# Redis Caching Implementation Guide for Backend Team

## Current Performance Issues

**Problem**: Dashboard and other pages take 2-3 seconds to load because every request hits Neon Postgres directly without caching.

**Current Redis Usage**: Only rate calculations and Bull Queue jobs are cached. Most read-heavy endpoints are NOT cached.

---

## High Priority - Must Cache (Week 1)

### 1. User Sessions & Auth ⭐⭐⭐
```typescript
// Cache decoded user data from JWT
Key: `session:${userId}`
Value: { userId, email, role, permissions, merchantId }
TTL: 15 minutes (refresh on activity)
Invalidate: On logout, profile update
```
**Why**: Every API call validates JWT - cache the decoded user data to avoid repeated processing.

### 2. Merchant Profile ⭐⭐⭐
```typescript
// Cache full merchant data
Key: `merchant:profile:${merchantId}`
Value: { name, companyName, email, phone, kycStatus, etc }
TTL: 5 minutes
Invalidate: On profile update
```
**Why**: Loaded on every dashboard visit, merchant data rarely changes.

### 3. Wallet Balance ⭐⭐⭐
```typescript
// Cache current wallet balance
Key: `wallet:balance:${merchantId}`
Value: "1500.00"
TTL: 30 seconds
Invalidate: On topup, order creation, refund, deduction
```
**Why**: Displayed in navbar on every page, shown in dashboard, checked during order creation.

### 4. Dashboard Statistics ⭐⭐⭐
```typescript
// Cache all dashboard metrics
Key: `dashboard:stats:${merchantId}`
Value: {
  wallet: { balance, lastTopup },
  orders: { total, thisMonth, pending, delivered },
  revenue: { total, thisMonth },
  deliveryRate: percentage
}
TTL: 2 minutes
Invalidate: On new order, order status change, wallet transaction
```
**Why**: Heavy aggregation queries (COUNT, SUM, JOIN), causes 2-3 second delays.

### 5. Order Lists (Pagination) ⭐⭐
```typescript
// Cache paginated order results
Key: `orders:list:${merchantId}:page:${page}:status:${status}:sort:${sort}`
Value: { orders: [...], total, page, pageSize }
TTL: 1 minute
Invalidate: On new order, order update (clear all pages for that merchant)
```
**Why**: List pages hit database repeatedly with complex queries.

### 6. Address Book ⭐⭐
```typescript
// Cache all merchant addresses
Key: `addresses:${merchantId}`
Value: [{ id, type, addressLine1, city, state, pincode, ... }]
TTL: 10 minutes
Invalidate: On address add/update/delete
```
**Why**: Used in every order creation, rarely changes, avoiding repeated DB queries.

### 7. Rate Calculations ✅ (Already Cached)
```typescript
// Cache shipping rate calculations
Key: `rates:${originPin}:${destPin}:${weight}:${paymentType}`
Value: { rateDetails, estimatedDelivery, couriers }
TTL: 1 hour
```
**Why**: External API calls are expensive and slow.

---

## Medium Priority - Should Cache (Week 2)

### 8. Invoice Lists
```typescript
Key: `invoices:list:${merchantId}:page:${page}`
Value: { invoices: [...], total, page }
TTL: 5 minutes
Invalidate: On new invoice generation
```

### 9. Transaction History
```typescript
Key: `transactions:${merchantId}:page:${page}:type:${type}`
Value: { transactions: [...], total, page }
TTL: 2 minutes
Invalidate: On new transaction (topup, deduction, refund)
```

### 10. NDR (Non-Delivery Reports)
```typescript
Key: `ndr:list:${merchantId}:status:${status}:page:${page}`
Value: { ndrList: [...], total, page }
TTL: 3 minutes
Invalidate: On NDR resolution, status update
```

### 11. Shipment Tracking Status
```typescript
Key: `tracking:${awb}`
Value: { currentStatus, events: [...], estimatedDelivery }
TTL: 5 minutes
Invalidate: When tracking worker updates from courier API
```

### 12. Courier Service Availability
```typescript
Key: `couriers:available:${pincode}`
Value: ["delhivery", "bluedart", "dtdc"]
TTL: 1 day
Invalidate: Manual (rarely changes)
```
**Why**: Pincode serviceability rarely changes, external API call.

---

## Low Priority - Nice to Have (Week 3)

### 13. API Rate Limiting
```typescript
Key: `ratelimit:${merchantId}:${endpoint}`
Value: requestCount
TTL: 1 minute sliding window
```
**Why**: Protect against abuse, DOS attacks.

### 14. Notification Preferences
```typescript
Key: `notifications:settings:${merchantId}`
Value: { emailNotifications: true, smsAlerts: false, ... }
TTL: 1 hour
Invalidate: On settings update
```

