import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarSync, ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { withHostScope } from "@/lib/pms/hostScopedPrisma";
import { isPmsProviderConnectable, PMS_PROVIDER_LABEL } from "@/lib/pms/registry";
import {
  ICAL_CHANNEL_LABEL,
  ICAL_SYNC_SCHEDULE_TEXT,
  icalChannelStatus,
  type IcalChannel,
  type IcalChannelStatus,
} from "@/lib/icalChannel";
import { IntegrationCard, type IntegrationSummary } from "@/components/host/pms/IntegrationCard";
import { IntegrationBanner } from "@/components/host/pms/IntegrationBanner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Channels", robots: { index: false } };



/**
 * Channels: calendar sync with Airbnb and other sites over iCal - the only
 * Airbnb connection FYStay can offer, since Airbnb's API is limited to
 * partners it approves. Every status shown comes from what icalSync.ts
 * stored on each listing (see icalChannelStatus). PMS integrations appear
 * only once one is genuinely connectable or already connected.
 */
export default async function HostIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ pms_connected?: string; pms_error?: string }>;
}) {
  const { pms_connected, pms_error } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/integrations");
  if (session.user.role !== "HOST") redirect("/host");

  const { connections, listings } = await withHostScope(session.user.id, async (tx) => ({
    connections: await tx.pmsConnection.findMany({
      where: { hostId: session.user.id },
      include: { roomMappings: true },
    }),
    listings: await tx.listing.findMany({
      where: { hostId: session.user.id },
      select: {
        id: true,
        title: true,
        propertyType: true,
        icalImportUrl: true,
        icalSyncedAt: true,
        icalSyncError: true,
        icalSyncFailedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  }));
  const byProvider = new Map(connections.map((c) => [c.provider, c]));

  const pmsSummaries: IntegrationSummary[] = (
    Object.keys(PMS_PROVIDER_LABEL) as (keyof typeof PMS_PROVIDER_LABEL)[]
  )
    .map((provider) => {
      const connection = byProvider.get(provider);
      return {
        provider,
        label: PMS_PROVIDER_LABEL[provider],
        live: isPmsProviderConnectable(provider),
        connected: connection?.status === "CONNECTED",
        status: connection?.status ?? "DISCONNECTED",
        externalPropertyName: connection?.externalPropertyName ?? null,
        lastSyncedAt: connection?.lastSyncedAt?.toISOString() ?? null,
        lastSyncStatus: connection?.lastSyncStatus ?? null,
        lastSyncError: connection?.lastSyncError ?? null,
        mappedCount: connection?.roomMappings.length ?? 0,
      };
    })
    // Not built or not configured: not shown, so nothing looks available that isn't.
    .filter((s) => s.live || s.connected);

  const now = new Date();
  const rows = listings.map((listing) => ({
    listing,
    syncable: listing.propertyType !== "HOTEL",
    status: icalChannelStatus(listing, now),
  }));
  const countFor = (channel: IcalChannel) => rows.filter((r) => r.status.channel === channel).length;
  const syncableCount = rows.filter((r) => r.syncable).length;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <Link
        href="/host/dashboard"
        className="focus-ring -ml-1 inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-sm font-medium text-stone-600 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-foreground">Channels</h1>
      <p className="mt-1 text-sm text-stone-500">
        Sync your calendar with Airbnb and other sites (iCal).
      </p>

      <IntegrationBanner connectedProvider={pms_connected} errorReason={pms_error} />

      <div className="mt-6 flex flex-col gap-4">
        <ChannelCard
          name="Airbnb"
          connectedCount={countFor("AIRBNB")}
          listingCount={syncableCount}
          intro="Set up once per listing."
        >
          <p className="rounded-xl bg-surface-muted p-3 text-sm text-stone-600">
            <span className="font-medium text-foreground">No direct Airbnb account connection.</span> Dates
            only - prices, messages and guest details don&apos;t sync.
          </p>
          <Steps
            title="Import Airbnb bookings"
            steps={[
              "Airbnb: Calendar → Availability → Connect calendars → Export calendar. Copy the link.",
              "Here: open the listing's calendar settings and paste it into “Your Airbnb (or other) calendar link”.",
            ]}
          />
          <Steps
            title="Send FYStay bookings to Airbnb"
            steps={[
              "Here: copy “Your FYStay calendar link” from the listing's calendar settings.",
              "Airbnb: Connect calendars → Connect another website. Paste it and save.",
            ]}
          />
        </ChannelCard>

        <ChannelCard
          name={ICAL_CHANNEL_LABEL.OTHER}
          connectedCount={countFor("OTHER")}
          listingCount={syncableCount}
          intro="Any site or app with an iCal (.ics) link, such as Vrbo or Google Calendar."
        >
          <Steps
            title="Set it up"
            steps={[
              "Paste its iCal link into the listing's calendar settings.",
              "To send FYStay bookings there, give it the listing's FYStay calendar link.",
            ]}
          />
        </ChannelCard>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground">Sync limits</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-stone-600">
            <li>
              Imported calendars sync {ICAL_SYNC_SCHEDULE_TEXT}, when you save or press Sync now, and before each
              booking.
            </li>
            <li>
              Updates aren&apos;t instant, so two guests can occasionally book the same dates on different sites.
              Check new bookings on both.
            </li>
            <li>Only dates are shared. Syncing never cancels a FYStay booking.</li>
          </ul>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-foreground">Your listings</h2>
      {rows.length === 0 ? (
        <Card className="mt-3 p-5 text-sm text-stone-500">
          You don&apos;t have any listings yet.{" "}
          <Link href="/host/listings/new" className="focus-ring rounded font-medium text-brand-700 underline underline-offset-2">
            Create a listing
          </Link>{" "}
          to set up calendar sync.
        </Card>
      ) : (
        <Card className="mt-3 divide-y divide-border-subtle">
          {rows.map(({ listing, syncable, status }) => (
            <div key={listing.id} data-testid="channel-listing" className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{listing.title}</p>
                {syncable ? (
                  <ListingSyncStatus status={status} />
                ) : (
                  <p className="mt-1 text-sm text-stone-500">
                    Calendar sync isn&apos;t available for hotel listings with room types.
                  </p>
                )}
              </div>
              {syncable && (
                <Link
                  href={`/host/listings/${listing.id}/calendar#calendar-sync`}
                  className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg py-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Calendar settings
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          ))}
        </Card>
      )}

      {pmsSummaries.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-foreground">Property management systems</h2>
          <div className="mt-3 flex flex-col gap-4">
            {pmsSummaries.map((summary) => (
              <IntegrationCard key={summary.provider} summary={summary} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChannelCard({
  name,
  connectedCount,
  listingCount,
  intro,
  children,
}: {
  name: string;
  connectedCount: number;
  listingCount: number;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-4 p-5" aria-label={name} role="region">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <CalendarSync className="h-5 w-5 text-brand-700" aria-hidden />
          <h2 className="text-base font-semibold text-foreground">{name}</h2>
          <Badge variant="brand">Calendar sync (iCal)</Badge>
          {connectedCount > 0 ? (
            <Badge variant="success">
              {connectedCount} of {listingCount} listing{listingCount === 1 ? "" : "s"} linked
            </Badge>
          ) : (
            <Badge variant="neutral">Not connected</Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm text-stone-500">{intro}</p>
      </div>
      {children}
    </Card>
  );
}

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ol className="mt-1.5 flex list-decimal flex-col gap-1 pl-5 text-sm text-stone-600">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

const STATUS_BADGE: Record<IcalChannelStatus["state"], "neutral" | "warning" | "success" | "danger"> = {
  NOT_CONNECTED: "neutral",
  PENDING: "warning",
  CONNECTED: "success",
  PROBLEM: "danger",
};

function ListingSyncStatus({ status }: { status: IcalChannelStatus }) {
  return (
    <div className="mt-1 flex flex-col gap-1 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {status.channel && <span className="text-stone-500">{ICAL_CHANNEL_LABEL[status.channel]}</span>}
        <Badge variant={STATUS_BADGE[status.state]}>{status.label}</Badge>
      </div>
      {"message" in status && (
        <p className={status.state === "PROBLEM" ? "text-red-700" : "text-stone-500"}>
          {status.message}
        </p>
      )}
    </div>
  );
}
