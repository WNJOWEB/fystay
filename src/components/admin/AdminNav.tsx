"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The admin pages, in named groups. A phone shows the current page's name as
 * a dropdown that opens this list; a bigger screen shows the groups in a row.
 */
const ADMIN_GROUPS = [
  {
    title: "Operations",
    links: [
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/disputes", label: "Disputes" },
      { href: "/admin/support-tickets", label: "Support tickets" },
      { href: "/admin/review-reports", label: "Review reports" },
    ],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/admin/listings", label: "Listings" },
      { href: "/admin/properties", label: "Add a property" },
      { href: "/admin/users", label: "Users" },
    ],
  },
  {
    title: "Revenue & growth",
    links: [
      { href: "/admin/promo-codes", label: "Promo codes" },
      { href: "/admin/promotions", label: "Spotlight" },
      { href: "/admin/extras", label: "Trip extras" },
      { href: "/admin/hotel-affiliate", label: "Hotel affiliate" },
    ],
  },
  {
    title: "System",
    links: [{ href: "/admin/local-data", label: "Local data" }],
  },
] as const;

const OVERVIEW = { href: "/admin", label: "Overview" } as const;
const ALL_LINKS: readonly { href: string; label: string }[] = ADMIN_GROUPS.flatMap((group) => [...group.links]);

type AdminHref = typeof OVERVIEW.href | (typeof ADMIN_GROUPS)[number]["links"][number]["href"];

/**
 * Cross-links between the admin-only pages, none of which are ever linked
 * from the site's own nav (an admin reaches them by URL, per the same
 * convention /admin/local-data already established) - without this, each
 * page was an island only reachable by typing its exact path.
 */
export function AdminNav({ active }: { active: AdminHref }) {
  const [open, setOpen] = useState(false);
  const current =
    active === OVERVIEW.href
      ? OVERVIEW.label
      : (ALL_LINKS.find((link) => link.href === active)?.label ?? "Admin");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav aria-label="Admin" className="border-b border-border-subtle pb-3 sm:pb-4">
      {/* A phone: one dropdown with the current page's name. */}
      <div className="flex items-center gap-2 sm:hidden">
        <Link
          href={OVERVIEW.href}
          aria-current={active === OVERVIEW.href ? "page" : undefined}
          className={cn(
            "focus-ring rounded-full px-3.5 py-2 text-sm font-medium",
            active === OVERVIEW.href ? "bg-brand-700 text-white" : "text-stone-600 hover:bg-surface-muted",
          )}
        >
          Overview
        </Link>
        {active !== OVERVIEW.href && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="focus-ring flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            <span className="truncate">{current}</span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        )}
        {active === OVERVIEW.href && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="focus-ring flex flex-1 items-center justify-between gap-2 rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-foreground"
          >
            Go to…
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div aria-hidden className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin sections"
            className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-2xl bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[var(--shadow-popover)]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border-subtle bg-surface px-5 py-3.5">
              <p className="text-base font-semibold text-foreground">Admin</p>
              <button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close" className="focus-ring -mr-2 rounded-full p-2 text-stone-600 hover:bg-surface-muted">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="px-5 pt-4">
              <MenuRow href={OVERVIEW.href} label={OVERVIEW.label} active={active === OVERVIEW.href} onClick={() => setOpen(false)} />
            </div>
            {ADMIN_GROUPS.map((group) => (
              <section key={group.title} className="mt-5 px-5" aria-label={group.title}>
                <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{group.title}</h2>
                <ul className="mt-1.5 divide-y divide-border-subtle rounded-xl border border-border-subtle">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <MenuRow href={link.href} label={link.label} active={link.href === active} onClick={() => setOpen(false)} bare />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* A bigger screen: the same groups, side by side. */}
      <div className="hidden flex-wrap gap-x-8 gap-y-3 sm:flex">
        <Link
          href={OVERVIEW.href}
          aria-current={active === OVERVIEW.href ? "page" : undefined}
          className={cn(
            "focus-ring self-end rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === OVERVIEW.href ? "bg-brand-700 text-white" : "text-stone-600 hover:bg-surface-muted",
          )}
        >
          Overview
        </Link>
        {ADMIN_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{group.title}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.href === active ? "page" : undefined}
                  className={cn(
                    "focus-ring whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    link.href === active ? "bg-brand-700 text-white" : "text-stone-600 hover:bg-surface-muted",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

function MenuRow({ href, label, active, onClick, bare }: { href: string; label: string; active: boolean; onClick: () => void; bare?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring flex items-center justify-between gap-3 px-3.5 py-3 text-sm font-medium hover:bg-surface-muted",
        bare ? "" : "rounded-xl border border-border-subtle",
        active ? "text-brand-800" : "text-foreground",
      )}
    >
      <span className={cn(active && "font-semibold")}>{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
    </Link>
  );
}
