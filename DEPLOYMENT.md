# Deployment Guide for Render.com

This guide provides step-by-step instructions for deploying the E-commerce Paystack API to Render.com.

## Prerequisites Checklist

- [ ] GitHub account with repository pushed
- [ ] Render.com account (free tier works)
- [ ] Paystack account with API keys
- [ ] All code committed and pushed to GitHub

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Render

1. **Login to Render**: Go to https://dashboard.render.com/
2. **Create New Database**:
   - Click **"New +"** button (top right)
   - Select **"PostgreSQL"**
3. **Configure Database**:
   ```
   Name: ecommerce-paystack-db
   Database: ecommerce_paystack
   User: (auto-generated, leave as is)
   Region: Oregon (US West) or closest to your users
   PostgreSQL Version: 16 (latest)
   Plan: Free
   ```
4. **Create Database**: Click **"Create Database"**
5. **Wait for Provisioning**: Takes 1-2 minutes
6. **Copy Connection String**:
   - Scroll down to **"Connections"** section
   - Copy the **"Internal Database URL"**
   - Format: `postgresql://user:password@host/database`
   - **IMPORTANT**: Save this URL, you'll need it in Step 3

### 2. Create Web Service on Render

1. **Create New Web Service**:
   - Click **"New +"** button
   - Select **"Web Service"**
2. **Connect Repository**:
   - Click **"Connect account"** if not connected
   - Select your GitHub account
   - Find and select `alfredaffia/ecommerce-paystack` repository
   - Click **"Connect"**
3. **Configure Web Service**:
   ```
   Name: ecommerce-paystack-api
   Region: Oregon (US West) - MUST match database region
   Branch: main
   Root Directory: (leave blank)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Plan: Free
   ```
4. **Advanced Settings** (click to expand):
   - **Auto-Deploy**: Yes (recommended)
   - **Health Check Path**: `/health`

### 3. Configure Environment Variables

In the **Environment** section, add these variables:

```bash
# Required Variables
NODE_ENV=production
PORT=3000

# Paystack Keys (get from https://dashboard.paystack.com/#/settings/developers)
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here

# Database (paste the Internal Database URL from Step 1)
DATABASE_URL=postgresql://user:password@host/database

# Frontend URLs (replace 'your-app-name' with your actual Render service name)
FRONTEND_SUCCESS_URL=https://your-app-name.onrender.com/success.html
FRONTEND_CANCEL_URL=https://your-app-name.onrender.com/cancel
FRONTEND_URL=https://your-app-name.onrender.com
```

**Important Notes**:
- Replace `your-app-name` with your actual Render service name
- Use your actual Paystack keys from dashboard
- Paste the exact DATABASE_URL from Step 1

### 4. Deploy

1. **Create Web Service**: Click **"Create Web Service"** button
2. **Wait for Build**: 
   - Initial build takes 5-10 minutes
   - Watch the logs in real-time
   - Look for: "Application is running on: http://localhost:3000"
3. **Check Deployment Status**:
   - Status should show **"Live"** with green indicator
   - Note your app URL: `https://your-app-name.onrender.com`

### 5. Verify Deployment

1. **Test Health Endpoint**:
   ```bash
   curl https://your-app-name.onrender.com/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.45,
     "environment": "production"
   }
   ```

2. **Test Swagger Docs**:
   - Visit: `https://your-app-name.onrender.com/api`
   - Should see interactive API documentation

3. **Test Database Connection**:
   - In Swagger, try `GET /products`
   - Should return empty array `[]` (no errors)

### 6. Configure Paystack Webhook

1. **Login to Paystack**: https://dashboard.paystack.com/
2. **Navigate to Webhooks**:
   - Go to **Settings** → **API Keys & Webhooks**
   - Scroll to **Webhook URL** section
3. **Add Webhook URL**:
   ```
   https://your-app-name.onrender.com/checkout/webhook/paystack
   ```
4. **Save Changes**: Click **"Save Changes"**
5. **Test Webhook** (optional):
   - Paystack provides a "Test Webhook" button
   - Check your Render logs to see if webhook was received

### 7. End-to-End Testing

#### Test 1: Create a Product
```bash
curl -X POST https://your-app-name.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 5000,
    "description": "Test product for deployment"
  }'
```

Expected response:
```json
{
  "id": 1,
  "name": "Test Product",
  "price": 5000,
  "description": "Test product for deployment",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Test 2: Initiate Payment
```bash
curl -X POST https://your-app-name.onrender.com/checkout/pay \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 5000,
    "productId": 1
  }'
