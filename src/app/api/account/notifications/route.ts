import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { withApiErrorHandling } from "@/lib/apiError";

const schema = z
  .object({
    emailArrivalReminders: z.boolean().optional(),
    emailReviewRequests: z.boolean().optional(),
    emailTripOffers: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((v) => v !== undefined), { message: "Nothing to update" });

/**
 * The optional emails only. Booking confirmations, receipts, cancellations,
 * payment and security emails have no switch: they are part of the booking.
 */
async function patchHandler(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit({ key: `account-notifications:${session.user.id}`, limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await prisma.user.update({ where: { id: session.user.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export const PATCH = withApiErrorHandling(patchHandler);
