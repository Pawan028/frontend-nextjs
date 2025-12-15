# Backend API Usage Guide

This guide helps frontend developers call the logistics/shipping microservice correctly.

## 1. Authentication & Authorization
- All protected routes use `fastify.authenticate`; send the `Authorization: Bearer <jwt>` header.
- Tokens expire after 7 days; handle refresh flows proactively.
- Route access is gated by `request.user.role` (MERCHANT, ADMIN, SUPER_ADMIN); expect `403 Forbidden` when role checks fail.

### ⚠️ **Phase 1 Limitations**
- **Registration is open** - `POST /auth/register` accepts merchant signups (no email verification yet)
- **No password reset flow** - manual admin intervention required
- **Token refresh returns 501** - users must re-login after 7 days

## 2. Response Patterns
- Use helpers in `src/utils/response-helpers.ts`:
  - `sendSuccess` for single payloads.
  - `sendPaginated` for list endpoints (look for `page`, `limit` query parameters).
  - `sendError` wraps all errors; inspect `code` and `message`.
- Decimal fields (prices, balances) are converted via `convertDecimalsToNumbers()`; expect plain numbers in JSON.

## 3. Complete API Endpoints Reference

### 🔐 Authentication (`/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ user: UserProfile, merchant: MerchantProfile }`
- `POST /auth/logout`
- `POST /auth/refresh` *(returns 501; planned refresh flow)*

### 👤 Merchant (`/merchant`)
- `GET /merchant/me` – merchant profile by logged-in user
- `PUT /merchant/me` – update merchant profile
- `GET /merchant/dashboard` – stats (orders, revenue, wallet, invoices, activity)
- `POST /merchant/addresses` – create pickup/return addresses
- `GET /merchant/addresses` – list addresses (filter by `type`)
- `PUT /merchant/addresses/:id` – update address
- `DELETE /merchant/addresses/:id` – delete address

### 🧭 Admin (`/admin`)
- `GET /admin/dashboard/stats` – global KPIs (orders, revenue, wallet usage)
- `GET /admin/merchants` – paginated merchant list with filters (`isActive`, `isKycVerified`, `search`)
- `GET /admin/merchants/:merchantId` – merchant details (profile, wallet, documents)
- `PUT /admin/merchants/:merchantId/kyc` – toggle KYC verification
- `PUT /admin/merchants/:merchantId/toggle-status` – activate/deactivate merchant
- `POST /admin/merchants/:merchantId/wallet/credit` – manual credit wallet
  - **Body**: `{ amount: number, description: string }`
- `POST /admin/merchants/:merchantId/wallet/debit` – manual debit wallet
  - **Body**: `{ amount: number, description: string }`
- `GET /admin/invoices` – list all invoices with filters (`status`, pagination)
- `PUT /admin/invoices/:invoiceId/mark-paid` – mark invoice paid
  - **Body**: `{ paymentMethod: 'WALLET' | 'ONLINE' | 'MANUAL' | 'UPI' | 'NET_BANKING' }`
- `GET /admin/shipments` – list all shipments with filters (`status`, pagination)

### 📦 Orders (`/orders`)
- `POST /orders` – create shipment order (validates rates, wallet charge)
  - **Body**: `{ origin, destination, items[], serviceType }`
  - **Response**: Includes calculated rates and `orderId`
- `GET /orders` – paginated list with status filter
  - **Query**: `?page=1&limit=20&status=PENDING`
- `GET /orders/:id` – order detail + shipment info
- `PATCH /orders/:id/cancel` – cancel & refund (wallet credit)

> Bulk label/manifest APIs are Phase 2 items; no routes exist yet.

### 🚚 Shipments (`/shipments`)
- `GET /shipments/:id` – shipment detail with tracking
- `GET /shipments/:id/label` *(download shipment label)*

### 🔁 NDR (`/ndr`)
- `GET /ndr/ndrs` – list non-delivery reports (NDRs)
- `PATCH /ndr/ndrs/:id/resolve` – update NDR resolution (reschedule, return, retry)

### 📊 Rates (`/rates`)
- `POST /rates` – rate calculator (uses mock external service)
  - **Body**: `{ origin, destination, weight, dimensions, serviceType }`
  - **Response**: `{ rates: Rate[], estimatedDays: number }`
- `DELETE /rates/cache` *(Admin)*
- `GET /rates/cache/stats` *(Admin)*
- `POST /rates/cache/warmup` *(Admin)*

### 💰 Wallet (`/wallet`)
- `GET /wallet/balance` – current wallet balance
  - **Response**: `{ balance: number, billingCycle: string, isKycVerified: boolean }`
- `GET /wallet/transactions` – transaction history (paginated)
  - **Query**: `?limit=50&offset=0&type=DEBIT&startDate=&endDate=`
- `GET /wallet/summary` – aggregated credit/debit stats
- `POST /wallet/topup` – manual/self-service top up (Phase 1, no payment gateway yet)
  - **Body**: `{ amount: number, reference: { type: 'manual' | 'order' | ..., id: string, description: string } }`
  - **Response**: `{ transaction, previousBalance, newBalance, isDuplicate }`
  - **Notes**: Auth required; merchants or admins must provide a unique reference per credit. Payment gateway integration arrives in Phase 2.
- `POST /wallet/charge` – debit wallet for shipments/services
  - **Body**: `{ amount: number, reference: { ... } }`

> There is **no** withdrawal endpoint yet; merchants must contact support.

