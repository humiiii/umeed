import crypto from 'crypto';

// Use SESSION_SECRET, fallback to CRON_SECRET, or generate a one-time secret for this process run
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.CRON_SECRET || 'umeed-default-secret-key-2026';

/**
 * Creates a cryptographically signed session token.
 * Format: base64url(payload) + '.' + base64url(signature)
 */
export function encrypt(payload) {
  const dataStr = JSON.stringify(payload);
  const encodedData = Buffer.from(dataStr).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');
    
  return `${encodedData}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 * Returns payload if valid and not expired, otherwise null.
 */
export function decrypt(token) {
  if (!token) return null;
  
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [encodedData, signature] = parts;
  
  // Re-generate signature to verify integrity
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    return null; // Signature is invalid
  }
  
  try {
    const jsonStr = Buffer.from(encodedData, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);
    
    // Check expiration
    if (payload.expires && Date.now() > payload.expires) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
