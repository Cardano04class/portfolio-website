const MOBILE_MAX_WIDTH_PX = 1024;

/**
 * Client-side transitions to project detail break touch scrolling on some mobile browsers.
 * A full document navigation reloads the app shell and restores native scroll.
 */
export function prefersHardNavigationToProjectDetail(): boolean {
    if (typeof window === "undefined") return false;
    return (
        navigator.maxTouchPoints > 0 &&
        window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches
    );
}

export function projectDetailPath(slug: string): string {
    return `/projects/${slug}`;
}
