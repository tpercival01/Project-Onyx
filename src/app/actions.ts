'use server';

import { redirect } from 'next/navigation';
import { db } from '../lib/db';
import { games, achievements } from '../lib/schema';
import { eq, and, sql } from 'drizzle-orm';


export type GamertagSearchState = {
  error: string | null;
};

export async function submitGamertag(
  _previousState: GamertagSearchState,
  formData: FormData
): Promise<GamertagSearchState> {
  const raw = formData.get('gamertag');
  const gamertag = typeof raw === 'string' ? raw.trim() : '';

  if (!gamertag || gamertag.length > 32) {
    return { error: 'Enter a valid Xbox Gamertag.' };
  }

  const token = process.env.ONYX_SYNC_TOKEN;

  if (!token) {
    return {
      error: 'Profile search is temporarily unavailable.',
    };
  }

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.onyx.thomaspercival.dev';

  let xuid: string | undefined;

  try {
    const response = await fetch(
      `${API_URL}/sync/profile/${encodeURIComponent(gamertag)}`,
      {
        method: 'POST',
        headers: { 'X-Onyx-Sync-Token': token },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return {
        error:
          response.status === 429
            ? 'Too many requests. Please try again later.'
            : 'Unable to contact Xbox services. Please try again.',
      };
    }

    const data = await response.json();

    if (data.error || !data.xuid) {
      return {
        error: 'Gamertag not found. Check the spelling and try again.',
      };
    }

    xuid = data.xuid;
  } catch {
    return {
      error: 'Connection failed. Please try again in a moment.',
    };
  }

  if (!xuid || !/^\d{1,20}$/.test(xuid)) {
    return {
      error: 'Unable to retrieve this Xbox profile.',
    };
  }

  redirect(`/profile/${xuid}`);
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

async function queueOnyxSync(path: string) {
  const token = process.env.ONYX_SYNC_TOKEN;

  if (!token) {
    throw new Error('Backend authentication is not configured');
  }

  const response = await fetch(
    `https://api.onyx.thomaspercival.dev${path}`,
    {
      method: 'POST',
      headers: {
        'X-Onyx-Sync-Token': token,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Sync request failed (${response.status})`);
  }
  return response;
}

export async function requestAchievementSync(
  xuid: string,
  titleId: string
) {
  if (!/^\d{1,20}$/.test(xuid) ||
      !/^\d{1,20}$/.test(titleId)) {
    throw new Error('Invalid Xbox identifiers');
  }

  await queueOnyxSync(
    `/sync/achievements/${xuid}/${titleId}`
  );
}


export async function requestLibraryRefresh(
  xuid: string
): Promise<'queued' | 'already_queued'> {
  if (!/^\d{1,20}$/.test(xuid)) {
    throw new Error('Invalid Xbox identifier');
  }

  const response = await queueOnyxSync(
    `/sync/refresh/${xuid}`
  );

  const data: unknown = await response.json();

  if (
    typeof data !== 'object' ||
    data === null ||
    !('status' in data)
  ) {
    throw new Error('Invalid refresh response');
  }

  if (
    data.status !== 'queued' &&
    data.status !== 'already_queued'
  ) {
    throw new Error('Unexpected refresh status');
  }

  return data.status;
}
