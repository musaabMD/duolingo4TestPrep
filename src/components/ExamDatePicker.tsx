"use client";

import { useMemo, useState } from "react";

type ExamDatePickerProps = {
  value: string | null;
  min: string;
  onChange: (value: string | null) => void;
};

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseKey(value: string | null) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value: string | null) {
  const date = parseKey(value);
  if (!date) return "Pick a date";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ExamDatePicker({ value, min, onChange }: ExamDatePickerProps) {
  const minDate = useMemo(() => parseKey(min) ?? new Date(), [min]);
  const selected = parseKey(value);
  const initial = selected ?? minDate;
  const [open, setOpen] = useState(true);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const items: Array<{ key: string; day: number; inMonth: boolean; disabled: boolean }> = [];

    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startPad - 1; i >= 0; i -= 1) {
      const day = prevDays - i;
      const month = viewMonth === 0 ? 11 : viewMonth - 1;
      const year = viewMonth === 0 ? viewYear - 1 : viewYear;
      const key = toDateKey(year, month, day);
      items.push({
        key,
        day,
        inMonth: false,
        disabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = toDateKey(viewYear, viewMonth, day);
      const date = new Date(viewYear, viewMonth, day);
      items.push({
        key,
        day,
        inMonth: true,
        disabled: date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()),
      });
    }

    while (items.length % 7 !== 0) {
      const day = items.length - (startPad + daysInMonth) + 1;
      items.push({
        key: `next-${day}`,
        day,
        inMonth: false,
        disabled: true,
      });
    }

    return items;
  }, [viewMonth, viewYear, minDate]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-xl font-bold outline-none transition ${
          open
            ? "border-[var(--brand)] bg-[#f4fff0]"
            : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"
        }`}
      >
        <span className={value ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
          {formatDisplay(value)}
        </span>
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-4 shadow-[0_12px_40px_rgba(21,32,50,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-lg font-extrabold text-[var(--ink)]">{monthLabel}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="grid h-9 place-items-center text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const selectedDay = cell.inMonth && cell.key === value;
              const todayKey = toDateKey(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate(),
              );
              const isToday = cell.inMonth && cell.key === todayKey;
              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={cell.disabled || !cell.inMonth}
                  onClick={() => {
                    onChange(cell.key);
                    setOpen(false);
                  }}
                  className={`grid h-11 place-items-center rounded-xl text-sm font-extrabold transition ${
                    selectedDay
                      ? "bg-[var(--brand)] text-white shadow-[0_3px_0_var(--brand-deep)]"
                      : cell.disabled || !cell.inMonth
                        ? "cursor-not-allowed text-[#d0d0d0]"
                        : isToday
                          ? "bg-[#eaf7ff] text-[var(--sky)] hover:bg-[#ddf4ff]"
                          : "text-[var(--ink)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
