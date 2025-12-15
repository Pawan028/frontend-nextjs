// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // ✅ Add this back
  directUrl = env("DIRECT_URL") // ✅ For migrations with pooled connections
}

// ==========================================
// 🧑‍💼 1. USERS & MERCHANT MODULE
// ==========================================

enum UserRole {
  MERCHANT
  ADMIN
  SUPER_ADMIN
}

enum BillingCycle {
  PREPAID
  POSTPAID
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          UserRole @default(MERCHANT)
  isActive      Boolean  @default(true) @map("is_active")
  emailVerified Boolean  @default(false) @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  merchantProfile MerchantProfile?

  @@index([email])
  @@map("users")
}

model MerchantProfile {
  id            String       @id @default(uuid())
  userId        String       @unique @map("user_id")
  companyName   String       @map("company_name")
  gst           String?      @unique
  pan           String?      @unique
  phone         String
  walletBalance Decimal      @default(0.00) @map("wallet_balance") @db.Decimal(12, 2)
  billingCycle  BillingCycle @default(PREPAID) @map("billing_cycle")
  isKycVerified Boolean      @default(false) @map("is_kyc_verified")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  // Relations
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses          Address[]
  orders             Order[]
  walletTransactions WalletTransaction[]
  invoices           Invoice[]
  billableItems      BillableItem[]

  @@index([userId])
  @@index([gst])
  @@map("merchant_profiles")
}

// ==========================================
// 📦 2. ADDRESS MODULE
// ==========================================

enum AddressType {
  PICKUP
  WAREHOUSE
  BILLING
  DELIVERY
}

model Address {
  id           String      @id @default(uuid())
  merchantId   String      @map("merchant_id")
  type         AddressType
  name         String
  phone        String
  addressLine1 String      @map("address_line1")
  addressLine2 String?     @map("address_line2")
  city         String
  state        String
  pincode      String
  country      String      @default("India")
  lat          Decimal?    @db.Decimal(10, 8)
  lng          Decimal?    @db.Decimal(11, 8)
  isDefault    Boolean     @default(false) @map("is_default")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  // Relations
  merchant       MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  ordersAsPickup Order[]

  @@index([merchantId, type])
  @@index([pincode])
  @@map("addresses")
}

// ==========================================
// 🧾 3. ORDER MODULE
// ==========================================

enum OrderStatus {
  CREATED
  READY_TO_SHIP
  MANIFESTED
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  RTO_INITIATED
  RTO_DELIVERED
  CANCELLED
  LOST
  DAMAGED
}

enum PaymentType {
  PREPAID
  COD
}

model Order {
  id            String      @id @default(uuid())
  merchantId    String      @map("merchant_id")
  orderNumber   String      @unique @map("order_number") // Merchant's order reference
  status        OrderStatus @default(CREATED)
  paymentType   PaymentType @map("payment_type")
  codAmount     Decimal?    @map("cod_amount") @db.Decimal(10, 2)
  invoiceAmount Decimal     @map("invoice_amount") @db.Decimal(10, 2)

  // Dimensions
  weight           Int // in grams
  length           Decimal? @db.Decimal(8, 2) // in cm
  breadth          Decimal? @db.Decimal(8, 2) // in cm
  height           Decimal? @db.Decimal(8, 2) // in cm
  volumetricWeight Int?     @map("volumetric_weight") // calculated

  // Product details
  orderItems Json @map("order_items") // [{name, qty, price, sku, hsn}]

  // Shipment details
  selectedCourier String? @map("selected_courier")
  trackingNumber  String? @unique @map("tracking_number")
  awb             String? @unique // Air Waybill number

  // Addresses
  pickupAddressId String @map("pickup_address_id")
  deliveryAddress Json   @map("delivery_address") // Full address object

  // Documents
  labelUrl    String? @map("label_url")
  invoiceUrl  String? @map("invoice_url")
  manifestUrl String? @map("manifest_url")

  // Metadata
  expectedDelivery DateTime? @map("expected_delivery")
  actualDelivery   DateTime? @map("actual_delivery")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  merchant       MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  pickupAddress  Address         @relation(fields: [pickupAddressId], references: [id])
  shipment       Shipment?
  trackingEvents TrackingEvent[]
  ndrReports     NdrReport[]
  billableItems  BillableItem[]

  @@index([merchantId, status])
  @@index([trackingNumber])
  @@index([orderNumber])
  @@index([createdAt])
  @@index([selectedCourier])
  @@map("orders")
}

// ==========================================
// 🚚 4. SHIPMENT MODULE
// ==========================================

enum ShipmentStatus {
  PENDING
  BOOKED
  MANIFESTED
  IN_TRANSIT
  DELIVERED
  RTO
  CANCELLED
  FAILED
}

