"use client";

import { useEffect, useRef, useState } from "react";
import { VoiceMenu } from "@/components/VoiceMenu";
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
      id: `${question.id}-topic`,
      role: "tutor",
      text: `This is a ${question.topic} question.`,
    },
    {
      id: `${question.id}-prompt`,
      role: "tutor",
      text: "Read the choices carefully, then pick the best answer.",
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
    return `Hint for ${question.topic}: eliminate choices that don't answer the prompt directly.`;
  }
  if (q.includes("why") || q.includes("explain") || q.includes("answer")) {
    return checked
      ? question.explanation
      : "Pick an answer first — then I can explain.";
  }
  if (q.includes("eliminate") || q.includes("wrong")) {
    return "Cross out options that are off-topic or only partially true.";
  }
  return "Ask for a hint, why an answer works, or how to eliminate choices.";
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

  function send() {
    const trimmed = draft.trim();
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
    setDraft("");
  }

  const lastIndex = messages.length - 1;

  return (
    <aside
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f7f7f7] ${className}`}
    >
      <div className="flex items-start gap-1 px-2 pt-3">
        <div className="flex flex-col">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#afafaf] hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            aria-label="Flag question"
            className="grid h-9 w-9 place-items-center rounded-full text-[#afafaf] hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
            </svg>
          </button>
          <VoiceMenu />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
        {messages.map((message, i) => {
          const isLatest = i === lastIndex;
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[95%] rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold leading-snug ${
                  isUser
                    ? "bg-[#1cb0f6] text-white"
                    : isLatest
                      ? "border border-[#bfe9ff] bg-[#eaf7ff] text-[var(--ink)]"
                      : "text-[#b4b4b4]"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3 pt-1">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <span
            aria-hidden
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--brand)] shadow-[0_3px_0_var(--brand-deep)]"
          >
            <span className="text-xl font-black leading-none text-white">D</span>
          </span>
          <div className="flex min-h-12 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-[0_0_0_1.5px_#e5e5e5]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="How can I help?"
              className="w-full bg-transparent text-[15px] font-semibold text-[var(--ink)] outline-none placeholder:font-medium placeholder:text-[#afafaf]"
            />
            <button
              type="button"
              aria-label="Voice input"
              className="grid h-8 w-8 shrink-0 place-items-center text-[#afafaf]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0014 0M12 18v3" strokeLinecap="round" />
              </svg>
            </button>
            {draft.trim() && (
              <button
                type="submit"
                aria-label="Send"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M3 11.5L21 3l-7.5 18-2.2-7.3L3 11.5z" />
                </svg>
              </button>
            )}
          </div>
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
