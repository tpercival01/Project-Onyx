
'use client';

import { useState } from 'react';
import { requestLibraryRefresh } from '@/app/actions';

type RefreshState =
  | 'idle'
  | 'requesting'
  | 'queued'
  | 'already_queued'
  | 'error';

export function GlobalSyncButton({
  xuid,
}: {
  xuid: string;
}) {
  const [status, setStatus] = useState<RefreshState>('idle');

  const disabled =
    status === 'requesting' ||
    status === 'queued' ||
    status === 'already_queued';

  async function handleRefresh() {
    if (disabled) return;

    setStatus('requesting');

    try {
      const result = await requestLibraryRefresh(xuid);
      setStatus(result);
    } catch {
      setStatus('error');
    }
  }

  const buttonLabel = {
    idle: 'Refresh Library',
    requesting: 'Requesting refresh...',
    queued: 'Refresh queued',
    already_queued: 'Already refreshing',
    error: 'Retry refresh',
  }[status];

  const message = {
    idle: null,
    requesting: null,
    queued:
      'Your library refresh has been queued. Updated data will appear as synchronization completes.',
    already_queued:
      'A library refresh is already queued or running. No duplicate job was created.',
    error:
      'Unable to request a refresh. Please try again later.',
  }[status];

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={disabled}
        aria-busy={status === 'requesting'}
        className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed ${
          status === 'queued' ||
          status === 'already_queued'
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/20'
        }`}
      >
        {status === 'requesting' ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-300"
          />
        ) : status === 'queued' ||
          status === 'already_queued' ? (
          <span aria-hidden="true">✓</span>
        ) : (
          <span aria-hidden="true">↻</span>
        )}

        {buttonLabel}
      </button>

      {message && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`max-w-xs text-xs leading-relaxed ${
            status === 'error'
              ? 'text-red-300'
              : 'text-zinc-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
