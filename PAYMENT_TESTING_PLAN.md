# Payment Flow Testing Plan - Premium Subscription

## Test Environment Setup
- **Platform**: Reddit Idea Finder
- **Payment Provider**: Polar.sh (Sandbox)
- **Test Plan**: Premium ($29/month)
- **Testing Date**: 2025-08-09

## Prerequisites Checklist
- [x] Polar.sh sandbox account created
- [x] API credentials obtained
- [x] Webhook secret configured
- [x] Products created in Polar.sh dashboard
- [ ] ngrok tunnel active (for webhook testing)
- [ ] Application servers running

## Testing Phases

### Phase 1: Environment Configuration
1. Update .env with Polar.sh sandbox credentials
2. Verify environment variables are loaded
3. Test API connection to Polar.sh

### Phase 2: User Journey
1. Register new test user
2. Login and obtain JWT tokens
3. Navigate to pricing page
4. Click "Start Free Trial" for Premium plan

### Phase 3: Checkout Flow
1. API creates checkout session with Polar.sh
2. User redirected to Polar.sh checkout page
3. Complete test payment with sandbox card
4. Handle redirect back to application

### Phase 4: Webhook Processing
1. Receive webhook from Polar.sh
2. Verify webhook signature
3. Process subscription activation
4. Update user subscription in database

### Phase 5: Feature Access Verification
1. Check user subscription status
2. Verify premium features are accessible
3. Test usage tracking and limits
4. Confirm UI reflects premium status

### Phase 6: Edge Cases
1. Test expired token handling
2. Test invalid payment scenarios
3. Test subscription cancellation
4. Test webhook retry mechanism

## Test Data

### Test User Credentials
```
Email: test.premium@example.com
Password: TestUser123!
Name: Premium Test User
```

### Sandbox Payment Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

## Expected Outcomes

### Successful Payment Flow
1. User clicks Premium upgrade → Redirected to Polar.sh
2. Completes payment → Redirected back with success
3. Webhook received → Subscription activated
4. Database updated → User has premium access
5. UI updated → Premium features available

### API Endpoints to Test
```
POST /api/auth/register
POST /api/auth/login
GET /api/subscriptions/status
POST /api/subscriptions/checkout
POST /api/subscriptions/webhook
GET /api/subscriptions/usage
```

## Monitoring Points
- API server logs
- Webhook receipt confirmation
- Database subscription updates
- Frontend UI changes
- Error handling at each step

## Test Execution Log
(Will be updated during testing)

### Step 1: Environment Setup
- [ ] .env updated with real sandbox keys
- [ ] Servers started successfully
- [ ] ngrok tunnel created

### Step 2: User Registration
- [ ] User registered successfully
- [ ] JWT tokens received
- [ ] User logged in

### Step 3: Checkout Initiation
- [ ] Checkout session created
- [ ] Redirect URL generated
- [ ] User redirected to Polar.sh

### Step 4: Payment Completion
- [ ] Payment processed in sandbox
- [ ] Success redirect received
- [ ] Webhook delivered

### Step 5: Subscription Activation
- [ ] Webhook processed
- [ ] Database updated
- [ ] Premium features accessible

## Issues & Resolutions
(To be documented during testing)