/* eslint-disable camelcase */
import { processTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, buyerId, credits, plan, amount } = body;

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // Structure the transaction data to match the processTransaction function
    const transaction = {
      razorpay_order_id, // Add the razorpay_order_id
      razorpay_payment_id, // Add the razorpay_payment_id
      razorpay_signature, // Add the razorpay_signature
      transaction: {       // The nested 'transaction' object containing the actual details
        stripeId: "", // Assign an empty string or a placeholder string (e.g., "razorpay_12345")
        razorpayId: razorpay_payment_id,
        amount: amount ? amount / 100 : 0, // Convert to the correct amount format
        plan: plan || "",
        credits: Number(credits) || 0,
        buyerId: buyerId || "",
        createdAt: new Date(),
      },
    };

    const newTransaction = await processTransaction(transaction);

    return NextResponse.json({ message: "OK", transaction: newTransaction });
  } catch (error) {
    return NextResponse.json({ message: "Webhook error", error }, { status: 500 });
  }
}
