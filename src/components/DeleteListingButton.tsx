"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/Dialog";

type DeleteListingProps = {
  listingId: string;
  listingTitle: string;
  /** Called immediately on confirm, before the server has responded. */
  onDeleted?: () => void;
  /** Called if the server ultimately rejects the deletion, to undo the optimistic update. */
  onDeleteFailed?: () => void;
};

/** The confirmation and the deletion itself, controlled from outside so a menu can open it. */
export function DeleteListingDialog({
  listingId,
  listingTitle,
  open,
  onClose,
  onDeleted,
  onDeleteFailed,
}: DeleteListingProps & { open: boolean; onClose: () => void }) {
  const router = useRouter();

  async function handleDelete() {
    // Optimistic: the listing disappears from the list the instant you
    // confirm; the request below just makes it real in the background.
    onClose();
    onDeleted?.();

    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" }).catch(() => null);
    if (!res) {
      onDeleteFailed?.();
      toast.error("Couldn't reach FYStay - check your connection and try again.");
      return;
    }

    if (res.ok) {
      toast.success("Listing deleted");
      router.refresh();
    } else {
      onDeleteFailed?.();
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(body?.error ?? "Could not delete listing.");
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      danger
      title="Delete listing"
      description={`Delete "${listingTitle}"? This cannot be undone. Listings that have had bookings can't be deleted - unpublish them instead.`}
      confirmLabel="Delete"
    />
  );
}

export function DeleteListingButton(props: DeleteListingProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
      <DeleteListingDialog {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
