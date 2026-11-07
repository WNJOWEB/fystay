import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, findUnique, update } = vi.hoisted(() => ({
  state: {
    session: null as null | { user: { id: string; role: "GUEST" | "HOST" | "ADMIN" } },
  },
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: async () => state.session }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deliveryFailure: {
      findUnique: (...a: unknown[]) => findUnique(...a),
      update: (...a: unknown[]) => update(...a),
    },
  },
}));

import { POST } from "./route";

const resolve = () =>
  POST(new Request("http://x", { method: "POST" }), { params: Promise.resolve({ id: "f1" }) });

beforeEach(() => {
  state.session = null;
  findUnique.mockReset();
  update.mockReset().mockImplementation(async ({ data }: { data: object }) => ({ id: "f1", ...data }));
});

describe("POST /api/admin/delivery-failures/[id]/resolve", () => {
  it("refuses a signed-out visitor", async () => {
    expect((await resolve()).status).toBe(401);
  });

  it("refuses a guest or host", async () => {
    state.session = { user: { id: "u1", role: "HOST" } };
    expect((await resolve()).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("404s an unknown failure", async () => {
    state.session = { user: { id: "a1", role: "ADMIN" } };
    findUnique.mockResolvedValue(null);
    expect((await resolve()).status).toBe(404);
  });

  it("does not mark an already-handled failure twice", async () => {
    state.session = { user: { id: "a1", role: "ADMIN" } };
    findUnique.mockResolvedValue({ id: "f1", resolvedAt: new Date() });
    expect((await resolve()).status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it("marks an open failure handled", async () => {
    state.session = { user: { id: "a1", role: "ADMIN" } };
    findUnique.mockResolvedValue({ id: "f1", resolvedAt: null });
    const res = await resolve();
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ where: { id: "f1" }, data: { resolvedAt: expect.any(Date) } });
  });
});
