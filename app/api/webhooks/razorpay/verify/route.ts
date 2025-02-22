// /* eslint-disable camelcase */
// import { processTransaction } from "@/lib/actions/transaction.action";
// import { NextResponse } from "next/server";
// import crypto from "crypto";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature, buyerId, credits, plan, amount } = body;

//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
//     const generated_signature = crypto
//       .createHmac("sha256", secret)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
//     }

//     // Structure the transaction data to match the processTransaction function
//     const transaction = {
//       razorpay_order_id, // Add the razorpay_order_id
//       razorpay_payment_id, // Add the razorpay_payment_id
//       razorpay_signature, // Add the razorpay_signature
//       transaction: {       // The nested 'transaction' object containing the actual details
//         stripeId: "", // Assign an empty string or a placeholder string (e.g., "razorpay_12345")
//         razorpayId: razorpay_payment_id,
//         amount: amount ? amount / 100 : 0, // Convert to the correct amount format
//         plan: plan || "",
//         credits: Number(credits) || 0,
//         buyerId: buyerId || "",
//         createdAt: new Date(),
//       },
//     };

//     const newTransaction = await processTransaction(transaction);

//     return NextResponse.json({ message: "OK", transaction: newTransaction });
//   } catch (error) {
//     return NextResponse.json({ message: "Webhook error", error }, { status: 500 });
//   }
// }

// /* eslint-disable camelcase */
// import { processTransaction } from "@/lib/actions/transaction.action";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const {
//       razorpay_payment_id,
//       razorpay_order_id,
//       razorpay_signature,
//       buyerId,
//       credits,
//       plan,
//       amount, // Amount in INR (as originally passed from client)
//     } = body;

//     // Build the transaction data. For Razorpay, we use an empty string for stripeId.
//     const transactionData = {
//       stripeId: `razorpay_${Date.now()}`, // Generate a unique placeholder
//       amount: amount, // In INR
//       plan: plan || "",
//       credits: Number(credits) || 0,
//       buyerId: buyerId || "",
//       createdAt: new Date(),
//     };

//     const processData = {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       transaction: transactionData,
//     };

//     const newTransaction = await processTransaction(processData);
//     return NextResponse.json({ message: "OK", transaction: newTransaction });
//   } catch (error) {
//     console.error("Error in verify endpoint:", error);
//     return NextResponse.json({ message: "Payment verification error", error }, { status: 500 });
//   }
// }


import { processTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Destructure the expected data from the request body
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      buyerId,
      credits,
      plan,
      amount, // Amount in INR (as originally passed from client)
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Ensure buyerId, credits, and plan are valid
    if (!buyerId || !credits || !amount) {
      return NextResponse.json(
        { message: "Missing buyerId, credits, or amount" },
        { status: 400 }
      );
    }

    // Build the transaction data. For Razorpay, we use an empty string for stripeId.
    const transactionData = {
      stripeId: `razorpay_${Date.now()}`, // Generate a unique placeholder
      amount: amount, // In INR
      plan: plan || "", // Optional field
      credits: Number(credits) || 0, // Convert credits to a number
      buyerId: buyerId || "",
      createdAt: new Date(),
    };

    // Create process data object for the transaction
    const processData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transaction: transactionData,
    };

    // Process the transaction
    const newTransaction = await processTransaction(processData);

    // Check if there was an error in the processTransaction
    if (newTransaction?.error) {
      return NextResponse.json(
        { message: "Transaction failed", error: newTransaction.error },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({ message: "OK", transaction: newTransaction });

  } catch (error) {
    console.error("Error in verify endpoint:", error);
    return NextResponse.json(
      { message: "Payment verification error", error },
      { status: 500 }
    );
  }
}
