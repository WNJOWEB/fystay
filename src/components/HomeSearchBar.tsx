"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/cn";

/**
 * The homepage search. With `slimOnPhone` (the Spotlight stay hero, which
 * wants the photo to show), a phone gets one "Where to?" bar and tapping it
 * opens the full search in its place - the header's search pill opens it the
 * same way (data-search-expand, see HeaderBar). From sm up, and without
 * `slimOnPhone`, it is always the full bar.
 */
export function HomeSearchBar({ slimOnPhone = false }: { slimOnPhone?: boolean }) {
  const [open, setOpen] = useState(false);
  const folded = slimOnPhone && !open;

  return (
    <>
      {folded && (
        <button
          type="button"
          data-search-expand
          onClick={() => setOpen(true)}
          aria-label="Search stays: anywhere, any dates, 1 guest"
          className="focus-ring flex w-full items-center gap-2.5 rounded-full border border-border-subtle bg-surface py-2 pl-5 pr-2 text-left shadow-[var(--shadow-popover)] sm:hidden"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Where to?</span>
            <span className="block text-xs text-stone-500">Any dates · 1 guest</span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
            <Search className="h-4 w-4" aria-hidden />
          </span>
        </button>
      )}
      <div className={cn(folded && "hidden sm:block")}>
        <SearchBar liveUpdate={false} className="max-w-none shadow-[var(--shadow-popover)]" />
      </div>
    </>
  );
}
