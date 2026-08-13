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
      text: `This is a ${question.topic} question. Take your time.`,
    },
    {
      id: `${question.id}-prompt`,
      role: "tutor",
      text: "Read each choice carefully, then pick the best answer.",
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
  if (q.includes("why") || q.includes("explain") || q.includes("answer") || q.includes("question")) {
    return checked
      ? question.explanation
      : "Pick an answer first — then I can walk through it with you.";
  }
  if (q.includes("eliminate") || q.includes("wrong") || q.includes("deeper") || q.includes("simplify")) {
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
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastResultKey = useRef<string | null>(null);

  useEffect(() => {
    if (!checked || isCorrect === null) return;
    const key = `${question.id}-${isCorrect}`;
    if (lastResultKey.current === key) return;
    lastResultKey.current = key;
    const text = isCorrect
      ? `Nice — that's right. ${question.explanation}`
      : `Not quite. ${question.explanation}`;
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `${key}-${Date.now()}`, role: "tutor", text },
      ]);
    }, 450);
    return () => window.clearTimeout(id);
  }, [checked, isCorrect, question.explanation, question.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(preset?: string) {
    const trimmed = (preset ?? draft).trim();
    if (!trimmed || typing) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          role: "tutor",
          text: tutorReply(trimmed, question, checked),
        },
      ]);
    }, 500);
  }

  return (
    <aside
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[1.75rem] border border-[#eadfe6] bg-white/90 shadow-[0_8px_30px_rgba(60,40,50,0.06)] backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#f0e8ec] px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--ink)]">Tutor</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf8df] px-2 py-0.5 text-[11px] font-extrabold text-[var(--brand-deep)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              Ready
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Flag question"
            className="grid h-9 w-9 place-items-center rounded-full text-[#b9b0b5] hover:bg-[#f7f2f4] hover:text-[var(--muted)]"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
            </svg>
          </button>
          <VoiceMenu iconClassName="hover:bg-[#f7f2f4]" />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Hide side chat"
              className="grid h-9 w-9 place-items-center rounded-full text-[#b9b0b5] transition hover:bg-[#f7f2f4] hover:text-[var(--ink)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-[1.25rem] px-3.5 py-2.5 text-[15px] font-semibold leading-snug ${
                  isUser
                    ? "rounded-br-md bg-[#4a4450] text-white"
                    : "rounded-bl-md bg-[#f3eef1] text-[#5c5560]"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div
              aria-label="Tutor is typing"
              className="rounded-[1.25rem] rounded-bl-md bg-[#f3eef1] px-4 py-3"
            >
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c4bbc2]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c4bbc2] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c4bbc2] [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#f0e8ec] px-3 pb-3 pt-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="flex min-h-12 flex-1 items-center gap-2 rounded-full border border-[#eadfe6] bg-[#fbf8f9] px-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask the tutor…"
              className="w-full bg-transparent text-[15px] font-semibold text-[var(--ink)] outline-none placeholder:font-medium placeholder:text-[#b0a7ad]"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim()}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${
                draft.trim()
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[#e8e0e4] text-[#b0a7ad]"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8-8-8z" />
              </svg>
            </button>
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
