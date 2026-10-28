"use client";

import { useEffect, useMemo, useState } from "react";
import type { DemoProps } from "../project-demo";
import { applyOp, parseInput, pushSwap, type Op, type Stacks } from "./turk";

const SIZES = [5, 10, 50, 100] as const;
/** The sort is ~O(n³) and bars stop being readable past this; the C program has no limit. */
const MAX_NUMBERS = 200;
const SPEEDS = [1, 4, 16] as const; // ops per tick
const TICK_MS = 60;

function randomInput(n: number): string {
    const pool = Array.from({ length: n * 4 }, (_, i) => i - n * 2);
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n).join(" ");
}

/** Value rank 0..1 to a cyan -> violet ramp (small to large), readable in light and dark. */
function barColor(t: number): string {
    return `oklch(${0.78 - t * 0.28} ${0.12 + t * 0.06} ${200 + t * 90})`;
}

/** Op without its stack letter -> colour in the move log: swaps amber, pushes green, rotations teal, reverse rotations violet. */
const OP_COLOR: Record<string, string> = { s: "#d97706", p: "#16a34a", r: "#0891b2", rr: "#7c3aed" };

type Run = { numbers: number[]; ops: Op[] } | { error: string };

function solve(text: string): Run {
    const parsed = parseInput(text);
    if (!parsed.ok) return { error: "Error" };
    if (parsed.numbers.length > MAX_NUMBERS) return { error: `The demo sorts up to ${MAX_NUMBERS} numbers.` };
    return { numbers: parsed.numbers, ops: pushSwap(parsed.numbers) };
}

