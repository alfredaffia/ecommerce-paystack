# Quick Start Guide

Get the E-commerce Paystack API running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Paystack account (free test account works)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/alfredaffia/ecommerce-paystack.git
cd ecommerce-paystack

# Install dependencies
npm install
```

## Step 2: Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file with your values:

```env
# Get Paystack keys from: https://dashboard.paystack.com/#/settings/developers
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Your PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_paystack

# Keep these as is for local development
PORT=3000
NODE_ENV=development
FRONTEND_SUCCESS_URL=http://localhost:3000/success.html
FRONTEND_CANCEL_URL=http://localhost:3000/cancel
FRONTEND_URL=http://localhost:3000
```

## Step 3: Run the Application (1 minute)

```bash
# Development mode with hot reload
npm run start:dev
```

Wait for:
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api
```

## Step 4: Test the API (1 minute)

### Option A: Use Swagger UI (Recommended)
1. Open http://localhost:3000/api in your browser
2. Try the endpoints interactively

### Option B: Use Test Script

**Linux/Mac**:
```bash
chmod +x test-api.sh
./test-api.sh
```

**Windows PowerShell**:
```powershell
.\test-api.ps1
```

### Option C: Use curl

```bash
# Health check
curl http://localhost:3000/health

# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 5000,
    "description": "A test product"
  }'

# Get all products
curl http://localhost:3000/products

# Initiate a payment
curl -X POST http://localhost:3000/checkout/pay \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 5000,
    "productId": 1
  }'
```

## Step 5: Complete a Test Payment

1. Use the `/checkout/pay` endpoint to get a payment URL
2. Open the `authorization_url` in your browser
3. Use Paystack test card:
   - **Card**: 4084 0840 8408 4081
   - **Expiry**: 12/25 (any future date)
   - **CVV**: 408
   - **PIN**: 0000
   - **OTP**: 123456
4. Complete the payment
5. You'll be redirected to the success page
6. Check orders: `GET /orders`

## Common Issues

### Issue: Database connection failed
**Solution**: Make sure PostgreSQL is running and `DATABASE_URL` is correct

```bash
# Check if PostgreSQL is running
# Mac: brew services list
# Linux: sudo systemctl status postgresql
# Windows: Check Services app
```

### Issue: Paystack API error
**Solution**: Verify your Paystack keys are correct

1. Go to https://dashboard.paystack.com/#/settings/developers
2. Copy the test keys (they start with `sk_test_` and `pk_test_`)
3. Update `.env` file

### Issue: Port 3000 already in use
**Solution**: Change the port in `.env`

```env
PORT=3001
```

## What's Next?

### Explore the API
- **Swagger Docs**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Products**: http://localhost:3000/products
- **Orders**: http://localhost:3000/orders

### Test Webhooks Locally
Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Add to Paystack webhook settings:
# https://abc123.ngrok.io/checkout/webhook/paystack
```

### Deploy to Production
See `DEPLOYMENT.md` for step-by-step Render.com deployment guide.

### Add More Features
- **Stage 2**: Authentication and admin features
- **Stage 3**: Email notifications

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create a product |
| POST | `/checkout/pay` | Initiate payment |
| GET | `/checkout/success` | Payment callback |
| POST | `/checkout/webhook/paystack` | Webhook handler |
| GET | `/orders` | Get all orders |

## Support

- **Documentation**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Issues**: https://github.com/alfredaffia/ecommerce-paystack/issues

## Success! 🎉

Your E-commerce Paystack API is now running!

Try creating products and processing payments through the Swagger UI at http://localhost:3000/api
