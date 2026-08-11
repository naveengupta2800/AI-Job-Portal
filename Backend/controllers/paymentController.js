const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");

// =====================================================
// RAZORPAY CONFIG CHECK
// =====================================================

if (!process.env.RAZORPAY_KEY_ID) {
  console.error("❌ RAZORPAY_KEY_ID is missing in .env");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ RAZORPAY_KEY_SECRET is missing in .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// PAYMENT PLANS
// =====================================================

const PLANS = {
  Starter: {
    amount: 99,
    jobLimit: 1,
    validityDays: 30,
  },

  Professional: {
    amount: 299,
    jobLimit: 5,
    validityDays: 30,
  },

  Business: {
    amount: 599,
    jobLimit: 15,
    validityDays: 60,
  },
};

// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = async (req, res) => {
  try {
    console.log("====================================");
    console.log("💳 CREATE PAYMENT ORDER");
    console.log("Recruiter ID:", req.userId);
    console.log(
      "Razorpay Key:",
      process.env.RAZORPAY_KEY_ID
        ? "Available"
        : "Missing"
    );
    console.log(
      "Razorpay Secret:",
      process.env.RAZORPAY_KEY_SECRET
        ? "Available"
        : "Missing"
    );
    console.log("====================================");

    // Check authentication
    if (!req.userId) {
      return res.status(401).json({
        message: "Recruiter authentication required",
      });
    }

    const { plan } = req.body;

    console.log("Selected Plan:", plan);

    // Validate plan
    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        message: "Invalid payment plan",
      });
    }

    // Check Razorpay keys
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      console.error(
        "❌ Razorpay keys are missing"
      );

      return res.status(500).json({
        message:
          "Razorpay configuration is missing on server",
      });
    }

    const selectedPlan = PLANS[plan];

    // Amount in paise
    const amountInPaise =
      selectedPlan.amount * 100;

    console.log(
      "Amount:",
      selectedPlan.amount,
      "INR"
    );

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",

      receipt: `job_${Date.now()}`,

      notes: {
        recruiterId: req.userId.toString(),
        plan: plan,
      },
    });

    console.log(
      "✅ Razorpay Order Created:",
      order.id
    );

    // Save payment in database
    const payment = await Payment.create({
      recruiter: req.userId,

      plan: plan,

      amount: selectedPlan.amount,

      currency: "INR",

      orderId: order.id,

      jobLimit: selectedPlan.jobLimit,

      validityDays: selectedPlan.validityDays,

      status: "Created",
    });

    console.log(
      "✅ Payment saved:",
      payment._id
    );

    // Response
    return res.status(201).json({
      message: "Payment order created successfully",

      success: true,

      orderId: order.id,

      amount: selectedPlan.amount,

      currency: "INR",

      plan: plan,

      keyId: process.env.RAZORPAY_KEY_ID,

      paymentId: payment._id,
    });
  } catch (error) {
    console.error("====================================");
    console.error("❌ CREATE ORDER ERROR");
    console.error(error);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Failed to create payment order",
    });
  }
};

// =====================================================
// VERIFY PAYMENT
// =====================================================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log(
      "Payment Verification:",
      razorpay_order_id
    );

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details missing",
      });
    }

    // Generate signature
    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // Verify signature
    if (
      generatedSignature !==
      razorpay_signature
    ) {
      console.error(
        "❌ Invalid Razorpay signature"
      );

      return res.status(400).json({
        message:
          "Payment verification failed",
      });
    }

    // Find payment
    const payment =
      await Payment.findOne({
        orderId: razorpay_order_id,

        recruiter: req.userId,
      });

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment record not found",
      });
    }

    // Prevent duplicate verification
    if (payment.status === "Paid") {
      return res.json({
        success: true,
        message:
          "Payment already verified",
        payment,
      });
    }

    payment.paymentId =
      razorpay_payment_id;

    payment.status = "Paid";

    payment.paidAt = new Date();

    await payment.save();

    console.log(
      "✅ Payment verified:",
      razorpay_payment_id
    );

    return res.json({
      success: true,

      message:
        "Payment verified successfully",

      payment: {
        id: payment._id,

        orderId:
          payment.orderId,

        paymentId:
          payment.paymentId,

        plan: payment.plan,

        amount:
          payment.amount,

        jobLimit:
          payment.jobLimit,

        validityDays:
          payment.validityDays,
      },
    });
  } catch (error) {
    console.error(
      "❌ Verify Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Payment verification failed",
    });
  }
};

// =====================================================
// PAYMENT HISTORY
// =====================================================

exports.getPaymentHistory = async (
  req,
  res
) => {
  try {
    const payments =
      await Payment.find({
        recruiter: req.userId,
      })
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Payment History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch payment history",
    });
  }
};