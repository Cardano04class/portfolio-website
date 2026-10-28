import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    PROJECT_TRANSITION_REVEAL_KEY,
    ROUTE_TRANSITION_LOCK_KEY,
    lockDocumentScroll,
    releaseDocumentScroll,
} from "@/app/utils/release-document-scroll";

const MOBILE_MAX_WIDTH_PX = 1024;
/** Time the leaving page's curtain needs to cover the screen before `router.push`. */
const CURTAIN_COVER_MS = 620;

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

/**
 * Navigates to a project detail page: hard navigation on touch phones, otherwise locks
 * scroll, lets the caller play its curtain (keyed by `transitionKey`), then soft-navigates.
 */
export function useProjectNavigation(disabled = false) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    const navigateToProject = useCallback(
        (slug: string) => {
            if (disabled || isNavigating) return;

            if (prefersHardNavigationToProjectDetail()) {
                window.location.assign(projectDetailPath(slug));
                return;
            }

            setIsNavigating(true);
            setTransitionKey((v) => v + 1);
            timeoutRef.current = window.setTimeout(() => {
                window.sessionStorage.setItem(ROUTE_TRANSITION_LOCK_KEY, "1");
                window.sessionStorage.setItem(PROJECT_TRANSITION_REVEAL_KEY, "1");
                router.push(projectDetailPath(slug));
            }, CURTAIN_COVER_MS);
        },
        [disabled, isNavigating, router],
    );

    useEffect(
        () => () => {
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        },
        [],
    );

    useEffect(() => {
        if (!isNavigating) return;
        lockDocumentScroll();
        return releaseDocumentScroll;
    }, [isNavigating]);

    return { isNavigating, transitionKey, navigateToProject };
}
