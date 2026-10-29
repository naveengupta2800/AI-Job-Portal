
import { useEffect, useState } from "react";
import api from "../../services/api";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Forever",
    description: "Perfect for getting started with hiring.",
    icon: "🌱",
    features: [
      "Post up to 2 jobs",
      "View candidate applications",
      "Manage application statuses",
      "Basic recruiter dashboard",
    ],
    unavailable: [
      "Advanced hiring analytics",
      "Priority support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    period: "30 days",
    description: "For growing teams hiring more candidates.",
    icon: "⚡",
    popular: true,
    features: [
      "Unlimited job postings",
      "Complete applicant management",
      "Interview scheduling",
      "Advanced hiring analytics",
      "Priority support",
      "AI-powered hiring insights",
    ],
    unavailable: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "30 days",
    description: "For organizations hiring at scale.",
    icon: "🏢",
    features: [
      "Everything in Professional",
      "Multiple recruiter seats (demo)",
      "Advanced hiring reports",
      "Custom hiring workflows",
      "Enterprise onboarding",
    ],
    unavailable: [],
  },
];

const faqs = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade by completing another successful Cashfree Sandbox test payment.",
  },
  {
    question: "Will I be charged real money?",
    answer:
      "This college project uses Cashfree Sandbox. Keep your backend configured with Sandbox credentials and the Sandbox API URL. Never use live credentials for testing.",
  },
  {
    question: "What happens when my subscription expires?",
    answer:
      "The backend should check the expiry date and apply the Starter plan limits when the subscription expires.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "This demo does not implement real refunds. Sandbox payments are for demonstration only.",
  },
];

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
      ✓
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
      —
    </span>
  );
}

function loadCashfree() {
  if (window.Cashfree) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Cashfree Checkout.")),
        { once: true }
      );

      if (window.Cashfree) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = resolve;
    script.onerror = () =>
      reject(new Error("Unable to load Cashfree Checkout."));

    document.body.appendChild(script);
  });
}

