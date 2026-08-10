"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

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

function subscribe() {
  return () => {};
}

export function VoiceMenu({ className = "", iconClassName = "" }: VoiceMenuProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  }

  function updatePosition() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuWidth = 250;
    const left = Math.min(rect.right + 8, window.innerWidth - menuWidth - 12);
    setCoords({
      top: Math.max(8, rect.top),
      left: Math.max(8, left),
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    function onScrollOrResize() {
      updatePosition();
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    // Defer so the opening click doesn't immediately close
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => clearCloseTimer(), []);

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-label="Voice settings"
            className="fixed z-[100] w-[250px] rounded-2xl bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
            style={{ top: coords.top, left: coords.left }}
            onMouseEnter={() => {
              clearCloseTimer();
              setOpen(true);
            }}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Voice settings"
        aria-expanded={open}
        aria-controls={menuId}
        onMouseEnter={() => {
          clearCloseTimer();
          updatePosition();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onClick={() => {
          clearCloseTimer();
          updatePosition();
          setOpen((value) => !value);
        }}
        className={`grid h-9 w-9 place-items-center rounded-full text-[#afafaf] transition hover:bg-[var(--surface)] hover:text-[var(--ink)] ${
          open ? "bg-[var(--surface)] text-[var(--sky)] ring-2 ring-[#a4e5ff]" : ""
        } ${iconClassName}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
          <path d="M15.5 8.5a4 4 0 010 7" strokeLinecap="round" />
        </svg>
      </button>
      {menu}
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
