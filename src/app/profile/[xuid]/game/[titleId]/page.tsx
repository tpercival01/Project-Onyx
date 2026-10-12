import { db } from '@/lib/db';
import { achievements, games } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
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

  const gameAchievements = await db
    .select()
    .from(achievements)
    .where(
      and(
        eq(achievements.userXuid, xuid),
        eq(achievements.titleId, titleId)
      )
    );

  const gameRecord = await db.query.games.findFirst({
    where: and(
      eq(games.id, titleId),
      eq(games.userXuid, xuid)
    ),
  });
  const gameName = gameRecord ? gameRecord.name : 'Unknown Game';

  if (gameAchievements.length === 0) {
    return (
      <main className="p-8 flex min-h-screen items-center justify-center">
        <SyncLoader 
          xuid={xuid} 
          titleId={titleId} 
          message="Decrypting Achievements..." 
        />
      </main>
    );
  }

  const unlocked = gameAchievements.filter((a) => a.isUnlocked);
  const locked = gameAchievements.filter((a) => !a.isUnlocked);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-12 border-b border-red-900/50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-neutral-200">
            {gameName.toUpperCase()}
          </h1>
          <p className="text-neutral-500 mt-2 tracking-widest text-sm">
            ACHIEVEMENT LOGS
          </p>
        </div>
      </div>
      
      <CollapsibleSection 
        title="UNLOCKED" 
        count={unlocked.length} 
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unlocked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </CollapsibleSection>

      <div className="my-12 h-px w-full bg-neutral-900" />

      <CollapsibleSection 
        title="LOCKED" 
        count={locked.length} 
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {locked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </CollapsibleSection>
    </main>
  );
}