/**
 * Validates a user ID from webhook metadata and returns it as a string
 * @param metadata - The metadata object from webhook
 * @returns Validated user ID as string (for Prisma compatibility)
 * @throws Error if validation fails
 */
export function validateWebhookUserId(metadata: any): string {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Webhook metadata is missing or invalid');
  }

  const userId = metadata.userId;
  
  if (!userId) {
    throw new Error('User ID is required in webhook metadata');
  }
  
  // Convert to string and validate
  const userIdString = String(userId).trim();
  
  if (!userIdString || userIdString === 'undefined' || userIdString === 'null') {
    throw new Error('User ID cannot be empty or null');
  }
  
  // Validate format - should be either cuid or numeric string
  if (!/^(c[a-z0-9]+|\d+)$/.test(userIdString)) {
    throw new Error('User ID must be a valid cuid or numeric string');
  }
  
  return userIdString;
}

/**
 * Validates a subscription tier value
 * @param tier - The tier to validate  
 * @returns The validated tier as string
 * @throws Error if validation fails
 */
export function validateSubscriptionTier(tier: any): string {
  if (!tier) {
    throw new Error('Subscription tier is required');
  }

  const validTiers = ['free', 'premium', 'enterprise'];
  const tierString = String(tier).toLowerCase();

  if (!validTiers.includes(tierString)) {
    throw new Error(`Invalid subscription tier. Must be one of: ${validTiers.join(', ')}`);
  }

  return tierString;
}