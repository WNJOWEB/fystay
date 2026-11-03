"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { RefObject } from "react";

/**
 * Reserves real space at the true bottom of the whole document, sized to
 * match a fixed-position element's own rendered height - not just space
 * within whatever page happens to render it. A position:fixed bar always
 * sits over the bottom of the *viewport*, so padding added only inside a
 * page's own content stops it covering that page's own content but does
 * nothing once a guest scrolls past that content into the site-wide
 * Footer, which renders after every page with no reserved space of its
 * own - without this, a fixed bar permanently hides the Footer's last few
 * rows (its legal links) once scrolled that far.
 *
 * A ResizeObserver (rather than a fixed pixel value, or reading the
 * height once) means this self-corrects if the bar's own height ever
 * changes, including collapsing to 0 via a responsive lg:hidden once the
 * viewport crosses into desktop width.
 *
 * Also exposes that same height as the --fixed-bottom-bar-height CSS
 * variable (default 0px - see globals.css) so any other fixed-position UI
 * that must avoid this bar, e.g. a floating support button pinned to the
 * bottom corner, can read the same live number instead of hardcoding a
 * guess or duplicating this observer.
 *
 * Several bars can be registered at once. Page bars (the site's bottom
 * navigation, a page's own booking or hosting bar - the default) share one
 * strip, so the tallest of them sets its height, exposed as
 * --page-bottom-bar-height. A bar registered with pageBar: false (the cookie
 * notice) is a layer above that strip: it adds its own height on top, and
 * reads --page-bottom-bar-height to sit just above the page bar instead of
 * covering it. --fixed-bottom-bar-height is the total of both. A page bar
 * also tells the site's bottom navigation to step aside - see
 * usePageBottomBarPresent - so two page bars never stack over the content.
 */
const heights = new Map<HTMLElement, { height: number; pageBar: boolean }>();
let pageBars = 0;
const listeners = new Set<() => void>();

function applyReservedSpace() {
  const tallestOf = (pageBar: boolean) =>
    Math.max(0, ...[...heights.values()].filter((bar) => bar.pageBar === pageBar).map((bar) => bar.height));
  const page = tallestOf(true);
  const total = page + tallestOf(false);
  const root = document.documentElement;
  if (page > 0) root.style.setProperty("--page-bottom-bar-height", `${page}px`);
  else root.style.removeProperty("--page-bottom-bar-height");
  if (total > 0) {
    document.body.style.paddingBottom = `${total}px`;
    root.style.setProperty("--fixed-bottom-bar-height", `${total}px`);
  } else {
    document.body.style.paddingBottom = "";
    root.style.removeProperty("--fixed-bottom-bar-height");
  }
}

function setPageBars(delta: number) {
  pageBars += delta;
  for (const listener of listeners) listener();
}

export function useReserveBottomSpace(
  ref: RefObject<HTMLElement | null>,
  { pageBar = true }: { pageBar?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (pageBar) setPageBars(1);
    const observer = new ResizeObserver(() => {
      heights.set(el, { height: el.offsetHeight, pageBar });
      applyReservedSpace();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      heights.delete(el);
      applyReservedSpace();
      if (pageBar) setPageBars(-1);
    };
  }, [ref, pageBar]);
}

/** True while a page's own fixed bottom bar (booking, checkout, hosting) is on screen. */
export function usePageBottomBarPresent(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pageBars > 0,
    () => false,
  );
}
