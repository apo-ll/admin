import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import * as crypto from 'crypto';

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const WEBHOOK_SECRET_KEY = 'djfranqke'

app.post('/bookings', async (c) => {
  try {
    // Retrieve the signature from the headers
    const signature = c.req.header('X-Cal-Signature-256');
    if (!signature) {
      return c.json({ message: 'Signature missing' }, 400);
    }

    // Read the request body
    const body = await c.req.text();

    // Compute the HMAC using the secret key and the request body
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET_KEY);
    hmac.update(body, 'utf8');
    const hash = hmac.digest('hex');

    // Compare the computed HMAC with the signature
    if (hash !== signature) {
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

export const POST = handle(app)