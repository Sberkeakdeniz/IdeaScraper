import { Polar } from '@polar-sh/sdk';

export interface PolarConfig {
  accessToken: string;
  organizationId: string;
  webhookSecret: string;
  premiumPriceId: string;
  enterprisePriceId: string;
}

export function validatePolarConfig(): PolarConfig {
  const config = {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    organizationId: process.env.POLAR_ORGANIZATION_ID,
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
    premiumPriceId: process.env.POLAR_PREMIUM_PRICE_ID,
    enterprisePriceId: process.env.POLAR_ENTERPRISE_PRICE_ID,
  };

  const missingVars: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(`POLAR_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Polar.sh environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and docs/POLAR_SETUP.md for configuration instructions.'
    );
  }

  // Validate token format
  if (!config.accessToken!.startsWith('polar_')) {
    throw new Error(
      'Invalid POLAR_ACCESS_TOKEN format. Expected token to start with "polar_"'
    );
  }

  // Validate organization ID format  
  if (!config.organizationId!.startsWith('org_')) {
    throw new Error(
      'Invalid POLAR_ORGANIZATION_ID format. Expected ID to start with "org_"'
    );
  }

  // Validate webhook secret format
  if (!config.webhookSecret!.startsWith('whsec_')) {
    throw new Error(
      'Invalid POLAR_WEBHOOK_SECRET format. Expected secret to start with "whsec_"'
    );
  }

  // Validate price ID formats
  if (!config.premiumPriceId!.startsWith('price_')) {
    throw new Error(
      'Invalid POLAR_PREMIUM_PRICE_ID format. Expected ID to start with "price_"'
    );
  }

  if (!config.enterprisePriceId!.startsWith('price_')) {
    throw new Error(
      'Invalid POLAR_ENTERPRISE_PRICE_ID format. Expected ID to start with "price_"'
    );
  }

  return config as PolarConfig;
}

export async function testPolarConnection(config: PolarConfig): Promise<void> {
  try {
    const polar = new Polar({
      accessToken: config.accessToken,
    });

    // Test API connection by fetching organization
    await polar.organizations.get({
      id: config.organizationId,
    });

  } catch (error: any) {
    if (error.status === 401) {
      throw new Error(
        'Polar.sh authentication failed. Please check your POLAR_ACCESS_TOKEN.'
      );
    } else if (error.status === 404) {
      throw new Error(
        'Polar.sh organization not found. Please check your POLAR_ORGANIZATION_ID.'
      );
    } else {
      throw new Error(
        `Failed to connect to Polar.sh API: ${error.message}`
      );
    }
  }
}

export function createPolarClient(config?: PolarConfig): Polar {
  const validConfig = config || validatePolarConfig();
  
  return new Polar({
    accessToken: validConfig.accessToken,
  });
}