"use client";

import { useEffect, useId, useRef, useState } from "react";

export type VoiceSettings = {
  narration: boolean;
  voice: "melodic" | "deep";
  soundEffects: boolean;
};

const DEFAULT_SETTINGS: VoiceSettings = {
  narration: true,
  voice: "melodic",
  soundEffects: true,
};

type VoiceMenuProps = {
  className?: string;
  iconClassName?: string;
};

export function VoiceMenu({ className = "", iconClassName = "" }: VoiceMenuProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const menuId = useId();

  function clearCloseTimer() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  }

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      clearCloseTimer();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="Voice settings"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`grid h-9 w-9 place-items-center rounded-full text-[#afafaf] transition hover:bg-white hover:text-[var(--ink)] ${
          open ? "bg-white text-[var(--sky)] ring-2 ring-[#a4e5ff]" : ""
        } ${iconClassName}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
          <path d="M15.5 8.5a4 4 0 010 7" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label="Voice settings"
          className="absolute left-11 top-0 z-50 w-[250px] rounded-2xl bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-center justify-between gap-3 px-1 py-2">
            <span className="text-sm font-bold text-[#777]">Narration</span>
            <Toggle
              checked={settings.narration}
              onChange={(narration) => setSettings((s) => ({ ...s, narration }))}
              label="Narration"
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-1 py-2">
            <span className="text-sm font-bold text-[#777]">Voice</span>
            <div className="flex rounded-full bg-[#efefef] p-0.5">
              {(["melodic", "deep"] as const).map((voice) => {
                const selected = settings.voice === voice;
                return (
                  <button
                    key={voice}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, voice }))}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize transition ${
                      selected
                        ? "bg-white text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                        : "text-[#999]"
                    }`}
                  >
                    {voice === "melodic" ? "Melodic" : "Deep"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 py-2">
            <span className="text-sm font-bold text-[#777]">Sound effects</span>
            <Toggle
              checked={settings.soundEffects}
              onChange={(soundEffects) =>
                setSettings((s) => ({ ...s, soundEffects }))
              }
              label="Sound effects"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-[var(--brand)]" : "bg-[#d4d4d4]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
