"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DemoProps } from "../project-demo";
import { checkArgs, formatLine, simulate, type Frame, type State } from "./sim";

const PRESETS = [
    { label: "nobody dies", args: "5 800 200 200" },
    { label: "someone dies", args: "4 310 200 100" },
    { label: "7 meals each", args: "5 800 200 200 7" },
    { label: "one philosopher", args: "1 800 200 200" },
] as const;
const SPEEDS = [0.25, 1, 4] as const;
const LIMIT_MS = 30000;

const COLOR: Record<State, string> = {
    hungry: "#94a3b8",
    thinking: "#94a3b8",
    eating: "#16a34a",
    sleeping: "#6366f1",
    dead: "#dc2626",
};
const LABEL: Record<State, string> = { hungry: "thinking", thinking: "thinking", eating: "eating", sleeping: "sleeping", dead: "dead" };

/** Last frame at or before virtual time t (frames are sorted by t). */
function frameAt(frames: readonly Frame[], t: number): Frame {
    let lo = 0;
    let hi = frames.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (frames[mid].t <= t) lo = mid;
        else hi = mid - 1;
    }
    return frames[lo];
}

export default function PhilosophersDemo({ active, reducedMotion }: DemoProps) {
    const [input, setInput] = useState<string>(PRESETS[1].args);
    const [args, setArgs] = useState<string>(PRESETS[1].args);
    const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
    const [clock, setClock] = useState(0);
    const [wantsPlay, setWantsPlay] = useState<boolean | null>(null);
    const logRef = useRef<HTMLDivElement>(null);

    const run = useMemo(() => {
        const argv = args.trim().split(/\s+/);
        const error = checkArgs(argv);
        if (error) return { error } as const;
        const [n, die, eat, sleep, meals] = argv.map(Number);
        return simulate({ n, die, eat, sleep, meals }, LIMIT_MS);
    }, [args]);

    const frames = "frames" in run ? run.frames : null;
    const last = frames?.[frames.length - 1];
    // A run ends at a death, when everyone is fed, or at the 30 s limit if nobody ever dies.
    const end = last ? (last.done ? last.t : LIMIT_MS) : 0;
    const finished = clock >= end;
    const playing = (wantsPlay ?? !reducedMotion) && !finished;

    useEffect(() => {
        if (!playing || !active) return;
        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
            setClock((c) => Math.min(end, c + (now - last) * speed));
            last = now;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, active, speed, end]);

    const frame = frames ? frameAt(frames, clock) : null;
    // ponytail: only the last 300 log lines are in the DOM; the full log can pass 200k lines.
    const lineCount = frame?.lineCount ?? 0;
    const shown = "lines" in run ? run.lines.slice(Math.max(0, lineCount - 300), lineCount) : [];

    useEffect(() => {
        const el = logRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [shown.length]);

    function start(text: string) {
        setInput(text);
        setArgs(text);
        setClock(0);
        setWantsPlay(true);
    }

    const btn =
        "rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold transition-[background-color,transform] active:translate-y-px disabled:opacity-35";
    const secondary = `${btn} border border-border bg-background text-foreground/80 hover:bg-muted`;

    const n = frame?.states.length ?? 0;
    const R = 92;
    const seatR = Math.max(4, Math.min(17, (Math.PI * R) / Math.max(n, 1) - 2));
    const seat = (i: number, r: number) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return { x: 130 + Math.cos(a) * r, y: 130 + Math.sin(a) * r };
    };

    return (
        <div className="grid gap-4 p-4 sm:p-5">
            <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    start(input);
                }}
            >
                <label htmlFor="philo-args" className="font-mono text-xs text-muted-foreground">
                    ./philo
                </label>
                <input
                    id="philo-args"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    placeholder="n die eat sleep [meals]"
                    className="w-56 border border-border bg-transparent px-2 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                />
                <button type="submit" className={`${btn} bg-[#16a34a] text-white hover:bg-[#15803d]`}>
                    Run
                </button>
                {PRESETS.map((p) => (
                    <button key={p.label} type="button" className={secondary} onClick={() => start(p.args)}>
                        {p.label}
                    </button>
                ))}
            </form>

            {"error" in run ? (
                <p role="alert" className="font-mono text-sm text-destructive">
                    {run.error}
                </p>
            ) : frame ? (
                <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[260px]" role="img" aria-label={`${n} philosophers around a table`}>
                        <circle cx="130" cy="130" r="58" className="fill-muted stroke-border" />
                        <text x="130" y="126" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                            {Math.floor(clock)} ms
                        </text>
                        <text x="130" y="142" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                            ×{speed}
                        </text>
                        {frame.forks.map((holder, f) => {
                            // Fork f lies between philosopher f and f+1; when held it slides toward its holder.
                            const free = seat(f + 0.5, 46);
                            const to = holder === null ? free : seat(holder, 50);
                            const p = holder === null ? free : { x: (free.x + to.x * 2) / 3, y: (free.y + to.y * 2) / 3 };
                            return (
                                <line
                                    key={f}
                                    x1={p.x}
                                    y1={p.y - 7}
                                    x2={p.x}
                                    y2={p.y + 7}
                                    stroke={holder === null ? "currentColor" : COLOR.eating}
                                    strokeOpacity={holder === null ? 0.5 : 1}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="text-foreground transition-all duration-200"
                                />
                            );
                        })}
                        {frame.states.map((s, i) => {
                            const { x, y } = seat(i, R);
                            return (
                                <g key={i}>
                                    <circle cx={x} cy={y} r={seatR} fill={COLOR[s]} className="transition-[fill] duration-200" />
                                    {n <= 12 ? (
                                        <>
                                            <text x={x} y={y + 4} textAnchor="middle" className="fill-white font-mono text-[11px] font-bold">
                                                {i + 1}
                                            </text>
                                            <text x={x} y={y + 30} textAnchor="middle" className="fill-muted-foreground font-mono text-[8px]">
                                                {LABEL[s]} · {frame.meals[i]}
                                            </text>
                                        </>
                                    ) : null}
                                </g>
                            );
                        })}
                    </svg>

                    <div className="grid min-w-0 gap-2">
                        <div
                            ref={logRef}
                            role="log"
                            aria-label="Program output"
                            className="h-[240px] overflow-y-auto rounded-md bg-[#0b0e14] px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#aeb6c4]"
                        >
                            {shown.map((l, i) => (
                                <div key={i} style={{ color: l.msg === "died" || l.msg === "is dead" ? "#f87171" : l.msg === "is eating" ? "#4ade80" : undefined }}>
                                    {formatLine(l)}
                                </div>
                            ))}
                            {finished && frame.deadId === null ? (
                                <div className="text-[#4ade80]">
                                    {last?.done ? "(everyone ate enough: the program stops)" : `(demo stopped at ${LIMIT_MS / 1000} s: nobody died)`}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                className={`${btn} ${playing ? "bg-[#f59e0b] text-black" : "bg-[#16a34a] text-white"}`}
                                disabled={finished}
                                onClick={() => setWantsPlay(!playing)}
                            >
                                {playing ? "Pause" : "Play"}
                            </button>
                            <button type="button" className={secondary} onClick={() => { setClock(0); setWantsPlay(false); }}>
                                Reset
                            </button>
                            <span className="flex gap-1" role="group" aria-label="Speed">
                                {SPEEDS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        aria-pressed={speed === s}
                                        className={speed === s ? `${btn} bg-[#0e7490] text-white` : secondary}
                                        onClick={() => setSpeed(s)}
                                    >
                                        {s}×
                                    </button>
                                ))}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
