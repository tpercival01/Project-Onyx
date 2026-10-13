import { db } from '@/lib/db';
import { achievements, games } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { SyncLoader } from '@/components/SyncLoader';
import { AchievementCard } from '@/components/AchievementCard';

export const dynamic = 'force-dynamic';

export default async function GamePage({
  params,
}: {
  params: Promise<{ xuid: string; titleId: string }>;
}) {
  const { xuid, titleId } = await params;

  const gameRecord = await db.query.games.findFirst({
    where: and(eq(games.id, titleId), eq(games.userXuid, xuid)),
  });

  if (!gameRecord) {
    notFound();
  }

  const gameAchievements = await db
    .select()
    .from(achievements)
    .where(
      and(
        eq(achievements.userXuid, xuid),
        eq(achievements.titleId, titleId)
      )
    );

  if (gameAchievements.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <SyncLoader
          xuid={xuid}
          titleId={titleId}
          message="Loading achievements..."
        />
      </main>
    );
  }

  const unlocked = gameAchievements.filter((achievement) => achievement.isUnlocked);
  const locked = gameAchievements.filter((achievement) => !achievement.isUnlocked);

  const earned = gameRecord.earnedAchievements;
  const total = gameRecord.totalAchievements;
  const hasVerifiedTotal = total > 0;
  const percentage = hasVerifiedTotal
    ? Math.min(100, Math.round((earned / total) * 100))
    : null;
  const isOnyx = hasVerifiedTotal && earned === total;
  const currentGamerscore = gameRecord.currentGamerscore ?? 0;
  const totalGamerscore = gameRecord.totalGamerscore ?? 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 text-zinc-100 lg:px-8">
      <nav className="mb-6" aria-label="Breadcrumb">
        <Link
          href={`/profile/${xuid}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-rose-300"
        >
          <span aria-hidden="true">←</span>
          Back to game library
        </Link>
      </nav>

      <header className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-[#111318]">
        {gameRecord.displayImage && (
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            aria-hidden="true"
          >
            <img
              src={gameRecord.displayImage}
              alt=""
              className="h-full w-full object-cover blur-3xl"
            />
          </div>
        )}

        <div className="relative grid gap-8 p-5 sm:p-8 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:p-10">
          <div className="mx-auto w-full max-w-[260px] self-start overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl shadow-black/40 md:mx-0">
            {gameRecord.displayImage ? (
              <img
                src={gameRecord.displayImage}
                alt={`${gameRecord.name} artwork`}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center p-5 text-center text-sm text-zinc-500">
                No artwork available
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                Game overview
              </span>
              {isOnyx && (
                <span className="rounded-full border border-rose-400/40 bg-zinc-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.14)]">
                  ◆ Onyx complete
                </span>
              )}
            </div>

            <h1 className="max-w-3xl break-words text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {gameRecord.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              Xbox achievements and completion progress
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-400">Completion</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {percentage === null ? '—' : `${percentage}%`}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-400">Achievements</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {earned.toLocaleString()}
                  <span className="text-base font-medium text-zinc-500">
                    {' / '}{hasVerifiedTotal ? total.toLocaleString() : '?'}
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-400">Gamerscore</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {currentGamerscore.toLocaleString()}
                  <span className="text-base font-medium text-zinc-500">
                    {' / '}{totalGamerscore.toLocaleString()} G
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-400">Achievement progress</span>
                <span className="font-semibold tabular-nums text-zinc-200">
                  {percentage === null ? 'Total unavailable' : `${percentage}%`}
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label={`${gameRecord.name} achievement completion`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage === null ? undefined : percentage}
              >
                <div
                  className={`h-full rounded-full ${
                    isOnyx
                      ? 'bg-gradient-to-r from-rose-700 via-rose-400 to-rose-200'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${percentage ?? 0}%` }}
                />
              </div>
              {!hasVerifiedTotal && (
                <p className="mt-2 text-xs text-amber-300">
                  Completion cannot be calculated until the achievement catalog total is verified.
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Achievement collection">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
            Achievement collection
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Achievements
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Browse unlocked achievements and those still available to earn.
          </p>
        </div>

        <CollapsibleSection title="UNLOCKED" count={unlocked.length} defaultOpen>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {unlocked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </CollapsibleSection>

        <div className="my-10 h-px w-full bg-white/10" />

        <CollapsibleSection title="LOCKED" count={locked.length} defaultOpen={false}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </CollapsibleSection>
      </section>
    </main>
  );
}
