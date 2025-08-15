import express, { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { supabaseAdmin } from '../utils/supabase';
import { createStripeClient } from '../utils/stripe-config';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('subscription_tier, subscription_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw createError('User not found', 404);
    }

    const isActive = user.subscription_tier !== 'free' && 
      (!user.subscription_ends_at || new Date(user.subscription_ends_at) > new Date());

    res.json({
      tier: user.subscription_tier || 'free',
      isActive,
      endsAt: user.subscription_ends_at,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      features: getFeaturesByTier(user.subscription_tier || 'free'),
    });
  } catch (error) {
    next(error);
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: usage } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    const limits = getLimitsByTier(req.user!.subscriptionTier);

    res.json({
      current: {
        ideasViewed: usage?.ideas_viewed || 0,
        apiCalls: usage?.api_calls || 0,
      },
      limits,
      resetDate: getNextMonthStart(),
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session with Stripe
router.post('/checkout', authenticateToken, [
  body('tier').isIn(['premium', 'enterprise']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;
    const userId = req.user!.id;
    const user = req.user!;

    const stripe = createStripeClient();
    
    // Get or create Stripe customer
    let customerId = await getStripeCustomerId(userId, user.email);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: getStripePriceIdByTier(tier),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?checkout=canceled`,
      metadata: {
        userId: userId,
        tier,
        email: user.email,
      },
    });

    res.json({
      checkoutUrl: session.url,
      tier,
      price: getPriceByTier(tier),
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout creation failed:', error);
    next(createError('Failed to create checkout session', 500));
  }
});

// Create customer portal session
router.post('/portal', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = req.user!;

    const stripe = createStripeClient();
    
    // Get or create Stripe customer
    let customerId = await getStripeCustomerId(userId, user.email);

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error('Stripe portal creation failed:', error);
    next(createError('Failed to create customer portal session', 500));
  }
});

// Handle webhook from Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: Response, next: NextFunction) => {
  try {
    const stripe = createStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw createError('Webhook secret not configured', 500);
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      throw createError('Missing Stripe signature', 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Received Stripe webhook:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    next(error);
  }
});

async function getStripeCustomerId(userId: string, email: string): Promise<string> {
  // Check if user already has a Stripe customer ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create new Stripe customer
  const stripe = createStripeClient();
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId: userId.toString(),
    },
  });

  // Save customer ID to database
  await supabaseAdmin
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

function getFeaturesByTier(tier: string) {
  const features = {
    free: [
      'View up to 30 ideas per month',
      'Basic filtering',
      'Email notifications',
    ],
    premium: [
      'Unlimited idea views',
      'Advanced filtering and search',
      'Export to PDF/CSV',
      'Priority email support',
      'Bookmark ideas',
    ],
    enterprise: [
      'All premium features',
      'Custom industry targeting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
  };

  return features[tier as keyof typeof features] || features.free;
}

function getLimitsByTier(tier: string) {
  const limits = {
    free: {
      ideasViewed: 50,
      apiCalls: 100,
    },
    premium: {
      ideasViewed: -1, // unlimited
      apiCalls: 1000,
    },
    enterprise: {
      ideasViewed: -1, // unlimited
      apiCalls: 10000,
    },
  };

  return limits[tier as keyof typeof limits] || limits.free;
}

function getPriceByTier(tier: string) {
  const prices = {
    premium: 29.99,
    enterprise: 99.99,
  };

  return prices[tier as keyof typeof prices] || 0;
}

function getStripePriceIdByTier(tier: string) {
  const priceIds = {
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  };

  const priceId = priceIds[tier as keyof typeof priceIds];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }
  return priceId;
}

function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

async function handleCheckoutCompleted(session: any) {
  try {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing userId or tier in checkout session metadata');
      return;
    }

    // Update user with subscription info
    await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: tier,
        stripe_customer_id: session.customer,
      })
      .eq('id', userId);

    console.log(`Checkout completed for user ${userId} - ${tier} tier`);
  } catch (error) {
    console.error('Failed to handle checkout completion:', error);
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  try {
    const stripe = createStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    if (customer.deleted) {
      console.error('Customer was deleted');
      return;
    }

    const userId = (customer as any).metadata?.userId;
    if (!userId) {
      console.error('Missing userId in customer metadata');
      return;
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Determine tier based on price ID
    const priceId = subscription.items.data[0]?.price.id;
    let tier = 'free';
    
    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      tier = 'premium';
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      tier = 'enterprise';
    }

    await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: isActive ? tier : 'free',
        subscription_ends_at: currentPeriodEnd.toISOString(),
        stripe_subscription_id: subscription.id,
      })
      .eq('id', userId);

    console.log(`Updated subscription for user ${userId} to ${tier}, active: ${isActive}, ends: ${currentPeriodEnd}`);
  } catch (error) {
    console.error('Failed to handle subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const stripe = createStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    if (customer.deleted) {
      console.error('Customer was deleted');
      return;
    }

    const userId = (customer as any).metadata?.userId;
    if (!userId) {
      console.error('Missing userId in customer metadata');
      return;
    }

    // Set subscription to free tier
    await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_ends_at: new Date().toISOString(),
      })
      .eq('id', userId);

    console.log(`Subscription deleted for user ${userId}`);
  } catch (error) {
    console.error('Failed to handle subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    console.log(`Payment succeeded for invoice ${invoice.id}`);
    // Additional logic if needed when payment succeeds
  } catch (error) {
    console.error('Failed to handle payment success:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    console.log(`Payment failed for invoice ${invoice.id}`);
    // Additional logic if needed when payment fails
    // Could send email notification, update subscription status, etc.
  } catch (error) {
    console.error('Failed to handle payment failure:', error);
  }
}

export default router;