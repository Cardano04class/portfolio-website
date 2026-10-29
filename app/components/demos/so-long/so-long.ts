/**
 * Port of Cardano04class/so_long (bonus build): .ber validation from so_long_bonus.c, map_bonus.c,
 * utils_bonus.c and floodfill_bonus.c, moves from movement_bonus.c. Pure: shared by the canvas and tests.
 * Quirks are copied on purpose (checked against the compiled validator), see parseBer.
 */

export type Dir = "up" | "down" | "left" | "right";
export type Game = { readonly map: readonly string[]; readonly px: number; readonly py: number; readonly moves: number; readonly won: boolean };

const STEP: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/**
 * Validates a .ber file in the repo's order and throws "Error\n<message>" as ft_error prints it.
 * Copied quirks: a trailing newline fails the last-row check ("in lines"), and flood_fill swaps
 * x and y (copie[x][y]), so only maps where that walk stays in bounds and reaches every C and E pass.
 */
export function parseBer(text: string): Game {
    const fail = (msg: string): never => {
        throw new Error(`Error\n${msg}`);
    };
    // get_next_line lines: each keeps its "\n" except possibly the last.
    const lines = text.match(/[^\n]*\n|[^\n]+$/g);
    if (!lines) return fail("Empty map");
    const len = (l: string) => l.replace(/\n$/, "").length;
    const width = lines[0].length - 1; // map_dim[1] = ft_strlen(first line) - 1
    const rows = lines.map((l) => l.slice(0, width));

    if (lines.some((l) => len(l) !== len(lines[0]))) fail("map not rectangular\n");
    if (/[^1]/.test(lines[0].replace(/\n$/, ""))) fail("first line or last line not 1\n");
    if (/[^1]/.test(lines[lines.length - 1])) fail("in lines\n");
    if (lines.some((l) => l[0] !== "1" || l[width - 1] !== "1")) fail("Invalid Sides!\n");
    if (rows.some((r) => /[^01PCE]/.test(r))) fail("Invalid components\n");
    const all = rows.join("");
    const count = (c: string) => all.split(c).length - 1;
    if (count("P") !== 1 || count("C") < 1 || count("E") !== 1) fail("Bad Components!\n");

    const py = rows.findIndex((r) => r.includes("P"));
    const px = rows[py].indexOf("P");
    // flood_fill(data, copie, px, py) reads copie[x][y]: x indexes rows, y indexes columns.
    const grid = rows.map((r) => [...r]);
    const stack: [number, number][] = [[px, py]];
    while (stack.length) {
        const [x, y] = stack.pop()!;
        if (x < 0 || y < 0 || x >= rows.length || y >= width) fail("out of borders\n");
        if (grid[x][y] === "E") grid[x][y] = "1";
        if (!"CE0P".includes(grid[x][y])) continue;
        grid[x][y] = ".";
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    if (grid.some((r) => r.includes("C") || r.includes("E"))) fail("Flood Fill!\n");
    return { map: rows, px, py, moves: 0, won: false };
}

export const collectiblesLeft = (g: Game) => g.map.join("").split("C").length - 1;

/** ft_move_*: walk onto 0 or C (picking it up), and win by stepping onto E once every C is collected. */
export function move(g: Game, dir: Dir): Game {
    if (g.won) return g;
    const [dx, dy] = STEP[dir];
    const x = g.px + dx;
    const y = g.py + dy;
    const target = g.map[y][x];
    if (target === "E" && collectiblesLeft(g) === 0) return { ...g, moves: g.moves + 1, won: true };
    if (target !== "0" && target !== "C") return g;
    const map = g.map.map((row, r) => {
        if (r !== y && r !== g.py) return row;
        const cells = [...row];
        if (r === g.py) cells[g.px] = "0";
        if (r === y) cells[x] = "P";
        return cells.join("");
    });
    return { map, px: x, py: y, moves: g.moves + 1, won: false };
}