### 🧾 Billing (`/invoices`)
- `GET /invoices` – paginated invoices
  - **Query**: `?page=1&limit=20&status=PAID&period=2024-01`
- `GET /invoices/:id` – invoice detail
- `GET /invoices/:id/download` – enqueue PDF generation

> Admin can mark invoices paid via `/admin/invoices/:invoiceId/mark-paid`. Direct billable-items CRUD endpoints don't exist (items created automatically during order/shipment lifecycle).

### 💵 Payments (`/payments`)
- `POST /payments/webhook` – placeholder for gateway callbacks (Phase 2)
- `GET /payments/history` – payment history

> `/payments/payouts` endpoints are **not implemented**. Webhook acts as simulated gateway callback; full integration deferred to Phase 2.

### ⚙️ Utilities
- Health/version endpoints are not defined in `server.ts`; probe via infra tools if needed.

## 4. Schema & Payload Expectations
- Zod schemas under `src/modules/{module}/schema.ts` define payloads; inspect module folders for required/optional fields.
- Route handlers often type payloads via Fastify generics: `fastify.post<{ Body: SchemaInput }>(...)`.

## 5. Background Jobs & Async Workflows
- Invoice generation and shipment tracking happen via BullMQ workers (`src/jobs/*Worker.ts`).
- Frontend triggers the base action (e.g., creating shipment) and polls relevant status endpoints; workers emit updates to database records.

### Job Status Polling Pattern
```typescript
// Step 1: Trigger async operation
POST /billing/invoices/:id/pdf
Response: { jobId: "job_xyz123" }

// Step 2: Poll job status
GET /billing/jobs/job_xyz123
Response: { status: "processing" | "completed" | "failed", result?: any }
```

## 6. Error Handling Notes
- Errors throw custom classes (`AppError`, `NotFoundError`, etc.); frontend should display `error.code`/`message`.
- `InsufficientBalanceError` returns 400; handle wallet-related failures gracefully.

### Common Error Codes
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Insufficient permissions (403)
- `WALLET_001` - Insufficient balance
- `ORDER_001` - Invalid shipment data
- `BILLING_001` - Invoice generation failed

## 7. Helpful Practices
- Always include `fastify.authenticate` token when hitting protected endpoints.
- Respect pagination defaults and pass filters explicitly; missing pagination may still return metadata from `sendPaginated`.
- Treat Decimal-derived numbers as floats; no manual conversion needed.
- For uploads or downloads (e.g., invoice PDFs), stream responses via Fastify’s `reply.send`.
- Confirm endpoint existence in `docs/api-use-guide.md` before wiring UI; anything absent here is not live yet.

## 8. Module Inventory & API Discovery
- Inspect `src/modules` (each subfolder follows the `{module}/routes.ts`, `{module}/service.ts`, `{module}/schema.ts` pattern) to see every available API.
- Open each module’s `routes.ts` to read the registered HTTP routes and refer to its `schema.ts` for required/optional payloads; use the module name as your entry point (e.g., `/orders`, `/billing`, `/wallet`, `/tracking`).
- Common domains you’ll encounter are `auth`, `merchant`, `orders`, `billing`, `wallet`, `tracking`, `rates`, `reports`, and `notifications`, but new modules can appear—re-run `ls src/modules` (or your OS equivalent) before each release to refresh your mental map.
- If a module wires background jobs (e.g., billing worker, tracking sync), note the base endpoint you call and expect the worker to update job status via other read endpoints.

## 9. Testing Status & Known Issues

### ✅ Passing Tests (133 total)
- Authentication (register, login, logout, token validation)
- Merchant profile CRUD and dashboard
- Wallet operations (balance, transactions, top-up, charge)
- Order creation, listing, detail, and cancellation
- Shipment tracking and label download
- Billing/invoice generation and PDF download
- NDR listing and resolution
- Payment webhook processing
- Admin dashboard and merchant management
- Rate calculation

### ⚠️ Missing Test Coverage
- **Edge cases**: Duplicate order IDs, concurrent wallet debits
- **Error scenarios**: Network failures during external API calls
- **Integration tests**: End-to-end order → billing → invoice flow
- **Job workers**: PDF generation completion, retry logic
- **Rate limiting**: Auth endpoint abuse prevention

### 🐛 Known Limitations
1. **No email verification** - registration completes without email confirmation
2. **Payment gateway stub** - `/payments/webhook` simulates gateway; real integration in Phase 2
3. **No rate limiting** - auth endpoints lack abuse prevention
4. **Tracking webhook** - signature verification not enforced in test mode
5. **Pagination** - `limit` parameter not capped (potential performance issue)

## 10. Development Roadmap

### High Priority (Phase 2)
- [ ] Add email verification to registration flow
- [ ] Implement password reset flow (token-based)
- [ ] Add token refresh endpoint (replace 501 stub)
- [ ] Enforce webhook signature verification in production
- [ ] Implement rate limiting on auth/payment endpoints

### Medium Priority
- [ ] Complete reports module with SQL aggregations
- [ ] Add notification system (email/SMS via queue)
- [ ] Implement file upload for merchant KYC documents
- [ ] Add CSV export for transactions/invoices
- [ ] Webhook retry logic with exponential backoff
#
### Nice to Have
- [ ] GraphQL API layer for complex queries
- [ ] Real-time WebSocket updates for tracking
- [ ] Multi-currency support in wallet
- [ ] Advanced filtering (date ranges, multiple statuses)

<!-- end of guide -->
## G7m@rK2p!