"use client";

import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { DemoId } from "@/app/data/projects";
import { useHydrationSafeReducedMotion } from "@/app/hooks/use-hydration-safe-reduced-motion";

/** What every demo receives. `active` is false when off-screen or the tab is hidden: stop timers then. */
export type DemoProps = { active: boolean; reducedMotion: boolean };

const loading = () => <div className="h-[464px] animate-pulse bg-muted/40" aria-hidden />;

// One chunk per demo, fetched only on the page that renders it.
const DEMOS: Record<DemoId, { title: string; hint: string; Demo: ComponentType<DemoProps> }> = {
    push_swap: {
        title: "push_swap",
        hint: "Type numbers or pick a random set, then play or step through every move.",
        Demo: dynamic(() => import("./push-swap/push-swap-demo"), { ssr: false, loading }),
    },
    inception: {
        title: "inception",
        hint: "Run make to build and start the stack, then send a request through it. Try make down and request again.",
        Demo: dynamic(() => import("./inception/inception-demo"), { ssr: false, loading }),
    },
    cub3d: {
        title: "cub3D",
        hint: "Click the view, then W A S D to move, ← → to turn, M for the minimap, Esc to leave.",
        Demo: dynamic(() => import("./cub3d/cub3d-demo"), { ssr: false, loading }),
    },
    minishell: {
        title: "minishell",
        hint: "Click the terminal to type. ↑↓ history, Tab completes, Ctrl-C cancels, Esc leaves.",
        Demo: dynamic(() => import("./minishell/terminal"), { ssr: false, loading }),
    },
};

function useActive(ref: React.RefObject<HTMLElement | null>): boolean {
    const [visible, setVisible] = useState(false);
    const [tabShown, setTabShown] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
        io.observe(el);
        const onVis = () => setTabShown(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", onVis);
        return () => {
            io.disconnect();
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [ref]);
    return visible && tabShown;
}

/** If the demo chunk fails to load or throws, show the project cover instead of a broken panel. */
class DemoErrorBoundary extends Component<{ cover: StaticImageData; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <div className="relative">
                <Image src={this.props.cover} alt="" className="h-auto w-full opacity-40" sizes="100vw" />
                <p className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                    Demo failed to load
                </p>
            </div>
        );
    }
}

export default function ProjectDemo({ id, cover }: { id: DemoId; cover: StaticImageData }) {
    const ref = useRef<HTMLDivElement>(null);
    const active = useActive(ref);
    const reducedMotion = useHydrationSafeReducedMotion();
    const { title, hint, Demo } = DEMOS[id];

    return (
        // Opt out of Lenis wheel/touch smoothing and of shoot mode's pointer capture.
        <div
            ref={ref}
            data-lenis-prevent
            data-shoot-scroll-interactive
            className="overflow-hidden rounded-sm border border-border bg-background"
        >
            <div className="relative flex items-center border-b border-border bg-muted/50 px-4 py-2.5">
                {/* macOS-style window controls: close, minimize, full screen. */}
                <span className="flex gap-2" aria-hidden>
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2)]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2)]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2)]" />
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    {title}
                </span>
            </div>
            <DemoErrorBoundary cover={cover}>
                <Demo active={active} reducedMotion={reducedMotion} />
            </DemoErrorBoundary>
            <p className="border-t border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {hint}
            </p>
        </div>
    );
}
