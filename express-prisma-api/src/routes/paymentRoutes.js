import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Create Stripe Checkout Session
router.post("/create-checkout-session", express.json(), createCheckoutSession);

// Webhook Route (must use raw body)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
