# DrKard.com

Duolingo-style **test prep** for SAT, ACT, MCAT, USMLE Step 1, GRE, and LSAT.

## Features

- Custom landing page with brand-first hero and exam search
- Mobile-friendly Duolingo-inspired onboarding
- Exam date + remaining days countdown
- Daily study goal and schedule preferences
- Practice sessions with check / why / continue feedback
- Dashboard with streak, XP, and search

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing page + search |
| `/onboarding` | Customized exam-date onboarding |
| `/dashboard` | Countdown, streak, XP, search |
| `/practice` | Bite-sized practice session |
