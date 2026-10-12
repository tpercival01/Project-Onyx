
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  checkGamesExist,
  checkAchievementsExist,
  requestAchievementSync,
} from '@/app/actions';

export function SyncLoader({
  xuid,
  titleId,
  message,
}: {
  xuid: string;
  titleId?: string;
  message: string;
}) {
  const router = useRouter();
  const syncRequested = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let attempts = 0;

    async function start() {
      try {
        // Request achievement sync through Next.js, not the browser.
        if (titleId && !syncRequested.current) {
          syncRequested.current = true;
          await requestAchievementSync(xuid, titleId);
        }

        async function poll() {
          if (cancelled) return;

          try {
            const exists = titleId
              ? await checkAchievementsExist(xuid, titleId)
              : await checkGamesExist(xuid);

            if (cancelled) return;

            if (exists) {
              router.refresh();
              return;
            }

            attempts++;

            if (attempts >= 20) {
              setError(
                'Sync is taking longer than expected. Please refresh the page.'
              );
              return;
            }

            timeout = setTimeout(poll, 3000);
          } catch {
            if (!cancelled) {
              setError('Unable to check sync progress.');
            }
          }
        }

        await poll();
      } catch {
        if (!cancelled) {
          setError('Unable to start achievement synchronization.');
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [xuid, titleId, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
      {error ? (
        <>
          <p role="alert" className="text-center text-red-400">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-neutral-700 px-5 py-2 text-white"
          >
            Try Again
          </button>
        </>
      ) : (
        <>
          <div className="h-16 w-16 animate-pulse rounded-full border border-red-500 bg-red-900" />
          <p className="text-center font-mono text-xl text-neutral-400">
            {message}
          </p>
        </>
      )}
    </div>
  );
}
