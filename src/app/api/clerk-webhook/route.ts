import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET as string,
    });

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    if (eventType === 'user.created') {
      // Handle user.created event
      const { email_addresses, first_name, last_name } = evt.data;
      const { data, error } = await supabase
        .from('user')
        .insert({
          email: email_addresses.find((email) => email.email_address)
            ?.email_address,
          first_name: first_name,
          last_name: last_name,
          clerk_user_id: id,
        })
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      console.log('User created in Supabase:', data);
    }
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log('Webhook payload:', evt.data);

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
