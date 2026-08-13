"use client";

import { useEffect, useRef, useState } from "react";
import { VoiceMenu } from "@/components/VoiceMenu";
import type { PracticeQuestion } from "@/lib/types";

export type ChatMessage = { id: string; role: "tutor" | "user"; text: string };

type SideChatProps = {
  question: PracticeQuestion;
  checked: boolean;
  isCorrect: boolean | null;
  open: boolean;
  flagged?: boolean;
  onFlag?: () => void;
  onClose?: () => void;
  quickPrompt?: { id: number; text: string } | null;
  className?: string;
};

function starterMessages(question: PracticeQuestion): ChatMessage[] {
  return [{ id: `${question.id}-start`, role: "tutor", text: `Let’s work through this ${question.topic} question. Choose an answer, or ask me for a hint.` }];
}

function tutorReply(input: string, question: PracticeQuestion, checked: boolean): string {
  const q = input.toLowerCase();
  if (q.includes("simpl")) return `In simpler terms: ${question.explanation}`;
  if (q.includes("deeper")) return `${question.explanation} Focus on the exact variable or claim the prompt asks you to identify.`;
  if (q.includes("hint") || q.includes("question") || q.includes("help") || q.includes("stuck")) return `Hint: eliminate choices that do not directly answer the ${question.topic} prompt.`;
  if (q.includes("why") || q.includes("explain") || q.includes("answer")) return checked ? question.explanation : "Choose an answer first, then I’ll explain the reasoning.";
  if (q.includes("eliminate") || q.includes("wrong")) return "Remove options that are off-topic or only partly true, then compare the remaining choices to the wording of the prompt.";
  return "Ask for a hint, a simpler explanation, or a deeper walkthrough.";
}

function SideChatPanel({ question, checked, isCorrect, flagged = false, onFlag, onClose, quickPrompt, className = "" }: Omit<SideChatProps, "open">) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => starterMessages(question));
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const lastResultKey = useRef<string | null>(null);
  const lastPromptId = useRef<number | null>(null);
  const appendExchangeRef = useRef<(text: string) => void>(() => undefined);

  function appendExchange(text: string) {
    if (!text.trim() || typing) return;
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text }]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `tutor-${Date.now()}`, role: "tutor", text: tutorReply(text, question, checked) }]);
    }, 360);
  }
  useEffect(() => {
    appendExchangeRef.current = appendExchange;
  });

  useEffect(() => {
    if (!checked || isCorrect === null) return;
    const key = `${question.id}-${isCorrect}`;
    if (lastResultKey.current === key) return;
    lastResultKey.current = key;
    setMessages((prev) => [...prev, { id: key, role: "tutor", text: isCorrect ? `Correct. ${question.explanation}` : `That answer is incorrect. ${question.explanation}` }]);
  }, [checked, isCorrect, question.explanation, question.id]);

  useEffect(() => {
    if (!quickPrompt || quickPrompt.id === lastPromptId.current) return;
    lastPromptId.current = quickPrompt.id;
    appendExchangeRef.current(quickPrompt.text);
  }, [quickPrompt]);

  useEffect(() => {
    if (pinnedRef.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    else setShowJump(true);
  }, [messages, typing]);

  function handleScroll() {
    const node = viewportRef.current;
    if (!node) return;
    const pinned = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    pinnedRef.current = pinned;
    setShowJump(!pinned);
  }

  return (
    <aside className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-[var(--line)] bg-white shadow-[0_10px_30px_rgba(21,32,50,0.07)] ${className}`}>
      <header className="flex h-17 shrink-0 items-center justify-between bg-[var(--surface)] px-4">
        <div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--ink)] text-sm font-black text-white">Dk</span><div><p className="font-black text-[var(--ink)]">Tutor</p><p className="flex items-center gap-1.5 text-xs font-bold text-[#16865f]"><span className="h-2 w-2 rounded-full bg-[#22a875]"/>Ready</p></div></div>
        <div className="flex items-center gap-1">
          {onFlag ? <button type="button" onClick={onFlag} aria-label={flagged ? "Remove flag" : "Flag question"} aria-pressed={flagged} className={`grid h-9 w-9 place-items-center rounded-xl transition ${flagged ? "bg-[#fff4d6] text-[#a86700]" : "text-[var(--muted)] hover:bg-[var(--surface)]"}`}><svg viewBox="0 0 24 24" className="h-5 w-5" fill={flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M5 21V4h11l-2 4 4 4H5" strokeLinejoin="round" /></svg></button> : null}
          <VoiceMenu iconClassName="hover:bg-[var(--surface)]" />
          {onClose ? <button type="button" onClick={onClose} aria-label="Hide tutor" className="grid h-9 w-9 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface)]"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m8 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg></button> : null}
        </div>
      </header>

      <div ref={viewportRef} onScroll={handleScroll} role="log" aria-relevant="additions" aria-busy={typing} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
        {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3.5 text-[15px] font-semibold leading-relaxed ${message.role === "user" ? "bg-[var(--ink)] text-white" : "border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"}`}>{message.text}</div></div>)}
        {typing ? <div className="flex justify-start"><div aria-label="Tutor is typing" className="rounded-2xl bg-[var(--surface)] px-4 py-3"><span className="inline-flex gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9ca3af]"/><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9ca3af] [animation-delay:150ms]"/><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9ca3af] [animation-delay:300ms]"/></span></div></div> : null}
        <div ref={bottomRef} />
      </div>

      {showJump ? <button type="button" onClick={() => { pinnedRef.current = true; setShowJump(false); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }} className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-extrabold shadow-lg">Newest ↓</button> : null}

      <form className="shrink-0 bg-white p-3" onSubmit={(event) => { event.preventDefault(); appendExchange(draft); }}>
        <div className="flex min-h-12 items-center gap-2 rounded-2xl border-2 border-[var(--line)] bg-white px-3 focus-within:border-[var(--ink)]"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask the tutor…" className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-[#9ca3af]"/><button type="submit" aria-label="Send" disabled={!draft.trim() || typing} className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--ink)] text-white disabled:bg-[#d5d8dc]"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 7-7 7 7M12 5v14" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
      </form>
    </aside>
  );
}

export function SideChat(props: SideChatProps) {
  if (!props.open) return null;
  return <SideChatPanel key={props.question.id} {...props} />;
}
