import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  stripeId: { type: String, required: true }, // Placeholder value for Razorpay orders
  amount: { type: Number, required: true },
  plan: { type: String },
  credits: { type: Number },
  buyer: { type: Schema.Types.ObjectId, ref: "User" },
  // Razorpay-specific fields
  razorpay_order_id: { type: String, required: true, unique: true },
  razorpay_payment_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
});

const Transaction = models?.Transaction || model("Transaction", TransactionSchema);
export default Transaction;
