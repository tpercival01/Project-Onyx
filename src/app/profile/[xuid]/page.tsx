
import { db } from '@/lib/db';
import { games, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { SyncLoader } from '@/components/SyncLoader';
import { GlobalSyncButton } from '@/components/GlobalSyncButton';

export const dynamic = 'force-dynamic';

type MedalTier = 'bronze' | 'silver' | 'gold' | 'onyx';

const medals = [
  {
    id: 'bronze',
    name: 'Bronze',
    requirement: 'Below 50%',
    colour: 'text-amber-600',
    gradient: 'from-amber-700 via-orange-400 to-amber-900',
  },
  {
    id: 'silver',
    name: 'Silver',
    requirement: '50–79%',
    colour: 'text-slate-300',
    gradient: 'from-slate-600 via-slate-200 to-slate-500',
  },
  {
    id: 'gold',
    name: 'Gold',
    requirement: '80–99%',
    colour: 'text-yellow-400',
    gradient: 'from-yellow-700 via-yellow-300 to-amber-600',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    requirement: '100%',
    colour: 'text-rose-400',
    gradient: 'from-zinc-950 via-rose-700 to-zinc-900',
  },
] as const;

function getMedalTier(game: {
  earnedAchievements: number;
  totalAchievements: number;
}): MedalTier | null {
  if (game.totalAchievements <= 0 || game.earnedAchievements <= 0) {
    return null;
  }

  const percentage =
    (game.earnedAchievements / game.totalAchievements) * 100;

  if (percentage >= 100) return 'onyx';
  if (percentage >= 80) return 'gold';
  if (percentage >= 50) return 'silver';
  return 'bronze';
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ xuid: string }>;
  searchParams: Promise<{ showAll?: string; medal?: string }>;
}) {
  const { xuid } = await params;
  const query = await searchParams;

  const showAll = query.showAll === '1';
  const selectedMedal =
    medals.find((medal) => medal.id === query.medal)?.id ?? null;

  const [profile] = await db
    .select({
      gamertag: users.gamertag,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.xuid, xuid))
    .limit(1);

  const userGames = await db
    .select()
    .from(games)
    .where(eq(games.userXuid, xuid))
    .orderBy(desc(games.lastTimePlayed));

  if (userGames.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <SyncLoader xuid={xuid} message="Loading Game Library..." />
      </main>
    );
  }

  const medalCounts: Record<MedalTier, number> = {
    bronze: 0,
    silver: 0,
    gold: 0,
    onyx: 0,
  };

  for (const game of userGames) {
    const tier = getMedalTier(game);
    if (tier) medalCounts[tier]++;
  }

  const startedGames = userGames.filter(
  game => game.earnedAchievements > 0
);

const gamesWithTotals = startedGames.filter(
  game => game.totalAchievements > 0
);

const earnedGamerscore = startedGames.reduce(
  (sum, game) => sum + (game.currentGamerscore ?? 0), 0
);

const earnedAchievements = gamesWithTotals.reduce(
  (sum, game) => sum + game.earnedAchievements, 0
);

const totalAchievements = gamesWithTotals.reduce(
  (sum, game) => sum + game.totalAchievements, 0
);

const completionRate = totalAchievements > 0
  ? (earnedAchievements / totalAchievements) * 100
  : null;

const stats = [
  {
    label: 'Gamerscore earned',
    value: earnedGamerscore.toLocaleString() + ' G',
    detail: 'Across started games',
  },
  {
    label: 'Achievements unlocked',
    value: `${earnedAchievements.toLocaleString()} / ${totalAchievements.toLocaleString()}`,
    detail: 'Games with known totals',
  },
  {
    label: 'Games completed',
    value: `${medalCounts.onyx} / ${gamesWithTotals.length}`,
    detail: 'Completed / known totals',
  },
  {
    label: 'Achievement completion',
    value: completionRate === null
      ? '—'
      : `${completionRate.toFixed(1)}%`,
    detail: 'Across games with known totals',
  },
];

  const visibleGames = userGames.filter((game) => {
    if (selectedMedal) {
      return getMedalTier(game) === selectedMedal;
    }

    return showAll || game.earnedAchievements > 0;
  });

  function profileUrl(medal: MedalTier | null = null) {
    const params = new URLSearchParams();
    if (showAll) params.set('showAll', '1');
    if (medal) params.set('medal', medal);

    const suffix = params.toString();
    return `/profile/${xuid}${suffix ? `?${suffix}` : ''}`;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 text-zinc-100 lg:px-8">

      {/* PROFILE HEADER */}
      <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.gamertag}'s Xbox avatar`}
              className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-zinc-900 object-cover sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-3xl font-bold text-rose-400">
              {profile?.gamertag?.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <div className="min-w-0">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400 hover:text-rose-300"
            >
              ONYX / PLAYER PROFILE
            </Link>

            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {profile?.gamertag || 'Xbox Player'}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {userGames.length.toLocaleString()} games in library
            </p>
          </div>
        </div>

        <GlobalSyncButton xuid={xuid} />
      </header>

      {/* PROFILE STATISTICS */}
<section className="mb-12" aria-label="Profile statistics">
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6"
      >
        <p className="text-xs font-medium text-zinc-400">
          {stat.label}
        </p>

        <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {stat.value}
        </p>

        <p className="mt-3 text-xs text-zinc-500">
          {stat.detail}
        </p>
      </div>
    ))}
  </div>

  {startedGames.length > gamesWithTotals.length && (
    <p className="mt-3 text-xs text-amber-400">
      {startedGames.length - gamesWithTotals.length} started
      games have unknown achievement totals and are excluded
      from completion calculations.
    </p>
  )}
