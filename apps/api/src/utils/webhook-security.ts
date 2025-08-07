import crypto from 'crypto';

/**
 * Verifies the signature of a webhook payload using HMAC-SHA256
 * @param payload - Raw webhook payload as string or buffer
 * @param signature - The signature from the webhook header
 * @param secret - The webhook secret
 * @returns boolean indicating if signature is valid
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    // Remove any prefix from signature (e.g., "sha256=")
    const cleanSignature = signature.replace(/^sha256=/, '');
    
    // Create HMAC using the secret
    const hmac = crypto.createHmac('sha256', secret);
    if (Buffer.isBuffer(payload)) {
      hmac.update(payload);
    } else {
      hmac.update(payload, 'utf8');
    }
    const computedSignature = hmac.digest('hex');
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Validates webhook timestamp to prevent replay attacks
 * @param timestamp - Unix timestamp from webhook header
 * @param toleranceSeconds - How old the webhook can be (default: 300 seconds = 5 minutes)
 * @returns boolean indicating if timestamp is within tolerance
 */
export function validateWebhookTimestamp(
  timestamp: string | number,
  toleranceSeconds: number = 300
): boolean {
  if (!timestamp) {
    return false;
  }

  try {
    const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - webhookTime);
    
    return timeDifference <= toleranceSeconds;
  } catch (error) {
    console.error('Webhook timestamp validation failed:', error);
    return false;
  }
}

/**
 * Comprehensive webhook security validation
 * @param payload - Raw webhook payload
 * @param signature - Webhook signature header
 * @param timestamp - Webhook timestamp header
 * @param secret - Webhook secret
 * @param toleranceSeconds - Timestamp tolerance in seconds
 * @returns object with validation results
 */
export function validateWebhookSecurity(
  payload: string | Buffer,
  signature: string,
  timestamp: string | number,
  secret: string,
  toleranceSeconds: number = 300
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    errors.push('Invalid webhook signature');
  }

  // Validate timestamp to prevent replay attacks
  if (!validateWebhookTimestamp(timestamp, toleranceSeconds)) {
    errors.push('Webhook timestamp outside tolerance window');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}