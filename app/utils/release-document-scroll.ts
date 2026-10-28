/** sessionStorage keys handed from the leaving page to `PageTransition` on the next route. */
export const ROUTE_TRANSITION_LOCK_KEY = "route-transition-lock";
export const PROJECT_TRANSITION_REVEAL_KEY = "project-transition-reveal";

/** Locks page scroll during a route transition. Undo with `releaseDocumentScroll`. */
export function lockDocumentScroll(): void {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add("route-transition-lock");
    body.classList.add("route-transition-lock");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
}

/**
 * Clears transition scroll locks and inline overflow overrides on the root elements.
 * Call after client navigations when scroll was locked by a previous route.
 */
export function releaseDocumentScroll(): void {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("route-transition-lock");
    body.classList.remove("route-transition-lock");

    html.style.removeProperty("overflow");
    html.style.removeProperty("overflow-y");
    body.style.removeProperty("overflow");
    body.style.removeProperty("overflow-y");
    body.style.removeProperty("touch-action");
}
