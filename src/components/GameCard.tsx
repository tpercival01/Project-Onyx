import Link from 'next/link';

type MedalTier = 'bronze' | 'silver' | 'gold' | 'onyx' | null;

type GameCardData = {
  id: string;
  name: string;
  displayImage: string | null;
  earnedAchievements: number;
  totalAchievements: number;
  currentGamerscore: number | null;
  totalGamerscore: number | null;
};

const tierStyles = {
  bronze: {
  label: 'Bronze',
  pill: 'border-[#a65d43]/70 bg-[#321b17]/95 text-[#e4a184]',
  bar: 'bg-[#b66b4d]',
},
  silver: {
    label: 'Silver',
    pill: 'border-slate-400/40 bg-slate-800/90 text-slate-200',
    bar: 'bg-slate-300',
  },
  gold: {
  label: 'Gold',
  pill: 'border-yellow-300/70 bg-[#443405]/95 text-yellow-200',
  bar: 'bg-yellow-300',
},
  onyx: {
    label: 'Onyx',
    pill: 'border-rose-400/50 bg-zinc-950/90 text-rose-200',
    bar: 'bg-gradient-to-r from-rose-700 via-rose-400 to-rose-200',
  },
} as const;

export function GameCard({
  game,
  xuid,
  tier,
}: {
  game: GameCardData;
  xuid: string;
  tier: MedalTier;
}) {
  const hasTotal = game.totalAchievements > 0;
  const percentage = hasTotal
    ? Math.min(100, Math.round(
        (game.earnedAchievements / game.totalAchievements) * 100
      ))
    : null;
  const isOnyx = tier === 'onyx';
  const style = tier ? tierStyles[tier] : null;

  return (
    <Link
      href={`/profile/${xuid}/game/${game.id}`}
      prefetch={false}
      aria-label={`${game.name}, ${percentage === null ? 'completion unknown' : `${percentage}% complete`}`}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-[#111318] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
        isOnyx
          ? 'border-rose-500/40 hover:border-rose-400/70'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950">
        {game.displayImage ? (
          <img
            src={game.displayImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-zinc-500">
            {game.name}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />

        {style && (
          <span className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] backdrop-blur-sm ${style.pill}`}>
            {style.label}
          </span>
        )}

        {isOnyx && (
          <div className="absolute right-3 top-3" aria-label="Onyx completion medal">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-rose-300/60 bg-gradient-to-br from-rose-600 via-zinc-950 to-rose-900 p-1 shadow-[0_0_22px_rgba(244,63,94,0.45)]">
              <span className="grid h-full w-full place-items-center rounded-full border border-rose-400/30 bg-zinc-950 text-xl text-rose-300">
                ◆
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <h3 className="min-h-12 line-clamp-2 text-sm font-semibold leading-6 text-zinc-100 transition group-hover:text-white">
          {game.name}
        </h3>

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-400">Achievements</span>
            <span className={`text-lg font-semibold tabular-nums ${isOnyx ? 'text-rose-300' : 'text-white'}`}>
              {percentage === null ? '—' : `${percentage}%`}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`${game.name} achievement completion`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage === null ? undefined : percentage}
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className={`h-full rounded-full ${style?.bar ?? 'bg-zinc-600'}`}
              style={{ width: `${percentage ?? 0}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-zinc-400">
            <span>
              {hasTotal
                ? `${game.earnedAchievements} / ${game.totalAchievements} unlocked`
                : 'Catalog total unavailable'}
            </span>
            <span className="font-medium tabular-nums text-zinc-300">
              {(game.currentGamerscore ?? 0).toLocaleString()} G
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
