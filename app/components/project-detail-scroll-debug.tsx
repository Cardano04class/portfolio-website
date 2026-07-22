"use client";

import { useEffect, useLayoutEffect } from "react";
import { logProjectsScroll } from "@/app/utils/projects-scroll-debug";

type ProjectDetailScrollDebugProps = {
    slug: string;
};

/**
 * Logs document scroll-related state when a project detail route mounts (mobile debugging).
 */
export default function ProjectDetailScrollDebug({
    slug,
}: ProjectDetailScrollDebugProps): null {
    useLayoutEffect(() => {
        logProjectsScroll(`detail useLayoutEffect mount slug=${slug}`, {
            phase: "layout",
        });
    }, [slug]);

    useEffect(() => {
        logProjectsScroll(`detail useEffect mount slug=${slug}`, {
            phase: "effect",
        });

        const id0 = window.setTimeout(() => {
            logProjectsScroll(`detail +0ms (macrotask) slug=${slug}`);
        }, 0);

        const id100 = window.setTimeout(() => {
            logProjectsScroll(`detail +100ms slug=${slug}`);
        }, 100);

        const id500 = window.setTimeout(() => {
            logProjectsScroll(`detail +500ms slug=${slug}`);
        }, 500);

        const id2000 = window.setTimeout(() => {
            logProjectsScroll(`detail +2000ms slug=${slug}`);
        }, 2000);

        return () => {
            window.clearTimeout(id0);
            window.clearTimeout(id100);
            window.clearTimeout(id500);
            window.clearTimeout(id2000);
        };
    }, [slug]);

    return null;
}
