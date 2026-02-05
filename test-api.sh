#!/bin/bash

# E-commerce Paystack API Test Script
# This script tests all endpoints to verify the API is working correctly

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL (change this to your deployed URL)
API_URL="${API_URL:-http://localhost:3000}"

echo "========================================="
echo "E-commerce Paystack API Test Script"
echo "========================================="
echo "Testing API at: $API_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Get All Products (should be empty initially)
echo -e "${YELLOW}Test 2: Get All Products${NC}"
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/products")
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)
BODY=$(echo "$PRODUCTS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get products passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Get products failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Create a Product
echo -e "${YELLOW}Test 3: Create a Product${NC}"
CREATE_PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laptop",
    "price": 250000,
    "description": "High-performance laptop for testing"
  }')
HTTP_CODE=$(echo "$CREATE_PRODUCT_RESPONSE" | tail -n1)
BODY=$(echo "$CREATE_PRODUCT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Create product passed${NC}"
    echo "Response: $BODY"
    PRODUCT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "Product ID: $PRODUCT_ID"
else
    echo -e "${RED}✗ Create product failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    PRODUCT_ID=1
fi
echo ""

# Test 4: Get Product by ID
echo -e "${YELLOW}Test 4: Get Product by ID${NC}"
GET_PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/products/$PRODUCT_ID")
HTTP_CODE=$(echo "$GET_PRODUCT_RESPONSE" | tail -n1)
BODY=$(echo "$GET_PRODUCT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get product by ID passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Get product by ID failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Validation Error Test (invalid product)
echo -e "${YELLOW}Test 5: Validation Error Test${NC}"
VALIDATION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "price": -100
  }')
HTTP_CODE=$(echo "$VALIDATION_RESPONSE" | tail -n1)
BODY=$(echo "$VALIDATION_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ Validation error test passed (correctly rejected invalid data)${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Validation error test failed (should return 400)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 6: Get All Orders
echo -e "${YELLOW}Test 6: Get All Orders${NC}"
ORDERS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/orders")
HTTP_CODE=$(echo "$ORDERS_RESPONSE" | tail -n1)
BODY=$(echo "$ORDERS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get orders passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Get orders failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 7: Initiate Payment (requires valid Paystack keys)
echo -e "${YELLOW}Test 7: Initiate Payment${NC}"
echo "Note: This test requires valid PAYSTACK_SECRET_KEY in .env"
PAYMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/checkout/pay" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"amount\": 5000,
    \"productId\": $PRODUCT_ID
  }")
HTTP_CODE=$(echo "$PAYMENT_RESPONSE" | tail -n1)
BODY=$(echo "$PAYMENT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Initiate payment passed${NC}"
    echo "Response: $BODY"
    PAYMENT_URL=$(echo "$BODY" | grep -o '"authorization_url":"[^"]*"' | cut -d'"' -f4)
    echo ""
    echo "Payment URL: $PAYMENT_URL"
    echo "You can open this URL to complete a test payment"
else
    echo -e "${RED}✗ Initiate payment failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    echo "Make sure PAYSTACK_SECRET_KEY is set in .env"
fi
echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "API URL: $API_URL"
echo "All basic endpoints tested"
echo ""
echo "Next steps:"
echo "1. Open Swagger docs: $API_URL/api"
echo "2. Test payment flow with Paystack test card"
echo "3. Verify webhook is working"
echo ""
echo "For deployment, see DEPLOYMENT.md"
echo "========================================="
