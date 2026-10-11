import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";

const suggestions = [
  {
    icon: "🎯",
    title: "Placement roadmap",
    prompt: "Create a practical 30-day software placement preparation roadmap.",
  },
  {
    icon: "💻",
    title: "Technical interview",
    prompt: "Help me prepare for a junior software developer technical interview.",
  },
  {
    icon: "🧠",
    title: "DSA preparation",
    prompt: "How should I prepare DSA for placements, including problem-solving patterns?",
  },
  {
    icon: "📄",
    title: "Resume improvement",
    prompt: "Tell me how to improve my resume for software developer jobs.",
  },
];

const starterMessage = {
  role: "assistant",
  content:
    "Hi! I'm your AI Career Assistant. 👋\n\nI can help you prepare for placements, improve your resume, practice interviews, learn DSA and plan your software development career.\n\nWhat would you like to work on today?",
};

function formatMessage(text = "") {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={partIndex}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
      {index < text.split("\n").length - 1 && <br />}
    </span>
  ));
}

function AssistantAvatar({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm ${
        small ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg"
      }`}
    >
      ✦
    </div>
  );
}

export default function AICareerAssistantPage() {
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;

    api
      .get("/api/profile/jobseeker")
      .then((response) => {
        if (active) {
          setProfile(response.data?.profile || null);
        }
      })
      .catch(() => {
        // Chat remains usable if profile details cannot be loaded.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function sendMessage(value = input) {
    const message = value.trim();

    if (!message || sending) return;

    const previousMessages = messages.filter(
      (item) => item !== starterMessage
    );

    const userMessage = { role: "user", content: message };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const response = await api.post("/api/ai/career-chat", {
        message,
        history: previousMessages.slice(-10).map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          content: item.content,
        })),
        profile: profile
          ? {
              name: profile.name || "",
              skills: Array.isArray(profile.skills) ? profile.skills : [],
              education: profile.education || [],
              experience: profile.experience || [],
            }
          : {},
      });

      const reply = response.data?.reply;

      if (!reply || typeof reply !== "string") {
        throw new Error("The assistant returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't get a response. Please try again."
        )
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    if (sending) return;
    setMessages([starterMessage]);
    setInput("");
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  const hasConversation = messages.length > 1;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl">
              ✦
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-200">
                  AI Career Tools
                </span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                  Career support
                </span>
              </div>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Career Assistant
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Your personal AI guide for placement preparation, technical
                interviews, DSA and career growth.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            disabled={!hasConversation || sending}
            className="shrink-0 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 sm:self-center"
          >
            ↻ New chat
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        {/* Chat panel */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <AssistantAvatar />
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-slate-900">Your career guide</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                AI-powered career guidance
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready to help
            </span>
          </div>

          {/* Conversation */}
          <div className="min-h-[360px] space-y-6 p-4 sm:min-h-[440px] sm:p-6">
            {!hasConversation && (
              <div className="mx-auto max-w-xl py-5 text-center sm:py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-3xl">
                  ✦
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                  Let's plan your next move
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ask a question or choose one of the suggestions to get
                  started.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <AssistantAvatar small />
                )}

                <div
                  className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${
                    message.role === "user"
                      ? "rounded-tr-md bg-violet-600 text-white"
                      : "rounded-tl-md border border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {formatMessage(message.content)}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-xs font-bold text-slate-700">
                    You
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-start gap-3">
                <AssistantAvatar small />
                <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:300ms]" />
                    <span className="ml-2 text-xs text-slate-500">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {!hasConversation && (
            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Try asking
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    disabled={sending}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Ask the assistant
                      </span>
                    </span>
                    <span className="ml-auto text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:mx-6"
            >
              <p className="font-bold">Message wasn't sent</p>
              <p className="mt-1 break-words">{error}</p>
              <button
                type="button"
                onClick={() => sendMessage(messages[messages.length - 1]?.content === input ? input : input)}
                className="mt-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-4 sm:p-6"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Ask about placements, DSA, interviews..."
                aria-label="Write your career question"
                className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
                title="Send message"
              >
                ↑
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
              <span>Enter to send · Shift + Enter for a new line</span>
              <span>{input.length}/2000</span>
            </div>
          </form>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Your career toolkit</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Continue your preparation with these tools.
            </p>

            <div className="mt-4 space-y-3">
              <a
                href="/ai/profile-analysis"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  📊
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">
                    Profile analysis
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Discover improvement areas
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </a>

              <a
                href="/ai/job-match"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  🎯
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">
                    AI job matching
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Check your job compatibility
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </a>

              <a
                href="/jobs"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  💼
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">
                    Explore jobs
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Find your next opportunity
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="text-xl">💡</div>
            <h3 className="mt-3 font-bold text-amber-950">
              Get better answers
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
              <li>• Mention your target role.</li>
              <li>• Share your current skill level.</li>
              <li>• Ask for practical examples and steps.</li>
              <li>• Verify important facts before acting.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">Profile context</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {profile?.name
                ? `The assistant can use your available profile details, such as your skills and education, to personalize guidance.`
                : "Your profile could not be loaded. You can still ask general career questions."}
            </p>
            <a
              href="/profile"
              className="mt-3 inline-flex text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              View profile →
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}