import { test } from "node:test";
import assert from "node:assert/strict";
import { castRay, isWalkable, makeTextures, parseCub, render, step } from "./raycast.ts";
import { MAPS } from "./maps.ts";

test("the repo's maps parse: colours, size, spawn at tile centre facing the letter", () => {
    const big = parseCub(MAPS.big);
    assert.deepEqual([big.floor, big.ceiling], [[26, 26, 24], [46, 58, 63]]);
    assert.equal(big.rows, 14);
    assert.deepEqual(big.spawn, { x: 25.5, y: 10.5, angle: Math.PI / 2 }); // 'S'
    const small = parseCub(MAPS.small);
    assert.deepEqual(small.spawn, { x: 5.5, y: 3.5, angle: (3 * Math.PI) / 2 }); // 'N'
});

test("parse errors use the repo's messages", () => {
    assert.throws(() => parseCub(MAPS.small.replace("10000N0", "1000000")), /Error, player not found/);
    assert.throws(() => parseCub(MAPS.small.replace("F 26,26,24", "F 26,300,24")), /rgb range error/);
    assert.throws(() => parseCub(MAPS.small.replace("10000N0", "10000NS")), /non valid character/);
    assert.throws(() => parseCub(MAPS.small.replace("100000000000001111", "100000000000001110")), /map error\(map rows should be closed by walls\)/);
    assert.throws(() => parseCub(MAPS.small.replace("1111111111111\n", "1111110111111\n")), /error \(first map row should all 1\)/);
});

test("spaces and short rows are walls, like fill_map.c", () => {
    const small = parseCub(MAPS.small);
    assert.equal(small.grid[2], "101111111111111111"); // "101" padded with walls
    let p = small.spawn; // facing north from (5.5, 3.5): row 2 is wall at x=5
    for (let i = 0; i < 200; i++) p = step(small, p, { walk: 1, strafe: 0, turn: 0 }, 0.05, 0);
    assert.ok(Math.abs(p.y - 3.2) < 1e-6, String(p.y));
    const big = parseCub(MAPS.big);
    assert.equal(isWalkable(big, 12.5, 10.5), false); // the space in "100000000000 000..."
});

test("DDA hits the right wall at the right distance", () => {
    const m = parseCub(MAPS.small);
    // From (5.5, 3.5) looking west: row "10000N000001111" has its wall at x=0, so the hit is 4.5 tiles away.
    const west = castRay(m, m.spawn, Math.PI);
    assert.ok(Math.abs(west.dist - 4.5) < 1e-9, String(west.dist));
    assert.deepEqual([west.side, west.tex], [0, 3]); // WE texture
    const north = castRay(m, m.spawn, (3 * Math.PI) / 2);
    assert.deepEqual([north.side, north.tex], [1, 0]); // NO texture
});

test("movement slides along walls and never enters one", () => {
    const m = parseCub(MAPS.small);
    let p = { ...m.spawn, angle: Math.PI }; // facing west along the corridor
    for (let i = 0; i < 2000; i++) p = step(m, p, { walk: 1, strafe: 0, turn: 0 }, 0.05, 0);
    assert.ok(isWalkable(m, p.x, p.y));
    assert.ok(Math.abs(p.x - 1.2) < 1e-6, String(p.x)); // stops 0.2 from the wall at x=1
    p = step(m, { ...p, angle: Math.PI * 0.75 }, { walk: 1, strafe: 0, turn: 0 }, 0.05, 0);
    assert.ok(isWalkable(m, p.x, p.y)); // diagonal into a corner: still outside the wall
});

test("rotation wraps into [0, 2π)", () => {
    const m = parseCub(MAPS.small);
    const p = step(m, { ...m.spawn, angle: 0.01 }, { walk: 0, strafe: 0, turn: -1 }, 0, 0.05);
    assert.ok(p.angle > 6 && p.angle < 2 * Math.PI);
});

test("render fills every pixel (ceiling, floor, walls) without throwing at any angle", () => {
    const m = parseCub(MAPS.big);
    const tex = makeTextures();
    const buf = new Uint32Array(160 * 80);
    for (let a = 0; a < 2 * Math.PI; a += 0.3) {
        buf.fill(0);
        render(buf, 160, 80, m, { ...m.spawn, angle: a }, tex);
        assert.ok(buf.every((v) => v !== 0));
    }
});
