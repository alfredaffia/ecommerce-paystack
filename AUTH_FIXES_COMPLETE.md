# Authentication & User Linking Fixes - COMPLETE ✅

## Summary

Successfully implemented authentication and user linking for payments and orders. All endpoints are now properly secured and orders are tied to logged-in users.

## Changes Implemented

### 1. ✅ Order Entity - Added User Relationship

**File**: `src/order/entity/order.entity.ts`

**Changes**:
- Added `userId` column (nullable for backward compatibility)
- Added `@ManyToOne` relationship to User entity
- Added `@JoinColumn` for proper foreign key
- Changed table name to `'orders'` for consistency
- Changed amount type to `decimal(10,2)` for precision
- Added `@CreateDateColumn()` decorator

**Why**: Orders now track which user made the payment, enabling user-specific order history.

### 2. ✅ Order Service - User-Specific Queries

**File**: `src/order/order.service.ts`

**Changes**:
- Updated `createFromWebhook()` to accept optional `userId` parameter
- Added `findByUserId()` method to get orders for a specific user
- Updated `findAll()` to include user relations
- Enhanced logging to show userId when present

**Why**: Enables filtering orders by user and linking webhook payments to users.

### 3. ✅ Order Controller - Protected & User-Filtered

**File**: `src/order/order.controller.ts`

**Changes**:
- Added `@UseGuards(JwtAuthGuard)` to protect GET /orders endpoint
- Added `@ApiBearerAuth()` for Swagger documentation
- Changed endpoint to return only current user's orders
- Extracts `userId` from JWT token (`req.user.id`)
- Updated API documentation to reflect authentication requirement

**Why**: Users can only see their own orders, not everyone's orders. Requires authentication.

### 4. ✅ Checkout Controller - Protected Payment Endpoint

**File**: `src/checkout/checkout.controller.ts`

**Changes**:
- Added `@UseGuards(JwtAuthGuard)` to POST /checkout/pay
- Added `@ApiBearerAuth()` for Swagger
- Extracts `userId` from JWT token
- Passes `userId` to checkout service
- Updated webhook handler to extract `userId` from Paystack metadata
- Passes `userId` to `createFromWebhook()` method
- Enhanced logging to show userId

**Why**: Only authenticated users can initiate payments. Payments are automatically linked to the user.

### 5. ✅ Checkout Service - userId in Paystack Metadata

**File**: `src/checkout/checkout.service.ts`

**Changes**:
- Updated `initiatePayment()` to accept optional `userId` parameter
- Includes `userId` in Paystack metadata
- Enhanced logging to show userId

**Why**: When Paystack sends webhook, we can identify which user made the payment.

## Security Improvements

### Before (Insecure)
- ❌ Anyone could initiate payments
- ❌ Anyone could see all orders
- ❌ Orders not linked to users
- ❌ No authentication required

### After (Secure)
- ✅ Only authenticated users can initiate payments
- ✅ Users can only see their own orders
- ✅ Orders automatically linked to users
- ✅ JWT authentication required for sensitive endpoints

## API Changes

### Protected Endpoints (Require JWT Token)

#### POST /checkout/pay
**Before**: No authentication required
**After**: Requires JWT token in Authorization header

**Request**:
```bash
curl -X POST http://localhost:3000/checkout/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "amount": 5000,
    "productId": 1
  }'
```

#### GET /orders
**Before**: Returned all orders for everyone
**After**: Returns only current user's orders, requires JWT token

**Request**:
```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Public Endpoints (No Authentication)

- POST /auth/register - Register new user
- POST /auth/login - Login and get JWT token
- GET /products - View products
- GET /products/:id - View single product
- POST /checkout/webhook/paystack - Paystack webhook (verified by signature)
- GET /checkout/success - Payment success callback
- GET /health - Health check

## Testing Instructions

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful"
}
```

**Save the `access_token` for next steps!**

### Step 2: Login (Alternative to Registration)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

### Step 3: Initiate Payment (Protected)