```

Expected response:
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "...",
  "message": "Payment link generated successfully"
}
```

#### Test 3: Complete Test Payment

1. **Copy the `authorization_url`** from Test 2 response
2. **Open URL in browser**
3. **Use Paystack Test Card**:
   - Card Number: `4084 0840 8408 4081`
   - Expiry: Any future date (e.g., `12/25`)
   - CVV: `408`
   - PIN: `0000`
   - OTP: `123456`
4. **Complete Payment**
5. **Verify Redirect**: Should redirect to success page with amount displayed
6. **Check Orders**:
   ```bash
   curl https://your-app-name.onrender.com/orders
   ```
   Should show the completed order

## Troubleshooting

### Issue: Build Failed

**Symptoms**: Build logs show errors, deployment fails

**Solutions**:
1. Check that `package.json` has all dependencies
2. Verify Node version compatibility
3. Check build logs for specific errors
4. Ensure `npm run build` works locally

### Issue: Database Connection Failed

**Symptoms**: App crashes with database connection errors

**Solutions**:
1. Verify `DATABASE_URL` is correct (copy from Render database page)
2. Ensure database and web service are in the same region
3. Check database status (should be "Available")
4. Verify SSL settings in `app.module.ts`

### Issue: Environment Variables Not Working

**Symptoms**: App can't find Paystack keys or other config

**Solutions**:
1. Double-check all environment variables are set
2. No quotes around values in Render dashboard
3. Redeploy after adding/changing env vars
4. Check logs for "Missing secret key" errors

### Issue: Webhook Not Receiving Events

**Symptoms**: Payments complete but orders not created

**Solutions**:
1. Verify webhook URL in Paystack dashboard is correct
2. Check Render logs for webhook requests
3. Ensure webhook signature verification is working
4. Test webhook using Paystack's test button

### Issue: "N/A" on Success Page

**Symptoms**: Success page shows "N/A" for amount

**Solutions**:
1. Check `PAYSTACK_SECRET_KEY` is set correctly
2. Verify payment reference is in URL
3. Check Render logs for verification errors
4. Test verification endpoint: `/checkout/test-verify/:reference`

### Issue: Free Tier Limitations

**Symptoms**: App spins down after inactivity, slow cold starts

**Solutions**:
1. Free tier apps spin down after 15 minutes of inactivity
2. First request after spin-down takes 30-60 seconds
3. Consider upgrading to paid plan for production
4. Use a service like UptimeRobot to keep app alive (ping every 14 minutes)

## Monitoring Your Deployment

### View Logs
1. Go to Render dashboard
2. Click on your web service
3. Click **"Logs"** tab
4. View real-time logs

### Check Metrics
1. In Render dashboard, click **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts (Paid Plans)
1. Go to **"Settings"** → **"Notifications"**
2. Add email or Slack webhook
3. Configure alert conditions

## Updating Your Deployment

### Automatic Deployment (Recommended)
1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. Render automatically detects changes and redeploys
4. Watch deployment progress in Render dashboard

### Manual Deployment
1. Go to Render dashboard
2. Click on your web service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Production Checklist

Before going live with real payments:

- [ ] Switch to Paystack live keys (not test keys)
- [ ] Update `FRONTEND_SUCCESS_URL` to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Disable `synchronize` in TypeORM (set to false)
- [ ] Set up database backups (Render paid plans)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Test with real payment (small amount)
- [ ] Review Paystack webhook logs
- [ ] Set up SSL certificate (automatic on Render)
- [ ] Review security settings
- [ ] Set up error tracking (e.g., Sentry)

## Support

If you encounter issues:

1. **Check Render Logs**: Most issues show up in logs
2. **Review Paystack Dashboard**: Check for API errors
3. **Test Locally**: Ensure code works locally first
4. **Render Support**: https://render.com/docs
5. **Paystack Support**: https://paystack.com/docs

## Next Steps

After successful deployment:

1. **Stage 2**: Add authentication and admin features
2. **Stage 3**: Add email notifications
3. **Monitoring**: Set up error tracking and monitoring
4. **Scaling**: Consider upgrading to paid plan for production
5. **Custom Domain**: Add your own domain name

---

**Deployment Complete!** 🎉

Your E-commerce Paystack API is now live and ready to process payments.
