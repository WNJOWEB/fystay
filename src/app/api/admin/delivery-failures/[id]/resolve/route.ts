import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { withApiErrorHandling } from "@/lib/apiError";

/**
 * An admin marks a failed email or webhook as handled - it's been followed up
 * (re-sent, refunded, or judged not to matter) - so it leaves the open list.
 */
async function postHandler(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const failure = await prisma.deliveryFailure.findUnique({ where: { id } });
  if (!failure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (failure.resolvedAt) {
    return NextResponse.json({ error: "Already handled" }, { status: 409 });
  }

  const updated = await prisma.deliveryFailure.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });
  return NextResponse.json({ failure: updated });
}

export const POST = withApiErrorHandling(postHandler);
