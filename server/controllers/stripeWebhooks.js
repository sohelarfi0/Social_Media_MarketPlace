import { sendEventResponseSchema } from 'inngest/types';
import stripe from 'stripe';
import prisma from '../configs/prisma';

export const stripeWebhook = async (request, response)=>{
    const stripeInstance = new  stripe(process.env.STRIPE_SECRET_KEY);
    const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event;

    if(endPointSecret){
        // get the signature sent by Stripe

        const signature = request.headers['stripe-signature'];
        try{
            event = stripe.webhooks.constructEvent(
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
            
        }

    }

    

}