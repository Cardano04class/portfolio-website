"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { check, makeLevels, seeded, type Device, type Field, type Level } from "./levels";

/** Device glyphs, drawn inline so the demo needs no images. */
function Glyph({ kind }: { kind: Device["kind"] }) {
    if (kind === "internet")
        return (
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-foreground/80" aria-hidden>
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
                <ellipse cx="24" cy="24" rx="9" ry="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 24h40M7 14h34M7 34h34" stroke="currentColor" strokeWidth="2.5" />
            </svg>
        );
    if (kind === "router")
        return (
            <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden>
                <ellipse cx="32" cy="28" rx="28" ry="10" fill="#1f5f86" />
                <rect x="4" y="14" width="56" height="14" fill="#2a7fb0" />
                <ellipse cx="32" cy="14" rx="28" ry="10" fill="#4aa3d4" />
                <path d="M20 10l8 4M44 18l-8-4M44 10l-8 4M20 18l8-4" stroke="#e6f4ff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        );
    if (kind === "switch")
        return (
            <svg viewBox="0 0 64 28" className="h-7 w-16" aria-hidden>
                <path d="M2 10l10-8h50l-10 8z" fill="#4b5563" />
                <rect x="2" y="10" width="50" height="14" fill="#1f2937" />
                <path d="M52 10l10-8v14l-10 8z" fill="#111827" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <rect key={i} x={20 + i * 5} y="14" width="3" height="5" fill="#9ca3af" />
                ))}
            </svg>
        );
    return (
        <svg viewBox="0 0 48 44" className="h-11 w-12 text-foreground/80" aria-hidden>
            <rect x="9" y="2" width="30" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="20" y="26" width="8" height="4" fill="currentColor" />
            <path d="M6 42l6-10h24l6 10z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        </svg>
    );
}

function Input({ field, label, onChange, bad }: { field: Field; label: string; onChange: (v: string) => void; bad: boolean }) {
    return (
        <input
            aria-label={label}
            value={field.value}
            readOnly={!field.editable}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className={`w-[118px] rounded-[3px] px-1.5 py-0.5 font-mono text-[11px] outline-none ${
                field.editable
                    ? `bg-white text-neutral-900 ring-1 focus:ring-2 ${bad ? "ring-red-500" : "ring-neutral-400 focus:ring-[#0e7490]"}`
                    : "bg-neutral-200/80 text-neutral-500"
            }`}
        />
    );
}

