import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { processTransaction } from "@/lib/actions/transaction.action"; // Import the transaction processing method
import { updateCredits } from "@/lib/actions/user.actions"; // Assuming you have a method to update credits

// Razorpay signature verification and credit update after successful payment
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction } = req.body;

    // Generate the expected signature using the Razorpay secret key
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      try {
        // Process the transaction and update credits
        const transactionResponse = await processTransaction({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          transaction, // Pass the transaction data for credits update
        });

        if (transactionResponse.error) {
          return res.status(500).json({ error: transactionResponse.error });
        }

        // On successful payment and transaction processing, return a success response
        return res.status(200).json({ success: true, transaction: transactionResponse });
      } catch (error) {
        console.error('Transaction processing error:', error);
        return res.status(500).json({ error: 'Transaction failed during processing' });
      }
    } else {
      // Signature mismatch
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
