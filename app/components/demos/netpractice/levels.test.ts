import { test } from "node:test";
import assert from "node:assert/strict";
import { check, makeLevels, seeded, type Level } from "./levels.ts";
import { broadcast, network, prefixOf, toInt, toIp } from "./ip.ts";

/** Fills every editable field with a correct answer, the way a player would. */
function solve(level: Level): Level {
    const copy: Level = structuredClone(level);
    const iface = (id: string) => copy.devices.flatMap((d) => d.ifaces).find((i) => i.id === id)!;
    const known = (id: string) => ({ ip: toInt(iface(id).ip.value)!, prefix: prefixOf(iface(id).mask.value)! });
    if (copy.title.startsWith("Level 1")) {
        const a = known("A1");
        iface("B1").ip.value = toIp(network(a.ip, a.prefix) + (a.ip - network(a.ip, a.prefix) === 1 ? 2 : 1));
    } else if (copy.title.startsWith("Level 2")) {
        const p = prefixOf(iface("B1").mask.value)!;
        const a = toInt(iface("A1").ip.value)!;
        iface("A1").mask.value = iface("B1").mask.value;
        iface("B1").ip.value = toIp(network(a, p) + 2);
        iface("C1").ip.value = toIp(network(a, p) + 3);
        iface("C1").mask.value = `/${p}`;
    } else {
        const p = prefixOf(iface("R1").mask.value)!;
        const a = toInt(iface("A1").ip.value)!;
        iface("A1").mask.value = iface("R1").mask.value;
        const gw = broadcast(a, p) - 1;
        iface("R1").ip.value = toIp(gw);
        copy.devices.find((d) => d.id === "A")!.routes[0].gate.value = toIp(gw);
        copy.devices.find((d) => d.id === "I")!.routes[0].dest.value = `${toIp(network(a, p))}/${p}`;
    }
    return copy;
}

test("every generated level starts unsolved and becomes solvable, for many seeds", () => {
    for (let seed = 1; seed <= 300; seed++) {
        for (const level of makeLevels(seeded(seed))) {
            assert.equal(check(level).ok, false, `${level.title} seed ${seed} solved before playing`);
            const r = check(solve(level));
            assert.ok(r.ok, `${level.title} seed ${seed}: ${r.problems.map((p) => p.text).join("; ")}`);
            assert.equal(r.paths.length, level.goals.length);
        }
    }
});

test("level 3 needs the return route: without it the internet cannot answer", () => {
    const l3 = solve(makeLevels(seeded(7))[2]);
    l3.devices.find((d) => d.id === "I")!.routes[0].dest.value = "8.0.0.0/8";
    const r = check(l3);
    assert.equal(r.ok, false);
    assert.match(r.problems[0].text, /internet I has no route/);
});

test("level 3 path goes A through the switch and R to I, and back", () => {
    const r = check(solve(makeLevels(seeded(3))[2]));
    assert.deepEqual(r.paths, [["A", "S", "R", "I"], ["I", "R", "S", "A"]]);
});

test("wrong answers name the problem", () => {
    const l1 = makeLevels(seeded(5))[0];
    const a = l1.devices[0].ifaces[0];
    l1.devices[1].ifaces[0].ip.value = a.ip.value; // same IP as A
    assert.match(check(l1).problems[0].text, /same IP/);
    l1.devices[1].ifaces[0].ip.value = "9.9.9.9";
    assert.match(check(l1).problems[0].text, /not on the same network/);
});

test("level 2 paths cross the switch", () => {
    const l2 = makeLevels(seeded(11))[1];
    const iface = (id: string) => l2.devices.flatMap((d) => d.ifaces).find((i) => i.id === id)!;
    const base = iface("A1").ip.value.split(".").map(Number);
    iface("A1").mask.value = iface("B1").mask.value;
    iface("B1").ip.value = [...base.slice(0, 3), base[3] + 1].join(".");
    iface("C1").ip.value = [...base.slice(0, 3), base[3] + 2].join(".");
    iface("C1").mask.value = iface("B1").mask.value;
    assert.deepEqual(check(l2).paths, [["A", "S", "B"], ["A", "S", "C"], ["B", "S", "C"]]);
});
