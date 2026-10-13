import { db } from '@/lib/db';
import { achievements, games, users } from '@/lib/schema';
import { eq, desc, and} from 'drizzle-orm';
import Link from 'next/link';
import { SyncLoader } from '@/components/SyncLoader';
import { GlobalSyncButton } from '@/components/GlobalSyncButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ xuid: string }>;
  searchParams: Promise<{ showAll?: string }>;
}) {
  const xuid = (await params).xuid;
  const showAll = (await searchParams).showAll === '1';
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
      <main className="p-8 flex min-h-screen items-center justify-center">
        <SyncLoader xuid={xuid} message="Extracting Game Library..." />
      </main>
    );
  }
  const visibleGames = showAll
  ? userGames
  : userGames.filter(game => game.earnedAchievements > 0);
  const unlockedAch = await db
  .select({gamerscore: achievements.gamerscore})
  .from(achievements)
  .where(and(eq(achievements.userXuid, xuid), eq(achievements.isUnlocked, true)));

  let bronze = 0; let silver = 0; let gold = 0;
  unlockedAch.forEach(a => {
    if (a.gamerscore >= 80) gold++;
    else if (a.gamerscore >= 40) silver++;
    else bronze++;
  });

  const onyxCoins = userGames.filter(g => (g.currentGamerscore ?? 0) === (g.totalGamerscore ?? 0) && (g.totalGamerscore ?? 0) > 0).length;

return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      
      {/* HEADER & SYNC BUTTON */}
      
{/* PROFILE HEADER */}
<div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
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
        className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400 transition hover:text-rose-300"
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
</div>


      {/* THE ONYX SHOWCASE */}
      <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-neutral-900 bg-[#050505] p-6 shadow-2xl shadow-red-900/5">
        
        {/* Onyx Coin (The Platinum) */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-900/50 bg-black p-6 shadow-[0_0_20px_rgba(139,0,0,0.2)]">
          <div className="mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-black border-2 border-red-500 shadow-[0_0_15px_#ff0000] animate-sith-pulse"></div>
          <span className="text-3xl font-bold text-neutral-200 font-mono">{onyxCoins}</span>
          <span className="text-xs font-bold tracking-widest text-red-500 mt-1">ONYX</span>
        </div>

        {/* Gold Coin */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-yellow-900/30 bg-[#0a0a0a] p-4">
          <div className="mb-2 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-800 border-2 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
          <span className="text-2xl font-bold text-neutral-300 font-mono">{gold}</span>
          <span className="text-xs font-bold tracking-widest text-yellow-600 mt-1">GOLD</span>
        </div>

        {/* Silver Coin */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-[#0a0a0a] p-4">
          <div className="mb-2 h-10 w-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border-2 border-gray-400"></div>
          <span className="text-2xl font-bold text-neutral-300 font-mono">{silver}</span>
          <span className="text-xs font-bold tracking-widest text-neutral-400 mt-1">SILVER</span>
        </div>

        {/* Bronze Coin */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-900/30 bg-[#0a0a0a] p-4">
          <div className="mb-2 h-10 w-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-amber-700"></div>
          <span className="text-2xl font-bold text-neutral-300 font-mono">{bronze}</span>
          <span className="text-xs font-bold tracking-widest text-amber-700 mt-1">BRONZE</span>
        </div>
      </div>

      {/* GAME LIBRARY */}
<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h2 className="text-2xl font-semibold text-white">
      Game Library
    </h2>
    <p className="mt-1 text-sm text-zinc-500">
      Showing {visibleGames.length.toLocaleString()} of{' '}
      {userGames.length.toLocaleString()} games
    </p>
  </div>

  <Link
    href={
      showAll
        ? `/profile/${xuid}`
        : `/profile/${xuid}?showAll=1`
    }
    scroll={false}
    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-rose-500/40 hover:text-white"
  >
    {showAll ? 'Hide unstarted games' : 'Show all games'}
  </Link>
</div>

{visibleGames.length === 0 && (
  <p className="mb-8 rounded-xl border border-white/10 p-6 text-zinc-400">
    No games with unlocked achievements found.
  </p>
)}

<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
  {visibleGames.map((game) => (
          <Link 
            href={`/profile/${xuid}/game/${game.id}`} 
            key={game.id} 
            prefetch={false}
            className="block h-full"
          >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-[#0a0a0a] border border-neutral-800 p-4 transition-all duration-300 hover:border-red-700 hover:shadow-[0_0_20px_rgba(139,0,0,0.3)] cursor-pointer">
              
              {/* Platinum check based on Gamerscore! */}
              {(game.currentGamerscore ?? 0) === (game.totalGamerscore ?? 0) && (game.totalGamerscore ?? 0) > 0 && (
                <div className="absolute top-6 right-6 z-10 rounded-full bg-black/90 p-2 border border-red-900 shadow-[0_0_15px_#8b0000]">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-red-500 to-black"></div>
                </div>
              )}
              
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border border-neutral-900 bg-neutral-950 pointer-events-none">
                {game.displayImage ? (
                  <img 
                    src={game.displayImage} 
                    alt={game.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-mono text-neutral-600">No Image</div>
                )}
              </div>
              <h2 className="font-bold text-neutral-300 line-clamp-2 mb-auto pointer-events-none">{game.name}</h2>
              
              <p className="text-sm text-neutral-500 mt-4 border-t border-neutral-900 pt-2 flex items-center justify-between pointer-events-none">
                <span>PROGRESS</span>
                <span className="font-mono">
                  <span className="text-red-700">{game.currentGamerscore ?? 0}</span> / {game.totalGamerscore ?? 0} G
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}