export default function NetPracticeDemo() {
    // Random addresses on every visit, like the training app; "new addresses" rolls again.
    const [levels, setLevels] = useState<Level[]>(() => makeLevels(seeded(Math.floor(Math.random() * 1e9))));
    const [index, setIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const level = levels[index];
    const result = useMemo(() => check(level), [level]);
    const owner = (id: string) => level.devices.find((d) => d.id === id || d.ifaces.some((i) => i.id === id))!;
    // Links join the device icons, measured after layout so the wires never miss their boxes.
    const stageRef = useRef<HTMLDivElement>(null);
    const [anchors, setAnchors] = useState<Record<string, { x: number; y: number }>>({});
    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const measure = () => {
            const base = stage.getBoundingClientRect();
            const next: Record<string, { x: number; y: number }> = {};
            stage.querySelectorAll<HTMLElement>("[data-glyph]").forEach((el) => {
                const b = el.getBoundingClientRect();
                next[el.dataset.glyph!] = { x: b.left - base.left + b.width / 2, y: b.top - base.top + b.height * 0.55 };
            });
            setAnchors(next);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(stage);
        return () => ro.disconnect();
    }, [index, levels]);

    function edit(fn: (l: Level) => void) {
        setLevels((ls) =>
            ls.map((l, i) => {
                if (i !== index) return l;
                const copy = structuredClone(l);
                fn(copy);
                return copy;
            }),
        );
        setChecked(false);
    }
    function newPuzzles() {
        setLevels(makeLevels(seeded(Math.floor(Math.random() * 1e9))));
        setChecked(false);
    }
    const bad = (where: string) => checked && result.problems.some((p) => p.where === where);
    const lit = new Set(checked && result.ok ? result.paths.flatMap((p) => p.slice(1).map((d, i) => [p[i], d].sort().join("-"))) : []);

    return (
        <div className="grid gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
                {levels.map((l, i) => (
                    <button
                        key={l.title}
                        type="button"
                        aria-pressed={i === index}
                        onClick={() => { setIndex(i); setChecked(false); }}
                        className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold ${i === index ? "bg-[#0e7490] text-white" : "border border-border bg-background text-foreground/80 hover:bg-muted"}`}
                    >
                        Level {i + 1}
                    </button>
                ))}
                <button type="button" onClick={newPuzzles} className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-foreground/80 hover:bg-muted">
                    new addresses
                </button>
                <button
                    type="button"
                    onClick={() => setChecked(true)}
                    className="ml-auto rounded-md bg-[#16a34a] px-3 py-1.5 font-mono text-[11px] font-semibold text-white shadow-[0_6px_16px_-6px_rgb(22_163_74/0.7)] hover:bg-[#15803d]"
                >
                    Check
                </button>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">{level.story} White fields are yours to fill.</p>

            <div className="overflow-x-auto rounded-md border border-border bg-[repeating-linear-gradient(115deg,transparent_0_46px,rgb(127_127_127/0.07)_46px_47px)]">
                <div ref={stageRef} className="relative h-[420px] min-w-[640px]">
                    <svg className="absolute inset-0 z-0 h-full w-full" aria-hidden>
                        {level.links.map(([a, b]) => {
                            const da = owner(a);
                            const db = owner(b);
                            const pa = anchors[da.id];
                            const pb = anchors[db.id];
                            if (!pa || !pb) return null;
                            const on = lit.has([da.id, db.id].sort().join("-"));
                            return (
                                <line
                                    key={a + b}
                                    x1={pa.x}
                                    y1={pa.y}
                                    x2={pb.x}
                                    y2={pb.y}
                                    stroke={on ? "#22d3ee" : "currentColor"}
                                    strokeWidth={on ? 4 : 2}
                                    className="text-foreground transition-all duration-300"
                                >
                                    {on ? <animate attributeName="stroke-dasharray" values="0 400;400 0" dur="0.8s" fill="freeze" /> : null}
                                </line>
                            );
                        })}
                    </svg>
                    {level.devices.map((d, di) => (
                        <div key={d.id} className="absolute z-10 -translate-x-1/2" style={{ left: `${(d.x / 500) * 100}%`, top: d.y }}>
                            <div className="flex flex-col items-center gap-1">
                                {d.ifaces.map((f, fi) => (
                                    <div key={f.id} className={`grid gap-0.5 rounded-sm bg-[#7d7d7d] px-1.5 py-1 text-[10px] text-white shadow ${bad(f.id) ? "ring-2 ring-red-500" : ""}`}>
                                        <span className="font-serif">Interface {f.id}</span>
                                        <label className="flex items-center gap-1">
                                            IP:
                                            <Input field={f.ip} label={`Interface ${f.id} IP`} bad={bad(f.id)} onChange={(v) => edit((l) => (l.devices[di].ifaces[fi].ip.value = v))} />
                                        </label>
                                        <label className="flex items-center gap-1">
                                            Mask:
                                            <Input field={f.mask} label={`Interface ${f.id} mask`} bad={bad(f.id)} onChange={(v) => edit((l) => (l.devices[di].ifaces[fi].mask.value = v))} />
                                        </label>
                                    </div>
                                ))}
                                <div data-glyph={d.id} className="relative z-20">
                                    <Glyph kind={d.kind} />
                                </div>
                                <div className={`grid gap-0.5 rounded-sm bg-[#a3a3ff] px-2 py-1 text-[10px] text-neutral-900 shadow ${bad(d.id) ? "ring-2 ring-red-500" : ""}`}>
                                    <span className="text-center font-serif">{d.name}</span>
                                    {d.routes.map((r, ri) => (
                                        <div key={ri} className="flex items-center gap-1">
                                            <Input field={r.dest} label={`${d.name} route destination`} bad={bad(d.id)} onChange={(v) => edit((l) => (l.devices[di].routes[ri].dest.value = v))} />
                                            <span>=&gt;</span>
                                            <Input field={r.gate} label={`${d.name} route gateway`} bad={bad(d.id)} onChange={(v) => edit((l) => (l.devices[di].routes[ri].gate.value = v))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div role="status" aria-live="polite" className="min-h-[40px] rounded-md bg-[#0b0e14] px-3 py-2 font-mono text-[11.5px] leading-relaxed">
                {!checked ? (
                    <span className="text-[#aeb6c4]">Fill the white fields, then press Check.</span>
                ) : result.ok ? (
                    <span className="text-[#4ade80]">
                        All goals reached: {result.paths.map((p) => p.join(" → ")).join("   ·   ")}
                    </span>
                ) : (
                    result.problems.slice(0, 3).map((p, i) => (
                        <div key={i} className="text-[#f87171]">
                            ✗ {p.text}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
