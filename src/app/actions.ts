'use server';

import { redirect } from 'next/navigation';
import { db } from '../lib/db';
import { games, achievements } from '../lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function submitGamertag(formData: FormData) {
  const gamertag = formData.get('gamertag');

  if (!gamertag || typeof gamertag !== 'string') {
    throw new Error('Invalid gamertag');
  }

  const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.onyx.thomaspercival.dev';

const token = process.env.ONYX_SYNC_TOKEN;

if (!token) {
  throw new Error('Backend authentication is not configured');
}

const res = await fetch(
  `${API_URL}/sync/profile/${encodeURIComponent(gamertag.trim())}`,
  {
    method: 'POST',
    headers: {
      'X-Onyx-Sync-Token': token,
    },
    cache: 'no-store',
  }
);

  if (!res.ok) {
    throw new Error('Failed to reach sync engine');
  }

  const data = await res.json();

  if (data.error || !data.xuid) {
    throw new Error(data.error || 'User not found on Xbox Live');
  }

  // 2. Redirect to profile. Python is doing the DB inserts in the background!
  redirect(`/profile/${data.xuid}`);
}

// Helper to check if games have landed in the DB yet
export async function checkGamesExist(xuid: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(games)
    .where(eq(games.userXuid, xuid));
  
  return Number(result[0].count) > 0;
}

// Helper to check if achievements have landed in the DB yet
export async function checkAchievementsExist(xuid: string, titleId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(
      and(
        eq(achievements.userXuid, xuid),
        eq(achievements.titleId, titleId)
      )
    );
  
  return Number(result[0].count) > 0;
}