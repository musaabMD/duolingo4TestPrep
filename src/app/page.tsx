import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { SiteHeader } from "@/components/SiteHeader";
import { EXAMS } from "@/lib/exams";

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="hero-atmosphere absolute inset-0 -z-10" />
      <div className="hero-grid absolute inset-0 -z-10" />

      <SiteHeader />

      <main>
        <section className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col justify-center px-4 pb-16 pt-6 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-rise">
              <p className="mb-4 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--ink)] sm:text-7xl">
                DrKard
              </p>
              <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
                Test prep that feels like a game — not a grind.
              </h1>
              <p className="mt-4 max-w-lg text-lg font-semibold text-[var(--muted)] sm:text-xl">
                Daily drills for SAT, ACT, MCAT, USMLE, GRE, and LSAT with exam
                countdown, streaks, and bite-sized practice.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/onboarding"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--brand)] px-8 text-lg font-extrabold text-white shadow-[0_6px_0_var(--brand-deep)] transition hover:brightness-105 active:translate-y-[2px] active:shadow-[0_4px_0_var(--brand-deep)]"
                >
                  Start onboarding
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--ink)] px-8 text-lg font-extrabold text-white transition hover:bg-black"
                >
                  Open dashboard
                </Link>
              </div>
            </div>

            <div className="animate-rise-delay relative mx-auto w-full max-w-md">
              <div className="animate-float relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#1a3d2a_0%,#0f2418_55%,#163828_100%)] p-6 text-white shadow-[0_30px_80px_rgba(15,40,28,0.28)]">
                <div className="absolute inset-0 opacity-40" aria-hidden>
                  <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-[var(--brand)] blur-3xl" />
                  <div className="absolute bottom-10 left-4 h-32 w-32 rounded-full bg-[var(--sky)] blur-3xl" />
                </div>
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                      Exam countdown
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-display)] text-6xl font-bold">
                      47
                    </p>
                    <p className="text-xl font-bold text-[var(--brand-soft)]">
                      days until MCAT
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <p className="text-sm font-bold text-white/70">Today</p>
                      <p className="text-lg font-extrabold">20 min · Chem/Phys</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-2xl bg-[var(--brand)] p-4 text-[var(--ink)]">
                        <p className="text-xs font-extrabold uppercase">Streak</p>
                        <p className="text-2xl font-black">12</p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-white p-4 text-[var(--ink)]">
                        <p className="text-xs font-extrabold uppercase">XP</p>
                        <p className="text-2xl font-black">860</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)] bg-white/70 px-4 py-14 backdrop-blur sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl">
              Find your exam or topic
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center font-semibold text-[var(--muted)]">
              Search practice paths instantly — then set your exam date and
              remaining days in onboarding.
            </p>
            <div className="mt-6">
              <SearchBox />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Built for high-stakes exams
            </h2>
            <p className="mt-2 max-w-2xl font-semibold text-[var(--muted)]">
              Pick a track. DrKard personalizes daily goals around your test
              date — not vocabulary flashcards.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMS.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/onboarding?exam=${exam.id}`}
                  className="group rounded-[1.5rem] border-2 border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[0_16px_40px_rgba(15,40,28,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-extrabold text-[var(--ink)]">
                      {exam.name}
                    </h3>
                    <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-extrabold text-[var(--brand-deep)]">
                      {exam.short}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-[var(--muted)]">
                    {exam.blurb}
                  </p>
                  <p className="mt-4 text-sm font-bold text-[var(--brand-deep)] transition group-hover:translate-x-1">
                    Start prep →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)] bg-[var(--ink)] px-4 py-16 text-white sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
                Set your exam date. Watch the clock work for you.
              </h2>
              <p className="mt-3 max-w-xl font-semibold text-white/70">
                Onboarding captures your test day, remaining days, daily study
                goal, and preferred study time — then launches practice that fits
                the countdown.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] px-8 text-lg font-extrabold text-[var(--ink)] transition hover:brightness-105"
            >
              Customize onboarding
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-4 py-8 text-center text-sm font-semibold text-[var(--muted)] sm:px-8">
        © {new Date().getFullYear()} DrKard.com — test prep, gamified.
      </footer>
    </div>
  );
}
