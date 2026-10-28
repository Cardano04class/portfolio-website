"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoProps } from "../project-demo";
import { apply, EMPTY, request, SERVICES, stepsFor, type Hop, type ServiceId, type Stack, type Step, type Target } from "./compose";

const STEP_MS = 320;
const HOP_MS = 650;

const STATE_COLOR: Record<Stack["services"][ServiceId], string> = {
    absent: "#6b7280",
    built: "#64748b",
    starting: "#febc2e",
    running: "#28c840",
};
const SOURCE_COLOR: Record<Step["source"], string> = {
    make: "#c084fc",
    compose: "#60a5fa",
    mariadb: "#f59e0b",
    wordpress: "#38bdf8",
    nginx: "#34d399",
};

// Layout (SVG units): browser on the left, host box with the network, three containers and two volumes.
const BOX: Record<ServiceId, { x: number; y: number }> = {
    nginx: { x: 150, y: 76 },
    wordpress: { x: 330, y: 76 },
    mariadb: { x: 510, y: 76 },
};
const W = 150;
const VOLUMES: { name: string; path: string; x: number; users: ServiceId[] }[] = [
    { name: "wordpress-data", path: "/home/mamir/data/wordpress", x: 205, users: ["nginx", "wordpress"] },
    { name: "mariadb-data", path: "/home/mamir/data/mariadb", x: 480, users: ["mariadb"] },
];
const H = 76;

