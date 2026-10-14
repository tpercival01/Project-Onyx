
'use client';

import { useId, useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const isUnlocked = title.toLowerCase() === 'unlocked';

  return (
    <section className="mb-8">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:px-6 ${
          isOpen
            ? 'border-white/15 bg-[#191c23]'
            : 'border-white/10 bg-[#111318] hover:border-white/20 hover:bg-[#191c23]'
        }`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isUnlocked
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 bg-white/5 text-zinc-400'
            }`}
          >
            {isUnlocked ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  d="m5 12 4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="11"
                  rx="2"
                />
                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>

          <div className="min-w-0">
            <h3 className="text-base font-semibold capitalize text-zinc-100 sm:text-lg">
              {title.toLowerCase()} achievements
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {isUnlocked
                ? 'Achievements you have earned'
                : 'Achievements still available to unlock'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold tabular-nums text-zinc-300">
            {count.toLocaleString()}
          </span>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <path
              d="m6 9 6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <div id={contentId} hidden={!isOpen}>
        <div className="pt-5">
          {children}
        </div>
      </div>
    </section>
  );
}
