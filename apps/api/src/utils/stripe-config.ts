import Stripe from 'stripe';

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  premiumPriceId: string;
  enterprisePriceId: string;
}

export function validateStripeConfig(): StripeConfig {
  const config = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  };

  const missingVars: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(`STRIPE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file for configuration instructions.'
    );
  }

  // Validate secret key format
  if (!config.secretKey!.startsWith('sk_')) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY format. Expected key to start with "sk_"'
    );
  }

  // Validate publishable key format
  if (!config.publishableKey!.startsWith('pk_')) {
    throw new Error(
      'Invalid STRIPE_PUBLISHABLE_KEY format. Expected key to start with "pk_"'
    );
  }

  // Validate webhook secret format
  if (!config.webhookSecret!.startsWith('we_') && !config.webhookSecret!.startsWith('whsec_')) {
    throw new Error(
      'Invalid STRIPE_WEBHOOK_SECRET format. Expected secret to start with "we_" or "whsec_"'
    );
  }

  // Validate price ID formats
  if (!config.premiumPriceId!.startsWith('price_')) {
    throw new Error(
      'Invalid STRIPE_PREMIUM_PRICE_ID format. Expected ID to start with "price_"'
    );
  }

  if (!config.enterprisePriceId!.startsWith('price_')) {
    throw new Error(
      'Invalid STRIPE_ENTERPRISE_PRICE_ID format. Expected ID to start with "price_"'
    );
  }

  return config as StripeConfig;
}

export async function testStripeConnection(config: StripeConfig): Promise<void> {
  try {
    const stripe = new Stripe(config.secretKey);

    // Test API connection by fetching account
    await stripe.accounts.retrieve();

  } catch (error: any) {
    if (error.type === 'StripeAuthenticationError') {
      throw new Error(
        'Stripe authentication failed. Please check your STRIPE_SECRET_KEY.'
      );
    } else {
      throw new Error(
        `Failed to connect to Stripe API: ${error.message}`
      );
    }
  }
}

export function createStripeClient(config?: StripeConfig): Stripe {
  const validConfig = config || validateStripeConfig();
  
  return new Stripe(validConfig.secretKey, {
    apiVersion: '2024-06-20', // Use latest API version
  });
}