import * as crypto from 'crypto';

const SEPARATOR = '.';

// Minimal HMAC-signed token (same idea as a JWT, no extra dependency needed).
export function createToken(secret: string, ttlSeconds: number): string {
  const payload = JSON.stringify({ exp: Date.now() + ttlSeconds * 1000 });
  const payloadEncoded = Buffer.from(payload).toString('base64url');
  return `${payloadEncoded}${SEPARATOR}${sign(payloadEncoded, secret)}`;
}

export function verifyToken(token: string, secret: string): boolean {
  const [payloadEncoded, signature] = token.split(SEPARATOR);
  if (!payloadEncoded || !signature) return false;

  const expectedSignature = sign(payloadEncoded, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString());
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function sign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}
