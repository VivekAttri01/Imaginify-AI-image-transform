// "use server";

// import { redirect } from 'next/navigation';
// import Stripe from "stripe";
// import { handleError } from '../utils';
// import { connectToDatabase } from '../database/mongoose';
// import Transaction from '../database/models/transaction.model';
// import { updateCredits } from './user.actions';

// export async function checkoutCredits(transaction: CheckoutTransactionParams) {
//   try {
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//     const amount = Number(transaction.amount) * 100;

//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             unit_amount: amount,
//             product_data: {
//               name: transaction.plan,
//             }
//           },
//           quantity: 1
//         }
//       ],
//       metadata: {
//         plan: transaction.plan,
//         credits: transaction.credits,
//         buyerId: transaction.buyerId,
//       },
//       mode: 'payment',
//       success_url: 'https://your-domain.com/profile',
//       cancel_url: 'https://imaginify-vk.vercel.app/',

//     });

//     // Return the session URL so the frontend can handle the redirection
//     return session.url;

//   } catch (error) {
//     handleError(error);
//   }
// }

// export async function createTransaction(transaction: CreateTransactionParams) {
//   try {
//     await connectToDatabase();

//     // Create a new transaction with a buyerId
//     const newTransaction = await Transaction.create({
//       ...transaction, buyer: transaction.buyerId
//     });

//     await updateCredits(transaction.buyerId, transaction.credits);

//     return JSON.parse(JSON.stringify(newTransaction));
//   } catch (error) {
//     handleError(error);
//   }
// }




// "use server";

// import { redirect } from 'next/navigation';
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { handleError } from '../utils';
// import { connectToDatabase } from '../database/mongoose';
// import Transaction from '../database/models/transaction.model';
// import { updateCredits } from './user.actions';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!
// });

// export async function checkoutCredits(transaction: CheckoutTransactionParams) {
//   try {
//     const amount = Number(transaction.amount) * 100;

//     const options = {
//       amount: amount,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         plan: transaction.plan,
//         credits: transaction.credits,
//         buyerId: transaction.buyerId,
//       }
//     };

//     const order = await razorpay.orders.create(options);

//     return order;
//   } catch (error) {
//     handleError(error);
//   }
// }

// export async function verifyPayment(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, transaction: CreateTransactionParams) {
//   try {
//     const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       throw new Error("Invalid payment signature");
//     }

//     await connectToDatabase();

//     const newTransaction = await Transaction.create({
//       ...transaction, buyer: transaction.buyerId
//     });

//     await updateCredits(transaction.buyerId, transaction.credits);

//     return JSON.parse(JSON.stringify(newTransaction));
//   } catch (error) {
//     handleError(error);
//   }
// }


// "use server";

// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { handleError } from "../utils";
// import { connectToDatabase } from "../database/mongoose";
// import Transaction from "../database/models/transaction.model";
// import { updateCredits } from "./user.actions";

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// // Function to create a Razorpay order (checkout process)
// export async function checkoutCredits(transaction: CheckoutTransactionParams) {
//   try {
//     const amount = Number(transaction.amount) * 100; // Convert INR to paise

//     const order = await razorpay.orders.create({
//       amount,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         plan: transaction.plan,
//         credits: transaction.credits,
//         buyerId: transaction.buyerId,
//       },
//     });

//     return order; // Returns Razorpay order ID to the frontend
//   } catch (error) {
//     handleError(error);
//     return { error: "Failed to create Razorpay order" };
//   }
// }

// // Function to verify Razorpay payment and store transaction in DB
// export async function processTransaction(paymentData: {
//   razorpay_order_id: string;
//   razorpay_payment_id: string;
//   razorpay_signature: string;
//   transaction: CreateTransactionParams;
// }) {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction } = paymentData;

//     // Verify Razorpay payment signature
//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       return { error: "Invalid payment signature" };
//     }

//     await connectToDatabase();

//     // Store transaction in database
//     const newTransaction = await Transaction.create({
//       ...transaction,
//       buyer: transaction.buyerId,
//       razorpay_order_id,
//       razorpay_payment_id,
//     });

//     // Update user credits
//     await updateCredits(transaction.buyerId, transaction.credits);

//     return JSON.parse(JSON.stringify(newTransaction));
//   } catch (error) {
//     handleError(error);
//     return { error: "Transaction processing failed" };
//   }
// }


"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";

// --- Type Definitions ---
export interface CheckoutTransactionParams {
  plan: string;
  amount: number; // in INR
  credits: number;
  buyerId: string;
}

export interface CreateTransactionParams {
  stripeId: string; // For Razorpay orders, use an empty string or placeholder.
  razorpayId?: string;
  amount: number;
  plan: string;
  credits: number;
  buyerId: string;
  createdAt: Date;
}

// --- Initialize Razorpay instance ---
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // Public key (client-safe)
  key_secret: process.env.RAZORPAY_KEY_SECRET!, // Secret key (server-only)
});

// --- Function to create a Razorpay order (checkout process) ---
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  try {
    const amountPaise = Number(transaction.amount) * 100; // Convert INR to paise
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
    });
    return order; // Order object from Razorpay (includes order.id, amount, etc.)
  } catch (error) {
    handleError(error);
    return { error: "Failed to create Razorpay order" };
  }
}

// --- Function to verify Razorpay payment and store transaction in DB ---
export async function processTransaction(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  transaction: CreateTransactionParams;
}) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction } = paymentData;

    // Verify payment signature using the secret key (same key used for order creation)
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return { error: "Invalid payment signature" };
    }

    await connectToDatabase();

    // Create the transaction document in MongoDB
    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Update the user's credit balance (updateCredits should update your User model)
    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
    return { error: "Transaction processing failed" };
  }
}
