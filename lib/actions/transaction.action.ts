"use server";

import { redirect } from 'next/navigation';
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const amount = Number(transaction.amount) * 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: transaction.plan,
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      mode: 'payment',
      success_url: 'https://imaginify-vk.vercel.app/profile',
      cancel_url: 'https://imaginify-vk.vercel.app/',

    });

    // Return the session URL so the frontend can handle the redirection
    return session.url;

  } catch (error) {
    handleError(error);
  }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction, buyer: transaction.buyerId
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
