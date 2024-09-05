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
                let newPlan = 'PREMIUM';
                if(priceId == "prod_Qj3tdTgeGwSXhb") newPlan = 'FREEMIUM';
                const session = await stripe.checkout.sessions.retrieve(
                    data.object.id,
                    {
                        expand: ['line_items']
                    }
                );
                const customerId = session?.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const priceId = session?.line_items?.data[0]?.price.id;
                const email = customer.email;
                if(email){
                    const user = await prisma.user.findFirst({
                        where:{
                            email: email
                        }
                    })
                    if(user){
                        const updateUser = await prisma.user.update({
                            where: {
                                email: email
                            },
                            data:{
                                plan: newPlan
                            }
                        })
                        const subscription = await prisma.subscriptions.findFirst({
                            where: {
                                userId: user.id
                            }
                        })
                        if (subscription?.plan?.length > 1){
                            await prisma.subscriptions.update({
                                where:{
                                    type: newPlan
                                }
                            })
                        } else{
                            await prisma.subscriptions.create({
                                data: {
                                    customerId: customerId,
                                    type: newPlan,
                                    userId: user.id
                                }
                            })
                        }
                    }
                }
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