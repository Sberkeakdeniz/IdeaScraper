import express, { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { supabaseAdmin } from '../utils/supabase';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Mock Polar.sh checkout creation (for testing when Polar API is unavailable)
router.post('/checkout-mock', authenticateToken, [
  body('tier').isIn(['premium', 'enterprise']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;
    const userId = req.user!.id;
    const user = req.user!;

    // Simulate successful checkout session creation
    const mockCheckoutSession = {
      id: `checkout_mock_${Date.now()}`,
      url: `http://localhost:3003/api/subscriptions/mock-payment?tier=${tier}&userId=${userId}&email=${encodeURIComponent(user.email)}`,
      tier,
      price: tier === 'premium' ? 29.99 : 99.99,
    };

    console.log('🎭 Mock checkout session created:', mockCheckoutSession);

    res.json({
      checkoutUrl: mockCheckoutSession.url,
      tier: mockCheckoutSession.tier,
      price: mockCheckoutSession.price,
      sessionId: mockCheckoutSession.id,
    });
  } catch (error) {
    console.error('Mock checkout creation failed:', error);
    next(createError('Failed to create mock checkout session', 500));
  }
});

// Mock payment page (simulates Polar.sh payment form)
router.get('/mock-payment', async (req: express.Request, res: Response) => {
  const { tier, userId, email } = req.query;
  
  const mockPaymentPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Payment - Polar.sh Simulator</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f5f5f5;
        }
        .payment-card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { color: #2563eb; margin-bottom: 20px; }
        .plan-info { 
          background: #eff6ff; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .btn {
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px 0;
          width: 100%;
        }
        .btn:hover { background: #1d4ed8; }
        .test-card {
          background: #f0f9ff;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="payment-card">
        <h1 class="header">🎭 Mock Payment Page</h1>
        <p><strong>Simulating Polar.sh Payment Flow</strong></p>
        
        <div class="plan-info">
          <h3>${tier.toUpperCase()} Plan</h3>
          <p>Price: $${tier === 'premium' ? '29.99' : '99.99'}/month</p>
          <p>Customer: ${decodeURIComponent(email as string)}</p>
        </div>
        
        <div class="test-card">
          <p><strong>Test Mode:</strong> This simulates the Polar.sh payment flow</p>
          <p>In production, users would enter real payment details here</p>
        </div>
        
        <form method="POST" action="/api/subscriptions/mock-success">
          <input type="hidden" name="tier" value="${tier}" />
          <input type="hidden" name="userId" value="${userId}" />
          <input type="hidden" name="email" value="${email}" />
          
          <button type="submit" class="btn">✅ Complete Mock Payment</button>
        </form>
        
        <form method="POST" action="/api/subscriptions/mock-cancel">
          <button type="submit" class="btn" style="background: #dc2626;">❌ Cancel Payment</button>
        </form>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is a mock payment page for testing. Real Polar.sh integration will replace this.
        </p>
      </div>
    </body>
    </html>
  `;
  
  res.send(mockPaymentPage);
});

// Mock successful payment (simulates webhook call)
router.post('/mock-success', async (req: express.Request, res: Response) => {
  const { tier, userId, email } = req.body;
  
  try {
    console.log('🎭 Processing mock payment success...');
    
    // Simulate webhook processing - update user subscription
    await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .eq('id', userId);
    
    console.log(`🎭 Mock payment processed: User ${userId} upgraded to ${tier}`);
    
    // Redirect to success page
    const successPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Successful</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            text-align: center;
          }
          .success { color: #16a34a; }
        </style>
      </head>
      <body>
        <h1 class="success">🎉 Payment Successful!</h1>
        <p>Your ${tier} subscription has been activated.</p>
        <p>You can now access premium features!</p>
        <a href="http://localhost:3000/dashboard" style="
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin-top: 20px;
        ">Go to Dashboard</a>
      </body>
      </html>
    `;
    
    res.send(successPage);
    
  } catch (error) {
    console.error('Mock payment processing failed:', error);
    res.status(500).send('Mock payment processing failed');
  }
});

// Mock cancelled payment
router.post('/mock-cancel', async (req: express.Request, res: Response) => {
  console.log('🎭 Mock payment cancelled');
  
  const cancelPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px;
          text-align: center;
        }
        .cancel { color: #dc2626; }
      </style>
    </head>
    <body>
      <h1 class="cancel">❌ Payment Cancelled</h1>
      <p>No charges were made to your account.</p>
      <a href="http://localhost:3000/dashboard" style="
        background: #6b7280;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin-top: 20px;
      ">Return to Dashboard</a>
    </body>
    </html>
  `;
  
  res.send(cancelPage);
});

export default router;