"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";

type Key = "emailArrivalReminders" | "emailReviewRequests" | "emailTripOffers";

const OPTIONS: { key: Key; title: string; description: string }[] = [
  { key: "emailArrivalReminders", title: "Arrival reminders", description: "A couple of days before check-in, with the details you need." },
  { key: "emailReviewRequests", title: "Review requests", description: "A day after checkout, asking how your stay was." },
  { key: "emailTripOffers", title: "Trip offers", description: "Optional extras for a booking, like an airport transfer." },
];

/** Switches for the optional emails. Booking, payment and security emails are always sent. */
export function NotificationSettingsCard({ initial }: { initial: Record<Key, boolean> }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState<Key | null>(null);

  async function toggle(key: Key) {
    const next = !values[key];
    setValues((v) => ({ ...v, [key]: next }));
    setSaving(key);
    const res = await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: next }),
    });
    setSaving(null);
    if (!res.ok) {
      setValues((v) => ({ ...v, [key]: !next }));
      toast.error("Couldn't save that. Please try again.");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <ul className="flex flex-col divide-y divide-border-subtle">
          {OPTIONS.map((option) => (
            <li key={option.key} className="flex items-start justify-between gap-4 py-3 first:pt-0">
              <div>
                <p id={`${option.key}-label`} className="text-sm font-semibold text-foreground">{option.title}</p>
                <p className="mt-0.5 text-sm text-stone-600">{option.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values[option.key]}
                aria-labelledby={`${option.key}-label`}
                disabled={saving === option.key}
                onClick={() => toggle(option.key)}
                className={`focus-ring relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${values[option.key] ? "bg-brand-700" : "bg-stone-300"}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${values[option.key] ? "translate-x-5" : ""}`} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-border-subtle pt-3 text-sm text-stone-600">
          Booking confirmations, receipts, cancellations and security emails are always sent.
        </p>
      </CardContent>
    </Card>
  );
}