</section>

      {/* MEDAL COLLECTION */}
      <section aria-labelledby="medals-heading" className="mb-14">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
            Your collection
          </p>
          <h2
            id="medals-heading"
            className="mt-2 text-2xl font-semibold tracking-tight"
          >
            Completion Medals
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Select a medal to explore games at that completion level.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {medals.map((medal) => {
            const active = selectedMedal === medal.id;

            return (
              <Link
                key={medal.id}
                href={profileUrl(active ? null : medal.id)}
                scroll={false}
                aria-current={active ? 'true' : undefined}
                className={`group relative flex flex-col items-center rounded-2xl border px-4 py-7 text-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
                  active
                    ? 'border-rose-500/70 bg-rose-500/10 ring-1 ring-rose-500/30'
                    : 'border-white/10 bg-[#111318] hover:-translate-y-1 hover:border-white/25 hover:bg-[#191c23]'
                }`}
              >
                {active && (
                  <span className="absolute right-3 top-3 text-[10px] font-medium uppercase tracking-wider text-rose-400">
                    Selected
                  </span>
                )}

                <div
                  aria-hidden="true"
                  className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${medal.gradient} p-[3px] shadow-lg shadow-black/40 transition-transform duration-300 group-hover:scale-105`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-white/15 bg-[#12141a]">
                    <span className={`text-3xl ${medal.colour}`}>
                      ◆
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${medal.colour}`}>
                  {medal.name}
                </span>

                <span className="mt-2 text-3xl font-semibold tabular-nums text-white">
                  {medalCounts[medal.id].toLocaleString()}
                </span>

                <span className="mt-2 text-xs text-zinc-500">
                  {medal.requirement} complete
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* GAME LIBRARY */}
      <section aria-labelledby="library-heading">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="library-heading"
              className="text-2xl font-semibold text-white"
            >
              {selectedMedal
                ? `${selectedMedal.charAt(0).toUpperCase()}${selectedMedal.slice(1)} Games`
                : 'Game Library'}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Showing {visibleGames.length.toLocaleString()} of{' '}
              {userGames.length.toLocaleString()} games
            </p>
          </div>

          {selectedMedal ? (
            <Link
              href={profileUrl()}
              scroll={false}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-300 hover:bg-rose-500/20"
            >
              Clear medal filter
            </Link>
          ) : (
            <Link
              href={showAll ? `/profile/${xuid}` : `/profile/${xuid}?showAll=1`}
              scroll={false}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-white/25 hover:text-white"
            >
              {showAll ? 'Hide unstarted games' : 'Show all games'}
            </Link>
          )}
        </div>

        {visibleGames.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
            <p className="text-zinc-300">
              {selectedMedal
                ? 'No games in this medal tier yet.'
                : 'No games with unlocked achievements found.'}
            </p>
            <Link
              href={profileUrl()}
              className="mt-4 inline-block text-sm text-rose-400 hover:text-rose-300"
            >
              View your library
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleGames.map((game) => {
              const tier = getMedalTier(game);
              const percentage = game.totalAchievements > 0
                ? Math.min(100, Math.round(
                    (game.earnedAchievements / game.totalAchievements) * 100
                  ))
                : 0;

              return (
                <Link
                  key={`${game.userXuid}-${game.id}`}
                  href={`/profile/${xuid}/game/${game.id}`}
                  prefetch={false}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111318] transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    {game.displayImage ? (
                      <img
                        src={game.displayImage}
                        alt={`${game.name} cover`}
                        className="h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                        No artwork
                      </div>
                    )}

                    {tier === 'onyx' && (
                      <span className="absolute right-3 top-3 rounded-full border border-rose-500/30 bg-black/90 px-3 py-1 text-[10px] font-bold tracking-wider text-rose-400">
                        ◆ ONYX
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-auto line-clamp-2 font-semibold text-zinc-200">
                      {game.name}
                    </h3>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-zinc-400">
                        <span>Achievements</span>
                        <span className="font-medium tabular-nums text-zinc-200">
                          {percentage}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${
                            tier === 'onyx' ? 'bg-rose-400' : 'bg-rose-700'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-zinc-500">
                        {game.earnedAchievements} / {game.totalAchievements} achievements
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {(game.currentGamerscore ?? 0).toLocaleString()} /{' '}
                        {(game.totalGamerscore ?? 0).toLocaleString()} G
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
