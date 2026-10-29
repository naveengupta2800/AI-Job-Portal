const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const requireAuth = require("../middleware/authMiddleware");

router.post(
  "/create-order",
  requireAuth("recruiter"),
  paymentController.createOrder
);

router.post(
  "/verify",
  requireAuth("recruiter"),
  paymentController.verifyPayment
);

router.get(
  "/history",
  requireAuth("recruiter"),
  paymentController.getPaymentHistory
);

router.get(
  "/subscription",
  requireAuth("recruiter"),
  paymentController.getMySubscription
);

module.exports = router;