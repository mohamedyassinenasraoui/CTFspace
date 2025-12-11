import crypto from 'crypto';

/**
 * Hash a flag with salt using HMAC-SHA256
 * @param {string} flag - The flag to hash
 * @param {string} salt - The salt to use
 * @returns {string} - The hashed flag
 */
export function hashFlag(flag, salt) {
  return crypto.createHmac('sha256', salt).update(flag).digest('hex');
}

/**
 * Verify a flag against a stored hash
 * Uses constant-time comparison to prevent timing attacks
 * @param {string} providedFlag - The flag provided by the user
 * @param {string} storedHash - The stored hash from the database
 * @param {string} salt - The salt used for hashing
 * @returns {boolean} - True if the flag is correct
 */
export function verifyFlag(providedFlag, storedHash, salt) {
  const providedHash = hashFlag(providedFlag, salt);
  
  // Constant-time comparison
  if (providedHash.length !== storedHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < providedHash.length; i++) {
    result |= providedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate a random salt for flag hashing
 * @returns {string} - A random salt string
 */
export function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

