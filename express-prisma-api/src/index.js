import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import companyRoutes from "./routes/companyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ Webhook route — must come BEFORE express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }), // use raw body for signature verification
  (req, res, next) => {
    req.isWebhook = true; // optional flag to identify webhook
    next();
  },
  paymentRoutes // send to router
);

// ✅ For all other routes (normal JSON requests)
app.use(express.json());

// ✅ Register routes
app.use("/api/companies", companyRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
