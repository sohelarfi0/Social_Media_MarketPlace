import { sendEventResponseSchema } from 'inngest/types';
import Stripe from 'stripe';
import prisma from '../configs/prisma.js';
import { inngest } from '../inngest/index.js';

export const stripeWebhook = async (request, response)=>{
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event;

    if(endPointSecret){
        // get the signature sent by Stripe

        const signature = request.headers['stripe-signature'];
        try{
            event = Stripe.webhooks.constructEvent(
                request.body,
                signature,
                endPointSecret
            );

        }catch(err){
            console.log(' Webhook signature verification failed.', err.message);
            return  response.sendStatus(400);

        }

        try {

            switch(event.type){
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    const sessionList = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntent.id
                    })

                    const session = sessionList.data[0];
                    const {transactionId, appId} = session.metadata;


                    if(appId === 'flipearn' && transactionId){
                        const transaction = await prisma.transaction.update({
                            where: {id: transactionId},
                            data: {isPaid: true}
                        })
                        // send new credentials to the buyer using the email address
                        await inngest.send({
                            name: "app/purchase",
                            data: {transaction}
                        })
                        

                        // mark the listing as sold

                        await prisma.listing.update({
                            where: {id: transaction.listingId},
                            data:{status: 'sold'}
                        })
                        // Add the amount to the user's earned balance
                        await prisma.user.update({
                            where: {id: transaction.ownerId},
                            data: {earned: {increment: transaction.amount}}
                        })
                    }
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`)
            }
            
        } catch (error) {
            console.log('Webhook processing error:', error);
        }
    }

    return response.status(200).json({ received: true });
}