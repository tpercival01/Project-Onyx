
'use client';

type Achievement = {
  id: string;
  name: string;
  description: string;
  gamerscore: number;
  isUnlocked: boolean;
  iconUrl: string | null;
};

export function AchievementCard({
  achievement,
}: {
  achievement: Achievement;
}) {
  const unlocked = achievement.isUnlocked;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        unlocked
          ? 'border-white/10 bg-[#111318] hover:border-rose-500/30 hover:bg-[#171a20]'
          : 'border-white/5 bg-[#0e1014] hover:border-white/15'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
          {achievement.iconUrl ? (
            <img
              src={achievement.iconUrl}
              alt=""
              loading="lazy"
              className={`h-full w-full object-cover ${
                unlocked ? '' : 'grayscale opacity-50'
              }`}
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
              No image
            </div>
          )}

          {!unlocked && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-zinc-300">
                Locked
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`line-clamp-2 text-sm font-semibold leading-snug ${
              unlocked ? 'text-zinc-100' : 'text-zinc-400'
            }`}
          >
            {achievement.name}
          </h3>

          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-500">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/5 px-4 py-3">
        <span
          className={`inline-flex items-center gap-2 text-xs font-medium ${
            unlocked ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              unlocked ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>

        <span
          className={`rounded-lg border px-3 py-1 text-sm font-semibold tabular-nums ${
            unlocked
              ? 'border-white/10 bg-white/5 text-zinc-100'
              : 'border-white/5 bg-black/20 text-zinc-500'
          }`}
        >
          {achievement.gamerscore.toLocaleString()} G
        </span>
      </div>
    </article>
  );
}
