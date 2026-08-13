import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { SiteHeader } from "@/components/SiteHeader";
import { EXAMS } from "@/lib/exams";

export default function HomePage() {
  return (
    <div className="min-h-dvh w-full bg-white">
      <SiteHeader />

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:pt-16">
          <div className="animate-rise">
            <p className="mb-3 text-5xl font-black tracking-tight text-[var(--ink)] sm:text-7xl">
              DrKard
            </p>
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
              Test prep that feels like a game — not a grind.
            </h1>
            <p className="mt-4 max-w-lg text-lg font-semibold text-[var(--muted)] sm:text-xl">
              Daily MCQ drills for SAT, ACT, MCAT, USMLE, GRE, and LSAT with exam
              countdown, streaks, and bite-sized practice.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/onboarding"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--brand)] px-8 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
              >
                Start onboarding
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-white px-8 text-lg font-extrabold text-[var(--ink)]"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
              Exam countdown
            </p>
            <p className="mt-3 text-6xl font-black text-[var(--ink)]">47</p>
            <p className="text-xl font-extrabold text-[var(--brand-deep)]">
              days until MCAT
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 border-2 border-[var(--line)]">
                <p className="text-xs font-extrabold uppercase text-[var(--muted)]">Streak</p>
                <p className="text-3xl font-black text-[var(--ink)]">12</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border-2 border-[var(--line)]">
                <p className="text-xs font-extrabold uppercase text-[var(--muted)]">XP</p>
                <p className="text-3xl font-black text-[var(--ink)]">860</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-y border-[var(--line)] bg-white px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Find your exam or topic
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center font-semibold text-[var(--muted)]">
              Search practice paths, then set your exam date and remaining days.
            </p>
            <div className="mt-6">
              <SearchBox />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Built for high-stakes exams
          </h2>
          <p className="mt-2 max-w-2xl font-semibold text-[var(--muted)]">
            Pick a track. DrKard personalizes daily MCQs around your test date.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMS.map((exam) => (
              <Link
                key={exam.id}
                href={`/onboarding?exam=${exam.id}`}
                className="rounded-2xl border-2 border-[var(--line)] bg-white p-5 transition hover:border-[var(--brand)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-extrabold text-[var(--ink)]">{exam.name}</h3>
                  <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-extrabold text-[var(--muted)]">
                    {exam.short}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-[var(--muted)]">{exam.blurb}</p>
                <p className="mt-4 text-sm font-extrabold text-[var(--brand-deep)]">
                  Start prep →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="w-full border-t border-[var(--line)] bg-[var(--surface)] px-5 py-16 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:px-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                Set your exam date. Watch the clock work for you.
              </h2>
              <p className="mt-3 max-w-xl font-semibold text-[var(--muted)]">
                Onboarding captures your test day, remaining days, daily study
                goal, and preferred study time.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] px-8 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
            >
              Customize onboarding
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-sm font-semibold text-[var(--muted)] sm:px-8">
        © {new Date().getFullYear()} DrKard.com — test prep, gamified.
      </footer>
    </div>
  );
}
