
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Starter",
    description: "For recruiters getting started with hiring.",
    price: 0,
    period: "forever",
    badge: "",
    features: [
      "Post up to 2 active jobs",
      "View candidate applications",
      "Manage application statuses",
      "Basic recruiter dashboard",
    ],
    unavailable: [
      "Advanced hiring analytics",
      "Priority support",
    ],
    button: "Current plan",
    featured: false,
  },
  {
    id: "pro",
    name: "Professional",
    description: "For growing teams hiring more candidates.",
    price: 999,
    period: "month",
    badge: "POPULAR",
    features: [
      "Unlimited job postings",
      "Complete applicant management",
      "Interview scheduling",
      "Advanced hiring analytics",
      "Priority support",
      "AI-powered hiring insights",
    ],
    unavailable: [],
    button: "Upgrade to Pro",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations hiring at scale.",
    price: 2999,
    period: "month",
    badge: "",
    features: [
      "Everything in Professional",
      "Multiple recruiter seats",
      "Advanced hiring reports",
      "Dedicated account support",
      "Custom hiring workflows",
      "Enterprise onboarding",
    ],
    unavailable: [],
    button: "Choose Enterprise",
    featured: false,
  },
];

const faqs = [
  {
    question: "Can I change my plan later?",
    answer:
      "This page currently demonstrates the pricing interface. Plan changes will work after subscription and payment APIs are connected.",
  },
  {
    question: "Will I be charged when I click Upgrade?",
    answer:
      "No payment is processed by this UI. A payment gateway must be integrated before any real subscription or charge can occur.",
  },
  {
    question: "Where can I manage my job listings?",
    answer:
      "Use My job listings in the recruiter sidebar to view and manage your posted jobs.",
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

export default function RecruiterBilling() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const currentPlan = plans[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-9 sm:py-12">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
              <span>✦</span>
              PLANS & BILLING
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find the right plan
              <br className="hidden sm:block" /> for your hiring goals.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose a plan that fits your team, manage recruitment at scale,
              and build a better hiring pipeline.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm lg:max-w-xs">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-300">Your current plan</p>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                Active
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{currentPlan.name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              ₹{currentPlan.price} · {currentPlan.period}
            </p>
            <div className="my-5 h-px bg-white/10" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Active job limit</span>
              <span className="font-semibold text-white">2 jobs</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 rounded-full bg-indigo-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Illustrative usage · live usage is not connected
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-indigo-600">
            SIMPLE, TRANSPARENT PRICING
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Plans for every hiring team
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Start free and explore the options as your recruitment needs grow.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7 ${
                plan.featured
                  ? "border-indigo-500 ring-2 ring-indigo-100"
                  : "border-slate-200"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  {plan.id === "free" ? "🌱" : plan.id === "pro" ? "⚡" : "🏢"}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>
              </div>

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
                disabled={plan.id === currentPlan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : plan.id === currentPlan.id
                    ? "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400"
                    : "border border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {plan.button}
              </button>

              <div className="my-6 h-px bg-slate-100" />

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                What's included
              </p>

              <ul className="mt-4 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.unavailable.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-400">
                    <CrossIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-400">
          Illustrative pricing and plan features for the UI preview. These plans
          are not connected to a live subscription or payment system.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Frequently asked questions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick answers about plans and billing.
            </p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            3 questions
          </span>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                aria-expanded={openFaq === index}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-800 sm:text-base">
                  {faq.question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-600">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <p className="max-w-3xl pt-3 text-sm leading-6 text-slate-500">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedPlan(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              {selectedPlan.id === "pro" ? "⚡" : "🏢"}
            </div>

            <h2
              id="plan-dialog-title"
              className="mt-5 text-xl font-bold text-slate-900"
            >
              {selectedPlan.name} plan
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This is a preview of the upgrade flow. No subscription will be
              activated and no payment will be taken.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Selected plan</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <span className="font-semibold text-slate-900">
                  {selectedPlan.name}
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-slate-500">
                    {" "}/ month
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Connect a payment gateway and backend subscription endpoint to
              enable real plan upgrades.
            </p>

            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
