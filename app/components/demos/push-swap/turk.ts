/**
 * TypeScript port of Cardano04class/Push_swap (the "Turk" cheapest-move sort).
 * Stacks are arrays with index 0 as the top. Ops come out exactly as the C program
 * prints them: rr / rrr are emitted as two lines (ra+rb, rra+rrb).
 */

export type Op = "sa" | "sb" | "pa" | "pb" | "ra" | "rb" | "rra" | "rrb";
export type Stacks = { readonly a: readonly number[]; readonly b: readonly number[] };

const INT_MIN = -2147483648;
const INT_MAX = 2147483647;
const NUMBER = /^[ \t]*[+-]?\d+[ \t]*$/;

/** Mirrors split_args + syntax_errors + ft_atoi + ft_duplicates: anything the C program rejects with "Error". */
export function parseInput(input: string): { ok: true; numbers: number[] } | { ok: false } {
    const words = input.split(" ").filter((w) => w !== "");
    if (words.length === 0) return { ok: false };
    const numbers: number[] = [];
    for (const w of words) {
        if (!NUMBER.test(w)) return { ok: false };
        const n = Number(w);
        if (n < INT_MIN || n > INT_MAX || numbers.includes(n)) return { ok: false };
        numbers.push(n);
    }
    return { ok: true, numbers };
}

/** Applies one op and returns new stacks; used by the animation and by the checker test. */
export function applyOp({ a, b }: Stacks, op: Op): Stacks {
    const A = [...a];
    const B = [...b];
    const swap = (s: number[]) => s.length > 1 && ([s[0], s[1]] = [s[1], s[0]]);
    const rot = (s: number[]) => s.length > 1 && s.push(s.shift()!);
    const rev = (s: number[]) => s.length > 1 && s.unshift(s.pop()!);
    switch (op) {
        case "sa": swap(A); break;
        case "sb": swap(B); break;
        case "pa": if (B.length) A.unshift(B.shift()!); break;
        case "pb": if (A.length) B.unshift(A.shift()!); break;
        case "ra": rot(A); break;
        case "rb": rot(B); break;
        case "rra": rev(A); break;
        case "rrb": rev(B); break;
    }
    return { a: A, b: B };
}

/** Returns the ops push_swap prints for `numbers` (assumed valid: see parseInput). */
export function pushSwap(numbers: readonly number[]): Op[] {
    const a = [...numbers];
    const b: number[] = [];
    const ops: Op[] = [];
    const run = (op: Op) => {
        const s = applyOp({ a, b }, op);
        a.splice(0, a.length, ...s.a);
        b.splice(0, b.length, ...s.b);
        ops.push(op);
    };

    if (isSorted(a)) return ops;
    if (a.length === 2) run("sa");
    else if (a.length === 3) sortThree(a, run);
    else sortStacks(a, b, run);
    return ops;
}

const isSorted = (s: readonly number[]) => s.every((v, i) => i === 0 || s[i - 1] < v);
const aboveMedian = (index: number, size: number) => index <= Math.floor(size / 2);
const cost = (index: number, size: number) => (aboveMedian(index, size) ? index : size - index);

function sortThree(a: number[], run: (op: Op) => void): void {
    const [x, y, z] = a;
    if (x > y && x > z) {
        run("ra");
        if (a[0] > a[1]) run("sa");
    } else if (x < y && y > z) {
        run("rra");
        if (a[0] > a[1]) run("sa");
    } else if (z > x && z > y && x > y) {
        run("sa");
    }
}

/** Brings the value `v` to the top of stack `name` the way prep_for_push does. */
function bringToTop(s: number[], v: number, name: "a" | "b", run: (op: Op) => void): void {
    const up = aboveMedian(s.indexOf(v), s.length);
    while (s[0] !== v) run(name === "a" ? (up ? "ra" : "rra") : up ? "rb" : "rrb");
}

function sortStacks(a: number[], b: number[], run: (op: Op) => void): void {
    let lenA = a.length;
    if (lenA-- > 3 && !isSorted(a)) run("pb");
    if (lenA-- > 3 && !isSorted(a)) run("pb");
    while (lenA-- > 3 && !isSorted(a)) {
        // init_nodes_a: target = largest b below the node, else max(b); cheapest by push_cost (first wins).
        let best = { value: 0, target: 0, cost: Infinity };
        a.forEach((v, i) => {
            const below = b.filter((x) => x < v);
            const target = below.length ? Math.max(...below) : Math.max(...b);
            const c = cost(i, a.length) + cost(b.indexOf(target), b.length);
            if (c < best.cost) best = { value: v, target, cost: c };
        });
        // move_a_to_b: rotate both while both sides agree, then finish each side, then pb.
        const nodeUp = aboveMedian(a.indexOf(best.value), a.length);
        const targetUp = aboveMedian(b.indexOf(best.target), b.length);
        if (nodeUp === targetUp) {
            while (b[0] !== best.target && a[0] !== best.value) {
                run(nodeUp ? "ra" : "rra");
                run(nodeUp ? "rb" : "rrb");
            }
        }
        bringToTop(a, best.value, "a", run);
        bringToTop(b, best.target, "b", run);
        run("pb");
    }
    sortThree(a, run);
    while (b.length) {
        // init_nodes_b: target = smallest a above b's top, else min(a).
        const above = a.filter((x) => x > b[0]);
        bringToTop(a, above.length ? Math.min(...above) : Math.min(...a), "a", run);
        run("pa");
    }
    bringToTop(a, Math.min(...a), "a", run);
}