### 15. Billing Cycle Data
```typescript
Key: `billing:cycle:${merchantId}`
Value: { cycleStart, cycleEnd, billingDate, outstandingAmount }
TTL: 1 day
Invalidate: On cycle change, payment
```

---

## Redis Data Structures to Use

### String - Simple Key-Value
```typescript
// For single values (balance, profile JSON)
await redis.set('wallet:balance:123', '1500.00', 'EX', 30);
const balance = await redis.get('wallet:balance:123');
```

### Hash - Structured Data
```typescript
// For dashboard statistics (multiple fields)
await redis.hset('stats:123', {
  totalOrders: 150,
  delivered: 120,
  pending: 30,
  revenue: 45000
});
const stats = await redis.hgetall('stats:123');
await redis.expire('stats:123', 120);
```

### Sorted Set - Time-Ordered Lists
```typescript
// For activity feeds, recent orders
await redis.zadd('recent:orders:123', timestamp, JSON.stringify(order));
await redis.zrevrange('recent:orders:123', 0, 9); // Latest 10
await redis.expire('recent:orders:123', 300);
```

### List - Pagination
```typescript
// For transaction history
await redis.lpush('transactions:123', JSON.stringify(txn));
await redis.lrange('transactions:123', 0, 19); // Page 1
await redis.ltrim('transactions:123', 0, 99); // Keep latest 100
```

---

## Implementation Example

### Generic Cache Manager Class

