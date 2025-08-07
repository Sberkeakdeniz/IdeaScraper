# Polar.sh Payment Integration Setup Guide

This guide will walk you through setting up polar.sh payment processing for your idea-scraper application.

## Prerequisites

- Polar.sh account (sign up at https://polar.sh/signup)
- Your application deployed or accessible via webhook URL

## Step 1: Account Setup (5 minutes)

1. **Sign Up**
   - Go to https://polar.sh/signup
   - Sign in with GitHub, Google, or email
   - Verify your email if needed

2. **Create Organization**
   - Complete your merchant profile
   - Set up your organization details
   - Note: This becomes your merchant identity

## Step 2: Get API Credentials (10 minutes)

### Access Token
1. Navigate to **Settings** → **API Keys** (or Developer Settings)
2. Click **Create Access Token** or **Generate New Token**
3. **Required Scopes** (select all):
   ```
   ✅ checkouts:read
   ✅ checkouts:write  
   ✅ customers:read
   ✅ customers:write
   ✅ products:read
   ✅ subscriptions:read
   ✅ subscriptions:write
   ```
4. Copy the token (format: `polar_pat_xxxxx...`)
5. **⚠️ Important**: Save this immediately - you can't view it again

### Organization ID
1. Go to **Organization Settings** or **Profile**
2. Look for **Organization ID** (format: `org_xxxxx...`)
3. Copy this ID

## Step 3: Create Products (10 minutes)

You need to create two subscription products:

### Premium Plan Product
1. Go to **Dashboard** → **Products**
2. Click **Create Product** or **New Product**
3. Fill in details:
   ```
   Name: Premium Plan
   Description: Access to premium features
   Type: Subscription
   Price: $29.99
   Billing: Monthly
   ```
4. **Save** and copy the **Price ID** (format: `price_xxxxx...`)

### Enterprise Plan Product  
1. Create another product:
   ```
   Name: Enterprise Plan
   Description: Full enterprise features
   Type: Subscription
   Price: $99.99
   Billing: Monthly
   ```
2. **Save** and copy the **Price ID**

## Step 4: Configure Webhooks (5 minutes)

1. Go to **Dashboard** → **Webhooks** or **Integrations** → **Webhooks**
2. Click **Add Webhook** or **Create Webhook**
3. Configure:
   ```
   Endpoint URL: https://yourdomain.com/api/subscriptions/webhook
   ```
   *Replace `yourdomain.com` with your actual domain*

4. **Select Events** (check these):
   ```
   ✅ checkout.created
   ✅ order.created  
   ✅ subscription.created
   ✅ subscription.updated
   ✅ subscription.cancelled
   ```

5. **Save** and copy the **Webhook Secret** (format: `whsec_xxxxx...`)

## Step 5: Configure Environment Variables (5 minutes)

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit your `.env` file** and add these values:
   ```bash
   # Polar.sh Configuration
   POLAR_ACCESS_TOKEN="polar_pat_your_actual_token_here"
   POLAR_ORGANIZATION_ID="org_your_organization_id_here"
   POLAR_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   POLAR_PREMIUM_PRICE_ID="price_premium_product_id_here"
   POLAR_ENTERPRISE_PRICE_ID="price_enterprise_product_id_here"
   
   # Make sure these are also set
   FRONTEND_URL="https://yourdomain.com"  # Your frontend URL
   ```

3. **Security**: Never commit your `.env` file to git!

## Step 6: Verify Configuration

Run the verification script to test your setup:

```bash
npm run verify-polar-setup
```

This will check:
- ✅ All environment variables are set and properly formatted
- ✅ API connection works with your access token
- ✅ Products are accessible with your price IDs
- ✅ Frontend URL is configured for checkout redirects

**Example successful output:**
```
🔍 Verifying Polar.sh Configuration...

📋 Verification Results:

1. ✅ Environment Variables: PASS
   All required environment variables are set and properly formatted

2. ✅ API Connection: PASS
   Successfully connected to Polar.sh API

3. ✅ Product Access: PASS
   Both premium and enterprise products found and accessible

4. ✅ Frontend URL: PASS
   Frontend URL configured: https://yourdomain.com

════════════════════════════════════════════════════════════
🎉 SUCCESS: Polar.sh is properly configured and ready to use!

Next steps:
1. Start your application: npm run dev
2. Test the checkout flow in your application
3. Check webhook logs for successful payment processing
════════════════════════════════════════════════════════════
```

## Testing the Integration

### Local Testing (Development)
1. **Use ngrok** for webhook testing:
   ```bash
   # Install ngrok if needed
   npm install -g ngrok
   
   # Expose your local server
   ngrok http 3001
   
   # Update webhook URL to: https://xxx.ngrok.io/api/subscriptions/webhook
   ```

2. **Test checkout flow**:
   - Start your application
   - Try to upgrade to Premium/Enterprise
   - Verify redirect to polar.sh checkout
   - Complete test payment
   - Check webhook logs

### Production Testing
1. Deploy your application with environment variables
2. Update webhook URL to production endpoint
3. Test with real card (small amount)
4. Verify subscription activation in database

## Troubleshooting

### Common Issues

**❌ "Access token invalid"**
- Verify token copied correctly
- Check token permissions/scopes
- Regenerate token if needed

**❌ "Product not found"**  
- Verify price IDs are correct
- Ensure products are published/active
- Check organization ID matches

**❌ "Webhook signature invalid"**
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Ensure HTTPS in production

**❌ "Organization not found"**
- Double-check organization ID
- Verify you're using the right account

### Debug Mode

Enable debug logging in development:

```bash
# Add to your .env
NODE_ENV=development
LOG_LEVEL=debug
```

Check logs for detailed polar.sh API responses.

## API Endpoints

After setup, these endpoints will be available:

```bash
# Get subscription status
GET /api/subscriptions/status

# Create checkout session  
POST /api/subscriptions/checkout
Body: { "tier": "premium" | "enterprise" }

# Webhook endpoint (for polar.sh)
POST /api/subscriptions/webhook
```

## Support

- **Polar.sh Docs**: https://docs.polar.sh
- **Polar.sh Support**: Contact via dashboard
- **Integration Issues**: Check application logs

---

**⚠️ Security Reminder**: Keep your access token and webhook secret secure. Never expose them in client-side code or commit them to version control.