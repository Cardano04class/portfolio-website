/**
 * Port of Cardano04class/cub3d's raycaster: .cub parsing (config + grid), the DDA from
 * ray_helper_1.c, texture choice from texture_utils.c, and movement from player_movement.c.
 * Pure: renders into a Uint32Array so it runs in the browser and in node (tests, cover image).
 */

export type Rgb = readonly [number, number, number];
export type Player = { x: number; y: number; angle: number };
/** Texture file names per face, as written in the .cub (NO, SO, EA, WE = render indexes 0..3). */
export type Faces = readonly [string, string, string, string];
export type CubMap = { grid: readonly string[]; cols: number; rows: number; floor: Rgb; ceiling: Rgb; spawn: Player; faces: Faces };
export type Texture = { size: number; px: Uint32Array };

const FOV = (60 * Math.PI) / 180;
const SPAWN_ANGLE: Record<string, number> = { N: (3 * Math.PI) / 2, S: Math.PI / 2, E: 0, W: Math.PI };
/** Collision half-size from is_walkable(). */
const BOX = 0.2;

/**
 * Reads a .cub file the way the repo's parser does: F and C colours, then map rows.
 * Row checks from map_row_checks.c; spaces and short rows become walls (fill_map.c);
 * first and last rows must be all walls (validate_map_borders).
 */
export function parseCub(text: string): CubMap {
    const lines = text.split("\n");
    const rgb = (key: string): Rgb => {
        const line = lines.find((l) => l.trim().startsWith(`${key} `));
        const parts = line?.trim().slice(2).split(",").map((n) => Number(n.trim()));
        if (!parts || parts.length !== 3 || parts.some((n) => !(n >= 0 && n <= 255))) throw new Error("rgb range error");
        return [parts[0], parts[1], parts[2]];
    };
    const face = (key: string) => {
        const path = lines.find((l) => l.trim().startsWith(`${key} `))?.trim().split(/\s+/)[1];
        if (!path) throw new Error("Error texture file path not found");
        return path.slice(path.lastIndexOf("/") + 1).replace(/\.xpm$/, "");
    };
    const configKeys = /^\s*(NO|SO|WE|EA|F|C)\s/;
    const raw = lines.filter((l) => l.trim() !== "" && !configKeys.test(l)).map((l) => l.replace(/\s+$/, ""));
    if (raw.length === 0) throw new Error("Error, map not found");
    let spawn: Player | null = null;
    raw.forEach((row, y) => {
        const trimmed = row.trim();
        if (trimmed[0] !== "1" || trimmed[trimmed.length - 1] !== "1") throw new Error("map error(map rows should be closed by walls)");
        [...row].forEach((c, x) => {
            if ("NSEW".includes(c) && !spawn) spawn = { x: x + 0.5, y: y + 0.5, angle: SPAWN_ANGLE[c] };
            else if (!" 01".includes(c)) throw new Error("non valid character");
        });
    });
    if (!spawn) throw new Error("Error, player not found");
    const cols = Math.max(...raw.map((r) => r.length));
    const grid = raw.map((row) => row.replace(/[NSEW]/, "0").replace(/ /g, "1").padEnd(cols, "1"));
    if (/[^1]/.test(grid[0])) throw new Error("error (first map row should all 1)");
    if (/[^1]/.test(grid[grid.length - 1])) throw new Error("error (last map row should be all 1)");
    return { grid, cols, rows: grid.length, floor: rgb("F"), ceiling: rgb("C"), spawn, faces: [face("NO"), face("SO"), face("EA"), face("WE")] };
}

const isWall = (map: CubMap, x: number, y: number) => {
    const mx = Math.floor(x);
    const my = Math.floor(y);
    if (mx < 0 || my < 0 || mx >= map.cols || my >= map.rows) return true;
    return map.grid[my][mx] === "1";
};

export function isWalkable(map: CubMap, x: number, y: number): boolean {
    return !isWall(map, x - BOX, y - BOX) && !isWall(map, x + BOX, y - BOX) && !isWall(map, x - BOX, y + BOX) && !isWall(map, x + BOX, y + BOX);
}

