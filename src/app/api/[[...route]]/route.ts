import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const WEBHOOK_SECRET_KEY = 'djfranqke';

async function verifySignature(body: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureMatch = signature.match(/[\da-f]{2}/gi);
  if (!signatureMatch) {
    throw new Error('Invalid signature format');
  }
  const signatureBuffer = new Uint8Array(signatureMatch.map((h) => parseInt(h, 16)));

  const data = encoder.encode(body);
  const hashBuffer = await crypto.subtle.sign('HMAC', key, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature;
}

app.post('/bookings', async (c) => {
  try {
    // Retrieve the signature from the headers
    const signature = c.req.header('X-Cal-Signature-256');
    if (!signature) {
      return c.json({ message: 'Signature missing' }, 400);
    }

    // Read the request body
    const body = await c.req.text();

    // Verify the HMAC signature using the Web Crypto API
    const isValid = await verifySignature(body, signature, WEBHOOK_SECRET_KEY);

    if (!isValid) {
      return c.json({ message: 'Invalid signature' }, 401);
    }

    // Proceed with processing the webhook payload
    const payload = JSON.parse(body);

    // Handle the payload as needed (e.g., log it, process events)
    console.log('Webhook payload:', payload);

    // Respond to the webhook
    return c.json({ message: 'Webhook received successfully' }, 200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

// Export the handler for Vercel
export const POST = handle(app);
