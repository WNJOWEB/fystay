"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

/** Marks one open failure as handled. Shown only on open rows at /admin/failures. */
export function DeliveryFailureActions({ failureId }: { failureId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markHandled() {
    setLoading(true);
    const res = await fetch(`/api/admin/delivery-failures/${failureId}/resolve`, { method: "POST" });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      toast.error(data?.error ?? "That didn't go through.");
      return;
    }
    toast.success("Marked as handled");
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={markHandled} loading={loading}>
      Mark handled
    </Button>
  );
}
