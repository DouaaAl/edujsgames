import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Specify the API version if needed
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

  let event: StripeEvent;
  let eventType: string;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        console.log('Payment completed');
        
        const session = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          {
            expand: ['line_items', 'subscription'],
          }
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
            where: {
              email: email,
            },
          });

          if (user) {
            await prisma.user.update({
              where: {
                email: email,
              },
              data: {
                plan: newPlan,
              },
            });

            if (session.subscription && typeof session.subscription === 'string') {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              const subscriptionId = subscription.id;

              // Retrieve the subscription from the database using the subscriptionId
              const existingSubscription = await prisma.subscriptions.findUnique({
                where: {
                  id: subscriptionId, // Ensure this matches the Prisma schema
                },
              });

              if (existingSubscription) {
                await prisma.subscriptions.update({
                  where: {
                    id: subscriptionId, // Ensure this matches the Prisma schema
                  },
                  data: {
                    type: newPlan,
                  },
                });
              } else {
                await prisma.subscriptions.create({
                  data: {
                    id: subscriptionId, 
                    type: newPlan,   
                    userId: user.id,          
                    customerId: subscriptionId // Ensure this is the correct value
                  },
                });
              }
            }
          }
        }
        break; 
      }

      case 'customer.subscription.deleted': {
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id
        );
        const subscriptionId = subscription.id;

        // Delete the subscription using the subscriptionId
        const userSubscription = await prisma.subscriptions.delete({
          where: {
            id: subscriptionId, // Ensure this matches the Prisma schema
          },
        });

        await prisma.user.update({
          where: {
            id: userSubscription.userId,
          },
          data: {
            plan: 'FREE',
          },
        });

        break;
      }

      default:
        // Unhandled event type
        console.warn(`Unhandled event type: ${eventType}`);
    }
  } catch (e: any) {
    console.error(
      `Stripe error: ${e.message} | EVENT TYPE: ${eventType}`
    );
  }

  return NextResponse.json({});
}