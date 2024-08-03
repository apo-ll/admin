import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.post('/bookings', async(c) => {
    const body = await c.req.json()

    const secret = 'djfranqke'
    const signature = c.req.header('x-calcom-signature')

    if (signature !== secret) {
        return c.json({ error: 'Invalid signature' }, 401)
    }

     const event = body.event;
     const userId = body.payload.userId;


  switch (event) {
    case 'booking_created':
      // Process the booking created event
      break;
    case 'booking_canceled':
      // Process the booking canceled event
      break;
    // Handle other event types as needed
  }


  return c.redirect('/Success')

})

export const POST = handle(app)