/** move_player / strafe_player / rotate_player, with each axis checked on its own so the player slides along walls. */
export function step(map: CubMap, p: Player, input: { walk: number; strafe: number; turn: number }, moveDist: number, turnRad: number): Player {
    let { x, y, angle } = p;
    for (const [dir, offset] of [[input.walk, 0], [input.strafe, Math.PI / 2]] as const) {
        if (!dir) continue;
        const nx = x + Math.cos(angle + offset) * dir * moveDist;
        const ny = y + Math.sin(angle + offset) * dir * moveDist;
        if (isWalkable(map, nx, y)) x = nx;
        if (isWalkable(map, x, ny)) y = ny;
    }
    angle = (((angle + input.turn * turnRad) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return { x, y, angle };
}

/** cast_ray(): DDA to the first '1'. Returns the perpendicular distance, the side and the texture index (0 NO, 1 SO, 2 EA, 3 WE). */
export function castRay(map: CubMap, p: Player, rayAngle: number): { dist: number; side: 0 | 1; tex: number; wallX: number } {
    const dx = Math.cos(rayAngle);
    const dy = Math.sin(rayAngle);
    let mx = Math.floor(p.x);
    let my = Math.floor(p.y);
    const ddx = Math.abs(1 / dx);
    const ddy = Math.abs(1 / dy);
    const sx = dx < 0 ? -1 : 1;
    const sy = dy < 0 ? -1 : 1;
    let sideX = dx < 0 ? (p.x - mx) * ddx : (mx + 1 - p.x) * ddx;
    let sideY = dy < 0 ? (p.y - my) * ddy : (my + 1 - p.y) * ddy;
    let side: 0 | 1 = 0;
    for (let guard = 0; guard < 4096; guard++) {
        if (sideX < sideY) { sideX += ddx; mx += sx; side = 0; }
        else { sideY += ddy; my += sy; side = 1; }
        if (mx < 0 || mx >= map.cols || my < 0 || my >= map.rows) break;
        if (map.grid[my][mx] === "1") break;
    }
    const dist = side === 0 ? (mx - p.x + (1 - sx) / 2) / dx : (my - p.y + (1 - sy) / 2) / dy;
    const hit = side === 0 ? p.y + dist * dy : p.x + dist * dx;
    const tex = side === 0 ? (dx > 0 ? 2 : 3) : dy > 0 ? 1 : 0;
    return { dist, side, tex, wallX: hit - Math.floor(hit) };
}

const pack = ([r, g, b]: Rgb) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;

/** draw(): ceiling, floor, then one textured column per x. `buf` is RGBA pixels as little-endian uint32. */
export function render(buf: Uint32Array, w: number, h: number, map: CubMap, p: Player, textures: readonly Texture[]): void {
    buf.fill(pack(map.ceiling), 0, (h >> 1) * w);
    buf.fill(pack(map.floor), (h >> 1) * w);
    for (let col = 0; col < w; col++) {
        const ray = p.angle - FOV / 2 + (col * FOV) / w;
        const { dist, side, tex, wallX } = castRay(map, p, ray);
        const corrected = dist * Math.cos(ray - p.angle);
        const lineH = Math.floor(h / corrected);
        const unclipped = Math.floor(-lineH / 2 + h / 2);
        const start = Math.max(0, unclipped);
        const end = Math.min(h - 1, Math.floor(lineH / 2 + h / 2));
        const t = textures[tex];
        let tx = Math.floor(wallX * t.size);
        if ((side === 0 && Math.cos(ray) > 0) || (side === 1 && Math.sin(ray) < 0)) tx = t.size - tx - 1;
        for (let y = start; y < end; y++) {
            const ty = Math.min(t.size - 1, Math.max(0, Math.floor(((y - unclipped) / lineH) * t.size)));
            buf[y * w + col] = t.px[ty * t.size + tx];
        }
    }
}
