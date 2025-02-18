// "use client";

// import { loadStripe } from "@stripe/stripe-js";
// import { useEffect } from "react";

// import { useToast } from "@/components/ui/use-toast";
// import { checkoutCredits } from "@/lib/actions/transaction.action";

// import { Button } from "../ui/button";

// const Checkout = ({
//   plan,
//   amount,
//   credits,
//   buyerId,
// }: {
//   plan: string;
//   amount: number;
//   credits: number;
//   buyerId: string;
// }) => {
//   const { toast } = useToast();

//   useEffect(() => {
//     loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
//   }, []);

//   useEffect(() => {
//     // Check to see if this is a redirect back from Checkout
//     const query = new URLSearchParams(window.location.search);
//     if (query.get("success")) {
//       toast({
//         title: "Order placed!",
//         description: "You will receive an email confirmation",
//         duration: 5000,
//         className: "success-toast",
//       });
//     }

//     if (query.get("canceled")) {
//       toast({
//         title: "Order canceled!",
//         description: "Continue to shop around and checkout when you're ready",
//         duration: 5000,
//         className: "error-toast",
//       });
//     }
//   }, []);

//   const onCheckout = async () => {
//     const transaction = {
//       plan,
//       amount,
//       credits,
//       buyerId,
//     };

//     await checkoutCredits(transaction);
//   };

//   return (
//     <form action={onCheckout} method="POST">
//       <section>
//         <Button
//           type="submit"
//           role="link"
//           className="w-full rounded-full bg-purple-gradient bg-cover"
//         >
//           Buy Credit
//         </Button>
//       </section>
//     </form>
//   );
// };

// export default Checkout;




// "use client";

// import { useEffect } from "react";
// import { useToast } from "@/components/ui/use-toast";
// import { checkoutCredits } from "@/lib/actions/transaction.action";
// import { Button } from "../ui/button";

// const Checkout = ({
//   plan,
//   amount,
//   credits,
//   buyerId,
// }: {
//   plan: string;
//   amount: number;
//   credits: number;
//   buyerId: string;
// }) => {
//   const { toast } = useToast();

//   useEffect(() => {
//     const query = new URLSearchParams(window.location.search);
//     if (query.get("success")) {
//       toast({
//         title: "Order placed!",
//         description: "You will receive an email confirmation",
//         duration: 5000,
//         className: "success-toast",
//       });
//     }
  
//     if (query.get("canceled")) {
//       toast({
//         title: "Order canceled!",
//         description: "Try again later",
//         duration: 5000,
//         className: "error-toast",
//       });
//     }
//   }, [toast]); 
  

//   const loadRazorpay = async () => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//     return new Promise((resolve) => {
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//     });
//   };

//   const onCheckout = async () => {
//     const res = await loadRazorpay();

//     if (!res) {
//       toast({
//         title: "Error",
//         description: "Razorpay SDK failed to load. Are you online?",
//         duration: 5000,
//         className: "error-toast",
//       });
//       return;
//     }

//     const transaction = {
//       plan,
//       amount,
//       credits,
//       buyerId,
//     };

//     const order = await checkoutCredits(transaction); // This should return the Razorpay order

//     if (!order) {
//       toast({
//         title: "Error",
//         description: "Failed to initiate payment",
//         duration: 5000,
//         className: "error-toast",
//       });
//       return;
//     }

//     const options = {
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       amount: order.amount,
//       currency: order.currency,
//       name: "Your Company Name",
//       description: `Purchase ${plan} credits`,
//       order_id: order.id,
//       handler: async function (response: any) {
//         toast({
//           title: "Payment Successful!",
//           description: "Credits have been added to your account.",
//           duration: 5000,
//           className: "success-toast",
//         });

//         // Call backend API to verify payment and update credits
//         await fetch("/api/verify-payment", {
//           method: "POST",
//           body: JSON.stringify({
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             buyerId,
//             credits,
//           }),
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//       },
//       prefill: {
//         email: "buyer@example.com",
//         contact: "9999999999",
//       },
//       theme: {
//         color: "#3399cc",
//       },
//     };

//     const paymentObject = new (window as any).Razorpay(options);
//     paymentObject.open();
//   };

//   return (
//     <form onSubmit={(e) => e.preventDefault()}>
//       <section>
//         <Button
//           type="button"
//           role="link"
//           onClick={onCheckout}
//           className="w-full rounded-full bg-purple-gradient bg-cover"
//         >
//           Buy Credit
//         </Button>
//       </section>
//     </form>
//   );
// };

// export default Checkout;

"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";

// Define RazorpayOrder interface to type the order response
interface RazorpayOrder {
  id: string;
  amount: number;
}

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, [toast]);  // Add 'toast' to the dependency array

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    try {
      const order = await checkoutCredits(transaction);

      if (order && (order as RazorpayOrder).id) {  // Ensure the response is an order
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: (order as RazorpayOrder).amount,
          currency: "INR",
          name: "Your Company Name",
          description: `Purchase ${credits} Credits`,
          order_id: (order as RazorpayOrder).id,
          handler: async function (response: any) {
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction,
            };

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentData),
            });

            if (verifyRes.ok) {
              toast({
                title: "Payment Successful!",
                description: "Your credits have been added.",
                duration: 5000,
                className: "success-toast",
              });
            } else {
              toast({
                title: "Payment Failed!",
                description: "Something went wrong. Please try again.",
                duration: 5000,
                className: "error-toast",
              });
            }
          },
          prefill: {
            name: "Your Name",
            email: "your-email@example.com",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        toast({
          title: "Order Creation Failed!",
          description: "Please try again later.",
          duration: 5000,
          className: "error-toast",
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Something went wrong during checkout.",
        duration: 5000,
        className: "error-toast",
      });
    }
  };

  return (
    <section>
      <Button
        onClick={onCheckout}
        className="w-full rounded-full bg-purple-gradient bg-cover"
      >
        Buy Credit
      </Button>
    </section>
  );
};

export default Checkout;
