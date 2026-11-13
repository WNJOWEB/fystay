"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardCheck, Eye, MoreHorizontal, PencilLine, Star, Trash2 } from "lucide-react";
import { DeleteListingDialog } from "@/components/DeleteListingButton";
import { cn } from "@/lib/cn";

/**
 * A listing card's actions without the clutter: the one thing a host does
 * most (Edit, or Review when FYStay prepared the listing for them) stays
 * visible, and everything else - the calendar, reviews, the live page and
 * the careful, irreversible Delete - lives behind "More".
 */
export function ListingActionsMenu({
  listingId,
  listingTitle,
  needsReview,
}: {
  listingId: string;
  listingTitle: string;
  needsReview: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-surface-muted";

  return (
    <>
      {needsReview && (
        <Link href={`/host/listings/${listingId}/review`} className="focus-ring flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <ClipboardCheck className="h-4 w-4" aria-hidden />
          Review
        </Link>
      )}
      <Link href={`/host/listings/${listingId}/edit`} className="focus-ring flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
        <PencilLine className="h-4 w-4" aria-hidden />
        Edit
      </Link>
      <span ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn("focus-ring flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:bg-surface-muted", open && "bg-surface-muted")}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          More<span className="sr-only"> actions for {listingTitle}</span>
        </button>
        {open && (
          <div role="menu" className="absolute bottom-full right-0 z-20 mb-1 w-48 rounded-xl border border-border-subtle bg-surface p-1 shadow-[var(--shadow-popover)]">
            <Link role="menuitem" href={`/host/listings/${listingId}/calendar`} className={item}>
              <CalendarDays className="h-4 w-4 text-stone-500" aria-hidden />
              Calendar
            </Link>
            <Link role="menuitem" href={`/host/listings/${listingId}/reviews`} className={item}>
              <Star className="h-4 w-4 text-stone-500" aria-hidden />
              Reviews
            </Link>
            <Link role="menuitem" href={`/listings/${listingId}`} className={item}>
              <Eye className="h-4 w-4 text-stone-500" aria-hidden />
              View live page
            </Link>
            <div className="my-1 border-t border-border-subtle" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
              className={cn(item, "text-red-700 hover:bg-red-50")}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete…
            </button>
          </div>
        )}
      </span>
      <DeleteListingDialog listingId={listingId} listingTitle={listingTitle} open={confirmDelete} onClose={() => setConfirmDelete(false)} />
    </>
  );
}
