/**
 * Cardano04class/Philosophers on a virtual millisecond clock: same argument checks (utils.c), same routine
 * (routine.c: odd ids take the right fork first, eat, sleep, think) and the same monitor (philo.c / routine.c).
 * Deterministic, so the browser can replay it at any speed and the tests can pin it.
 * Copied quirk: the death line always names philosopher 1 (`p_data->philosophers_id` in ft_monitor).
 */

export type Args = { n: number; die: number; eat: number; sleep: number; meals?: number };
export type Line = { t: number; id: number; msg: "has taken a fork" | "is eating" | "is sleeping" | "is thinking" | "died" | "is dead" };
export type State = "thinking" | "hungry" | "eating" | "sleeping" | "dead";
/** One point in time: how much of the shared log exists, each philosopher's state, who holds each fork. */
export type Frame = { t: number; states: State[]; forks: (number | null)[]; meals: number[]; lineCount: number; deadId: number | null; done: boolean };
export type Run = { frames: Frame[]; lines: Line[] };

/** ft_parse_args, in the same order, with the same messages. Returns null when the arguments are accepted. */
export function checkArgs(argv: readonly string[]): string | null {
    const atoi = (s: string) => parseInt(s, 10) || 0;
    if (argv.length < 4 || argv.length > 5) return "Invalid Number of Arguments";
    if (argv.length === 5 && atoi(argv[4]) <= 0) return "invalid Meal Number ";
    if (atoi(argv[0]) <= 0 || atoi(argv[0]) > 200) return "Invalid Philosophers Number";
    if (argv.some((a) => !/^\d+$/.test(a))) return "Numeric arguments only";
    if (argv.slice(1, 4).some((a) => atoi(a) < 60)) return "Bad Arguments [arg should be >= 60]";
    return null;
}

/**
 * Runs the dinner to the end (death, everyone fed, or `limitMs`) and returns every frame where something changed.
 * Fork pickup is first-come at the same millisecond in philosopher order, which matches the binary's logs.
 */
export function simulate(a: Args, limitMs = 20000): Run {
    const { n, die, eat, sleep, meals } = a;
    const forks: (number | null)[] = Array(n).fill(null);
    // Each fork is a mutex with a FIFO of blocked philosophers: whoever blocked first gets it on release.
    const waiting: number[][] = Array.from({ length: n }, () => []);
    const states: State[] = Array(n).fill("hungry");
    const lastEat = Array(n).fill(0);
    const eaten = Array(n).fill(0);
    const busyUntil = Array(n).fill(0); // end of the current eat or sleep
    const held = Array.from({ length: n }, () => [] as number[]);
    const lines: Line[] = [];
    const frames: Frame[] = [];
    const snap = (t: number, deadId: number | null, done: boolean) =>
        frames.push({ t, states: [...states], forks: [...forks], meals: [...eaten], lineCount: lines.length, deadId, done });

    if (n === 1) {
        // ft_one_philo: takes one fork, waits time_to_die, "is dead".
        forks[0] = 0;
        lines.push({ t: 0, id: 1, msg: "has taken a fork" });
        snap(0, null, false);
        states[0] = "dead";
        lines.push({ t: die, id: 1, msg: "is dead" });
        snap(die, 0, true);
        return { frames, lines };
    }

    // eating(): odd ids lock the right fork first, even ids the left one.
    const order = (i: number): [number, number] => {
        const left = i;
        const right = (i + 1) % n;
        return (i + 1) % 2 !== 0 ? [right, left] : [left, right];
    };
    const allFed = () => meals !== undefined && eaten.every((m) => m >= meals);
    let ended: "fed" | null = null;

    /** Gives philosopher i the fork if free, or queues it; returns whether it now holds the fork. */
    const lock = (i: number, f: number, t: number): boolean => {
        if (forks[f] === null && (waiting[f].length === 0 || waiting[f][0] === i)) {
            if (waiting[f][0] === i) waiting[f].shift();
            forks[f] = i;
            held[i].push(f);
            lines.push({ t, id: i + 1, msg: "has taken a fork" });
            return true;
        }
        if (!waiting[f].includes(i)) waiting[f].push(i);
        return false;
    };
    /** Advances a hungry philosopher as far as the forks allow. */
    const tryEat = (i: number, t: number) => {
        if (states[i] !== "hungry" || ended) return false;
        const [first, second] = order(i);
        let moved = false;
        if (held[i].length === 0) moved = lock(i, first, t);
        if (held[i].length === 1 && lock(i, second, t)) {
            lines.push({ t, id: i + 1, msg: "is eating" });
            states[i] = "eating";
            lastEat[i] = t;
            eaten[i]++;
            busyUntil[i] = t + eat;
            if (allFed()) ended = "fed"; // the monitor sees it at once; nothing else gets printed
            return true;
        }
        return moved;
    };

    snap(0, null, false);
    for (let t = 0; t <= limitMs; t++) {
        let changed = false;
        const freed: number[] = [];
        for (let i = 0; i < n; i++) {
            if (states[i] === "eating" && t >= busyUntil[i]) {
                // Unlock first_take, then second_take; queued philosophers wake in that order.
                for (const f of held[i]) {
                    forks[f] = null;
                    freed.push(f);
                }
                held[i] = [];
                states[i] = "sleeping";
                busyUntil[i] = t + sleep;
                lines.push({ t, id: i + 1, msg: "is sleeping" });
                changed = true;
            } else if (states[i] === "sleeping" && t >= busyUntil[i]) {
                states[i] = "hungry";
                lines.push({ t, id: i + 1, msg: "is thinking" });
                changed = true;
            }
        }
        // Released forks go to whoever has waited longest on them.
        for (const f of freed) {
            const next = waiting[f][0];
            if (next !== undefined && tryEat(next, t)) changed = true;
        }
        for (let i = 0; i < n; i++) if (tryEat(i, t)) changed = true;
        if (ended) {
            snap(t, null, true);
            return { frames, lines };
        }
        // ft_monitor: the first philosopher (by index) not fed within time_to_die dies.
        const starving = states.findIndex((s, i) => s !== "eating" && t - lastEat[i] > die);
        if (starving >= 0) {
            states[starving] = "dead";
            lines.push({ t, id: 1, msg: "died" }); // copied quirk: always id 1
            snap(t, starving, true);
            return { frames, lines };
        }
        if (changed) snap(t, null, false);
    }
    return { frames, lines };
}

export const formatLine = (l: Line) => `${l.t} ${l.id} ${l.msg}`;
