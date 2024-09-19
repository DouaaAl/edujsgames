import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20', // Specify your API version
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    let data: any;
    let eventType: string;
    let event: any;

    try {
        event = stripe.webhooks.constructEvent(body, signature as string, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed. ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    data = event.data;
    eventType = event.type;

    try {
        switch (eventType) {
            case 'checkout.session.completed': {
                console.log("Payment completed");

                const session: any = await stripe.checkout.sessions.retrieve(
                    data.object.id as string,
                    {
                        expand: ['line_items', 'subscription'] // Expand to include subscription if it exists
                    }
                );

                const customerId = session.customer as string;
                const customer: any = await stripe.customers.retrieve(customerId);
                const priceId: any = session.line_items?.data[0]?.price.id as string;

                let newPlan: 'PREMIUM' | 'FREEMIUM' = 'PREMIUM';
                if (priceId === "prod_Qj3tdTgeGwSXhb") {
                    newPlan = 'FREEMIUM';
                }

                const email = customer.email;
                if (email) {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: email
                        }
                    });

                    if (user) {
                        await prisma.user.update({
                            where: {
                                email: email
                            },
                            data: {
                                plan: newPlan
                            }
                        });

                        // Check if the session has a subscription and it's a valid string
                        if (session.subscription && typeof session.subscription === 'string') {
                            // Retrieve the subscription details from Stripe
                            const subscription = await stripe.subscriptions.retrieve(session.subscription);
                            const subscriptionId = subscription.id;

                            // Update or create the subscription in your database
                            const existingSubscription: any = await prisma.subscriptions.findFirst({
                                where: {
                                    userId: user.id
                                }
                            });

                            if (existingSubscription?.plan?.length > 1) {
                                await prisma.subscriptions.update({
                                    where: {
                                        customerId: subscriptionId
                                    },
                                    data: {
                                        type: newPlan
                                    }
                                });
                            } else {
                                await prisma.subscriptions.create({
                                    data: {
                                        customerId: subscriptionId,
                                        type: newPlan,
                                        userId: user.id
                                    }
                                });
                            }
                        }
                    }
                }
                break; // Ensure you add a break to exit the case
            }

            case 'customer.subscription.deleted': {
                const subscription = await stripe.subscriptions.retrieve(data.object.id as string);
                const subscriptionId = subscription.customer as string;
                const userSubscription = await prisma.subscriptions.delete({
                    where: {
                        customerId: subscriptionId
                    }
                });

                await prisma.user.update({
                    where: {
                        id: userSubscription.userId
                    },
                    data: {
                        plan: "FREE"
                    }
                });
                break;
            }

            default:
                // Unhandled event type
                console.warn(`Unhandled event type: ${eventType}`);
        }
    } catch (e: any) {
        console.error('Stripe error: ' + e.message + ' | EVENT TYPE: ' + eventType);
    }

    return NextResponse.json({});
}