model Shipment {
  id                String         @id @default(uuid())
  orderId           String         @unique @map("order_id")
  courier           String
  awb               String         @unique
  shipmentStatus    ShipmentStatus @default(PENDING) @map("shipment_status")
  labelUrl          String?        @map("label_url")
  invoicePdfUrl     String?        @map("invoice_pdf_url")
  manifestUrl       String?        @map("manifest_url")
  rawApiResponse    Json?          @map("raw_api_response") // Store full courier API response
  courierCharges    Decimal?       @map("courier_charges") @db.Decimal(10, 2)
  estimatedDelivery DateTime?      @map("estimated_delivery")
  lastTrackedAt     DateTime?      @map("last_tracked_at") // ✅ ADD THIS LINE
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([courier])
  @@index([shipmentStatus])
  @@index([awb])
  @@map("shipments")
}

// ==========================================
// 📡 5. RATE ENGINE CACHE
// ==========================================

model RateCache {
  id        String   @id @default(uuid())
  cacheKey  String   @unique @map("cache_key") // "origin_dest_weight_paymentType"
  ratesJson Json     @map("rates_json") // Array of courier rates
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([cacheKey, expiresAt])
  @@map("rates_cache")
}

// ==========================================
// 🛰️ 6. TRACKING MODULE
// ==========================================

model TrackingEvent {
  id        String   @id @default(uuid())
  orderId   String   @map("order_id")
  event     String // "Picked up", "In Transit", etc.
  eventCode String?  @map("event_code") // Courier-specific code
  location  String?
  remarks   String?  @db.Text
  timestamp DateTime // Event time from courier
  syncedAt  DateTime @default(now()) @map("synced_at")
  rawData   Json?    @map("raw_data") // Full tracking response

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId, timestamp])
  @@index([syncedAt])
  @@map("tracking_events")
}

// ==========================================
// 💰 7. WALLET & BILLING SYSTEM
// ==========================================

enum TransactionType {
  CREDIT
  DEBIT
}

enum ReferenceType {
  ORDER
  REFUND
  MANUAL
  NDR
  INVOICE
  RTO_CHARGE
  WEIGHT_ADJUSTMENT
  COD_FEE
}

model WalletTransaction {
  id             String          @id @default(uuid())
  merchantId     String          @map("merchant_id")
  type           TransactionType
  amount         Decimal         @db.Decimal(10, 2)
  referenceType  ReferenceType   @map("reference_type")
  referenceId    String?         @map("reference_id") // orderId or invoiceId
  description    String          @db.Text
  closingBalance Decimal         @map("closing_balance") @db.Decimal(12, 2)
  metadata       Json? // Additional transaction info
  createdAt      DateTime        @default(now()) @map("created_at")

  // Relations
  merchant MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@index([merchantId, createdAt])
  @@index([referenceType, referenceId])
  @@map("wallet_transactions")
}

enum InvoiceStatus {
  UNPAID
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
}

// Invoice sequence for atomic number generation
model InvoiceSequence {
  id        Int      @id @default(autoincrement())
  yearMonth String   @unique // "202512"
  counter   Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("invoice_sequences")
}

enum PaymentMethod {
  WALLET
  ONLINE
  MANUAL
  UPI
  NET_BANKING
}

model Invoice {
  id            String         @id @default(uuid())
  merchantId    String         @map("merchant_id")
  invoiceNumber String         @unique @map("invoice_number")
  billingStart  DateTime       @map("billing_start")
  billingEnd    DateTime       @map("billing_end")
  totalAmount   Decimal        @map("total_amount") @db.Decimal(12, 2)
  paidAmount    Decimal        @default(0.00) @map("paid_amount") @db.Decimal(12, 2)
  status        InvoiceStatus  @default(UNPAID)
  paymentMethod PaymentMethod? @map("payment_method")
  pdfUrl        String?        @map("pdf_url")
  dueDate       DateTime?      @map("due_date")
  paidAt        DateTime?      @map("paid_at")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  // Relations
  merchant      MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  billableItems BillableItem[]

  @@index([merchantId, status])
  @@index([invoiceNumber])
  @@index([dueDate])
  @@index([status, dueDate]) // For overdue queries
  @@map("invoices")
}

enum ChargeType {
  FORWARD
  RTO
  COD_FEE
  WEIGHT_ADJUSTMENT
  FUEL_SURCHARGE
  HANDLING_FEE
  NDR_FEE
}