```bash
curl -X POST http://localhost:3000/checkout/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "amount": 5000,
    "productId": 1
  }'
```

**Expected Response**:
```json
{
  "authorization_url": "https://checkout.paystack.com/abc123",
  "reference": "xyz789",
  "access_code": "abc123",
  "message": "Payment link generated successfully"
}
```

### Step 4: Complete Payment

1. Open the `authorization_url` in your browser
2. Use Paystack test card:
   - Card: 4084 0840 8408 4081
   - Expiry: 12/25
   - CVV: 408
   - PIN: 0000
   - OTP: 123456
3. Complete the payment

### Step 5: Check Your Orders (Protected)

```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "reference": "xyz789",
    "amount": 5000,
    "email": "testuser@example.com",
    "status": "paid",
    "productId": 1,
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "email": "testuser@example.com",
      "firstName": "Test",
      "lastName": "User"
    }
  }
]
```

### Step 6: Try Without Token (Should Fail)

```bash
curl http://localhost:3000/orders
```

**Expected Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Swagger Testing

1. Open http://localhost:3000/api
2. Click "Authorize" button (top right)
3. Enter: `Bearer YOUR_JWT_TOKEN_HERE`
4. Click "Authorize"
5. Now you can test protected endpoints

## Database Schema Changes

### Order Table (Updated)

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  reference VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  email VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  productId INTEGER,
  userId INTEGER,  -- NEW: Links to users table
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Migration Note**: Existing orders will have `userId = NULL`. New orders will automatically link to users.

## Webhook Flow (Updated)

1. User initiates payment (authenticated)
2. Checkout service includes `userId` in Paystack metadata
3. User completes payment on Paystack
4. Paystack sends webhook with metadata including `userId`
5. Webhook handler extracts `userId` from metadata
6. Order is created with `userId` link
7. User can see their order in GET /orders

## Environment Variables

No new environment variables required. Existing ones:

```env
# JWT Configuration (already in auth module)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Paystack (already configured)
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Database (already configured)
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Security Best Practices Implemented

1. ✅ **JWT Authentication**: All sensitive endpoints protected
2. ✅ **User Isolation**: Users can only access their own data
3. ✅ **Password Hashing**: bcrypt with salt rounds
4. ✅ **Webhook Signature Verification**: Prevents fake webhooks
5. ✅ **Input Validation**: class-validator on all DTOs
6. ✅ **Error Handling**: Consistent error responses
7. ✅ **Logging**: All operations logged for audit trail

## What's Next

### Completed ✅
- Link payments to users
- JWT authentication
- Protected endpoints
- User-specific order filtering
- Webhook user linking

### Remaining Tasks
1. **Admin Routes** (Stage 2 continuation):
   - Add RolesGuard for admin-only endpoints
   - Add GET /admin/orders (all orders)
   - Add PATCH /admin/orders/:id/status
   - Add GET /admin/users

2. **Email Notifications** (Stage 3):
   - Already implemented in webhook handler
   - Sends order confirmation email
   - Sends payment receipt email
   - Configure email service (Nodemailer/Resend)

## Troubleshooting

### Issue: "Unauthorized" when accessing protected endpoints
**Solution**: Make sure you're including the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Issue: Orders not showing userId
**Solution**: 
- Make sure you're using the JWT token when initiating payment
- Check that the token is valid and not expired
- Verify userId is in Paystack metadata (check logs)

### Issue: Can't see any orders
**Solution**:
- Make sure you're logged in as the user who made the payment
- Check that the payment was completed successfully
- Verify the webhook was received (check logs)

## Summary

All authentication and user linking fixes are complete! The system is now secure:

- ✅ Payments require authentication
- ✅ Orders are linked to users
- ✅ Users can only see their own orders
- ✅ Webhook properly links payments to users
- ✅ All sensitive endpoints protected
- ✅ Comprehensive logging and error handling

**Status**: Ready for production deployment with proper authentication! 🎉
