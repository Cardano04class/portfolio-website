import assert from "node:assert/strict";
import test from "node:test";
import { botReply, command, createServer } from "./server.ts";

const register = (s: ReturnType<typeof createServer>, nick = "you") => {
    command(s, "", "PASS secretpass");
    command(s, "", `NICK ${nick}`);
    return command(s, nick, `USER ${nick} 0 * :You`);
};

test("commands before PASS return 451; wrong password returns 464", () => {
    const s = createServer();
    assert.match(command(s, "", "NICK you")[0], /451 \* NICK :Password required/);
    assert.match(command(s, "", "PASS wrong")[0], /464 \* PASS :Password incorrect/);
});

test("registration works with PASS, NICK, USER in order; nick collision returns 433", () => {
    const s = createServer();
    command(s, "", "PASS secretpass");
    assert.match(command(s, "", "NICK alice")[0], /433 \* alice :Nickname is already in use/);
    const lines = command(s, "", "NICK you");
    assert.deepEqual(lines, []);
    assert.match(command(s, "you", "USER you 0 * :You")[0], /001 you you :Welcome/);
});

test("JOIN emits echo, 331, 353, 366 in order", () => {
    const s = createServer(); register(s);
    const lines = command(s, "you", "JOIN #42");
    assert.match(lines[0], /JOIN :#42/);
    assert.deepEqual(lines.slice(1).filter((line) => /^:ircserv \d{3}/.test(line)).map((line) => line.split(" ")[1]), ["331", "353", "366"]);
});

test("KICK needs operator and invite opens +i channel", () => {
    const s = createServer(); register(s);
    command(s, "you", "JOIN #42");
    assert.match(command(s, "you", "KICK #42 bob")[0], /482 you #42 :You're not channel operator/);
    command(s, "alice", "JOIN #private");
    command(s, "alice", "MODE #private +i");
    assert.match(command(s, "you", "JOIN #private")[0], /473 you #private :Cannot join channel \(\+i\)/);
    command(s, "alice", "INVITE you #private");
    assert.match(command(s, "you", "JOIN #private").find((line) => line.includes(" 366 "))!, /366 you you #private/);
});

test("alice replies to mentions and can op a channel member", () => {
    const s = createServer(); register(s);
    command(s, "you", "JOIN #42");
    assert.deepEqual(botReply(s, "you", "hi alice"), ["alice: hi there!"]);
    assert.deepEqual(botReply(s, "you", "op me"), ["alice: you're an operator now — try KICK #42 bob"]);
    assert.equal(s.channels.get("#42")?.operators.has("you"), true);
});
