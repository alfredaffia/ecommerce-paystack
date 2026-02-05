# E-commerce Paystack API Test Script (PowerShell)
# This script tests all endpoints to verify the API is working correctly

# API Base URL (change this to your deployed URL)
$API_URL = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "E-commerce Paystack API Test Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing API at: $API_URL"
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "✗ Health check failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: Get All Products
Write-Host "Test 2: Get All Products" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/products" -Method Get
    Write-Host "✓ Get products passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "✗ Get products failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 3: Create a Product
Write-Host "Test 3: Create a Product" -ForegroundColor Yellow
$productData = @{
    name = "Test Laptop"
    price = 250000
    description = "High-performance laptop for testing"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/products" -Method Post -Body $productData -ContentType "application/json"
    Write-Host "✓ Create product passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
    $PRODUCT_ID = $response.id
    Write-Host "Product ID: $PRODUCT_ID"
} catch {
    Write-Host "✗ Create product failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    $PRODUCT_ID = 1
}
Write-Host ""

# Test 4: Get Product by ID
Write-Host "Test 4: Get Product by ID" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/products/$PRODUCT_ID" -Method Get
    Write-Host "✓ Get product by ID passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "✗ Get product by ID failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 5: Validation Error Test
Write-Host "Test 5: Validation Error Test" -ForegroundColor Yellow
$invalidData = @{
    name = "A"
    price = -100
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/products" -Method Post -Body $invalidData -ContentType "application/json"
    Write-Host "✗ Validation error test failed (should have been rejected)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Validation error test passed (correctly rejected invalid data)" -ForegroundColor Green
        Write-Host "Error response received as expected"
    } else {
        Write-Host "✗ Unexpected error" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}
Write-Host ""

# Test 6: Get All Orders
Write-Host "Test 6: Get All Orders" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/orders" -Method Get
    Write-Host "✓ Get orders passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "✗ Get orders failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 7: Initiate Payment
Write-Host "Test 7: Initiate Payment" -ForegroundColor Yellow
Write-Host "Note: This test requires valid PAYSTACK_SECRET_KEY in .env"
$paymentData = @{
    email = "test@example.com"
    amount = 5000
    productId = $PRODUCT_ID
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/checkout/pay" -Method Post -Body $paymentData -ContentType "application/json"
    Write-Host "✓ Initiate payment passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
    Write-Host ""
    Write-Host "Payment URL: $($response.authorization_url)"
    Write-Host "You can open this URL to complete a test payment"
} catch {
    Write-Host "✗ Initiate payment failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Make sure PAYSTACK_SECRET_KEY is set in .env"
}
Write-Host ""

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "API URL: $API_URL"
Write-Host "All basic endpoints tested"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open Swagger docs: $API_URL/api"
Write-Host "2. Test payment flow with Paystack test card"
Write-Host "3. Verify webhook is working"
Write-Host ""
Write-Host "For deployment, see DEPLOYMENT.md"
Write-Host "=========================================" -ForegroundColor Cyan