```typescript
// src/utils/cache-manager.ts
import { Redis } from 'ioredis';

export class CacheManager {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Generic cache wrapper with TTL
   */
  async cached<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }

    console.log(`Cache MISS: ${key}`);
    const fresh = await fetcher();
    await this.redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }

  /**
   * Dashboard statistics with 2-minute cache
   */
  async getDashboardStats(merchantId: string) {
    return this.cached(
      `dashboard:stats:${merchantId}`,
      120, // 2 minutes
      async () => {
        // Heavy aggregation queries here
        const stats = await db.query(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
          FROM orders 
          WHERE merchant_id = $1
        `, [merchantId]);
        
        return stats;
      }
    );
  }

  /**
   * Wallet balance with 30-second cache
   */
  async getWalletBalance(merchantId: string): Promise<number> {
    const key = `wallet:balance:${merchantId}`;
    const cached = await this.redis.get(key);
    if (cached) return parseFloat(cached);

    const result = await db.query(
      'SELECT balance FROM wallets WHERE merchant_id = $1',
      [merchantId]
    );
    const balance = result.rows[0].balance;
    
    await this.redis.setex(key, 30, balance.toString());
    return balance;
  }

  /**
   * Merchant profile with 5-minute cache
   */
  async getMerchantProfile(merchantId: string) {
    return this.cached(
      `merchant:profile:${merchantId}`,
      300, // 5 minutes
      () => db.merchants.findUnique({ where: { id: merchantId } })
    );
  }

  /**
   * Address book with 10-minute cache
   */
  async getAddresses(merchantId: string) {
    return this.cached(
      `addresses:${merchantId}`,
      600, // 10 minutes
      () => db.addresses.findMany({ where: { merchantId } })
    );
  }

  /**
   * Order list with pagination (1-minute cache)
   */
  async getOrders(merchantId: string, page: number, status?: string) {
    const key = `orders:list:${merchantId}:page:${page}:status:${status || 'all'}`;
    return this.cached(
      key,
      60, // 1 minute
      async () => {
        const where = { merchantId, ...(status && { status }) };
        const [orders, total] = await Promise.all([
          db.orders.findMany({
            where,
            skip: (page - 1) * 20,
            take: 20,
            orderBy: { createdAt: 'desc' }
          }),
          db.orders.count({ where })
        ]);
        return { orders, total, page };
      }
    );
  }

  /**
   * Invalidate cache after mutations
   */
  async invalidateOrderCache(merchantId: string) {
    const patterns = [
      `orders:list:${merchantId}:*`,
      `dashboard:stats:${merchantId}`,
      `wallet:balance:${merchantId}`
    ];
    
    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Invalidated ${keys.length} keys matching: ${pattern}`);
      }
    }
  }

  async invalidateWalletCache(merchantId: string) {
    const keys = [
      `wallet:balance:${merchantId}`,
      `dashboard:stats:${merchantId}`,
      `transactions:${merchantId}:*`
    ];
    
    for (const key of keys) {
      if (key.includes('*')) {
        const matches = await this.redis.keys(key);
        if (matches.length > 0) await this.redis.del(...matches);
      } else {
        await this.redis.del(key);
      }
    }
  }

  async invalidateAddressCache(merchantId: string) {
    await this.redis.del(`addresses:${merchantId}`);
  }

  async invalidateMerchantProfile(merchantId: string) {
    await this.redis.del(`merchant:profile:${merchantId}`);
  }
}

// Export singleton instance
export const cacheManager = new CacheManager(redis);
```

---

## Cache Invalidation Strategy

### Manual Invalidation After Mutations

```typescript
// After order creation
app.post('/orders', async (req, reply) => {
  const order = await createOrder(req.body);
  
  // Invalidate related caches
  await cacheManager.invalidateOrderCache(req.user.merchantId);
  
  return { success: true, data: order };
});

// After wallet topup
app.post('/wallet/topup', async (req, reply) => {
  const transaction = await processTopup(req.body);
  
  // Invalidate wallet-related caches
  await cacheManager.invalidateWalletCache(req.user.merchantId);
  
  return { success: true, data: transaction };
});

// After address update
app.put('/addresses/:id', async (req, reply) => {
  const address = await updateAddress(req.params.id, req.body);
  
  // Invalidate address cache
  await cacheManager.invalidateAddressCache(req.user.merchantId);
  
  return { success: true, data: address };
});

// After profile update
app.put('/merchant/profile', async (req, reply) => {
  const profile = await updateProfile(req.user.merchantId, req.body);
  
  // Invalidate profile cache
  await cacheManager.invalidateMerchantProfile(req.user.merchantId);
  
  return { success: true, data: profile };
});
```

### Pattern-Based Deletion

```typescript
// Delete all cached pages for a merchant
async function clearPaginatedCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`Cleared ${keys.length} cache keys`);
  }
}

// Usage
await clearPaginatedCache(`orders:list:${merchantId}:*`);
await clearPaginatedCache(`transactions:${merchantId}:*`);
```

### TTL-Based Auto-Expiry

```typescript
// All cached data has TTL - automatically expires
// No manual cleanup needed for time-based invalidation
await redis.setex(key, ttlSeconds, value);
```

---

## Route-Level Implementation Examples

### Dashboard Route (Currently Slowest)

```typescript
// routes/merchant/dashboard.ts
app.get('/merchant/dashboard', async (req, reply) => {
  const merchantId = req.user.merchantId;
  
  // Try cache first (2-minute cache)
  const stats = await cacheManager.getDashboardStats(merchantId);
  
  return {
    success: true,
    data: {
      merchant: await cacheManager.getMerchantProfile(merchantId),
      stats,
      recentActivity: [] // Can also be cached
    }
  };
});
```

**Expected Performance**:
- First request: 2-3s (DB queries)
- Subsequent requests (within 2 min): ~50-100ms (Redis)
- **20-30x improvement**

### Wallet Balance Route

```typescript
// routes/wallet/balance.ts
app.get('/wallet/balance', async (req, reply) => {
  const merchantId = req.user.merchantId;
  
  // 30-second cache
  const balance = await cacheManager.getWalletBalance(merchantId);
  
  return {
    success: true,
    data: { balance }
  };
});
```

**Expected Performance**:
- First request: 500-1000ms
- Cached: ~30-50ms
- **20-30x improvement**

### Orders List Route

```typescript
// routes/orders/list.ts
app.get('/orders', async (req, reply) => {
  const { page = 1, status } = req.query;
  const merchantId = req.user.merchantId;
  
  // 1-minute cache
  const result = await cacheManager.getOrders(merchantId, page, status);
  
  return {
    success: true,
    data: result
  };
});
```

**Expected Performance**:
- First request: 1-2s
- Cached: ~100-150ms
- **10-15x improvement**

---

## Monitoring & Logging

### Add Cache Hit/Miss Metrics

```typescript
let cacheHits = 0;
let cacheMisses = 0;

async function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    cacheHits++;
    console.log(`✅ Cache HIT: ${key} (hits: ${cacheHits}, misses: ${cacheMisses})`);
    return JSON.parse(cached);
  }

  cacheMisses++;
  console.log(`❌ Cache MISS: ${key} (hits: ${cacheHits}, misses: ${cacheMisses})`);
  
  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}

// Expose metrics endpoint
app.get('/metrics/cache', async (req, reply) => {
  const hitRate = ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(2);
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: `${hitRate}%`,
    totalRequests: cacheHits + cacheMisses
  };
});
```

---

## Performance Comparison

| Endpoint | Current (No Cache) | With Redis Cache | Improvement | Priority |
|----------|-------------------|------------------|-------------|----------|
| **Dashboard** | 2-3s | 50-100ms | **20-30x** | ⭐⭐⭐ Must |
| **Wallet Balance** | 1-2s | 30-50ms | **20-40x** | ⭐⭐⭐ Must |
| **Orders List** | 1-2s | 80-150ms | **10-15x** | ⭐⭐ Should |
| **Rates** (✅ cached) | 400ms | 250ms | Already good | ✅ Done |
| **Addresses** | 500ms | 50ms | **10x** | ⭐⭐ Must |
| **Transactions** | 1-2s | 100ms | **10-20x** | ⭐⭐ Should |
| **Invoices** | 1-2s | 150ms | **10-15x** | ⭐ Nice to have |
| **NDR List** | 1-2s | 150ms | **10-15x** | ⭐ Nice to have |
| **Tracking** | 500-1000ms | 100ms | **5-10x** | ⭐ Nice to have |

---

## Expected Results

### Before Redis Caching:
- ❌ Dashboard loads in 2-3 seconds
- ❌ Every page navigation hits database
- ❌ Heavy database load during peak hours
- ❌ Poor user experience (waiting on every click)
- ❌ Database queries: ~50-100 per minute per active user

### After Redis Caching:
- ✅ Dashboard loads in ~100ms (cached)
- ✅ Instant page navigation (data from Redis)
- ✅ Database load reduced by 80-90%
- ✅ Excellent UX (feels instant)
- ✅ Database queries: ~5-10 per minute per active user

### Database Load Reduction:
- **Dashboard**: 100% of repeat requests served from cache (2-min window)
- **Wallet Balance**: 95% served from cache (30-sec window)
- **Order Lists**: 80% served from cache (1-min window)
- **Overall Database Load**: Reduced by 80-90%

---

## Implementation Checklist

### Week 1 - High Priority (Must Have)
- [ ] Set up cache manager utility class
- [ ] Implement dashboard statistics caching (2 min TTL)
- [ ] Implement wallet balance caching (30 sec TTL)
- [ ] Implement merchant profile caching (5 min TTL)
- [ ] Implement address book caching (10 min TTL)
- [ ] Implement order list caching (1 min TTL)
- [ ] Add cache invalidation after order creation
- [ ] Add cache invalidation after wallet transactions
- [ ] Add cache invalidation after address updates
- [ ] Test cache hit/miss rates
- [ ] Deploy to staging and verify performance

### Week 2 - Medium Priority (Should Have)
- [ ] Implement transaction history caching
- [ ] Implement invoice list caching
- [ ] Implement NDR list caching
- [ ] Implement tracking status caching
- [ ] Implement courier availability caching
- [ ] Add cache metrics endpoint
- [ ] Monitor cache performance in production

### Week 3 - Low Priority (Nice to Have)
- [ ] Implement API rate limiting with Redis
- [ ] Implement notification preferences caching
- [ ] Implement billing cycle caching
- [ ] Add cache warming strategy (pre-populate on server start)
- [ ] Optimize cache key structure
- [ ] Add Redis cluster support for scaling

---

## Testing Strategy

### Test Cache Functionality
```bash
# Test dashboard cache
curl http://localhost:3000/merchant/dashboard
# First call: ~2s (DB query)
# Second call: ~100ms (Redis cache) ✅

# Test wallet balance cache
curl http://localhost:3000/wallet/balance
# First call: ~1s (DB query)
# Second call: ~30ms (Redis cache) ✅

# Test cache invalidation
curl -X POST http://localhost:3000/wallet/topup -d '{"amount": 100}'
curl http://localhost:3000/wallet/balance
# Should fetch fresh data from DB ✅
```

### Monitor Cache Metrics
```bash
# Check cache hit rate
curl http://localhost:3000/metrics/cache
# Expected: >70% hit rate after warming up
```

---

## Redis Configuration Recommendations

### Production Settings
```typescript
// config/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  
  // Connection pool
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Timeouts
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Retry strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Reconnect on error
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Handle connection events
redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('close', () => console.warn('⚠️ Redis connection closed'));
```

---

## Summary for Backend Team

**Problem**: Dashboard and key pages are slow (2-3 seconds) because every request hits Neon Postgres without caching.

**Solution**: Implement Redis caching for read-heavy endpoints with appropriate TTLs and cache invalidation.

**Priority Order**:
1. **Week 1 (Must)**: Dashboard stats, wallet balance, merchant profile, addresses, order lists
2. **Week 2 (Should)**: Transactions, invoices, NDR, tracking, courier availability
3. **Week 3 (Nice)**: Rate limiting, preferences, billing, advanced optimization

**Expected Impact**:
- 📈 **20-30x faster** response times (2-3s → 50-100ms)
- 📉 **80-90% reduction** in database load
- 🚀 **Instant UX** - pages feel immediate
- 💰 **Cost savings** - fewer database queries = lower Neon usage

**Implementation**: Use the provided `CacheManager` class and route examples. Start with high-priority items (dashboard, wallet) for maximum impact.

---

## Questions?

If you have questions about:
- Redis data structure choices
- TTL values (can be adjusted based on usage patterns)
- Cache invalidation strategy
- Performance testing methodology
- Scaling Redis for production

Please reach out to the frontend team or DevOps for discussion.

**Goal**: Achieve sub-100ms response times for all cached endpoints! 🚀