export default function RecruiterBilling() {
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/api/payments/subscription");

      if (response.data?.success) {
        setSubscription(response.data.subscription);
      }
    } catch (err) {
      console.error("Subscription fetch failed:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Cashfree redirects back with order_id in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) return;

    let cancelled = false;

    const verifyReturnedOrder = async () => {
      setPaying(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.post("/api/payments/verify", {
          orderId,
        });

        if (cancelled) return;

        if (response.data?.paid) {
          setSuccess("Cashfree Sandbox payment verified. Your plan is activated.");
          await fetchSubscription();
        } else {
          setError(
            `Payment is not confirmed yet. Status: ${
              response.data?.status || "PENDING"
            }. Your plan has not been activated.`
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to verify payment status. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setPaying(false);
          setSelectedPlan(null);

          // Remove order_id from the address bar after verification.
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    };

    verifyReturnedOrder();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlanName = subscription?.plan || "Starter";

  const currentPlan =
    plans.find((plan) => plan.name === currentPlanName) || plans[0];

  const handleChoosePlan = (plan) => {
    setError("");
    setSuccess("");
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!selectedPlan || selectedPlan.price === 0 || paying) {
      return;
    }

    setPaying(true);
    setError("");
    setSuccess("");

    try {
      await loadCashfree();

      const orderResponse = await api.post(
        "/api/payments/create-order",
        {
          plan: selectedPlan.name,
        }
      );

      const order = orderResponse.data;

      if (
        !order?.success ||
        !order.orderId ||
        !order.paymentSessionId
      ) {
        throw new Error(
          "Invalid Cashfree order received from server."
        );
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      // Cashfree handles the redirect and returns to the configured URL.
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start Cashfree Sandbox checkout."
      );
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-9 sm:py-12">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
              ✦ PLANS & BILLING
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find the right plan
              <br className="hidden sm:block" />
              for your hiring goals.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose a plan that fits your team and manage your
              recruitment process from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                ✓ Flexible plans
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                ✓ Secure checkout
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                ✓ Cashfree Sandbox
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.07] p-5 lg:max-w-xs">
            <p className="text-sm text-slate-300">Your current plan</p>

            <h2 className="mt-3 text-2xl font-bold">
              {loadingSubscription ? "Loading..." : currentPlan.name}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              ₹{currentPlan.price.toLocaleString("en-IN")} /{" "}
              {currentPlan.period}
            </p>

            <div className="my-5 h-px bg-white/10" />

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">Job posting limit</span>
              <span className="font-semibold">
                {subscription?.jobLimit === -1
                  ? "Unlimited"
                  : `${subscription?.jobLimit ?? 2} jobs`}
              </span>
            </div>

            {subscription?.expiresAt && (
              <p className="mt-3 text-xs text-slate-400">
                Expires on:{" "}
                {new Date(subscription.expiresAt).toLocaleDateString(
                  "en-IN"
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Alerts */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="font-bold">✓</span>
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-bold">!</span>
          <p>{error}</p>
        </div>
      )}

      {/* Pricing Heading */}
      <section>
        <div className="mb-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Simple, transparent pricing
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Plans for every hiring team
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Start with the free plan and upgrade whenever your hiring
            needs grow.
          </p>

          <p className="mt-2 text-xs font-medium text-emerald-700">
            College project demo · Cashfree Sandbox only
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentPlanName;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-7 ${
                  plan.popular
                    ? "border-indigo-500 ring-2 ring-indigo-100"
                    : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Popular
                  </span>
                )}

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  {plan.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {plan.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-slate-500">
                    / {plan.period}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isCurrent || paying || loadingSubscription}
                  onClick={() => handleChoosePlan(plan)}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isCurrent
                      ? "border border-slate-200 bg-slate-50 text-slate-400"
                      : plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {isCurrent
                    ? "Current plan"
                    : plan.price === 0
                    ? "Choose Starter"
                    : `Choose ${plan.name}`}
                </button>

                <div className="my-6 h-px bg-slate-100" />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  What's included
                </p>

                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-slate-700"
                    >
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}

                  {plan.unavailable.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-slate-400"
                    >
                      <CrossIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Billing Note */}
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🔒
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Cashfree Sandbox environment
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              This project is configured for Sandbox testing. Use only
              Cashfree Sandbox credentials and the Sandbox API on your
              backend. Do not use live credentials or real payment
              details for this demo.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold text-slate-900">
          Frequently asked questions
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Quick answers about your subscription.
        </p>

        <div className="mt-5 divide-y divide-slate-100">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="py-4">
              <button
                type="button"
                onClick={() =>
                  setOpenFaq(openFaq === index ? -1 : index)
                }
                aria-expanded={openFaq === index}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {faq.question}
                </span>

                <span className="text-xl text-slate-500">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <p className="pt-3 text-sm leading-6 text-slate-500">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Plan Confirmation Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !paying
            ) {
              setSelectedPlan(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Subscription
                </p>

                <h2
                  id="plan-dialog-title"
                  className="mt-2 text-2xl font-bold text-slate-900"
                >
                  {selectedPlan.name}
                </h2>
              </div>

              <button
                type="button"
                disabled={paying}
                onClick={() => setSelectedPlan(null)}
                aria-label="Close dialog"
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Review your selected plan before continuing.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-800">
                  {selectedPlan.name} plan
                </span>

                <span className="text-xl font-bold text-slate-900">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Validity: {selectedPlan.period}
              </p>
            </div>

            {selectedPlan.price > 0 ? (
              <>
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                  Sandbox testing only. Continue only if your backend
                  is configured with Cashfree Sandbox credentials.
                  Do not enter real payment details.
                </div>

                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePayment}
                  className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying
                    ? "Processing..."
                    : "Continue to Sandbox Checkout"}
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Starter is the free plan. It is the default plan for
                new recruiters.
              </p>
            )}

            <button
              type="button"
              disabled={paying}
              onClick={() => setSelectedPlan(null)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
