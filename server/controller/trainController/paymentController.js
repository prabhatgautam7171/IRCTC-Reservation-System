// controllers/paymentController.js
import dotenv from 'dotenv';
dotenv.config(); // ✅ Load .env variables at the top

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // ✅ Use after .env is loaded

export const createCheckoutSession = async (req, res) => {
  try {
    const { totalAmount, trainName, coachType , passengers , journey } = req.body;
    console.log(journey,passengers);

       const requiredSeats = passengers.length;
       const passengerNames = passengers.map(p => p.name).join(', ');
       const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${trainName} - ${coachType}`,
                description: `Passengers: ${passengerNames} ... , from  ${journey.from} to ${journey.to} , On ${journey.journeyDate}`
              },
              unit_amount: totalAmount * 100, // Stripe expects amount in paise
            },
            quantity: requiredSeats,
          },
        ],
        success_url: `http://localhost:3000/auth/payment-success/{CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/auth/payment-cancel`,
      });


    res.status(200).json({ id: session.id , paymentIntentId: session.payment_intent });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Stripe payment failed' });
  }
};


