import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { DeliveryFailureActions } from "@/components/admin/DeliveryFailureActions";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Failed emails and webhooks", robots: { index: false } };

type Filter = "open" | "handled";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

/**
 * Emails FYStay couldn't send and Stripe webhooks that failed to process. An
 * open row needs someone: re-send the email, check the payment in Stripe, then
 * mark it handled. Recording happens in src/lib/deliveryFailures.ts.
 */
export default async function AdminFailuresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/failures");
  if (session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const filter: Filter = params.status === "handled" ? "handled" : "open";

  const failures = await prisma.deliveryFailure.findMany({
    where: filter === "open" ? { resolvedAt: null } : { resolvedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Failed emails and webhooks</h1>

      <div className="mt-6">
        <AdminNav active="/admin/failures" />
      </div>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Filter">
        {(["open", "handled"] as const).map((value) => (
          <Link
            key={value}
            href={value === "open" ? "/admin/failures" : "/admin/failures?status=handled"}
            role="tab"
            aria-selected={filter === value}
            className={cn(
              "focus-ring rounded-full px-4 py-1.5 text-sm font-medium",
              filter === value ? "bg-foreground text-white" : "bg-surface text-stone-700 ring-1 ring-border-subtle",
            )}
          >
            {value === "open" ? "Open" : "Handled"}
          </Link>
        ))}
      </div>

      {failures.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">{filter === "open" ? "Nothing needs a look." : "Nothing handled yet."}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {failures.map((failure) => (
            <li key={failure.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={failure.kind === "WEBHOOK" ? "danger" : "warning"}>
                        {failure.kind === "WEBHOOK" ? "Webhook" : "Email"}
                      </Badge>
                      <span className="text-xs text-stone-500">{dateTime.format(failure.createdAt)}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      {failure.kind === "WEBHOOK" && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />}
                      <span className="break-words">{failure.label}</span>
                    </p>
                    <p className="mt-1 break-words text-xs text-stone-500">{failure.reason}</p>
                  </div>
                  {!failure.resolvedAt && <DeliveryFailureActions failureId={failure.id} />}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