export default function InceptionDemo({ active, reducedMotion }: DemoProps) {
    const [stack, setStack] = useState<Stack>(EMPTY);
    const [log, setLogRaw] = useState<{ source: Step["source"] | "request"; text: string }[]>([
        { source: "make", text: "$ cd inception && ls  →  Makefile  srcs/  (press make)" },
    ]);
    const [queue, setQueue] = useState<Step[]>([]);
    const [hops, setHops] = useState<{ list: Hop[]; shown: number } | null>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const addLog = (lines: { source: Step["source"] | "request"; text: string }[]) => setLogRaw((l) => [...l, ...lines].slice(-80));
    const busy = queue.length > 0 || hops !== null;

    // Plays queued steps one by one; reduced motion applies them all at once.
    useEffect(() => {
        if (!queue.length || !active) return;
        const take = reducedMotion ? queue.length : 1;
        const id = window.setTimeout(() => {
            const steps = queue.slice(0, take);
            setStack((s) => steps.reduce(apply, s));
            addLog(steps.map((s) => ({ source: s.source, text: s.log })));
            setQueue((q) => q.slice(take));
        }, reducedMotion ? 0 : STEP_MS);
        return () => window.clearTimeout(id);
    }, [queue, active, reducedMotion]);

    useEffect(() => {
        if (!hops || !active) return;
        if (hops.shown >= hops.list.length) {
            const id = window.setTimeout(() => setHops(null), reducedMotion ? 0 : HOP_MS);
            return () => window.clearTimeout(id);
        }
        const id = window.setTimeout(() => setHops({ ...hops, shown: hops.shown + 1 }), reducedMotion ? 0 : HOP_MS);
        return () => window.clearTimeout(id);
    }, [hops, active, reducedMotion]);

    useEffect(() => {
        const el = logRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [log]);

    function run(target: Target) {
        addLog([{ source: "make", text: `$ ${target}` }]);
        setQueue(stepsFor(target, stack));
    }

    function send() {
        const r = request(stack);
        addLog([
            { source: "request", text: "$ curl -k https://mamir.42.fr" },
            ...r.hops.map((h) => ({ source: "request" as const, text: `  ${h.from} → ${h.to}: ${h.label}` })),
            { source: "request", text: r.log },
        ]);
        if (r.hops.length) setHops({ list: r.hops, shown: 0 });
    }

    const lastHop = hops && hops.shown > 0 ? hops.list[hops.shown - 1] : null;
    const btn =
        "rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] transition-[background-color,box-shadow,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-35";
    const primary = `${btn} bg-[#16a34a] text-white shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_6px_16px_-6px_rgb(22_163_74/0.7)] hover:bg-[#15803d]`;
    const secondary = `${btn} border border-border bg-background text-foreground/80 hover:border-foreground/30 hover:bg-muted`;

    return (
        <div className="grid gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={primary} disabled={busy} onClick={() => run("make")}>
                    make
                </button>
                <button type="button" className={secondary} disabled={busy} onClick={() => run("make down")}>
                    make down
                </button>
                <button type="button" className={secondary} disabled={busy} onClick={() => run("make re")}>
                    make re
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={send}
                    className={`${btn} ml-auto bg-[#0e7490] text-white shadow-[0_6px_16px_-6px_rgb(14_116_144/0.7)] hover:bg-[#155e75]`}
                >
                    Send HTTPS request
                </button>
            </div>

            <div className="overflow-x-auto">
                <svg viewBox="0 0 700 300" className="min-w-[560px] w-full" role="img" aria-label="Inception: browser, nginx, wordpress and mariadb containers on the inception network, with two volumes">
                    {/* browser */}
                    <g>
                        <rect x="10" y="86" width="90" height="56" rx="8" className="fill-muted stroke-border" />
                        <text x="55" y="111" textAnchor="middle" className="fill-foreground font-mono text-[11px]">browser</text>
                        <text x="55" y="128" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">:443 only</text>
                    </g>
                    {/* host + network */}
                    <rect x="130" y="20" width="560" height="270" rx="12" className="fill-none stroke-border" strokeDasharray="4 4" />
                    <text x="142" y="38" className="fill-muted-foreground font-mono text-[10px]">host · docker</text>
                    <rect
                        x="140"
                        y="56"
                        width="540"
                        height="106"
                        rx="10"
                        fill={stack.network ? "rgb(96 165 250 / 0.08)" : "none"}
                        stroke={stack.network ? "#60a5fa" : "currentColor"}
                        strokeOpacity={stack.network ? 0.7 : 0.15}
                        className="text-foreground transition-all duration-300"
                    />
                    <text x="672" y="68" textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">
                        network: inception (bridge){stack.network ? "" : " · down"}
                    </text>

                    {/* request arrows */}
                    {[
                        { from: { x: 100, y: 114 }, to: "nginx" as const },
                        { from: { x: BOX.nginx.x + W, y: 114 }, to: "wordpress" as const },
                        { from: { x: BOX.wordpress.x + W, y: 114 }, to: "mariadb" as const },
                    ].map(({ from, to }) => {
                        const hit = hops?.list.slice(0, hops.shown).some((h) => h.to === to);
                        return (
                            <line
                                key={to}
                                x1={from.x}
                                y1={from.y}
                                x2={BOX[to].x}
                                y2={114}
                                stroke={hit ? "#22d3ee" : "currentColor"}
                                strokeOpacity={hit ? 1 : 0.2}
                                strokeWidth={hit ? 3 : 1.5}
                                className="text-foreground transition-all duration-300"
                            />
                        );
                    })}

                    {/* containers */}
                    {SERVICES.map((s) => {
                        const { x, y } = BOX[s.id];
                        const state = stack.services[s.id];
                        const lit = lastHop?.to === s.id;
                        return (
                            <g key={s.id}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={W}
                                    height={H}
                                    rx="8"
                                    className="fill-background transition-all duration-300"
                                    stroke={lit ? "#22d3ee" : STATE_COLOR[state]}
                                    strokeWidth={lit ? 3 : 1.5}
                                    strokeDasharray={state === "absent" ? "4 3" : undefined}
                                />
                                <circle cx={x + 14} cy={y + 18} r="5" fill={STATE_COLOR[state]} className={state === "starting" ? "animate-pulse" : ""} />
                                <text x={x + 26} y={y + 22} className="fill-foreground font-mono text-[12px] font-semibold">{s.id}</text>
                                <text x={x + 12} y={y + 42} className="fill-muted-foreground font-mono text-[8.5px]">{s.image}</text>
                                <text x={x + 12} y={y + 62} className="fill-muted-foreground font-mono text-[9px]">
                                    :{s.port} · {state}
                                </text>
                            </g>
                        );
                    })}

                    {/* volumes */}
                    {VOLUMES.map((v) => (
                        <g key={v.name}>
                            {v.users.map((u) => (
                                <line
                                    key={u}
                                    x1={BOX[u].x + W / 2}
                                    y1={BOX[u].y + H}
                                    x2={v.x + 95}
                                    y2={210}
                                    stroke="currentColor"
                                    strokeOpacity={stack.data ? 0.35 : 0.12}
                                    strokeDasharray="3 3"
                                    className="text-foreground"
                                />
                            ))}
                            <rect x={v.x} y={210} width="190" height="56" rx="8" className="fill-muted/60" stroke={stack.data ? "#c084fc" : "currentColor"} strokeOpacity={stack.data ? 0.8 : 0.2} />
                            <text x={v.x + 12} y={232} className="fill-foreground font-mono text-[10.5px] font-semibold">{v.name}</text>
                            <text x={v.x + 12} y={250} className="fill-muted-foreground font-mono text-[8px]">bind → {v.path}</text>
                        </g>
                    ))}
                </svg>
            </div>

            <div
                ref={logRef}
                role="log"
                aria-label="Container logs"
                className="h-[150px] overflow-y-auto rounded-md bg-[#0b0e14] px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#aeb6c4]"
            >
                {log.map((l, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                        {l.source !== "make" && l.source !== "request" ? (
                            <span style={{ color: SOURCE_COLOR[l.source] }}>{l.source.padEnd(9)}| </span>
                        ) : null}
                        <span style={l.source === "make" ? { color: SOURCE_COLOR.make } : l.source === "request" ? { color: "#22d3ee" } : undefined}>
                            {l.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
