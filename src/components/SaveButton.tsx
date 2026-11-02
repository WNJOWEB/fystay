"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// A save a signed-out guest started: remembered in this tab when they
// choose to log in or sign up from the prompt, and finished by this
// listing's heart once they're back signed in - so they never have to tap
// it a second time. Session storage (this tab only, gone when it closes)
// and a short expiry keep it from surprising anyone later; only this site
// can write it, so a link can't plant a save.
const PENDING_SAVE_KEY = "fystay:pending-save";
const PENDING_SAVE_TTL_MS = 30 * 60 * 1000;
// Every heart for the same stay (it can sit in more than one row) follows
// a change made by any of them.
const SAVED_EVENT = "fystay:saved";

function rememberPendingSave(listingId: string) {
  try {
    sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({ listingId, at: Date.now() }));
  } catch {
    // Storage unavailable (private mode, blocked): they'll just tap again.
  }
}

/** Claims the pending save for this listing, if there is a fresh one - at most one heart ever claims it. */
function claimPendingSave(listingId: string): boolean {
  try {
    const raw = sessionStorage.getItem(PENDING_SAVE_KEY);
    if (!raw) return false;
    const pending = JSON.parse(raw) as { listingId?: unknown; at?: unknown };
    if (pending.listingId !== listingId) return false;
    sessionStorage.removeItem(PENDING_SAVE_KEY);
    return typeof pending.at === "number" && Date.now() - pending.at < PENDING_SAVE_TTL_MS;
  } catch {
    return false;
  }
}

function announceSaved(listingId: string, saved: boolean) {
  window.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail: { listingId, saved } }));
}

export function SaveButton({
  listingId,
  initialSaved,
  isLoggedIn,
  className,
}: {
  listingId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  // The page to come back to after signing in, captured when the prompt
  // opens (path and query, so e.g. the homepage's chosen filter survives).
  // The prompt itself is only mounted while open - never one hidden copy
  // per card.
  const [promptFor, setPromptFor] = useState<string | null>(null);
  // Guards against a second click firing a request while one is already in
  // flight, without blocking the instant visual toggle on the first click.
  const pendingRef = useRef(false);
  // Counts the guest's own saves, so each one replays the heart's pop and burst.
  const [burst, setBurst] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function closePrompt() {
    setPromptFor(null);
    // Back to the heart, as a native dialog would on close.
    buttonRef.current?.focus();
  }

  useEffect(() => {
    function onSaved(event: Event) {
      const detail = (event as CustomEvent<{ listingId: string; saved: boolean }>).detail;
      if (detail.listingId === listingId) setSaved(detail.saved);
    }
    window.addEventListener(SAVED_EVENT, onSaved);
    return () => window.removeEventListener(SAVED_EVENT, onSaved);
  }, [listingId]);

  // Back from signing in: finish the save they started.
  useEffect(() => {
    if (!isLoggedIn || !claimPendingSave(listingId)) return;
    void (async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, saved: true }),
      });
      if (!res.ok) {
        toast.error("Could not save that stay - try the heart again.");
        return;
      }
      announceSaved(listingId, true);
      toast.success("Saved to your wishlist");
      router.refresh();
    })();
  }, [isLoggedIn, listingId, router]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pendingRef.current) return;

    if (!isLoggedIn) {
      // Never fail silently: a logged-out tap gets an explicit prompt to
      // sign in or create an account, not a surprise redirect.
      setPromptFor(`${window.location.pathname}${window.location.search}` || "/");
      return;
    }

    // Optimistic: flip the heart immediately, reconcile with the server in
    // the background, and roll back only if the request actually fails.
    const optimisticSaved = !saved;
    setSaved(optimisticSaved);
    if (optimisticSaved) {
      setBurst((n) => n + 1);
      // A light tap on phones that support it.
      navigator.vibrate?.(12);
    }
    pendingRef.current = true;

    // keepalive: the heart has already flipped, so the save must still land
    // if the visitor leaves the page straight away - without it, a full
    // page load (a typed address, a refresh) cancels the request in flight
    // and the stay silently isn't saved.
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
      keepalive: true,
    });
    pendingRef.current = false;

    if (!res.ok) {
      setSaved(!optimisticSaved);
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Could not update wishlist.");
      return;
    }

    const data = await res.json();
    announceSaved(listingId, data.saved);
    router.refresh();
  }

  function continueTo(path: "/login" | "/register") {
    return {
      href: `${path}?callbackUrl=${encodeURIComponent(promptFor ?? "/")}`,
      onClick: () => {
        rememberPendingSave(listingId);
        setPromptFor(null);
      },
    };
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(
          "focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 active:scale-95",
          className,
        )}
      >
        <span className="relative flex items-center justify-center">
          {/* The burst: a ring and a ring of dots, replayed on each new save. */}
          {burst > 0 && saved && (
            <span key={burst} aria-hidden className="pointer-events-none absolute inset-0">
              <span className="heart-ring absolute inset-0 rounded-full border-2 border-red-400" />
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <span
                  key={angle}
                  className={cn(
                    "heart-dot absolute left-1/2 top-1/2 -ml-[2.5px] -mt-[2.5px] h-[5px] w-[5px] rounded-full",
                    i % 2 === 0 ? "bg-red-500" : "bg-amber-400",
                  )}
                  style={{ "--a": `${angle}deg` } as React.CSSProperties}
                />
              ))}
            </span>
          )}
          <Heart
            key={saved ? burst : "off"}
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              saved ? "fill-red-500 text-red-500" : "text-stone-600",
              saved && burst > 0 && "heart-pop",
            )}
          />
        </span>
      </button>

      {promptFor !== null && (
        <Dialog open onClose={closePrompt} title="Save this stay">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600">
              Sign in or create a free account to keep a wishlist on any device. We&apos;ll save this
              stay as soon as you&apos;re signed in.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link
                {...continueTo("/register")}
                className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
              >
                Create account
              </Link>
              <Link {...continueTo("/login")} className={cn(buttonVariants(), "w-full sm:w-auto")}>
                Log in
              </Link>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
