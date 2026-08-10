"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type VoiceSettings = {
  narration: boolean;
  soundEffects: boolean;
};

const DEFAULT_SETTINGS: VoiceSettings = {
  narration: false,
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
    closeTimer.current = window.setTimeout(() => setOpen(false), 220);
  }

  function openMenu() {
    clearCloseTimer();
    updatePosition();
    setOpen(true);
  }

  function updatePosition() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 112;
    let left = rect.right + 10;
    let top = rect.top - 8;

    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.left - menuWidth - 10);
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - menuHeight - 12);
    }

    setCoords({
      top: Math.max(8, top),
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

  const muted = !settings.narration && !settings.soundEffects;

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-label="Sound settings"
            className="fixed z-[200] w-[220px] rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
            style={{ top: coords.top, left: coords.left }}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="flex items-center justify-between gap-3 px-1 py-2.5">
              <span className="text-[15px] font-bold text-[#777]">Narration</span>
              <Toggle
                checked={settings.narration}
                onChange={(narration) => setSettings((s) => ({ ...s, narration }))}
                label="Narration"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-1 py-2.5">
              <span className="text-[15px] font-bold text-[#777]">Sound effects</span>
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
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Sound settings"
        aria-expanded={open}
        aria-controls={menuId}
        onFocus={openMenu}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openMenu();
          }
        }}
        className={`grid h-9 w-9 place-items-center rounded-full text-[#afafaf] transition hover:bg-white hover:text-[var(--ink)] ${
          open ? "bg-white text-[var(--ink)]" : ""
        } ${iconClassName}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
          {muted || !settings.narration ? (
            <path d="M16 9l5 5M21 9l-5 5" strokeLinecap="round" />
          ) : (
            <path d="M15.5 8.5a4 4 0 010 7" strokeLinecap="round" />
          )}
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
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-[var(--brand)]" : "bg-[#e5e5e5]"
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
