PS C:\clientProject07\backend-fastify-v1> npm test

> backend-fastify-v2@1.0.0 test
> cross-env NODE_ENV=test jest --runInBand --detectOpenHandles --forceExit

 PASS  tests/order.test.ts (66.672 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🐛 Cancel Test - Order Response Status: 201

      at Object.<anonymous> (tests/order.test.ts:363:21)

    console.log
      🐛 Cancel Test - Order Response Body: {
        "success": true,
        "data": {
          "order": {
            "id": "0bc38858-e664-4924-8fe1-e3765910d380",
            "merchantId": "a2e6e9a5-ab49-4189-a8f7-0f08ceacac1e",
            "orderNumber": "ORD-5Y2B6AD9N7",
            "status": "READY_TO_SHIP",
            "paymentType": "PREPAID",
            "codAmount": null,
            "invoiceAmount": 300,
            "shippingCharge": 56,
            "weight": 300,
            "length": null,
            "breadth": null,
            "height": null,
            "volumetricWeight": null,
            "orderItems": [
              {
                "name": "Product",
                "price": 300,
                "quantity": 1
              }
            ],
            "selectedCourier": "MOCK_STANDARD",
            "trackingNumber": null,
            "awb": null,
            "pickupAddressId": "d896fe9c-55ae-4e74-a247-866e4d39584f",
            "deliveryAddress": {
              "city": "Hyderabad",
              "name": "Cancel Test",
              "phone": "9876543210",
              "state": "Telangana",
              "pincode": "500001",
              "address_line1": "Cancel Test Address"
            },
            "labelUrl": null,
            "invoiceUrl": null,
            "manifestUrl": null,
            "expectedDelivery": null,
            "actualDelivery": null,
            "createdAt": "2025-12-15T16:51:55.227Z",
            "updatedAt": "2025-12-15T16:51:58.117Z",
            "pickupAddress": {
              "id": "d896fe9c-55ae-4e74-a247-866e4d39584f",
              "merchantId": "a2e6e9a5-ab49-4189-a8f7-0f08ceacac1e",
              "type": "PICKUP",
              "name": "Test Warehouse",
              "phone": "9876543210",
              "addressLine1": "Test Address Line 1",
              "addressLine2": null,
              "city": "Mumbai",
              "state": "Maharashtra",
              "pincode": "400001",
              "country": "India",
              "lat": null,
              "lng": null,
              "isDefault": true,
              "createdAt": "2025-12-15T16:51:19.839Z",
              "updatedAt": "2025-12-15T16:51:19.839Z"
            }
          },
          "shipment": {
            "id": "6dfdd793-7f29-4c98-b98c-ff26c5f091af",
            "awb": "MOCK1765817519781476",
            "status": "BOOKED"
          },
          "courier": {
            "courier": "MOCK_STANDARD",
            "serviceName": "Mock Standard Service",
            "price": 56,
            "eta": 4,
            "raw": {
              "carrier": "MockCarrier",
              "originPincode": "400001",
              "destPincode": "500001",
              "weight": 300,
              "paymentType": "prepaid"
            }
          },
          "available_rates": [
            {
              "courier": "MOCK_STANDARD",
              "serviceName": "Mock Standard Service",
              "price": 56,
              "eta": 4,
              "raw": {
                "carrier": "MockCarrier",
                "originPincode": "400001",
                "destPincode": "500001",
                "weight": 300,
                "paymentType": "prepaid"
              }
            },
            {
              "courier": "MOCK_EXPRESS",
              "serviceName": "Mock Express Service",
              "price": 70,
              "eta": 2,
              "raw": {
                "carrier": "MockCarrier",
                "originPincode": "400001",
                "destPincode": "500001",
                "weight": 300,
                "paymentType": "prepaid"
              }
            }
          ]
        },
        "requestTime": 6326
      }

      at Object.<anonymous> (tests/order.test.ts:365:21)

    console.log
      ✅ Order created for cancel test: 0bc38858-e664-4924-8fe1-e3765910d380

      at Object.<anonymous> (tests/order.test.ts:370:25)

    console.log
      🐛 Cancel Response Status: 200

      at Object.<anonymous> (tests/order.test.ts:397:21)

    console.log
      🐛 Cancel Response Body: {
        success: true,
        data: {
          id: '0bc38858-e664-4924-8fe1-e3765910d380',
          merchantId: 'a2e6e9a5-ab49-4189-a8f7-0f08ceacac1e',
          orderNumber: 'ORD-5Y2B6AD9N7',
          status: 'CANCELLED',
          paymentType: 'PREPAID',
          codAmount: null,
          invoiceAmount: 300,
          shippingCharge: 56,
          weight: 300,
          length: null,
          breadth: null,
          height: null,
          volumetricWeight: null,
          orderItems: [ [Object] ],
          selectedCourier: 'MOCK_STANDARD',
          trackingNumber: 'MOCK1765817519781476',
          awb: 'MOCK1765817519781476',
          pickupAddressId: 'd896fe9c-55ae-4e74-a247-866e4d39584f',
          deliveryAddress: {
            city: 'Hyderabad',
            name: 'Cancel Test',
            phone: '9876543210',
            state: 'Telangana',
            pincode: '500001',
            address_line1: 'Cancel Test Address'
          },
          labelUrl: 'C:\\clientProject07\\backend-fastify-v1\\temp\\labels\\MOCK1765817519781476.pdf',
          invoiceUrl: null,
          manifestUrl: null,
          expectedDelivery: null,
          actualDelivery: null,
          createdAt: '2025-12-15T16:51:55.227Z',
          updatedAt: '2025-12-15T16:52:01.778Z'
        },
        warnings: [ 'Order cancelled and amount refunded to wallet' ]
      }

      at Object.<anonymous> (tests/order.test.ts:398:21)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/payments.test.ts (39.859 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/merchant.test.ts (38.982 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/wallet-deduction-fix.test.ts (54.394 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      💰 Initial Balance: ₹1000

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:114:17)

    console.log
      📦 Order Created: ORD-1TF8507R2Z

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:143:17)

    console.log
      💵 Invoice Amount: ₹5000

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:144:17)

    console.log
      🚚 Shipping Charge: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:145:17)

    console.log
      💰 Balance After: ₹944

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:157:17)

    console.log
      
      🔍 VERIFICATION:

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:164:17)

    console.log
         Invoice Amount: ₹5000

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:165:17)

    console.log
         Shipping Charge: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:166:17)

    console.log
         Actually Debited: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:167:17)

    console.log
         Expected Debit: ₹56 (shipping charge)

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:168:17)

    console.log
      ✅ PASS: Debited correct amount (shipping charge)

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:177:17)

    console.log
      
      💰 Balance Before Order: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:208:17)

    console.log
      📦 Order Created: ORD-M0NRBHYNQQ

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:244:17)

    console.log
      🚚 Shipping Charge: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:245:17)

    console.log
      💰 Balance After Order: ₹1388

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:257:17)

    console.log
      ❌ Order Cancelled

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:275:17)

    console.log
      💰 Balance After Cancel: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:287:17)

    console.log
      
      🔍 REFUND VERIFICATION:

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:291:17)

    console.log
         Invoice Amount: ₹2000

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:292:17)

    console.log
         Shipping Charge: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:293:17)

    console.log
         Actually Refunded: ₹56

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:294:17)

    console.log
         Expected Refund: ₹56 (shipping charge)

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:295:17)

    console.log
      ✅ PASS: Refunded correct amount (shipping charge)

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:304:17)

    console.log
      
      🔍 BALANCE CONSISTENCY CHECK:

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:328:17)

    console.log
         Wallet Page Balance: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:329:17)

    console.log
         Dashboard Balance: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:330:17)

    console.log
      ✅ PASS: Balances are consistent

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:335:17)

    console.log
      
      💰 Balance Before COD Order: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:349:17)

    console.log
      📦 COD Order Created: ORD-6CKG613HK0

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:379:17)

    console.log
      💰 Balance After COD Order: ₹1444

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:391:17)

    console.log
      ✅ PASS: COD order did not debit wallet

      at Object.<anonymous> (tests/wallet-deduction-fix.test.ts:396:17)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/billing.test.ts (45.285 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      {"event":"billing.invoice_created","merchantId":"09788987-b4cd-4dce-94be-46a8be446314","invoiceNumber":"INV-202512-0477","totalAmount":1000,"itemCount":1,"billingPeriod":{"start":"2025-12-01T16:54:41.165Z","end":"2025-12-15T16:54:41.165Z"},"timestamp":"2025-12-15T16:54:43.135Z"}

      at prisma.$transaction.maxWait (src/modules/billing/service.ts:61:17)

    console.log
      {"event":"billing.invoice_created","merchantId":"09788987-b4cd-4dce-94be-46a8be446314","invoiceNumber":"INV-202512-0483","totalAmount":500,"itemCount":1,"billingPeriod":{"start":"2025-12-01T16:54:51.974Z","end":"2025-12-15T16:54:51.974Z"},"timestamp":"2025-12-15T16:54:53.108Z"}

      at prisma.$transaction.maxWait (src/modules/billing/service.ts:61:17)

    console.log
      ℹ️  [Billing] No unbilled items for merchant 09788987-b4cd-4dce-94be-46a8be446314

      at prisma.$transaction.maxWait (src/modules/billing/service.ts:45:21)

    console.warn
      {"event":"slow_operation","operationName":"getInvoices","duration":3640,"threshold":3000,"timestamp":"2025-12-15T16:55:00.341Z"}

      90 |
      91 |         if (duration > warningThresholdMs) {
    > 92 |             console.warn(JSON.stringify({
         |                     ^
      93 |                 event: 'slow_operation',
      94 |                 operationName,
      95 |                 duration,

      at monitorPerformance (src/utils/timeout-helper.ts:92:21)
      at withRetry (src/utils/timeout-helper.ts:205:20)
      at Object.<anonymous> (src/modules/billing/routes.ts:67:34)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/admin-invoice.test.ts (28.28 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/ndr.test.ts (36.652 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      ✅ Credited ₹10000 to merchant 384d1d50... (New balance: ₹10000)

      at creditMerchantWallet (tests/helpers/wallet.ts:80:13)

    console.log
      ✅ Wallet credited with ₹10,000

      at Object.<anonymous> (tests/ndr.test.ts:60:13)

    console.log
      ✅ Created pickup address: f19c95c8-0315-4d62-bf1c-bcc582765c58

      at Object.<anonymous> (tests/ndr.test.ts:83:15)

    console.log
      ✅ Created order for NDR test: 0da69b0c-f762-45cf-ab88-c55783881d60

      at Object.<anonymous> (tests/ndr.test.ts:121:15)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/admin.test.ts (38.14 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/auth.test.ts (18.192 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/shipment.test.ts (27.189 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🐛 Shipment Test - Order Response Status: 201

      at Object.<anonymous> (tests/shipment.test.ts:86:17)

    console.log
      🐛 Shipment Test - Order Response Body: {
        "success": true,
        "data": {
          "order": {
            "id": "2bb770f9-5ce5-4a68-808e-a10e61721c00",
            "merchantId": "b6268fc1-f889-4a31-8c34-1a3e052e7af5",
            "orderNumber": "ORD-2IM307VUVU",
            "status": "READY_TO_SHIP",
            "paymentType": "PREPAID",
            "codAmount": null,
            "invoiceAmount": 500,
            "shippingCharge": 56,
            "weight": 500,
            "length": null,
            "breadth": null,
            "height": null,
            "volumetricWeight": null,
            "orderItems": [
              {
                "name": "Item",
                "price": 500,
                "quantity": 1
              }
            ],
            "selectedCourier": "MOCK_STANDARD",
            "trackingNumber": null,
            "awb": null,
            "pickupAddressId": "b0544f1a-8432-4974-ad4c-51cf9a83983c",
            "deliveryAddress": {
              "city": "Delhi",
              "name": "Customer",
              "phone": "9876543210",
              "state": "DL",
              "pincode": "110001",
              "address_line1": "Customer Address Line 1"
            },
            "labelUrl": null,
            "invoiceUrl": null,
            "manifestUrl": null,
            "expectedDelivery": null,
            "actualDelivery": null,
            "createdAt": "2025-12-15T16:57:22.298Z",
            "updatedAt": "2025-12-15T16:57:25.095Z",
            "pickupAddress": {
              "id": "b0544f1a-8432-4974-ad4c-51cf9a83983c",
              "merchantId": "b6268fc1-f889-4a31-8c34-1a3e052e7af5",
              "type": "PICKUP",
              "name": "Warehouse",
              "phone": "9876543210",
              "addressLine1": "Addr",
              "addressLine2": null,
              "city": "Mumbai",
              "state": "MH",
              "pincode": "400001",
              "country": "India",
              "lat": null,
              "lng": null,
              "isDefault": false,
              "createdAt": "2025-12-15T16:57:20.714Z",
              "updatedAt": "2025-12-15T16:57:20.714Z"
            }
          },
          "shipment": {
            "id": "7f2cd524-3094-4dde-9142-7648b81dcdbc",
            "awb": "MOCK1765817847645360",
            "status": "BOOKED"
          },
          "courier": {
            "courier": "MOCK_STANDARD",
            "serviceName": "Mock Standard Service",
            "price": 56,
            "eta": 4,
            "raw": {
              "carrier": "MockCarrier",
              "originPincode": "400001",
              "destPincode": "110001",
              "weight": 500,
              "paymentType": "prepaid"
            }
          },
          "available_rates": [
            {
              "courier": "MOCK_STANDARD",
              "serviceName": "Mock Standard Service",
              "price": 56,
              "eta": 4,
              "raw": {
                "carrier": "MockCarrier",
                "originPincode": "400001",
                "destPincode": "110001",
                "weight": 500,
                "paymentType": "prepaid"
              }
            },
            {
              "courier": "MOCK_EXPRESS",
              "serviceName": "Mock Express Service",
              "price": 70,
              "eta": 2,
              "raw": {
                "carrier": "MockCarrier",
                "originPincode": "400001",
                "destPincode": "110001",
                "weight": 500,
                "paymentType": "prepaid"
              }
            }
          ]
        },
        "requestTime": 8849
      }

      at Object.<anonymous> (tests/shipment.test.ts:88:17)

    console.log
      ✅ Shipment created: {
        shipmentId: '7f2cd524-3094-4dde-9142-7648b81dcdbc',
        awb: 'MOCK1765817847645360'
      }

      at Object.<anonymous> (tests/shipment.test.ts:93:21)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/wallet.test.ts (31.889 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/rate.test.ts (8.449 s)
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)

 PASS  tests/tracking.test.ts
  ● Console

    console.log
      [Resources] ✅ Registered: Prisma

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      [Resources] ✅ Registered: Redis Client

      at registerResource (src/utils/resources.ts:28:11)

    console.log
      🔥 Warming up database...

      at Object.<anonymous> (tests/setup.ts:10:11)

    console.log
      ✅ Database is ready!

      at Object.<anonymous> (tests/setup.ts:19:13)

    console.log
      🧹 Cleaning up: closing resources...

      at Object.<anonymous> (tests/setup.ts:29:11)

    console.log
      [Resources] 🛑 Shutting down 2 resources...

      at closeAllResources (src/utils/resources.ts:43:11)

    console.log
      [Resources] 🔄 Closing Prisma...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] 🔄 Closing Redis Client...

      at src/utils/resources.ts:47:15
          at Array.map (<anonymous>)

    console.log
      [Resources] ✅ Closed Redis Client

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 1)

    console.log
      [Resources] ✅ Closed Prisma

      at src/utils/resources.ts:60:15
          at async Promise.allSettled (index 0)

    console.log
      [Resources] ✅ Cleanup complete.

      at closeAllResources (src/utils/resources.ts:78:13)


Test Suites: 13 passed, 13 total
Tests:       137 passed, 137 total
Snapshots:   0 total
Time:        437.745 s, estimated 449 s
Ran all test suites.
PS C:\clientProject07\backend-fastify-v1> 
