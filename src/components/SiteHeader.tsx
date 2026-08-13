import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ compact = false, actions }: { compact?: boolean; actions?: ReactNode }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link href="/" className="group flex items-center gap-2.5" aria-label="DrKard home">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-[var(--ink)] text-lg font-black text-white transition group-hover:-translate-y-0.5">
          D
          <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--ink)]" aria-hidden />
        </span>
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--ink)]">
          DrKard
        </span>
      </Link>
      {actions ? actions : !compact ? (
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-full px-4 py-2 text-sm font-bold text-[var(--ink)] transition hover:bg-black/5 sm:inline-flex"
          >
            Dashboard
          </Link>
          <Link
            href="/onboarding?step=welcome"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-black"
          >
            Get started
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
