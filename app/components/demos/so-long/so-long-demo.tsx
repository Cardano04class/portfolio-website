"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import bombUrl from "@/src/projects/so_long/sprites/bomb.png";
import door2Url from "@/src/projects/so_long/sprites/door2.png";
import exit2Url from "@/src/projects/so_long/sprites/exit2.png";
import kingUrl from "@/src/projects/so_long/sprites/king.png";
import wall3Url from "@/src/projects/so_long/sprites/wall3.png";
import woodUrl from "@/src/projects/so_long/sprites/wood.png";
import { MAPS } from "./maps";
import { collectiblesLeft, move, parseBer, type Dir, type Game } from "./so-long";

/** The repo's sprites (textures/*.xpm), same roles as ft_init_textures; tiles are 45 px like the window. */
const TILE = 45;
const SPRITES = { floor: woodUrl, wall: wall3Url, player: kingUrl, collectible: bombUrl, exit: door2Url, open: exit2Url };
type Sprites = Record<keyof typeof SPRITES, HTMLImageElement>;

const KEYS: Record<string, Dir> = {
    w: "up", a: "left", s: "down", d: "right",
    ArrowUp: "up", ArrowLeft: "left", ArrowDown: "down", ArrowRight: "right",
};
const LEVELS = ["map", "map1"] as const;

function useSprites(): Sprites | "failed" | null {
    const [sprites, setSprites] = useState<Sprites | "failed" | null>(null);
    useEffect(() => {
        let live = true;
        const load = (s: { src: string }) => {
            const img = new Image();
            img.src = s.src;
            return img.decode().then(() => img);
        };
        Promise.all([load(SPRITES.floor), load(SPRITES.wall), load(SPRITES.player), load(SPRITES.collectible), load(SPRITES.exit), load(SPRITES.open)])
            .then(([floor, wall, player, collectible, exit, open]) => live && setSprites({ floor, wall, player, collectible, exit, open }))
            .catch(() => live && setSprites("failed"));
        return () => {
            live = false;
        };
    }, []);
    return sprites;
}

export default function SoLongDemo() {
    const [level, setLevel] = useState<(typeof LEVELS)[number]>("map1");
    const [game, setGame] = useState<Game>(() => parseBer(MAPS[level]));
    const start = useMemo(() => parseBer(MAPS[level]), [level]);
    const pickLevel = (l: (typeof LEVELS)[number]) => {
        setLevel(l);
        setGame(parseBer(MAPS[l]));
    };
    const [focused, setFocused] = useState(false);
    const sprites = useSprites();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const w = start.map[0].length * TILE;
    const h = start.map.length * TILE;

    // ft_put_textures: floor everywhere, then walls, collectibles, the exit (open once all are collected), the player.
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !sprites || sprites === "failed") return;
        ctx.imageSmoothingEnabled = false;
        const open = collectiblesLeft(game) === 0;
        game.map.forEach((row, y) =>
            [...row].forEach((c, x) => {
                ctx.drawImage(sprites.floor, x * TILE, y * TILE);
                const sprite = c === "1" ? sprites.wall : c === "C" ? sprites.collectible : c === "E" ? (open ? sprites.open : sprites.exit) : c === "P" ? sprites.player : null;
                // At j * 45, i * 45 like the repo: the 37 px door sits left-aligned in its tile.
                if (sprite) ctx.drawImage(sprite, x * TILE, y * TILE);
            }),
        );
        // mlx_string_put(…, 9, 15, 0xffffff, "Moves: N"); outlined so it reads on the bricks.
        ctx.font = "bold 12px ui-monospace, monospace";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.strokeText(`Moves: ${game.moves}`, 9, 15);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Moves: ${game.moves}`, 9, 15);

        // Keep the king in view when the board scrolls sideways (phones).
        const board = boardRef.current;
        const canvas = canvasRef.current;
        if (board && canvas && board.scrollWidth > board.clientWidth) {
            const scale = canvas.clientWidth / canvas.width;
            const kingX = (game.px + 0.5) * TILE * scale;
            board.scrollLeft = Math.max(0, kingX - board.clientWidth / 2);
        }
    }, [game, sprites]);

    const go = (dir: Dir) => setGame((g) => move(g, dir));
    const left = collectiblesLeft(game);
    const pad = (label: string, dir: Dir, aria: string) => (
        <button
            type="button"
            aria-label={aria}
            onClick={() => go(dir)}
            className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background font-mono text-sm text-foreground/80 active:bg-muted"
        >
            {label}
        </button>
    );

    return (
        <div className="grid gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">./so_long_bonus maps/</span>
                {LEVELS.map((l) => (
                    <button
                        key={l}
                        type="button"
                        aria-pressed={level === l}
                        onClick={() => pickLevel(l)}
                        className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${level === l ? "bg-[#0e7490] text-white" : "border border-border bg-background text-foreground/80 hover:bg-muted"}`}
                    >
                        {l}.ber
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setGame(start)}
                    className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-foreground/80 hover:bg-muted"
                >
                    restart
                </button>
                <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
                    {game.won ? `You Win! in ${game.moves} moves` : `${left} bomb${left === 1 ? "" : "s"} left`}
                </span>
            </div>

            <div
                ref={boardRef}
                tabIndex={0}
                role="application"
                aria-label="so_long. Use W A S D or the arrow keys to collect every bomb, then reach the door. Escape to leave."
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                    if (e.metaKey || e.ctrlKey || e.altKey) return;
                    if (e.key === "Escape") return e.currentTarget.blur();
                    const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
                    if (!dir) return;
                    e.preventDefault();
                    go(dir); // the repo moves on every keypress event, including key repeat
                }}
                className="relative mx-auto w-full max-w-full cursor-pointer overflow-x-auto overscroll-x-contain rounded-md bg-[#2a1f1c] outline-none ring-[#28c840] focus-visible:ring-2"
            >
                <canvas
                    ref={canvasRef}
                    width={w}
                    height={h}
                    // At least 30 px per tile on phones: the wide map scrolls sideways instead of shrinking to crumbs.
                    className="mx-auto block max-w-none [image-rendering:pixelated] sm:max-w-full"
                    style={{ aspectRatio: `${w} / ${h}`, width: `max(min(100%, ${w}px), ${(w / TILE) * 30}px)` }}
                />
                {sprites === "failed" ? (
                    <p role="alert" className="absolute inset-0 grid place-items-center font-mono text-xs text-white">
                        The game&apos;s sprites failed to load.
                    </p>
                ) : null}
                {!focused && !game.won ? (
                    <div className="pointer-events-none absolute inset-0 hidden place-items-center bg-black/30 sm:grid">
                        <span className="rounded-md bg-black/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                            Click to play
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="flex justify-center sm:hidden" aria-label="Touch controls">
                <div className="grid grid-cols-3 gap-1">
                    <span />
                    {pad("▲", "up", "Up")}
                    <span />
                    {pad("◀", "left", "Left")}
                    {pad("▼", "down", "Down")}
                    {pad("▶", "right", "Right")}
                </div>
            </div>
        </div>
    );
}
