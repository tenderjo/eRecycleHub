"use client";

import { Tabs } from "radix-ui";
import type { ReactNode } from "react";

type Tab = { key: string; label: string; count: number; icon: ReactNode; content: ReactNode };

/** Segmented control over the homepage auction lists; the lists themselves are rendered on the server. */
export function AuctionTabs({ tabs, label, initial }: { tabs: Tab[]; label: string; initial: string }) {
  return (
    <Tabs.Root defaultValue={initial}>
      <Tabs.List aria-label={label} className="mx-auto flex w-fit max-w-full gap-2 overflow-x-auto rounded-2xl bg-sunken p-1.5">
        {tabs.map((t) => (
          <Tabs.Trigger
            key={t.key}
            value={t.key}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold text-ink-2 transition hover:text-patina data-[state=active]:bg-patina data-[state=active]:text-white data-[state=active]:shadow-[0_10px_25px_-8px_#087b70] sm:px-7"
          >
            {t.icon}
            {t.label}
            <span className="tabular rounded-full bg-white/80 px-2 py-0.5 text-xs text-patina-700">{t.count}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content key={t.key} value={t.key} className="mt-8 focus-visible:outline-none">
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