export default function PushSwapDemo({ active, reducedMotion }: DemoProps) {
    const [input, setInput] = useState(() => randomInput(50));
    const [run, setRun] = useState(() => solve(input));
    const [step, setStep] = useState(0);
    // null until the visitor presses a control: until then the demo autoplays (unless reduced motion).
    const [wantsPlay, setWantsPlay] = useState<boolean | null>(null);
    const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(4);

    const total = "error" in run ? 0 : run.ops.length;
    const playing = (wantsPlay ?? !reducedMotion) && step < total;
    useEffect(() => {
        if (!playing || !active) return;
        const id = window.setInterval(() => setStep((s) => Math.min(total, s + speed)), TICK_MS);
        return () => window.clearInterval(id);
    }, [playing, active, speed, total]);

    // Every 25th state is kept, so any step is at most 24 ops away: play, step and reset stay O(1)-ish.
    const checkpoints = useMemo(() => {
        if ("error" in run) return [];
        const out: Stacks[] = [];
        let s: Stacks = { a: run.numbers, b: [] };
        run.ops.forEach((op, i) => {
            if (i % 25 === 0) out.push(s);
            s = applyOp(s, op);
        });
        out.push(s);
        return out;
    }, [run]);
    const stacks: Stacks = useMemo(() => {
        if ("error" in run) return { a: [], b: [] };
        if (step === total) return checkpoints[checkpoints.length - 1];
        let s = checkpoints[Math.floor(step / 25)];
        for (let i = Math.floor(step / 25) * 25; i < step; i++) s = applyOp(s, run.ops[i]);
        return s;
    }, [run, step, total, checkpoints]);

    const rank = useMemo(() => {
        if ("error" in run) return new Map<number, number>();
        const sorted = [...run.numbers].sort((x, y) => x - y);
        return new Map(sorted.map((v, i) => [v, (i + 1) / sorted.length]));
    }, [run]);

    function load(text: string) {
        setInput(text);
        setRun(solve(text));
        setStep(0);
        setWantsPlay(false);
    }

    const n = "error" in run ? 0 : run.numbers.length;
    const lastOps = "error" in run ? [] : run.ops.slice(Math.max(0, step - 6), step);
    const btn =
        "rounded-md px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition-[background-color,box-shadow,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-35";
    // Primary actions: solid green with a soft glow, like a terminal "go" key.
    const primary = `${btn} bg-[#16a34a] text-white shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_6px_16px_-6px_rgb(22_163_74/0.7)] hover:bg-[#15803d]`;
    const secondary = `${btn} border border-border bg-background text-foreground/80 hover:border-foreground/30 hover:bg-muted`;

    return (
        <div className="grid gap-4 p-4 sm:p-5">
            <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    load(input);
                }}
            >
                <label className="sr-only" htmlFor="ps-input">
                    Numbers to sort
                </label>
                <span className="font-mono text-xs text-muted-foreground">./push_swap</span>
                <input
                    id="ps-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    className="min-w-0 flex-1 border border-border bg-transparent px-2 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                />
                <button type="submit" className={primary}>
                    Run
                </button>
                <span className="flex gap-1" role="group" aria-label="Random input size">
                    {SIZES.map((size) => (
                        <button
                            key={size}
                            type="button"
                            aria-label={`${size} random numbers`}
                            className={secondary}
                            onClick={() => load(randomInput(size))}
                        >
                            {size}
                        </button>
                    ))}
                </span>
            </form>

            {"error" in run ? (
                <p role="alert" className="font-mono text-sm text-destructive">
                    {run.error}
                </p>
            ) : (
                <>
                    <div className="grid h-[260px] grid-cols-2 gap-4 sm:h-[300px]">
                        {(["a", "b"] as const).map((name) => (
                            <div key={name} className="flex min-h-0 flex-col">
                                <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    stack {name} · {stacks[name].length}
                                </span>
                                <ol className="flex min-h-0 flex-1 flex-col border-l border-border" aria-hidden>
                                    {stacks[name].map((v) => (
                                        <li
                                            key={v}
                                            title={String(v)}
                                            className="rounded-r-[2px]"
                                            style={{
                                                width: `${(rank.get(v) ?? 0) * 100}%`,
                                                height: `${100 / n}%`,
                                                backgroundColor: barColor(rank.get(v) ?? 0),
                                                marginBottom: n <= 20 ? 2 : 0,
                                            }}
                                        />
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className={playing ? `${btn} bg-[#f59e0b] text-black shadow-[0_6px_16px_-6px_rgb(245_158_11/0.7)] hover:bg-[#d97706]` : primary}
                            disabled={step >= total}
                            onClick={() => setWantsPlay(!playing)}
                        >
                            {playing ? "Pause" : "Play"}
                        </button>
                        <button
                            type="button"
                            className={secondary}
                            disabled={step >= total}
                            onClick={() => {
                                setWantsPlay(false);
                                setStep((s) => Math.min(total, s + 1));
                            }}
                        >
                            Step
                        </button>
                        <button
                            type="button"
                            className={secondary}
                            onClick={() => {
                                setWantsPlay(false);
                                setStep(0);
                            }}
                        >
                            Reset
                        </button>
                        <span className="flex gap-1" role="group" aria-label="Speed">
                            {SPEEDS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    aria-pressed={speed === s}
                                    className={
                                        speed === s
                                            ? `${btn} bg-[#0e7490] text-white shadow-[0_6px_16px_-6px_rgb(14_116_144/0.7)]`
                                            : secondary
                                    }
                                    onClick={() => setSpeed(s)}
                                >
                                    {s}×
                                </button>
                            ))}
                        </span>
                        <span className="ml-auto font-mono text-xs tabular-nums text-foreground" aria-live="off">
                            {step} / {total} ops
                        </span>
                    </div>

                    <p className="flex h-4 gap-2 overflow-hidden font-mono text-[11px]" aria-hidden>
                        {lastOps.map((op, i) => (
                            <span key={step - lastOps.length + i} style={{ color: OP_COLOR[op.slice(0, -1)] }}>
                                {op}
                            </span>
                        ))}
                    </p>
                </>
            )}
        </div>
    );
}
