
'use client';

import { useActionState } from 'react';
import { submitGamertag } from '@/app/actions';

export function GamertagSearch() {
  const [state, formAction, isPending] = useActionState(
    submitGamertag,
    { error: null }
  );

  return (
    <form action={formAction} className="mt-10 max-w-xl">
      <label
        htmlFor="gamertag"
        className="mb-3 block text-sm font-medium text-zinc-300"
      >
        Find your Xbox profile
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="gamertag"
          name="gamertag"
          type="text"
          placeholder="Enter your Gamertag"
          autoComplete="off"
          maxLength={32}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? 'gamertag-error' : undefined}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-rose-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? 'Searching...' : 'View profile →'}
        </button>
      </div>

      {isPending && (
        <p role="status" className="mt-3 text-sm text-rose-300">
          Looking up Xbox profile...
        </p>
      )}

      {state.error && !isPending && (
        <p
          id="gamertag-error"
          role="alert"
          className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </p>
      )}

      <p className="mt-3 text-xs text-zinc-500">
        Public Xbox profiles only. Initial synchronization may take
        a few moments.
      </p>
    </form>
  );
}
