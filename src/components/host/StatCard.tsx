import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    // Icon above the figure, so a long amount has the full width of the card
    // and is never cut off on a phone.
    <Card className={cn("flex flex-col gap-3 p-4", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="mt-0.5 break-words text-lg font-bold tabular-nums text-foreground sm:text-xl">{value}</p>
        {sublabel && <p className="mt-0.5 text-xs text-stone-500">{sublabel}</p>}
      </div>
    </Card>
  );
}
