#!/bin/bash
# Frontend E2E Smoke Test

API_URL="http://localhost:3001/api/v1"
EMAIL="newuser@test.com"
PASSWORD="Test@123"

echo "🔥 Starting smoke test..."

# 1. Login
echo "1. Testing login..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.token')

if [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# 2. Get Rates
echo "2. Testing get rates..."
curl -s -X POST "$API_URL/rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"originPincode":"110001","destPincode":"560001","weight":1000,"paymentType":"prepaid"}' | jq '.success'
echo "✅ Get rates successful"

# 3. List Orders
echo "3. Testing list orders..."
curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'
echo "✅ List orders successful"

# 4. Get Wallet Balance
echo "4. Testing wallet balance..."
curl -s -X GET "$API_URL/wallet/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'
echo "✅ Wallet balance successful"

# 5. List Invoices
echo "5. Testing list invoices..."
curl -s -X GET "$API_URL/invoices" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'
echo "✅ List invoices successful"

echo "🎉 All smoke tests passed!"
