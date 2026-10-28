import { test } from "node:test";
import assert from "node:assert/strict";
import { apply, EMPTY, request, stepsFor, type Stack, type Target } from "./compose.ts";

const run = (stack: Stack, target: Target) => stepsFor(target, stack).reduce(apply, stack);

test("make builds then starts in depends_on order: mariadb, wordpress, nginx", () => {
    const steps = stepsFor("make", EMPTY);
    const started = steps.filter((s) => s.log.endsWith("Started")).map((s) => s.log.split(" ")[1]);
    assert.deepEqual(started, ["mariadb", "wordpress", "nginx"]);
    // depends_on orders start only; wordpress's own script waits for mariadb before installing
    const dbRunning = steps.findIndex((s) => s.set?.mariadb === "running");
    // wordpress waits for the database before it is marked running
    const wpRunning = steps.findIndex((s) => s.set?.wordpress === "running");
    const dbReady = steps.findIndex((s) => s.log === "Database ready!");
    assert.ok(dbRunning < dbReady && dbReady < wpRunning);
    const up = run(EMPTY, "make");
    assert.deepEqual(up, { services: { mariadb: "running", wordpress: "running", nginx: "running" }, network: true, data: true });
});

test("only nginx publishes a port, and a request goes 443 → 9000 → 3306", () => {
    assert.deepEqual(request(EMPTY), { hops: [], ok: false, log: "curl: (7) Failed to connect to mamir.42.fr port 443: Connection refused" });
    const r = request(run(EMPTY, "make"));
    assert.equal(r.ok, true);
    assert.deepEqual(r.hops.map((h) => h.to), ["nginx", "wordpress", "mariadb"]);
});

test("make down keeps images and data; make re rebuilds from scratch", () => {
    const down = run(run(EMPTY, "make"), "make down");
    assert.deepEqual(down, { services: { mariadb: "built", wordpress: "built", nginx: "built" }, network: false, data: true });
    assert.equal(stepsFor("make down", down)[0].log, "Nothing to stop.");
    const re = stepsFor("make re", down);
    assert.ok(re.some((s) => s.log === "docker system prune -a --force"));
    assert.deepEqual(re.reduce(apply, down), run(EMPTY, "make"));
});

test("a request stops at the first container that is not running", () => {
    const up = run(EMPTY, "make");
    const noWp = request({ ...up, services: { ...up.services, wordpress: "built" } });
    assert.deepEqual([noWp.ok, noWp.log, noWp.hops.map((h) => h.to)], [false, "502 Bad Gateway (nginx): php-fpm at wordpress:9000 is not running", ["nginx"]]);
    const noDb = request({ ...up, services: { ...up.services, mariadb: "built" } });
    assert.deepEqual([noDb.log, noDb.hops.map((h) => h.to)], ["Error establishing a database connection (WordPress)", ["nginx", "wordpress"]]);
});

test("make re from nothing does not pretend to remove containers", () => {
    const re = stepsFor("make re", EMPTY);
    assert.ok(!re.some((s) => s.log.endsWith("Removed")));
    assert.deepEqual(re.reduce(apply, EMPTY), run(EMPTY, "make"));
});

test("make on a running stack is a no-op that says so", () => {
    const up = run(EMPTY, "make");
    const again = stepsFor("make", up);
    assert.deepEqual(again.slice(-3).map((s) => s.log), ["Container mariadb  Running", "Container wordpress  Running", "Container nginx  Running"]);
    assert.deepEqual(again.reduce(apply, up), up);
});

test("no step prints a password", () => {
    for (const t of ["make", "make down", "make re"] as const) {
        for (const s of stepsFor(t, EMPTY)) assert.ok(!/password/i.test(s.log), s.log);
    }
});
