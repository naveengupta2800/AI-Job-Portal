
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");

const PLANS = {
  Professional: {
    amount: 99,
    jobLimit: -1,
    validityDays: 30,
  },
  Enterprise: {
    amount: 199,
    jobLimit: -1,
    validityDays: 30,
  },
};

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";
const API_VERSION = process.env.CASHFREE_API_VERSION || "2025-01-01";

function getCashfreeHeaders() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error("Cashfree Sandbox credentials are not configured");
  }

  return {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function cashfreeRequest(path, options = {}) {
  const response = await fetch(`${CASHFREE_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getCashfreeHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Cashfree API error:", response.status, data);
    throw new Error("Cashfree API request failed");
  }

  return data;
}

// Create a Cashfree Sandbox order
exports.createOrder = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { plan } = req.body || {};
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid paid plan",
      });
    }

    const user = await User.findById(req.userId);

    if (!user || user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Recruiter account required",
      });
    }

    // These fallback values are for Sandbox testing only.
    const phone = String(
      user.phone || user.mobile || "9999999999"
    ).replace(/\D/g, "");

    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Add a valid phone number to your recruiter profile",
      });
    }

    const orderId = `jobportal_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const cashfreeOrder = await cashfreeRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        order_amount: selectedPlan.amount,
        order_currency: "INR",
        customer_details: {
          customer_id: String(user._id),
          customer_phone: phone,
          ...(user.email ? { customer_email: user.email } : {}),
        },
        order_meta: {
          return_url:
            `${frontendUrl}/recruiter/billing?order_id={order_id}`,
        },
        order_note: `${plan} subscription - Sandbox`,
      }),
    });

    await Payment.create({
      recruiter: user._id,
      plan,
      amount: selectedPlan.amount,
      currency: "INR",
      orderId,
      jobLimit: selectedPlan.jobLimit,
      validityDays: selectedPlan.validityDays,
      status: "Created",
    });

    return res.status(201).json({
      success: true,
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: selectedPlan.amount,
      currency: "INR",
      plan,
      environment: "sandbox",
    });
  } catch (error) {
    console.error("Create Cashfree order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create Cashfree Sandbox order",
    });
  }
};

// Verify payment using Cashfree's server-side order status
exports.verifyPayment = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { orderId } = req.body || {};

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
    }

    const payment = await Payment.findOne({
      orderId,
      recruiter: req.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (payment.status === "Paid") {
      return res.json({
        success: true,
        paid: true,
        message: "Payment already verified",
      });
    }

    const remoteOrder = await cashfreeRequest(
      `/orders/${encodeURIComponent(orderId)}`,
      { method: "GET" }
    );

    // Verify order ownership against our own database, amount and currency.
    if (
      Number(remoteOrder.order_amount) !== Number(payment.amount) ||
      remoteOrder.order_currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        paid: false,
        message: "Order amount or currency does not match",
      });
    }

    // Never activate a plan for ACTIVE/PENDING/FAILED orders.
    if (remoteOrder.order_status !== "PAID") {
      return res.status(200).json({
        success: true,
        paid: false,
        status: remoteOrder.order_status || "PENDING",
        message: "Payment is not confirmed yet",
      });
    }

    const planConfig = PLANS[payment.plan];

    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + planConfig.validityDays);

    const user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        role: "recruiter",
      },
      {
        $set: {
          subscriptionPlan: payment.plan,
          subscriptionExpiresAt: expiry,
          jobLimit: planConfig.jobLimit,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    payment.status = "Paid";
    payment.paidAt = new Date();
    await payment.save();

    return res.json({
      success: true,
      paid: true,
      message: "Sandbox payment verified and plan activated",
      subscription: {
        plan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpiresAt,
        jobLimit: user.jobLimit,
      },
    });
  } catch (error) {
    console.error("Verify Cashfree payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify Cashfree payment",
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      recruiter: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Payment history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payment history",
    });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
      role: "recruiter",
    }).select(
      "subscriptionPlan subscriptionExpiresAt jobLimit totalJobsPosted"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    const expired =
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt <= new Date();

    return res.json({
      success: true,
      subscription: {
        plan: expired ? "Starter" : user.subscriptionPlan || "Starter",
        expiresAt: user.subscriptionExpiresAt,
        jobLimit: expired ? 2 : user.jobLimit ?? 2,
        totalJobsPosted: user.totalJobsPosted || 0,
        expired: Boolean(expired),
      },
    });
  } catch (error) {
    console.error("Subscription error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscription",
    });
  }
};