model BillableItem {
  id          String     @id @default(uuid())
  merchantId  String     @map("merchant_id")
  invoiceId   String?    @map("invoice_id")
  orderId     String?    @map("order_id")
  courier     String?
  chargeType  ChargeType @map("charge_type")
  amount      Decimal    @db.Decimal(10, 2)
  description String?    @db.Text
  chargeDate  DateTime   @default(now()) @map("charge_date")
  createdAt   DateTime   @default(now()) @map("created_at")

  // Relations
  merchant MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  invoice  Invoice?        @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  order    Order?          @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@index([merchantId])
  @@index([merchantId, invoiceId])
  @@index([invoiceId])
  @@index([orderId])
  @@index([chargeDate])
  @@index([invoiceId, chargeDate]) // For unbilled items
  @@map("billable_items")
}

// ==========================================
// ⚠️ 8. NDR (NON-DELIVERY REPORT) MODULE
// ==========================================

enum NdrResolution {
  RESCHEDULE
  RETURN_TO_ORIGIN
  DELIVER_TO_CUSTOMER
  ATTEMPT_RETRY
  CANCELLED
  PENDING
}

enum NdrReason {
  CUSTOMER_UNAVAILABLE
  INCORRECT_ADDRESS
  CUSTOMER_REFUSED
  OUT_OF_DELIVERY_AREA
  CONSIGNEE_SHIFTED
  LOCKED_PREMISES
  OTHER
}

model NdrReport {
  id             String        @id @default(uuid())
  orderId        String        @map("order_id")
  reason         NdrReason
  reasonText     String?       @map("reason_text") @db.Text
  attemptCount   Int           @default(1) @map("attempt_count")
  lastUpdated    DateTime      @default(now()) @map("last_updated")
  resolution     NdrResolution @default(PENDING)
  resolutionNote String?       @map("resolution_note") @db.Text
  rescheduleDate DateTime?     @map("reschedule_date")
  resolvedAt     DateTime?     @map("resolved_at")
  createdAt      DateTime      @default(now()) @map("created_at")

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([resolution])
  @@map("ndr_reports")
}

// ==========================================
// 🔐 ADDITIONAL TABLES FOR PRODUCTION
// ==========================================

// API Keys for merchant integrations
model ApiKey {
  id         String    @id @default(uuid())
  merchantId String    @map("merchant_id")
  name       String // "Production Key", "Test Key"
  key        String    @unique // Hashed API key
  isActive   Boolean   @default(true) @map("is_active")
  lastUsedAt DateTime? @map("last_used_at")
  expiresAt  DateTime? @map("expires_at")
  createdAt  DateTime  @default(now()) @map("created_at")

  @@index([merchantId])
  @@index([key])
  @@map("api_keys")
}

// Webhook configurations
enum WebhookEvent {
  ORDER_CREATED
  ORDER_SHIPPED
  ORDER_DELIVERED
  ORDER_RTO
  ORDER_CANCELLED
  NDR_RAISED
  TRACKING_UPDATE
}

model Webhook {
  id         String         @id @default(uuid())
  merchantId String         @map("merchant_id")
  url        String
  events     WebhookEvent[] // Array of subscribed events
  secret     String // For HMAC signature
  isActive   Boolean        @default(true) @map("is_active")
  retryCount Int            @default(3) @map("retry_count")
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")

  @@index([merchantId])
  @@map("webhooks")
}

// Audit logs for sensitive operations
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?  @map("user_id")
  action     String // "wallet_credit", "order_cancelled", etc.
  entityType String   @map("entity_type") // "order", "wallet", "invoice"
  entityId   String   @map("entity_id")
  changes    Json? // Before/after values
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent") @db.Text
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}

// ==========================================
// 💳 PAYMENT RECORDS
// ==========================================

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum PaymentGateway {
  SIMULATED // For testing
  RAZORPAY
  STRIPE
  PHONEPE
  PAYTM
}

model Payment {
  id               String         @id @default(uuid())
  merchantId       String         @map("merchant_id")
  invoiceId        String?        @map("invoice_id")
  amount           Decimal        @db.Decimal(12, 2)
  status           PaymentStatus  @default(PENDING)
  gateway          PaymentGateway @default(SIMULATED)
  paymentMethod    String?        @map("payment_method") // "UPI", "Card", etc.
  gatewayOrderId   String?        @unique @map("gateway_order_id")
  gatewayPaymentId String?        @unique @map("gateway_payment_id")
  transactionRef   String?        @map("transaction_ref") // External reference
  metadata         Json? // Gateway-specific data
  initiatedAt      DateTime       @default(now()) @map("initiated_at")
  completedAt      DateTime?      @map("completed_at")
  failureReason    String?        @map("failure_reason") @db.Text
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  @@index([merchantId, status])
  @@index([invoiceId])
  @@index([gatewayOrderId])
  @@index([status, createdAt])
  @@map("payments")
}
