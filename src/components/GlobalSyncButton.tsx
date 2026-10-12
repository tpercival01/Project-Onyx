
'use client';

import { useState } from 'react';
import { requestLibraryRefresh } from '@/app/actions';

export function GlobalSyncButton({ xuid }: { xuid: string }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setMessage(null);
    setError(false);

    try {
      await requestLibraryRefresh(xuid);

      setMessage(
        'Refresh queued. Updated games will appear as synchronization completes.'
      );
    } catch {
      setError(true);
      setMessage('Unable to start refresh. Please try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="rounded-lg border border-red-900/50 bg-neutral-900 px-6 py-3 font-medium text-red-400 transition-colors hover:bg-red-950 disabled:cursor-wait disabled:opacity-50"
      >
        {isSyncing ? 'Requesting refresh...' : 'Refresh Library'}
      </button>

      {message && (
        <p
          role={error ? 'alert' : 'status'}
          className={`text-sm ${
            error ? 'text-red-400' : 'text-neutral-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
