"use client";

import { useEffect, useRef, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  Plug,
  Plus,
  Sparkles,
  Sun,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useReserveBottomSpace } from "@/hooks/useReserveBottomSpace";

type NavItem = { href: string; label: string; icon: LucideIcon; match?: (path: string) => boolean };

const TODAY: NavItem = { href: "/host/dashboard", label: "Today", icon: Sun };
const BOOKINGS: NavItem = { href: "/host/bookings", label: "Bookings", icon: LayoutGrid };
const CALENDAR: NavItem = {
  href: "/host/calendar",
  label: "Calendar",
  icon: CalendarDays,
  match: (p) => p.startsWith("/host/calendar") || /^\/host\/listings\/[^/]+\/calendar/.test(p),
};
const MESSAGES: NavItem = { href: "/inbox", label: "Messages", icon: MessageCircle };
const EARNINGS: NavItem = { href: "/host/earnings", label: "Earnings", icon: Wallet };
const LISTINGS: NavItem = {
  href: "/host/listings",
  label: "Listings",
  icon: Home,
  match: (p) => p.startsWith("/host/listings") && !/\/calendar/.test(p),
};
const PAYOUTS: NavItem = { href: "/host/payouts", label: "Payouts", icon: CreditCard };
const CHANNELS: NavItem = { href: "/host/integrations", label: "Channels", icon: Plug };
const SPOTLIGHT: NavItem = { href: "/host/promote", label: "Spotlight", icon: Sparkles };

// A phone's bottom bar: the four things a host does every day, then Menu for
// everything else, grouped (see MENU_GROUPS) instead of a row to swipe along.
const BOTTOM_TABS: NavItem[] = [TODAY, BOOKINGS, CALENDAR, MESSAGES];

const MENU_GROUPS: { title: string; items: (NavItem & { description: string })[] }[] = [
  {
    title: "Your business",
    items: [
      { ...LISTINGS, description: "Edit, pause and add your stays" },
      { ...EARNINGS, description: "What you have earned, by month" },
      { ...PAYOUTS, description: "When and where you get paid" },
    ],
  },
  {
    title: "Grow",
    items: [
      { ...SPOTLIGHT, description: "Feature a stay on the homepage" },
      { ...CHANNELS, description: "Sync your calendar with Airbnb and others" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/account", label: "Settings & security", icon: UserRound, description: "Profile, password, two-factor, identity" },
      { href: "/help", label: "Help centre", icon: CircleHelp, description: "Guides and contact support" },
    ],
  },
];

const MENU_PATHS = [EARNINGS, LISTINGS, PAYOUTS, CHANNELS, SPOTLIGHT];

function isActive(item: NavItem, path: string) {
  return item.match ? item.match(path) : path === item.href || path.startsWith(`${item.href}/`);
}

export function HostNav({ actionCount, unreadMessages }: { actionCount: number; unreadMessages: number }) {
  const path = usePathname();
  const bottomBar = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useReserveBottomSpace(bottomBar);

  const badgeFor = (href: string) =>
    href === "/host/dashboard" ? actionCount : href === "/inbox" ? unreadMessages : 0;
  const menuActive = MENU_PATHS.some((item) => isActive(item, path)) || path.startsWith("/account");

  return (
    <>
      {/* A bigger screen has room for everything as tabs. A phone uses the bottom bar below. */}
      <div className="sticky top-0 z-30 hidden border-b border-border-subtle bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 md:block">
        <nav aria-label="Hosting" className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-6 [scrollbar-width:none]">
          {[TODAY, BOOKINGS, CALENDAR, EARNINGS, LISTINGS].map((item) => (
            <NavTab key={item.href} item={item} active={isActive(item, path)} badge={badgeFor(item.href)} />
          ))}
          <span aria-hidden className="mx-2 h-5 w-px bg-border-subtle" />
          {[MESSAGES, PAYOUTS, CHANNELS, SPOTLIGHT].map((item) => (
            <NavTab key={item.href} item={item} active={isActive(item, path)} badge={badgeFor(item.href)} subtle />
          ))}
          <Link
            href="/host/listings/new"
            className="focus-ring ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        </nav>
      </div>

      <nav
        ref={bottomBar}
        aria-label="Hosting (mobile)"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {BOTTOM_TABS.map((item) => {
            const active = isActive(item, path);
            const badge = badgeFor(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                    active ? "text-brand-700" : "text-stone-500",
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                    {badge > 0 && <Badge count={badge} className="-right-2.5 -top-1.5" />}
                  </span>
                  {item.label}
                  <PendingBar />
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className={cn(
                "focus-ring relative flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                menuActive ? "text-brand-700" : "text-stone-500",
              )}
            >
              <Menu className={cn("h-5 w-5", menuActive && "stroke-[2.25]")} />
              Menu
            </button>
          </li>
        </ul>
      </nav>

      {menuOpen && <MenuSheet path={path} onClose={() => setMenuOpen(false)} />}
    </>
  );
}

/** Everything that is not a daily tab, in named groups, as a sheet rising from the bottom bar. */
function MenuSheet({ path, onClose }: { path: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div aria-hidden className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hosting menu"
        className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-2xl bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[var(--shadow-popover)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-surface px-5 py-3.5">
          <p className="text-base font-semibold text-foreground">Menu</p>
          <button type="button" onClick={onClose} autoFocus aria-label="Close menu" className="focus-ring -mr-2 rounded-full p-2 text-stone-600 hover:bg-surface-muted">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <Link
          href="/host/listings/new"
          onClick={onClose}
          className="focus-ring mx-5 mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New listing
        </Link>

        {MENU_GROUPS.map((group) => (
          <section key={group.title} className="mt-5 px-5" aria-label={group.title}>
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{group.title}</h2>
            <ul className="mt-1.5 divide-y divide-border-subtle rounded-xl border border-border-subtle">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, path);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className="focus-ring flex items-center gap-3 px-3.5 py-3 hover:bg-surface-muted"
                    >
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", active ? "bg-brand-100 text-brand-800" : "bg-brand-50 text-brand-700")}>
                        <Icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                        <span className="block truncate text-xs text-stone-500">{item.description}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function NavTab({
  item,
  active,
  badge,
  subtle,
  className,
}: {
  item: NavItem;
  active: boolean;
  badge: number;
  subtle?: boolean;
  className?: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 text-foreground"
          : cn("border-transparent hover:text-foreground", subtle ? "text-stone-500" : "text-stone-600"),
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
      {badge > 0 && <Badge count={badge} className="static ml-0.5" />}
      <PendingBar />
    </Link>
  );
}

function Badge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-none text-white",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> waiting</span>
    </span>
  );
}

/**
 * A thin bar under a tapped menu item while its page is on the way - only
 * ever visible on a slow connection, since each hosting page has a
 * loading.tsx and is prefetched. Always rendered (opacity only), so it
 * never shifts the layout.
 */
function PendingBar() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-400 transition-opacity duration-150",
        pending ? "animate-pulse opacity-100" : "opacity-0",
      )}
    />
  );
}
