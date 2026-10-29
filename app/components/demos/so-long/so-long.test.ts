import { test } from "node:test";
import assert from "node:assert/strict";
import { collectiblesLeft, move, parseBer } from "./so-long.ts";
import { MAPS } from "./maps.ts";

const err = (text: string) => {
    try {
        parseBer(text);
        return "VALID";
    } catch (e) {
        return (e as Error).message;
    }
};

test("the repo's playable maps validate; map2.ber has no player, like the binary says", () => {
    assert.equal(err(MAPS.map), "VALID");
    assert.equal(err(MAPS.map1), "VALID");
    assert.equal(err(MAPS.map2), "Error\nBad Components!\n");
});

test("validation messages and order match the compiled validator", () => {
    // Expected strings captured from so_long_bonus built from the repo (graphics stubbed).
    assert.equal(err("1111\n1PCE1\n1111"), "Error\nmap not rectangular\n");
    assert.equal(err("11111\n1PCE1\n11111\n"), "Error\nin lines\n"); // trailing newline quirk
    assert.equal(err("11111\n1PCX1\n11111"), "Error\nInvalid components\n");
    assert.equal(err("11111\n1P1CE\n11111"), "Error\nInvalid Sides!\n");
    assert.equal(err("111111\n1PPCE1\n111111"), "Error\nBad Components!\n");
    assert.equal(err("1111111\n1E0C1P1\n1111111"), "Error\nout of borders\n"); // flood_fill x/y swap
});

test("moves count, collectibles are picked up, the exit only works when they are all collected", () => {
    // Expected values come from the repo's ft_move_* compiled and run on the same keys.
    let g = parseBer(MAPS.map1);
    const walk = (keys: string) => {
        for (const k of keys) g = move(g, ({ u: "up", d: "down", l: "left", r: "right" } as const)[k as "u"]);
    };
    walk("ll"); // wall on the left of P: nothing happens, nothing counted
    assert.equal(g.moves, 0);
    walk("rrrrr"); // five steps right; the last lands on the C at (6,2)
    assert.deepEqual([g.px, g.py, g.moves, collectiblesLeft(g)], [6, 2, 5, 1]);
    walk("llddddr"); // collects the last C at (5,6)
    assert.deepEqual([g.px, g.py, g.moves, collectiblesLeft(g), g.won], [5, 6, 12, 0, false]);
    walk("ull"); // onto E with every C collected
    assert.deepEqual([g.won, g.moves], [true, 15]);
    const final = g.moves;
    walk("r");
    assert.equal(g.moves, final); // game over: input ignored
});
