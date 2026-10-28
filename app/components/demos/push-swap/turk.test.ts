import { test } from "node:test";
import assert from "node:assert/strict";
import { applyOp, parseInput, pushSwap, type Stacks } from "./turk.ts";

function run(nums: number[]): { ops: string[]; end: Stacks } {
    const ops = pushSwap(nums);
    let s: Stacks = { a: [...nums], b: [] };
    for (const op of ops) s = applyOp(s, op);
    return { ops, end: s };
}

const sorted = (xs: readonly number[]) => xs.every((v, i) => i === 0 || xs[i - 1] < v);

test("parseInput: accepts numbers split on spaces, like the C split_args", () => {
    assert.deepEqual(parseInput("3 -1  +2"), { ok: true, numbers: [3, -1, 2] });
});

test("parseInput: rejects what push_swap prints Error for", () => {
    for (const bad of ["1 1", "1 a", "2147483648", "-2147483649", "1 2-", "+", "   "]) {
        assert.deepEqual(parseInput(bad), { ok: false }, bad);
    }
    assert.deepEqual(parseInput("2147483647 -2147483648"), { ok: true, numbers: [2147483647, -2147483648] });
});

test("small cases print the same ops as the C program", () => {
    assert.deepEqual(pushSwap([1, 2, 3]), []);
    assert.deepEqual(pushSwap([2, 1]), ["sa"]);
    assert.deepEqual(pushSwap([3, 2, 1]), ["ra", "sa"]);
    assert.deepEqual(pushSwap([1, 3, 2]), ["rra", "sa"]);
    assert.deepEqual(pushSwap([2, 1, 3]), ["sa"]);
});

test("matches the compiled C program, including rr printed as ra + rb", () => {
    // Expected output captured from `./push_swap 17 18 11 -5 -27 -9 27 3 22 -19 19 -26 -8 -12 -4 -7 15 30 9 6` built from the repo.
    const input = [17, 18, 11, -5, -27, -9, 27, 3, 22, -19, 19, -26, -8, -12, -4, -7, 15, 30, 9, 6];
    const expected = "pb pb pb rb pb rb pb pb rb rb pb ra rb pb rrb rrb pb ra rb pb rrb rrb pb rb rb pb rrb rrb rrb pb rb rb pb rrb rrb rrb pb ra rb rb pb rb pb ra pa rra pa pa pa pa pa pa pa pa pa rra pa pa rra pa pa pa pa pa ra ra ra ra ra ra ra ra ra".split(" ");
    assert.deepEqual(pushSwap(input), expected);
});

test("any input ends sorted in a with b empty (the checker)", () => {
    for (const n of [4, 5, 6, 10, 50, 100]) {
        for (let seed = 0; seed < 40; seed++) {
            const { end } = run(shuffled(n, seed));
            assert.ok(sorted(end.a) && end.b.length === 0, `n=${n} seed=${seed}`);
            assert.equal(end.a.length, n);
        }
    }
});

test("100 numbers stay under the 42 grading limit of 700 ops on average", () => {
    let total = 0;
    for (let seed = 0; seed < 50; seed++) total += pushSwap(shuffled(100, seed)).length;
    assert.ok(total / 50 < 700, `avg ${total / 50}`);
});

function shuffled(n: number, seed: number): number[] {
    const xs = Array.from({ length: n }, (_, i) => i * 7 - 300);
    let s = seed + 1;
    for (let i = n - 1; i > 0; i--) {
        s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
        const j = s % (i + 1);
        [xs[i], xs[j]] = [xs[j], xs[i]];
    }
    return xs;
}
