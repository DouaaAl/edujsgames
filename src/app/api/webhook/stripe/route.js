import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {

    const body = await req.text();

    const signature = headers().get('stripe-signature');

    let data;
    let eventType;
    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed. ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    data = event.data;
    eventType = event.type;

    try {
        switch (eventType) {
            case 'checkout.session.completed': {
                console.log("payment completed");
            
                const session = await stripe.checkout.sessions.retrieve(
                    data.object.id,
                    {
                        expand: ['line_items', 'subscription'] 
                    }
                );
                
                const customerId = session?.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const priceId = session?.line_items?.data[0]?.price.id;
            
                let newPlan = 'PREMIUM';
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
                            const existingSubscription = await prisma.subscriptions.findFirst({
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
                break;  // Ensure you add a break to exit the case
            }

            case 'customer.subscription.deleted': {
                const subscription = await stripe.subscriptions.retrieve(
                    data.object.id
                );
                const subscriptionId = subscription.customer;
                const userSubscription = await prisma.subscriptions.delete({
                    where: {
                        customerId: subscriptionId
                    }
                })
                const updateUser = await prisma.user.update({
                    where: {
                        id: userSubscription.userId
                    },
                    data:{
                        plan: "FREE"
                    }
                })

                break;
            }

            default:
            // Unhandled event type
        }
    } catch (e) {
        console.error(
            'stripe error: ' + e.message + ' | EVENT TYPE: ' + eventType
        );
    }

    return NextResponse.json({});
}