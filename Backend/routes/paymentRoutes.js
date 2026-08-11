const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

const requireAuth = require("../middleware/authMiddleware");

// =====================================================
// CREATE PAYMENT ORDER
// =====================================================

router.post(
  "/create-order",
  requireAuth("recruiter"),
  paymentController.createOrder
);

// =====================================================
// VERIFY PAYMENT
// =====================================================

router.post(
  "/verify",
  requireAuth("recruiter"),
  paymentController.verifyPayment
);

// =====================================================
// PAYMENT HISTORY
// =====================================================

router.get(
  "/history",
  requireAuth("recruiter"),
  paymentController.getPaymentHistory
);

module.exports = router;