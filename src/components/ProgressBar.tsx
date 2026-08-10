type ProgressBarProps = {
  value: number;
  showBack?: boolean;
  onBack?: () => void;
};

export function ProgressBar({ value, showBack, onBack }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] transition hover:bg-black/5"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="w-10" />
      )}
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--track)]">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-10" />
    </div>
  );
}
