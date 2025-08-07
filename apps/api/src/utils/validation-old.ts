/**
 * Safely validates and converts a string to integer
 * @param value - The value to convert
 * @param fieldName - Name of the field for error messages
 * @returns The validated integer
 * @throws Error if validation fails
 */
export function validateIntegerString(value: any, fieldName: string): number {
  // Check if value exists
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }

  // Convert to string if not already
  const stringValue = String(value).trim();

  // Check if empty
  if (!stringValue) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  // Check if it's a valid integer string
  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} must be a valid positive integer`);
  }

  const intValue = parseInt(stringValue, 10);

  // Check if conversion was successful and within safe range
  if (isNaN(intValue) || !Number.isSafeInteger(intValue)) {
    throw new Error(`${fieldName} must be a safe integer`);
  }

  // Check if it's positive
  if (intValue <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return intValue;
}

/**
 * Validates a user ID from webhook metadata
 * @param metadata - The metadata object from webhook
 * @returns Validated user ID as string (for Prisma compatibility)
 * @throws Error if validation fails
 */
export function validateWebhookUserId(metadata: any): string {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Webhook metadata is missing or invalid');
  }

  const userId = metadata.userId;
  
  // For webhook data, userId might come as string or number
  // Validate and normalize to string for Prisma
  if (!userId) {
    throw new Error('User ID is required in webhook metadata');
  }
  
  const userIdString = String(userId).trim();
  
  // Validate it looks like a valid ID (either cuid or integer)
  if (!userIdString || userIdString === 'undefined' || userIdString === 'null') {
    throw new Error('User ID cannot be empty or null');
  }
  
  // Check if it's a cuid (starts with 'c' and has alphanumeric chars) or numeric string
  if (!/^(c[a-z0-9]+|\d+)$/.test(userIdString)) {
    throw new Error('User ID must be a valid cuid or numeric string');
  }
  
  return userIdString;
}

/**
 * Validates a subscription tier value
 * @param tier - The tier to validate
 * @returns The validated tier
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