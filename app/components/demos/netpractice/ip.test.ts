import { test } from "node:test";
import assert from "node:assert/strict";
import { broadcast, isHost, isReserved, network, parseRoute, prefixOf, sameNet, toInt, toIp } from "./ip.ts";

const ip = (s: string) => toInt(s)!;

test("parses addresses and rejects bad ones", () => {
    assert.equal(toIp(ip("104.96.23.11")), "104.96.23.11");
    for (const bad of ["1.2.3", "1.2.3.256", "a.b.c.d", "1.2.3.4.5", ""]) assert.equal(toInt(bad), null, bad);
});

test("masks in both forms, and invalid masks", () => {
    assert.equal(prefixOf("255.255.255.128"), 25);
    assert.equal(prefixOf("255.255.192.0"), 18);
    assert.equal(prefixOf("/30"), 30);
    assert.equal(prefixOf("255.255.255.255"), 32);
    assert.equal(prefixOf("0.0.0.0"), 0);
    assert.equal(prefixOf("255.0.255.0"), null);
    assert.equal(prefixOf("/33"), null);
});

test("network, broadcast and usable hosts, including /30 and /31", () => {
    assert.equal(toIp(network(ip("87.175.98.227"), 25)), "87.175.98.128");
    assert.equal(toIp(broadcast(ip("87.175.98.227"), 25)), "87.175.98.255");
    assert.equal(isHost(ip("10.0.0.0"), 30), false);
    assert.equal(isHost(ip("10.0.0.3"), 30), false);
    assert.equal(isHost(ip("10.0.0.1"), 30), true);
    assert.equal(isHost(ip("10.0.0.0"), 31), true); // point-to-point: both addresses usable
});

test("the user's level 2 answer: A1 and B1 share a /27 (from Cardano04class/NetPractice level2.json)", () => {
    assert.equal(sameNet(ip("192.168.28.221"), ip("192.168.28.222"), prefixOf("255.255.255.224")!), true);
    assert.equal(sameNet(ip("192.168.28.221"), ip("192.168.28.230"), 27), false);
});

test("routes and reserved ranges", () => {
    assert.deepEqual(parseRoute("default"), { net: 0, prefix: 0 });
    assert.deepEqual(parseRoute("87.175.98.0/24"), { net: ip("87.175.98.0"), prefix: 24 });
    assert.equal(parseRoute("87.175.98.1/24"), null); // host bits set
    assert.equal(isReserved(ip("127.0.0.1")), true);
    assert.equal(isReserved(ip("230.1.1.1")), true);
    assert.equal(isReserved(ip("104.96.23.11")), false);
});
