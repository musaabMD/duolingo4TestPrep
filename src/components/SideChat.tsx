"use client";

import { useEffect, useRef, useState } from "react";
import type { PracticeQuestion } from "@/lib/types";

export type ChatMessage = {
  id: string;
  role: "tutor" | "user";
  text: string;
};

type SideChatProps = {
  question: PracticeQuestion;
  checked: boolean;
  isCorrect: boolean | null;
  open: boolean;
  onClose?: () => void;
  className?: string;
};

function starterMessages(question: PracticeQuestion): ChatMessage[] {
  return [
    {
      id: `${question.id}-start`,
      role: "tutor",
      text: "Alright, let's get started.",
    },
    {
      id: `${question.id}-prompt`,
      role: "tutor",
      text: `This is a ${question.topic} MCQ. Read carefully, then choose the best answer.`,
    },
  ];
}

function tutorReply(
  input: string,
  question: PracticeQuestion,
  checked: boolean,
): string {
  const q = input.toLowerCase();
  if (q.includes("hint") || q.includes("help") || q.includes("stuck")) {
    return `Hint for ${question.topic}: eliminate choices that don't answer the prompt directly. Focus on what the question is really asking.`;
  }
  if (q.includes("why") || q.includes("explain") || q.includes("answer")) {
    return checked
      ? question.explanation
      : "Pick an answer and tap Check — then I can walk through the explanation.";
  }
  if (q.includes("eliminate") || q.includes("wrong")) {
    return "Cross out options that are off-topic or only partially true. On test day, process of elimination is your friend.";
  }
  return `I'm your DrKard tutor for this ${question.topic} question. Ask for a hint, why an answer works, or how to eliminate choices.`;
}

function SideChatPanel({
  question,
  checked,
  isCorrect,
  onClose,
  className = "",
}: Omit<SideChatProps, "open">) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    starterMessages(question),
  );
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastResultKey = useRef<string | null>(null);

  useEffect(() => {
    if (!checked || isCorrect === null) return;
    const key = `${question.id}-${isCorrect}`;
    if (lastResultKey.current === key) return;
    lastResultKey.current = key;
    const text = isCorrect
      ? `Correct! ${question.explanation}`
      : `Not quite. ${question.explanation}`;
    // Queue after paint to avoid cascading render lint in the same tick as check
    const id = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `${key}-${Date.now()}`, role: "tutor", text },
      ]);
    }, 0);
    return () => window.clearTimeout(id);
  }, [checked, isCorrect, question.explanation, question.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function pushExchange(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: trimmed },
      {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        text: tutorReply(trimmed, question, checked),
      },
    ]);
  }

  function send() {
    pushExchange(draft);
    setDraft("");
  }

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-[var(--line)] bg-white ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--brand)] text-xs font-black text-white">
            Dk
          </span>
          <div>
            <p className="text-sm font-extrabold text-[var(--ink)]">Tutor chat</p>
            <p className="text-xs font-semibold text-[var(--muted)]">
              Ask for hints anytime
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="grid h-9 w-9 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] lg:hidden"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-4 py-2">
        <button
          type="button"
          aria-label="Flag question"
          className="grid h-9 w-9 place-items-center rounded-full text-[#afafaf] hover:bg-[var(--surface)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Read aloud"
          className="grid h-9 w-9 place-items-center rounded-full text-[#afafaf] hover:bg-[var(--surface)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
            <path d="M15.5 8.5a4 4 0 010 7" strokeLinecap="round" />
          </svg>
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          {["Hint", "Why?", "Eliminate"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => pushExchange(label)}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-extrabold text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm font-semibold leading-relaxed ${
                message.role === "user"
                  ? "bg-[var(--sky)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--line)] p-3">
        <form
          className="flex items-center gap-2 rounded-2xl border-2 border-[var(--line)] bg-white px-3 py-2 focus-within:border-[var(--sky)]"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="How can I help?"
            className="w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            aria-label="Send"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 11.5L21 3l-7.5 18-2.2-7.3L3 11.5z" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}

export function SideChat({
  question,
  checked,
  isCorrect,
  open,
  onClose,
  className = "",
}: SideChatProps) {
  if (!open) return null;

  return (
    <SideChatPanel
      key={question.id}
      question={question}
      checked={checked}
      isCorrect={isCorrect}
      onClose={onClose}
      className={className}
    />
  );
}
