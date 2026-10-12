
import { submitGamertag } from './actions';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090b0f] text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(190,40,65,0.12),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <header className="flex h-24 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10">
              <span className="h-4 w-4 rotate-45 border-2 border-rose-400" />
            </span>
            <span className="text-lg font-black tracking-[0.16em]">
              ONYX
            </span>
          </a>

          <a
            href="#how-it-works"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            How it works
          </a>
        </header>

        <section className="grid min-h-[670px] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Xbox achievement tracking
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Every game.
              <br />
              Every achievement.
              <br />
              <span className="text-rose-400">
                Every completion.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-zinc-400 sm:text-lg">
              Your Xbox library, reimagined. Explore your
              achievements, track Gamerscore, and see exactly
              how close you are to completing every game.
            </p>

            <form
              action={submitGamertag}
              className="mt-10 max-w-xl"
            >
              <label
                htmlFor="gamertag"
                className="mb-3 block text-sm font-medium text-zinc-300"
              >
                Find your Xbox profile
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="gamertag"
                  name="gamertag"
                  type="text"
                  placeholder="Enter your Gamertag"
                  autoComplete="off"
                  maxLength={32}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                >
                  View profile →
                </button>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Public Xbox profiles only. Initial synchronization
                may take a few moments.
              </p>
            </form>
          </div>

          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-5 rounded-[36px] bg-rose-500/5 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101319] p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Dashboard preview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Your progress, at a glance.
                  </h2>
                </div>
                <div className="h-10 w-10 rounded-xl border border-rose-500/20 bg-rose-500/10" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs text-zinc-500">
                    Gamerscore
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    24,850
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Example total
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs text-zinc-500">
                    Completed games
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    18
                  </p>
                  <p className="mt-2 text-xs text-rose-400">
                    Onyx completions
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Game completion
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Example achievement progress
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-rose-400">
                    82%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-rose-700 to-rose-400" />
                </div>

                <div className="mt-4 flex justify-between text-xs text-zinc-500">
                  <span>41 of 50 achievements</span>
                  <span>82%</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-rose-500/[0.06] px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                    ◆
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      Onyx completion
                    </p>
                    <p className="text-xs text-zinc-500">
                      Finish every achievement
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-rose-400">
                  100%
                </span>
              </div>

              <p className="mt-5 text-center text-[11px] text-zinc-600">
                Illustrative data, not a live player profile
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-white/10 py-16"
        >
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
              Built for completionists
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything that matters. Nothing that doesn't.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Discover',
                description:
                  'Look up an Xbox Gamertag and explore its game library.',
              },
              {
                number: '02',
                title: 'Track',
                description:
                  'Follow achievements, Gamerscore and completion progress.',
              },
              {
                number: '03',
                title: 'Complete',
                description:
                  'Earn Onyx status by completing every achievement in a game.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
              >
                <span className="text-xs font-semibold text-rose-400">
                  {item.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-white/10 py-8 text-xs text-zinc-500 sm:flex-row">
          <span>© Project Onyx</span>
          <span>Independent Xbox achievement tracker</span>
        </footer>
      </div>
    </main>
  );
}
