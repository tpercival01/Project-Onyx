
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  checkGamesExist,
  checkAchievementsExist,
  requestAchievementSync,
} from '@/app/actions';

type SyncStatus =
  | 'checking'
  | 'requesting'
  | 'waiting'
  | 'delayed'
  | 'paused'
  | 'error';

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
  const [status, setStatus] = useState<SyncStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Keep the request promise across effect reruns.
  const requestRef = useRef<{
    key: string;
    promise: Promise<void>;
  } | null>(null);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function hasData() {
      return titleId
        ? checkAchievementsExist(xuid, titleId)
        : checkGamesExist(xuid);
    }

    async function poll(attempt: number) {
      if (!active) return;

      try {
        const exists = await hasData();
        if (!active) return;

        if (exists) {
          router.refresh();
          return;
        }

        // Thirty checks at ten-second intervals.
        if (attempt >= 29) {
          setStatus('paused');
          return;
        }

        setStatus(attempt >= 5 ? 'delayed' : 'waiting');

        timeout = setTimeout(() => {
          void poll(attempt + 1);
        }, 10000);
      } catch {
        if (!active) return;

        setError('Unable to check for updated data.');
        setStatus('error');
      }
    }

    async function start() {
      setError(null);
      setStatus('checking');

      try {
        // Check the cache before submitting any request.
        if (await hasData()) {
          if (active) router.refresh();
          return;
        }

        if (!active) return;

        if (titleId) {
          const key = `${xuid}:${titleId}`;

          if (requestRef.current?.key !== key) {
            requestRef.current = {
              key,
              promise: requestAchievementSync(xuid, titleId),
            };
          }

          setStatus('requesting');

          try {
            await requestRef.current.promise;
          } catch {
            if (requestRef.current?.key === key) {
              requestRef.current = null;
            }

            throw new Error('Unable to request achievement sync.');
          }

          if (!active) return;
        }

        setStatus('waiting');
        await poll(0);
      } catch {
        if (!active) return;

        setError(
          'Unable to start or check synchronization. Please try again.'
        );
        setStatus('error');
      }
    }

    void start();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [xuid, titleId, router, retry]);

  const paused = status === 'paused';
  const failed = status === 'error';
  const waiting = status === 'waiting' || status === 'delayed';

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        {!paused && !failed && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/10 blur-xl" />
        )}

        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-500/20 bg-[#15171d]">
          <img
            src="/medals/onyx.svg"
            alt=""
            width={60}
            height={60}
            className="h-15 w-15 object-contain"
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-white">
        {paused
          ? 'Still waiting for data'
          : failed
            ? 'Synchronization unavailable'
            : message}
      </h2>

      <div className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
        {status === 'checking' && (
          <p>Checking for existing cached data...</p>
        )}

        {status === 'requesting' && (
          <p>Submitting the achievement synchronization request...</p>
        )}

        {waiting && (
          <p role="status">
            {status === 'delayed'
              ? 'This is taking longer than expected. The request may still be queued or processing. We are continuing to check for updated data.'
              : 'Waiting for data to become available. This page checks automatically.'}
          </p>
        )}

        {paused && (
          <p>
            No new data was found during the checking period.
            The background job may still be queued or processing.
          </p>
        )}

        {failed && (
          <p role="alert" className="text-red-300">
            {error}
          </p>
        )}
      </div>

      {(paused || failed) && (
        <button
          type="button"
          onClick={() => setRetry(value => value + 1)}
          className="mt-7 rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          Check again
        </button>
      )}

      <Link
        href={titleId ? `/profile/${xuid}` : '/'}
        className="mt-6 text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        {titleId ? '← Back to game library' : '← Back to search'}
      </Link>
    </div>
  );
}
