import React, { useState } from "react";

const plans = [
  {
    name: "Starter",
    price: 99,
    jobs: 8,
    validity: "30 Days",
  },
  {
    name: "Professional",
    price: 299,
    jobs: 25,
    validity: "30 Days",
    popular: true,
  },
  {
    name: "Business",
    price: 599,
    jobs: 45,
    validity: "60 Days",
  },
];

export default function PaymentPlans({ onSuccess }) {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD RAZORPAY CHECKOUT
  // =====================================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async (plan) => {
    try {
      setError("");
      setLoadingPlan(plan.name);

      // -------------------------------------------------
      // LOAD RAZORPAY
      // -------------------------------------------------

      const loaded = await loadRazorpay();

      if (!loaded) {
        setError(
          "Unable to load Razorpay. Please check your internet connection."
        );

        alert(
          "Unable to load payment gateway."
        );

        return;
      }

      // -------------------------------------------------
      // CREATE ORDER
      // -------------------------------------------------

      const orderRes = await fetch(
        "http://localhost:8000/api/payment/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            plan: plan.name,
          }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(
          orderData.message ||
            "Unable to create payment order."
        );

        alert(
          orderData.message ||
            "Unable to create payment."
        );

        return;
      }

      if (!orderData.orderId) {
        setError(
          "Payment order was not created."
        );

        alert(
          "Payment order was not created."
        );

        return;
      }

      // -------------------------------------------------
      // RAZORPAY OPTIONS
      // -------------------------------------------------

      const options = {
        key: orderData.keyId,

        amount: orderData.amount * 100,

        currency: orderData.currency || "INR",

        name: "Job Portal",

        description:
          `${plan.name} Job Posting Plan`,

        order_id: orderData.orderId,

        // =================================================
        // PAYMENT METHODS
        // =================================================

        method: {
          upi: true,
          card: true,
          netbanking: true,
        },

        // =================================================
        // PREFILL
        // =================================================

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        // =================================================
        // THEME
        // =================================================

        theme: {
          color: "#000000",
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (response) {
          try {
            console.log(
              "Razorpay Response:",
              response
            );

            // ------------------------------------------------
            // VERIFY PAYMENT
            // ------------------------------------------------

            const verifyRes = await fetch(
              "http://localhost:8000/api/payment/verify",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials: "include",

                body: JSON.stringify(response),
              }
            );

            const verifyData =
              await verifyRes.json();

            if (!verifyRes.ok) {
              alert(
                verifyData.message ||
                  "Payment verification failed."
              );

              return;
            }

            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            alert(
              "Payment successful! You can now create your job."
            );

            console.log(
              "Payment verified:",
              verifyData
            );

            if (onSuccess) {
              onSuccess(
                verifyData.payment
              );
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              "Payment completed but verification failed."
            );
          }
        },

        // =================================================
        // MODAL
        // =================================================

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay payment popup closed."
            );
          },
        },
      };

      // -------------------------------------------------
      // CREATE RAZORPAY INSTANCE
      // -------------------------------------------------

      const razorpay =
        new window.Razorpay(options);

      // -------------------------------------------------
      // PAYMENT FAILED
      // -------------------------------------------------

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          const message =
            response.error?.description ||
            "Payment failed. Please try again.";

          setError(message);

          alert(message);
        }
      );

      // -------------------------------------------------
      // OPEN CHECKOUT
      // -------------------------------------------------

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      setError(
        error.message ||
          "Payment server error."
      );

      alert(
        "Payment server error."
      );
    } finally {
      setLoadingPlan("");
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-5 py-10">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10 text-center">

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recruiter Plans
          </p>

          <h1 className="text-3xl font-bold text-black md:text-4xl">
            Choose a plan to publish your job
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Select a paid plan and publish your
            job listing to reach qualified
            candidates.
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            PLANS
        ================================================= */}

        <div className="grid gap-6 md:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative
                rounded-2xl
                border
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-xl
                ${
                  plan.popular
                    ? "border-black ring-1 ring-black"
                    : "border-gray-200"
                }
              `}
            >

              {/* =================================================
                  POPULAR
              ================================================= */}

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              {/* =================================================
                  PLAN HEADER
              ================================================= */}

              <div className="mb-6">

                <h2 className="text-xl font-bold text-black">
                  {plan.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Perfect for recruiters
                </p>

              </div>

              {/* =================================================
                  PRICE
              ================================================= */}

              <div className="mb-7">

                <span className="text-4xl font-bold text-black">
                  ₹{plan.price}
                </span>

                <span className="ml-1 text-sm text-gray-500">
                  / plan
                </span>

              </div>

              {/* =================================================
                  FEATURES
              ================================================= */}

              <div className="mb-7 space-y-3">

                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                  <span className="text-sm text-gray-600">
                    Job Posts
                  </span>

                  <span className="text-sm font-bold text-black">
                    {plan.jobs}
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                  <span className="text-sm text-gray-600">
                    Validity
                  </span>

                  <span className="text-sm font-bold text-black">
                    {plan.validity}
                  </span>

                </div>

                {/* UPI */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                  <span className="text-sm text-gray-600">
                    Payment
                  </span>

                  <span className="text-sm font-bold text-black">
                    UPI / Card
                  </span>

                </div>

              </div>

              {/* =================================================
                  PAY BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  handlePayment(plan)
                }
                disabled={
                  loadingPlan === plan.name
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-gray-800
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loadingPlan === plan.name
                  ? "Processing..."
                  : `Pay ₹${plan.price}`}

              </button>

            </div>
          ))}

        </div>

        {/* =================================================
            PAYMENT INFO
        ================================================= */}

        <div className="mt-8 text-center">

          <p className="text-xs text-gray-400">
            Secure payment powered by Razorpay
          </p>

          <p className="mt-1 text-xs text-gray-400">
            UPI, Cards and Net Banking supported
          </p>

        </div>

      </div>
    </div>
  );
}