import { stripe } from "../utils/stripe.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @route POST /api/payments/create-checkout-session
 * @desc Create a Stripe Checkout Session
 */
export const createCheckoutSession = async (req, res) => {
  const { companyId, amount, currency } = req.body;

  try {
    // Validate company
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: "Company not found" });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `Payment for ${company.name}` },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: { companyId },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

/**
 * @route POST /api/payments/webhook
 * @desc Handle Stripe Webhooks
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful checkout session
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await prisma.payment.create({
        data: {
          companyId: session.metadata.companyId,
          stripePaymentId: session.id,
          amount: session.amount_total,
          currency: session.currency,
          status: "completed",
        },
      });

      console.log(`✅ Payment recorded for Company ID: ${session.metadata.companyId}`);
    } catch (dbError) {
      console.error("Database save error:", dbError.message);
    }
  }

  res.json({ received: true });
};
