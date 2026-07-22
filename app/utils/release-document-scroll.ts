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
