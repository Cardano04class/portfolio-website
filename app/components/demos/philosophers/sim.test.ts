import { test } from "node:test";
import assert from "node:assert/strict";
import { checkArgs, formatLine, simulate, type Args } from "./sim.ts";

/** Outcome of a run: who dies and when, everyone fed, or still running at the limit. */
function outcome(a: Args, limit = 4000): string {
    const { frames, lines } = simulate(a, limit);
    const last = frames.at(-1)!;
    const d = lines.find((l) => l.msg === "died" || l.msg === "is dead");
    if (d) return formatLine(d);
    return last.done ? `all fed after ${lines.filter((l) => l.msg === "is eating").length} meals` : "survives";
}

test("argument checks: same order and messages as ft_parse_args", () => {
    // Captured from the compiled repo.
    assert.equal(checkArgs(["4", "310", "200"]), "Invalid Number of Arguments");
    assert.equal(checkArgs(["0", "800", "200", "200"]), "Invalid Philosophers Number");
    assert.equal(checkArgs(["201", "800", "200", "200"]), "Invalid Philosophers Number");
    assert.equal(checkArgs(["4", "50", "200", "200"]), "Bad Arguments [arg should be >= 60]");
    assert.equal(checkArgs(["4", "800", "200", "200", "0"]), "invalid Meal Number ");
    assert.equal(checkArgs(["4", "8a0", "200", "200"]), "Numeric arguments only");
    assert.equal(checkArgs(["4", "800", "200", "200", "-1"]), "invalid Meal Number ");
    assert.equal(checkArgs(["4", "800", "200", "200"]), null);
});

test("outcomes match the compiled binary on the cases where its threads agree", () => {
    // Each expectation is what the binary printed in 5 out of 5 runs.
    assert.equal(outcome({ n: 4, die: 310, eat: 200, sleep: 100 }), "311 1 died");
    assert.equal(outcome({ n: 4, die: 200, eat: 205, sleep: 200 }), "201 1 died");
    assert.equal(outcome({ n: 2, die: 150, eat: 100, sleep: 100 }), "151 1 died");
    assert.equal(outcome({ n: 1, die: 800, eat: 200, sleep: 200 }), "800 1 is dead");
    assert.equal(outcome({ n: 5, die: 800, eat: 200, sleep: 200, meals: 2 }), "all fed after 10 meals");
    assert.equal(outcome({ n: 3, die: 310, eat: 100, sleep: 100, meals: 4 }), "all fed after 12 meals");
    assert.equal(outcome({ n: 5, die: 610, eat: 200, sleep: 200, meals: 3 }), "all fed after 15 meals");
    assert.equal(outcome({ n: 4, die: 410, eat: 200, sleep: 200 }), "survives");
});

test("the death line always names philosopher 1, like the binary, while the frame knows who starved", () => {
    const { frames, lines } = simulate({ n: 4, die: 310, eat: 200, sleep: 100 });
    const last = frames.at(-1)!;
    assert.equal(lines.at(-1)!.id, 1);
    assert.equal(typeof last.deadId, "number");
    assert.equal(last.states[last.deadId!], "dead");
});

test("odd ids take the right fork first, even ids the left one", () => {
    const first = simulate({ n: 4, die: 800, eat: 200, sleep: 200 }).frames[1];
    // Philosopher 1 (index 0, odd id) holds fork 1 (its right) and fork 0; philosopher 3 holds forks 3 and 2.
    assert.deepEqual(first.forks, [0, 0, 2, 2]);
});

test("long runs stay cheap: frames share one log instead of copying it", () => {
    const t0 = Date.now();
    const { frames, lines } = simulate({ n: 200, die: 1000, eat: 61, sleep: 67 }, 30000);
    assert.ok(Date.now() - t0 < 2000, `${Date.now() - t0} ms`);
    assert.ok(lines.length > 100000);
    assert.equal(frames.at(-1)!.lineCount, lines.length);
});
