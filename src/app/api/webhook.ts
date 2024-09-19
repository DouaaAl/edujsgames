import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface StripeEvent {
  data: {
    object: any;
  };
  type: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const eventType = event.type;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        console.log('Payment completed');

        const session = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          { expand: ['line_items', 'subscription'] }
        );

        const customerId = session?.customer as string | undefined;
        const customer: any = customerId ? await stripe.customers.retrieve(customerId) : null;
        const priceId = session?.line_items?.data[0]?.price?.id;

        let newPlan: 'PREMIUM' | 'FREEMIUM' = 'PREMIUM';
        if (priceId === 'prod_Qj3tdTgeGwSXhb') {
          newPlan = 'FREEMIUM';
        }

        const email = customer?.email;
        if (email) {
          const user = await prisma.user.findFirst({
            where: { email },
          });

          if (user) {
            console.log('User:', user);

            const updatedUser = await prisma.user.update({
              where: { email },
              data: { plan: newPlan },
            });
            console.log('Updated User:', updatedUser);

            if (session.subscription && typeof session.subscription === 'string') {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              const subscriptionId = subscription.id;

              const existingSubscription = await prisma.subscriptions.findUnique({
                where: { id: subscriptionId },
              });

              if (existingSubscription) {
                await prisma.subscriptions.update({
                  where: { id: subscriptionId },
                  data: { type: newPlan },
                });
              } else {
                await prisma.subscriptions.create({
                  data: {
                    id: subscriptionId,
                    type: newPlan,
                    userId: user.id,
                    customerId: subscription.customer as string, // Use customer ID for customerId
                  },
                });
              }
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = event.data.object.id;

        const userSubscription = await prisma.subscriptions.delete({
          where: { id: subscriptionId },
        });

        await prisma.user.update({
          where: { id: userSubscription.userId },
          data: { plan: 'FREE' },
        });

        break;
      }

      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }
  } catch (e: any) {
    console.error(`Stripe error: ${e.message} | EVENT TYPE: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}