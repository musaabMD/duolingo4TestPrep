import Link from "next/link";
import { ExamSwitcher } from "@/components/ExamSwitcher";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white shadow-[0_8px_0_var(--brand-deep)] transition group-hover:-translate-y-0.5">
          Dk
        </span>
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--ink)]">
          DrKard
        </span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {compact ? <ExamSwitcher /> : (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-[var(--ink)] transition hover:bg-black/5 sm:inline-flex"
            >
              Dashboard
            </Link>
            <Link
              href="/onboarding"
              className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-black"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
