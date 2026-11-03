"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FieldError, Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { HOST_BIO_MAX } from "@/lib/hostBio";

/** A host's short "about me", shown on their public host page. */
export function HostBioCard({ initialBio, hostId }: { initialBio: string; hostId: string }) {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = bio.trim() !== initialBio.trim();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: bio.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't save your bio.");
      return;
    }
    toast.success("Bio saved");
    router.refresh();
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={save} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="hostBio">About you</Label>
            <p className="mt-0.5 text-sm text-stone-600">
              Shown to guests on <a className="text-brand-700 hover:underline" href={`/hosts/${hostId}`}>your host page</a>. A line or two about you and your place.
            </p>
          </div>
          <Textarea
            id="hostBio"
            rows={4}
            maxLength={HOST_BIO_MAX}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            invalid={Boolean(error)}
            placeholder="e.g. Born and raised in Blackpool. I look after two flats a short walk from the Tower."
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500">{bio.length}/{HOST_BIO_MAX}</span>
            <Button type="submit" size="sm" disabled={!changed || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && <FieldError>{error}</FieldError>}
        </form>
      </CardContent>
    </Card>
  );
}
