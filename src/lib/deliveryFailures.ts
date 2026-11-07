import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";

/**
 * Keeps a record of an email that couldn't be sent and a Stripe webhook that
 * failed to process, so an admin can see them at /admin/failures instead of
 * finding out from a guest. Writing one must never break the request that
 * caused it, so any error here is only logged.
 */

const MAX_LABEL = 200;
const MAX_REASON = 500;

/** A short "Name: message" line for an error, without stack traces or request data. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, MAX_REASON);
  return "Unknown error";
}

export async function recordDeliveryFailure(input: {
  kind: "EMAIL" | "WEBHOOK";
  label: string;
  reason: string;
}): Promise<void> {
  try {
    await prisma.deliveryFailure.create({
      data: {
        kind: input.kind,
        label: input.label.slice(0, MAX_LABEL),
        reason: input.reason.slice(0, MAX_REASON),
      },
    });
  } catch (error) {
    console.error("Couldn't record a delivery failure", error);
    Sentry.captureException(error);
  }
}
