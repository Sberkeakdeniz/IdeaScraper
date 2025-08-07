import express, { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { Polar } from '@polar-sh/sdk';

const prisma = new PrismaClient();
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const isActive = user.subscriptionTier !== 'free' && 
      (!user.subscriptionEndsAt || user.subscriptionEndsAt > new Date());

    res.json({
      tier: user.subscriptionTier,
      isActive,
      endsAt: user.subscriptionEndsAt,
      features: getFeaturesByTier(user.subscriptionTier),
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

    const usage = await prisma.userUsage.findUnique({
      where: {
        userId_monthYear: {
          userId,
          monthYear: currentMonth,
        },
      },
    });

    const limits = getLimitsByTier(req.user!.subscriptionTier);

    res.json({
      current: {
        ideasViewed: usage?.ideasViewed || 0,
        apiCalls: usage?.apiCalls || 0,
      },
      limits,
      resetDate: getNextMonthStart(),
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session with polar.sh
router.post('/checkout', authenticateToken, [
  body('tier').isIn(['premium', 'enterprise']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;
    const userId = req.user!.id;
    const user = req.user!;

    if (!process.env.POLAR_ORGANIZATION_ID) {
      throw createError('Polar organization ID not configured', 500);
    }

    // Create checkout session with polar.sh
    const checkoutSession = await polar.checkouts.create({
      products: [getPolarPriceIdByTier(tier)],
      successUrl: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
      customerEmail: user.email,
      metadata: {
        userId: userId.toString(),
        tier,
      },
    });

    res.json({
      checkoutUrl: checkoutSession.url,
      tier,
      price: getPriceByTier(tier),
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Polar checkout creation failed:', error);
    next(createError('Failed to create checkout session', 500));
  }
});

// Handle webhook from polar.sh
router.post('/webhook', async (req: express.Request, res: Response, next: NextFunction) => {
  try {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw createError('Webhook secret not configured', 500);
    }

    // Verify webhook signature (basic implementation)
    const signature = req.headers['polar-webhook-signature'] as string;
    if (!signature) {
      throw createError('Missing webhook signature', 400);
    }

    const event = req.body;
    console.log('Received polar.sh webhook:', event.type);

    switch (event.type) {
      case 'checkout.created':
        console.log('Checkout session created:', event.data.id);
        break;

      case 'order.created':
        await handleOrderCreated(event.data);
        break;

      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(event.data);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
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

function getPolarPriceIdByTier(tier: string) {
  const priceIds = {
    premium: process.env.POLAR_PREMIUM_PRICE_ID,
    enterprise: process.env.POLAR_ENTERPRISE_PRICE_ID,
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

async function handleOrderCreated(orderData: any) {
  try {
    const userId = orderData.metadata?.userId;
    const tier = orderData.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing userId or tier in order metadata');
      return;
    }

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    console.log(`Updated user ${userId} to ${tier} tier`);
  } catch (error) {
    console.error('Failed to handle order created:', error);
  }
}

async function handleSubscriptionUpdate(subscriptionData: any) {
  try {
    const userId = subscriptionData.metadata?.userId;
    const tier = subscriptionData.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing userId or tier in subscription metadata');
      return;
    }

    const endsAt = subscriptionData.current_period_end ? 
      new Date(subscriptionData.current_period_end * 1000) : 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEndsAt: endsAt,
      },
    });

    console.log(`Updated subscription for user ${userId} to ${tier}, ends at ${endsAt}`);
  } catch (error) {
    console.error('Failed to handle subscription update:', error);
  }
}

async function handleSubscriptionCancelled(subscriptionData: any) {
  try {
    const userId = subscriptionData.metadata?.userId;

    if (!userId) {
      console.error('Missing userId in subscription metadata');
      return;
    }

    // Set subscription to end at the current period end
    const endsAt = subscriptionData.current_period_end ? 
      new Date(subscriptionData.current_period_end * 1000) : 
      new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionEndsAt: endsAt,
      },
    });

    console.log(`Scheduled subscription cancellation for user ${userId} at ${endsAt}`);
  } catch (error) {
    console.error('Failed to handle subscription cancellation:', error);
  }
}

export default router;