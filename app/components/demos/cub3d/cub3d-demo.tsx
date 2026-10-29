"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DemoProps } from "../project-demo";
import { MAPS } from "./maps";
import { parseCub, render, step, type Player, type Texture } from "./raycast";
import { loadFaceTextures } from "./textures";

// The repo moves 0.01 tile and turns 0.5° per frame from an uncapped mlx loop, so its real speed depends on the
// machine. The demo uses fixed per-second speeds (≈ that step at 180 fps) so every screen feels the same.
const MOVE_PER_S = 1.8;
const TURN_PER_S = (90 * Math.PI) / 180;
const W = 640;
const H = 300;

type Keys = { walk: number; strafe: number; turn: number };
const KEYMAP: Record<string, [keyof Keys, number]> = {
    w: ["walk", 1], s: ["walk", -1], a: ["strafe", -1], d: ["strafe", 1],
    ArrowUp: ["walk", 1], ArrowDown: ["walk", -1], ArrowLeft: ["turn", -1], ArrowRight: ["turn", 1],
};

export default function Cub3dDemo({ active }: DemoProps) {
    const [mapName, setMapName] = useState<keyof typeof MAPS>("big");
    const map = useMemo(() => parseCub(MAPS[mapName]), [mapName]);
    const [textures, setTextures] = useState<{ map: typeof map; list: Texture[] } | null>(null);
    useEffect(() => {
        let live = true;
        loadFaceTextures(map).then((list) => live && setTextures({ map, list }));
        return () => {
            live = false;
        };
    }, [map]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const miniRef = useRef<HTMLCanvasElement>(null);
    const player = useRef<Player>(map.spawn);
    const keys = useRef<Keys>({ walk: 0, strafe: 0, turn: 0 });
    const [focused, setFocused] = useState(false);
    const [minimap, setMinimap] = useState(true);

    useEffect(() => {
        player.current = map.spawn;
    }, [map]);

    // Render loop: runs only while on screen; one frame is ~0.5 ms at 640×300 (measured in the prototype).
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        // Wait for this map's textures (the repo's XPMs, decoded once) before drawing.
        if (!canvas || !ctx || !active || textures?.map !== map) return;
        const faceTextures = textures.list;
        function drawMinimap() {
            const c = miniRef.current?.getContext("2d");
            if (!c || miniRef.current?.classList.contains("hidden")) return;
            const t = 5;
            c.clearRect(0, 0, c.canvas.width, c.canvas.height);
            c.fillStyle = "rgba(11,14,20,0.75)";
            c.fillRect(0, 0, map.cols * t, map.rows * t);
            c.fillStyle = "#94a3b8";
            map.grid.forEach((row, y) => [...row].forEach((ch, x) => ch === "1" && c.fillRect(x * t, y * t, t, t)));
            const p = player.current;
            c.fillStyle = "#28c840";
            c.beginPath();
            c.arc(p.x * t, p.y * t, 2.5, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = "#28c840";
            c.beginPath();
            c.moveTo(p.x * t, p.y * t);
            c.lineTo((p.x + Math.cos(p.angle) * 2) * t, (p.y + Math.sin(p.angle) * 2) * t);
            c.stroke();
        }
        const img = ctx.createImageData(W, H);
        const buf = new Uint32Array(img.data.buffer);
        let raf = 0;
        let last = performance.now();
        const frame = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            player.current = step(map, player.current, keys.current, MOVE_PER_S * dt, TURN_PER_S * dt);
            render(buf, W, H, map, player.current, faceTextures);
            ctx.putImageData(img, 0, 0);
            drawMinimap();
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [active, map, textures]);

    function setKey(key: string, down: boolean): boolean {
        const k = KEYMAP[key.length === 1 ? key.toLowerCase() : key];
        if (!k) return false;
        keys.current = { ...keys.current, [k[0]]: down ? k[1] : 0 };
        return true;
    }

    const pad = (label: string, key: string, aria: string) => (
        <button
            type="button"
            aria-label={aria}
            onPointerDown={(e) => { e.preventDefault(); setKey(key, true); }}
            onPointerUp={() => setKey(key, false)}
            onPointerLeave={() => setKey(key, false)}
            onPointerCancel={() => setKey(key, false)}
            className="grid h-11 w-11 select-none place-items-center rounded-md border border-border bg-background font-mono text-sm text-foreground/80 active:bg-muted"
        >
            {label}
        </button>
    );

    return (
        <div className="grid gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">./cub3D maps/</span>
                {(["big", "small"] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        aria-pressed={mapName === m}
                        onClick={() => setMapName(m)}
                        className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${mapName === m ? "bg-[#0e7490] text-white" : "border border-border bg-background text-foreground/80 hover:bg-muted"}`}
                    >
                        {m === "big" ? "..cub" : "map.cub"}
                    </button>
                ))}
                <button
                    type="button"
                    aria-pressed={minimap}
                    onClick={() => setMinimap((v) => !v)}
                    className="ml-auto rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-foreground/80 hover:bg-muted"
                >
                    minimap (M)
                </button>
            </div>

            <div
                tabIndex={0}
                role="application"
                aria-label="cub3D raycaster. Click, then use W A S D to move and arrow keys to turn. Escape to leave."
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); keys.current = { walk: 0, strafe: 0, turn: 0 }; }}
                onKeyDown={(e) => {
                    // Leave browser shortcuts alone; macOS also never sends keyup for keys pressed with Cmd.
                    if (e.metaKey || e.ctrlKey || e.altKey) return;
                    if (e.key === "Escape") return e.currentTarget.blur();
                    if (e.key.toLowerCase() === "m") {
                        if (!e.repeat) setMinimap((v) => !v);
                        return;
                    }
                    if (setKey(e.key, true)) e.preventDefault();
                }}
                onKeyUp={(e) => setKey(e.key, false)}
                className="relative cursor-pointer overflow-hidden rounded-md outline-none ring-[#28c840] focus-visible:ring-2"
            >
                <canvas ref={canvasRef} width={W} height={H} className="block aspect-[640/300] w-full [image-rendering:pixelated]" />
                <canvas
                    ref={miniRef}
                    width={map.cols * 5}
                    height={map.rows * 5}
                    className={`absolute left-2 top-2 ${minimap ? "" : "hidden"}`}
                    aria-hidden
                />
                {!focused ? (
                    // Touch screens drive the view with the pad below, so the prompt only shows where a keyboard is likely.
                    <div className="pointer-events-none absolute inset-0 hidden place-items-center bg-black/35 sm:grid">
                        <span className="rounded-md bg-black/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                            Click to play
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center justify-between gap-4 sm:hidden" aria-label="Touch controls">
                <div className="grid grid-cols-3 gap-1">
                    <span />
                    {pad("▲", "w", "Forward")}
                    <span />
                    {pad("◀", "a", "Strafe left")}
                    {pad("▼", "s", "Back")}
                    {pad("▶", "d", "Strafe right")}
                </div>
                <div className="flex gap-1">
                    {pad("⟲", "ArrowLeft", "Turn left")}
                    {pad("⟳", "ArrowRight", "Turn right")}
                </div>
            </div>
        </div>
    );
}
