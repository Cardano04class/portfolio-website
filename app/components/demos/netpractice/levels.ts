/**
 * Three NetPractice-style levels, generated with fresh random addresses each time (like the training app).
 * A level is data: devices with interfaces and routes, links between interfaces, and the goals to reach.
 * `check` runs the same reasoning NetPractice expects: valid host IPs, matching networks on every link,
 * and routes that carry a packet hop by hop to its destination.
 */
import { isHost, isReserved, network, parseRoute, prefixOf, sameNet, toInt, toIp } from "./ip.ts";

export type Field = { value: string; editable: boolean };
export type Iface = { id: string; ip: Field; mask: Field };
export type Route = { dest: Field; gate: Field };
export type Device = { id: string; kind: "host" | "router" | "switch" | "internet"; name: string; ifaces: Iface[]; routes: Route[]; x: number; y: number };
export type Level = { title: string; story: string; devices: Device[]; links: [string, string][]; goals: [string, string][] };

type Rand = () => number;
const pick = <T>(r: Rand, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
const randInt = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const fixed = (value: string): Field => ({ value, editable: false });
const blank = (): Field => ({ value: "", editable: true });

/** A random public-looking network of the given prefix, avoiding reserved and private ranges. */
function randomNet(r: Rand, prefix: number): number {
    for (;;) {
        const first = randInt(r, 11, 223);
        if (first === 127 || first === 10 || first === 172 || first === 192) continue;
        const n = ((first << 24) | (randInt(r, 0, 255) << 16) | (randInt(r, 0, 255) << 8) | randInt(r, 0, 255)) >>> 0;
        return network(n, prefix);
    }
}
const host = (net: number, k: number) => toIp((net + k) >>> 0);
const maskText = (p: number) => toIp(p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);

export function makeLevels(r: Rand = Math.random): Level[] {
    // Level 1: two hosts on one wire; fill B's IP so it shares A's network.
    const p1 = pick(r, [24, 25, 26, 27]);
    const n1 = randomNet(r, p1);
    const l1: Level = {
        title: "Level 1: two hosts",
        story: "Host A and host B are on the same cable. Give B an address on A's network.",
        devices: [
            { id: "A", kind: "host", name: "client A", x: 100, y: 60, routes: [], ifaces: [{ id: "A1", ip: fixed(host(n1, randInt(r, 1, 6))), mask: fixed(maskText(p1)) }] },
            { id: "B", kind: "host", name: "client B", x: 400, y: 60, routes: [], ifaces: [{ id: "B1", ip: blank(), mask: fixed(maskText(p1)) }] },
        ],
        links: [["A1", "B1"]],
        goals: [["A", "B"], ["B", "A"]],
    };

    // Level 2: three hosts on a switch; the mask is given on one, the others must agree on network and mask.
    const p2 = pick(r, [26, 27, 28, 29]);
    const n2 = randomNet(r, p2);
    const l2: Level = {
        title: "Level 2: a switch",
        story: "A switch connects three hosts. They all need addresses on one network, and the same mask.",
        devices: [
            { id: "S", kind: "switch", name: "switch S", x: 250, y: 280, routes: [], ifaces: [] },
            { id: "A", kind: "host", name: "client A", x: 80, y: 20, routes: [], ifaces: [{ id: "A1", ip: fixed(host(n2, 1)), mask: blank() }] },
            { id: "B", kind: "host", name: "client B", x: 420, y: 20, routes: [], ifaces: [{ id: "B1", ip: blank(), mask: fixed(maskText(p2)) }] },
            { id: "C", kind: "host", name: "client C", x: 250, y: 20, routes: [], ifaces: [{ id: "C1", ip: blank(), mask: blank() }] },
        ],
        links: [["A1", "S"], ["B1", "S"], ["C1", "S"]],
        goals: [["A", "B"], ["A", "C"], ["B", "C"]],
    };

    // Level 3 (like the screenshot): a client behind a switch and a router, reaching the internet and back.
    const pLan = 25;
    const lan = randomNet(r, pLan);
    const wan = randomNet(r, 28);
    const l3: Level = {
        title: "Level 3: through a router",
        story: "Client A must reach the internet through router R, and the internet must route back to A's network.",
        devices: [
            { id: "I", kind: "internet", name: "internet I", x: 70, y: 10, ifaces: [{ id: "I1", ip: fixed(host(wan, 1)), mask: fixed("/28") }], routes: [{ dest: blank(), gate: fixed(host(wan, 12)) }] },
            {
                id: "R", kind: "router", name: "router R", x: 235, y: 110,
                ifaces: [
                    { id: "R2", ip: fixed(host(wan, 12)), mask: fixed(maskText(28)) },
                    { id: "R1", ip: blank(), mask: fixed(maskText(pLan)) },
                ],
                routes: [{ dest: fixed("default"), gate: fixed(host(wan, 1)) }],
            },
            { id: "S", kind: "switch", name: "switch S", x: 395, y: 90, routes: [], ifaces: [] },
            { id: "A", kind: "host", name: "client A", x: 425, y: 215, ifaces: [{ id: "A1", ip: fixed(host(lan, randInt(r, 1, 90))), mask: blank() }], routes: [{ dest: fixed("default"), gate: blank() }] },
        ],
        links: [["I1", "R2"], ["R1", "S"], ["A1", "S"]],
        goals: [["A", "I"], ["I", "A"]],
    };
    return [l1, l2, l3];
}

export type Problem = { where: string; text: string };
export type Result = { ok: boolean; problems: Problem[]; paths: string[][] };

/** Checks a level the way NetPractice does and returns the problems, plus the hop path for each goal that works. */
export function check(level: Level): Result {
    const problems: Problem[] = [];
    const ifaces = new Map<string, { dev: Device; iface: Iface; ip: number | null; prefix: number | null }>();
    for (const dev of level.devices) {
        for (const iface of dev.ifaces) {
            const ip = toInt(iface.ip.value);
            const prefix = prefixOf(iface.mask.value);
            if (ip === null) problems.push({ where: iface.id, text: `Interface ${iface.id}: IP "${iface.ip.value || "empty"}" is not a valid address` });
            else if (prefix === null) problems.push({ where: iface.id, text: `Interface ${iface.id}: mask "${iface.mask.value || "empty"}" is not valid` });
            else if (isReserved(ip)) problems.push({ where: iface.id, text: `Interface ${iface.id}: ${iface.ip.value} is in a reserved range` });
            else if (!isHost(ip, prefix)) problems.push({ where: iface.id, text: `Interface ${iface.id}: ${iface.ip.value} is the network or broadcast address of its /${prefix}` });
            ifaces.set(iface.id, { dev, iface, ip: problems.some((p) => p.where === iface.id) ? null : ip, prefix });
        }
    }
    // A switch joins every interface linked to it into one segment; a direct link is a segment of two.
    const segments: string[][] = [];
    const switchSeg = new Map<string, string[]>();
    for (const [a, b] of level.links) {
        const sw = level.devices.find((d) => d.kind === "switch" && (d.id === a || d.id === b));
        if (sw) {
            const seg = switchSeg.get(sw.id) ?? [];
            seg.push(sw.id === a ? b : a);
            if (!switchSeg.has(sw.id)) {
                switchSeg.set(sw.id, seg);
                segments.push(seg);
            }
        } else segments.push([a, b]);
    }
    for (const seg of segments) {
        const known = seg.map((id) => ifaces.get(id)!).filter((x) => x.ip !== null && x.prefix !== null);
        for (let i = 0; i < known.length; i++) {
            for (let j = i + 1; j < known.length; j++) {
                const a = known[i];
                const b = known[j];
                if (a.prefix !== b.prefix) problems.push({ where: b.iface.id, text: `${a.iface.id} and ${b.iface.id} are on the same wire but use different masks` });
                else if (!sameNet(a.ip!, b.ip!, a.prefix!)) problems.push({ where: b.iface.id, text: `${a.iface.id} (${toIp(network(a.ip!, a.prefix!))}/${a.prefix}) and ${b.iface.id} (${toIp(network(b.ip!, b.prefix!))}/${b.prefix}) are not on the same network` });
                else if (a.ip === b.ip) problems.push({ where: b.iface.id, text: `${a.iface.id} and ${b.iface.id} have the same IP` });
            }
        }
    }
    for (const dev of level.devices) {
        for (const route of dev.routes) {
            if (!parseRoute(route.dest.value)) problems.push({ where: dev.id, text: `${dev.name}: route destination "${route.dest.value || "empty"}" is not "default" or a network like 10.0.0.0/8` });
            if (toInt(route.gate.value) === null) problems.push({ where: dev.id, text: `${dev.name}: gateway "${route.gate.value || "empty"}" is not an address` });
        }
    }
    const paths: string[][] = [];
    if (problems.length === 0) {
        for (const [from, to] of level.goals) {
            const r = trace(level, segments, ifaces, from, to);
            if (typeof r === "string") problems.push({ where: r.startsWith("router") ? "R" : r.startsWith("internet") ? "I" : from, text: r });
            else paths.push(r);
        }
    }
    return { ok: problems.length === 0, problems, paths };
}

type IfaceInfo = { dev: Device; iface: Iface; ip: number | null; prefix: number | null };

/** Follows a packet from device `from` to device `to`: deliver on a shared segment, else take the longest matching route. */
function trace(level: Level, segments: string[][], ifaces: Map<string, IfaceInfo>, from: string, to: string): string[] | string {
    // A hop across a switched segment passes through the switch, so its wires light up too.
    const via = (ifaceId: string) => {
        for (const [a, b] of level.links) {
            const sw = level.devices.find((d) => d.kind === "switch" && ((a === ifaceId && d.id === b) || (b === ifaceId && d.id === a)));
            if (sw) return [sw.id];
        }
        return [];
    };
    const target = level.devices.find((d) => d.id === to)!;
    const dstIps = target.ifaces.map((i) => ifaces.get(i.id)!.ip!);
    const dst = dstIps[0];
    const path = [from];
    let cur = level.devices.find((d) => d.id === from)!;
    for (let hops = 0; hops < 8; hops++) {
        if (cur.id === to) return path;
        const mine = cur.ifaces.map((i) => ifaces.get(i.id)!);
        // Directly connected: the destination shares a segment with one of my interfaces and my network.
        for (const m of mine) {
            const seg = segments.find((s) => s.includes(m.iface.id))!;
            for (const other of seg) {
                const o = ifaces.get(other);
                if (o && o.dev.id === to && sameNet(m.ip!, o.ip!, m.prefix!)) return [...path, ...via(m.iface.id), to];
            }
        }
        // Otherwise route: the longest prefix that matches the destination.
        const routes = cur.routes
            .map((r) => ({ r: parseRoute(r.dest.value)!, gate: toInt(r.gate.value)! }))
            .filter(({ r }) => network(dst, r.prefix) === r.net)
            .sort((a, b) => b.r.prefix - a.r.prefix);
        if (!routes.length) return `${cur.name} has no route to ${toIp(dst)}`;
        const gate = routes[0].gate;
        // The gateway must be reachable on one of my segments.
        let next: Device | null = null;
        for (const m of mine) {
            if (!sameNet(m.ip!, gate, m.prefix!)) continue;
            const seg = segments.find((s) => s.includes(m.iface.id))!;
            const hit = seg.map((id) => ifaces.get(id)!).find((o) => o.ip === gate);
            if (hit) {
                next = hit.dev;
                path.push(...via(m.iface.id));
            }
        }
        if (!next) return `${cur.name}: gateway ${toIp(gate)} is not on any of its networks`;
        path.push(next.id);
        cur = next;
    }
    return `the packet from ${from} to ${to} loops`;
}

/** A seeded generator so tests (and the "same puzzle again" button) are reproducible. */
export function seeded(seed: number): Rand {
    let s = seed >>> 0 || 1;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
