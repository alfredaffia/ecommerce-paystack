# E-commerce Paystack API

A production-ready NestJS e-commerce checkout API with Paystack payment integration, built with TypeScript, TypeORM, and PostgreSQL.

## 🚀 Features

- **Product Management**: Full CRUD operations for products
- **Paystack Integration**: Secure payment processing with Paystack
- **Order Tracking**: Automatic order creation via webhooks
- **Webhook Handling**: Secure signature verification for Paystack webhooks
- **API Documentation**: Interactive Swagger/OpenAPI docs
- **Error Handling**: Global exception filter with consistent error responses
- **Validation**: Comprehensive input validation with class-validator
- **Logging**: Structured logging for debugging and monitoring
- **Database**: PostgreSQL with TypeORM
- **Deployment Ready**: Configured for Render.com deployment

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Paystack account (test or live keys)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/alfredaffia/ecommerce-paystack.git
cd ecommerce-paystack

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env
# Edit .env with your values
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Paystack API Keys (get from https://dashboard.paystack.com/#/settings/developers)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Frontend URLs
FRONTEND_SUCCESS_URL=http://localhost:3000/success.html
FRONTEND_CANCEL_URL=http://localhost:3000/cancel
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# For production on Render, use the DATABASE_URL they provide
```

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Access Points
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Success Page**: http://localhost:3000/success.html

## 📚 API Endpoints

### Products
- `POST /products` - Create a new product
- `GET /products` - Get all products
- `GET /products/:id` - Get a product by ID

### Checkout
- `POST /checkout/pay` - Initiate a Paystack payment
- `GET /checkout/success` - Payment success callback (used by Paystack)
- `POST /checkout/webhook/paystack` - Webhook endpoint for Paystack events
- `GET /checkout/test-verify/:reference` - Test payment verification

### Orders
- `GET /orders` - Get all orders

## 🚀 Deployment to Render.com

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure `.env` is in `.gitignore` (never commit secrets!)

### Step 2: Create PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ecommerce-paystack-db`
   - **Database**: `ecommerce_paystack`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service on Render
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-paystack-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or paid for production)

### Step 4: Add Environment Variables
In the Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=3000
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
DATABASE_URL=<paste_internal_database_url_from_step_2>
FRONTEND_SUCCESS_URL=https://your-app-name.onrender.com/success.html
FRONTEND_CANCEL_URL=https://your-app-name.onrender.com/cancel
FRONTEND_URL=https://your-app-name.onrender.com
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (5-10 minutes)
4. Your API will be live at: `https://your-app-name.onrender.com`

### Step 6: Configure Paystack Webhook
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developers)
2. Navigate to **Settings** → **Webhooks**
3. Add webhook URL: `https://your-app-name.onrender.com/checkout/webhook/paystack`
4. Save changes

### Step 7: Test Your Deployment
1. Visit `https://your-app-name.onrender.com/api` for Swagger docs
2. Test creating a product via Swagger
3. Test initiating a payment
4. Complete a test payment with Paystack test card:
   - **Card Number**: 4084 0840 8408 4081
   - **Expiry**: Any future date
   - **CVV**: 408
   - **PIN**: 0000
   - **OTP**: 123456

## 🧪 Testing

### Test Payment Flow
1. Create a product: `POST /products`
2. Initiate payment: `POST /checkout/pay`
3. Complete payment using Paystack test card
4. Verify order created: `GET /orders`

### Test Webhook Locally (using ngrok)
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run start:dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL in Paystack webhook settings
# Example: https://abc123.ngrok.io/checkout/webhook/paystack
```

## 📝 Database Schema

### Product
- `id`: Primary key
- `name`: Product name
- `price`: Price in Naira
- `description`: Optional description
- `createdAt`: Timestamp

### Order
- `id`: Primary key
- `reference`: Paystack payment reference
- `amount`: Amount in Naira
- `email`: Customer email
- `status`: Order status (pending, paid, failed)
- `productId`: Reference to product
- `createdAt`: Timestamp

## 🔒 Security Features

- ✅ Webhook signature verification
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (TypeORM)
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Global exception handling

## 🐛 Troubleshooting

### Issue: "N/A" showing on success page
- Check that `PAYSTACK_SECRET_KEY` is set correctly
- Verify the payment reference is being passed in the URL
- Check server logs for verification errors

### Issue: Webhook not receiving events
- Verify webhook URL is correct in Paystack dashboard
- Check that your server is publicly accessible
- Ensure webhook signature verification is working

### Issue: Database connection failed
- Verify `DATABASE_URL` is correct
- Check that database is running
- Ensure SSL settings are correct for Render

## 📄 License

MIT

## 👤 Author

Alfred Affia
- GitHub: [@alfredaffia](https://github.com/alfredaffia)
- Repository: [ecommerce-paystack](https://github.com/alfredaffia/ecommerce-paystack)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
