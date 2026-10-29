export type Client = { nick: string; user: string; passOk: boolean; registered: boolean; invited: Set<string>; lines: string[] };
export type Channel = { members: Set<string>; operators: Set<string>; modes: Set<string>; key?: string; limit?: number; topic?: string };
export type IrcServer = { clients: Map<string, Client>; channels: Map<string, Channel>; secret: string };
function findClient(server: IrcServer, nick: string): Client | undefined {
    return server.clients.get(nick) ?? [...server.clients.values()].find((c) => c.nick === nick);
}

export function createServer(secret = "secretpass"): IrcServer {
    const clients = new Map<string, Client>();
    const channels = new Map<string, Channel>();
    for (const nick of ["alice", "bob"]) {
        clients.set(nick, { nick, user: nick, passOk: true, registered: true, invited: new Set(), lines: [] });
    }
    const channel: Channel = { members: new Set(["alice", "bob"]), operators: new Set(["alice"]), modes: new Set() };
    channels.set("#42", channel);
    clients.set("@visitor", { nick: "", user: "", passOk: false, registered: false, invited: new Set(), lines: [] });
    return { clients, channels, secret };
}

function line(server: IrcServer, nick: string, value: string) {
    const client = findClient(server, nick) ?? (nick === "*" ? [...server.clients.values()].find((c) => !c.registered) : undefined);
    client?.lines.push(value);
}
function numeric(server: IrcServer, nick: string, code: number, arg: string, message: string) {
    // Repo's sendNumericReply omits the space before the trailing parameter; demo fixes this formatting slip.
    line(server, nick, `:ircserv ${String(code).padStart(3, "0")} ${nick} ${arg}${message ? ` :${message}` : ""}`);
}
function broadcast(server: IrcServer, channel: Channel, value: string, except?: string) {
    for (const nick of channel.members) if (nick !== except) line(server, nick, value);
}
function register(server: IrcServer, c: Client) {
    if (c.registered || !c.passOk || !c.nick || !c.user) return;
    c.registered = true;
    server.clients.delete("@visitor");
    numeric(server, c.nick, 1, c.nick, `Welcome to the IRC network ${c.nick}!${c.user}@localhost`);
    numeric(server, c.nick, 2, c.nick, "Your host is ircserv, running version 1.0");
    numeric(server, c.nick, 3, c.nick, "This server was created 2024");
    numeric(server, c.nick, 4, c.nick, "ircserv 1.0 _ oitkl");
}
function fail(server: IrcServer, c: Client, code: number, arg: string, message: string) {
    numeric(server, c.nick || "*", code, arg, message);
}
function member(server: IrcServer, c: Client, channel: string): Channel | undefined {
    const ch = server.channels.get(channel);
    if (!ch) fail(server, c, 403, channel, "No such channel");
    else if (!ch.members.has(c.nick)) fail(server, c, 442, channel, "You're not on that channel");
    else return ch;
    return undefined;
}

export function command(server: IrcServer, nick: string, raw: string): string[] {
    const c = findClient(server, nick) ?? (nick === "" ? server.clients.get("@visitor") : undefined);
    if (!c) return [];
    c.lines = [];
    const input = raw.trim();
    if (!input) return c.lines;
    const sep = input.indexOf(" :");
    const head = (sep < 0 ? input : input.slice(0, sep)).split(/\s+/);
    const trailing = sep < 0 ? "" : input.slice(sep + 2);
    const cmd = head.shift()!.toUpperCase();
    const args = [...head, ...(sep < 0 ? [] : [trailing])];
    if (!c.passOk && cmd !== "PASS") { fail(server, c, 451, cmd, "Password required"); return c.lines; }
    if (!c.registered && !["PASS", "NICK", "USER", "PING", "QUIT"].includes(cmd)) { fail(server, c, 451, cmd, "Password required"); return c.lines; }
    if (cmd === "PASS") {
        if (!args[0]) fail(server, c, 461, "PASS", "Not enough parameters");
        else if (c.registered) fail(server, c, 462, "PASS", "You are already registered");
        else if (args[0] !== server.secret) fail(server, c, 464, "PASS", "Password incorrect");
        else { c.passOk = true; register(server, c); }
    } else if (cmd === "NICK") {
        const next = args[0];
        if (!next) fail(server, c, 431, "NICK", "No Nickname given");
        else if (!/^[A-Za-z][A-Za-z0-9_-]{0,8}$/.test(next)) fail(server, c, 432, next, "Invalid Nickname");
        else if ([...server.clients.values()].some((x) => x !== c && x.nick.toLowerCase() === next.toLowerCase())) fail(server, c, 433, next, "Nickname is already in use");
        else {
            const old = c.nick;
            c.nick = next;
            server.clients.set(next, c);
            for (const ch of server.channels.values()) {
                if (ch.members.delete(old)) ch.members.add(next);
                if (ch.operators.delete(old)) ch.operators.add(next);
            }
            if (old) for (const ch of server.channels.values()) if (ch.members.has(next)) broadcast(server, ch, `:${old}!${c.user}@localhost NICK :${next}`);
            register(server, c);
        }
    } else if (cmd === "USER") {
        if (!args[0]) fail(server, c, 461, "USER", "not enough parameters");
        else if (c.registered) fail(server, c, 462, "USER", "You may not reregister");
        else { c.user = args[0]; register(server, c); }
    } else if (cmd === "JOIN") {
        const name = args[0];
        if (!name) fail(server, c, 461, "JOIN", "Not enough parameters");
        else {
            let ch = server.channels.get(name);
            if (!ch) { ch = { members: new Set(), operators: new Set(), modes: new Set() }; server.channels.set(name, ch); }
            const key = args[1];
            if (ch.modes.has("i") && !c.invited.has(name)) fail(server, c, 473, name, "Cannot join channel (+i)");
            else if (ch.key && ch.key !== key) fail(server, c, 475, name, "Cannot join channel (+k)");
            else if (ch.limit && ch.members.size >= ch.limit) fail(server, c, 471, name, "Cannot join channel (+l)");
            else {
                const existed = ch.members.size > 0;
                ch.members.add(c.nick); c.invited.delete(name);
                if (!existed) ch.operators.add(c.nick);
                broadcast(server, ch, `:${c.nick}!${c.user}@localhost JOIN :${name}`);
                line(server, c.nick, `:${c.nick}!${c.user}@localhost JOIN :${name}`);
                if (ch.topic) numeric(server, c.nick, 332, `${c.nick} ${name}`, ch.topic);
                else numeric(server, c.nick, 331, `${c.nick} ${name}`, "No topic is set");
                const nicks = [...ch.members].map((n) => `${ch.operators.has(n) ? "@" : ""}${n}`).join(" ");
                numeric(server, c.nick, 353, `${c.nick} = ${name}`, nicks);
                numeric(server, c.nick, 366, `${c.nick} ${name}`, "End of /NAMES list.");
            }
        }
    } else if (["PRIVMSG", "NOTICE"].includes(cmd)) {
        const target = args[0], text = args[1];
        if (!target) { if (cmd === "PRIVMSG") fail(server, c, 411, "", "No recipient given (PRIVMSG)"); }
        else if (!text) { if (cmd === "PRIVMSG") fail(server, c, 412, "", "No text to send"); }
        else if (target.startsWith("#")) {
            const ch = server.channels.get(target);
            if (!ch) { if (cmd === "PRIVMSG") fail(server, c, 403, target, "No Such channel"); }
            else if (!ch.members.has(c.nick)) { if (cmd === "PRIVMSG") fail(server, c, 404, target, "You're not on that channel"); }
            else broadcast(server, ch, `:${c.nick}!${c.user}@localhost ${cmd} ${target} :${text}`, c.nick);
        } else if (server.clients.has(target)) line(server, target, `:${c.nick}!${c.user}@localhost ${cmd} ${target} :${text}`);
        else if (cmd === "PRIVMSG") fail(server, c, 401, target, "No such nick/channel");
    } else if (cmd === "KICK") {
        const [name, target, reason = c.nick] = args; const ch = server.channels.get(name);
        if (!name || !target) fail(server, c, 461, "KICK", "Not enough parameters");
        else if (!ch) fail(server, c, 403, name, "No such channel");
        else if (!ch.operators.has(c.nick)) fail(server, c, 482, name, "You're not channel operator");
        else if (!ch.members.has(target)) fail(server, c, 441, `${target} ${name}`, "They aren't in that channel");
        else {
            const msg = `:${c.nick}!${c.user}@localhost KICK ${name} ${target} :${reason}`;
            broadcast(server, ch, msg); line(server, target, msg); ch.members.delete(target); ch.operators.delete(target);
        }
    } else if (cmd === "INVITE") {
        const [target, name] = args; const ch = server.channels.get(name);
        if (!target || !name) fail(server, c, 461, "INVITE", "Not enough parameters");
        else if (!findClient(server, target)) fail(server, c, 401, target, "No such nick");
        else if (!ch) fail(server, c, 403, name, "No such channel");
        else if (!ch.members.has(c.nick)) fail(server, c, 442, name, "You're not on that channel");
        else if (!ch.operators.has(c.nick)) fail(server, c, 482, name, "You're not channel operator");
        else if (ch.members.has(target)) fail(server, c, 443, `${target} ${name}`, "is already on channel");
        else { findClient(server, target)!.invited.add(name); line(server, target, `:${c.nick}!${c.user}@localhost INVITE ${target} :${name}`); numeric(server, c.nick, 341, `${c.nick} ${target}`, name); }
    } else if (cmd === "PART") {
        const name = args[0], ch = name && member(server, c, name);
        if (!name) fail(server, c, 461, "PART", "Not enough parameters");
        else if (ch) { const msg = `:${c.nick}!${c.user}@localhost PART ${name}`; broadcast(server, ch, msg); line(server, c.nick, msg); ch.members.delete(c.nick); ch.operators.delete(c.nick); }
    } else if (cmd === "TOPIC") {
        const name = args[0], ch = name && member(server, c, name);
        if (!name) fail(server, c, 461, "TOPIC", "Not enough parameters");
        else if (ch && args.length === 1) {
            if (ch.topic) numeric(server, c.nick, 332, `${c.nick} ${name}`, ch.topic);
            else numeric(server, c.nick, 331, `${c.nick} ${name}`, "No topic is set");
        }
        else if (ch && ch.modes.has("t") && !ch.operators.has(c.nick)) fail(server, c, 482, name, "You're not a channel operator");
        else if (ch) { ch.topic = args[1] || undefined; broadcast(server, ch, `:${c.nick}!${c.user}@localhost TOPIC ${name} :${args[1] ?? ""}`); }
    } else if (cmd === "MODE") {
        const [name, spec, value] = args; const ch = server.channels.get(name);
        if (!name || !spec) fail(server, c, 461, "MODE", "Not enough parameters");
        else if (!ch) fail(server, c, 403, name, "No such channel");
        else if (!ch.members.has(c.nick)) fail(server, c, 442, name, "You're not on that channel");
        else if (!ch.operators.has(c.nick)) fail(server, c, 482, name, "You're not a channel operator");
        else {
            let adding = true, arg = 0; const changes: string[] = [];
            for (const flag of spec) {
                if (flag === "+") adding = true;
                else if (flag === "-") adding = false;
                else if ("itkl".includes(flag)) {
                    if (adding) ch.modes.add(flag); else ch.modes.delete(flag);
                    if (flag === "k") { if (adding && value) ch.key = value; else if (!adding) ch.key = undefined; }
                    if (flag === "l") { if (adding && value && Number.isFinite(+value)) ch.limit = +value; else if (!adding) ch.limit = undefined; }
                    changes.push(`${adding ? "+" : "-"}${flag}${["k", "l"].includes(flag) && value ? ` ${value}` : ""}`); if (["k", "l"].includes(flag)) arg++;
                } else if (flag === "o") {
                    const target = value?.split(/\s+/)[arg++];
                    if (target && ch.members.has(target)) { if (adding) ch.operators.add(target); else ch.operators.delete(target); changes.push(`${adding ? "+" : "-"}o ${target}`); }
                }
            }
            if (changes.length) broadcast(server, ch, `:${c.nick}!${c.user}@localhost MODE ${name} ${changes.join(" ")}`);
        }
    } else if (cmd === "QUIT") {
        const msg = `:${c.nick}!${c.user}@localhost QUIT :${args[0] || "Client Quit"}`;
        for (const ch of server.channels.values()) { if (ch.members.has(c.nick)) broadcast(server, ch, msg, c.nick); ch.members.delete(c.nick); ch.operators.delete(c.nick); }
        for (const [key, client] of server.clients) if (client === c) server.clients.delete(key);
    } else fail(server, c, 421, cmd, "Unknown command");
    return c.lines;
}

export function botReply(server: IrcServer, sender: string, text: string): string[] {
    const ch = server.channels.get("#42");
    if (!ch?.members.has(sender)) return [];
    const replies: string[] = [];
    if (/\balice\b/i.test(text)) replies.push("alice: hi there!");
    if (/\bbob\b/i.test(text)) replies.push("bob: hey!");
    if (/\bop me\b/i.test(text) && ch.members.has("alice")) {
        ch.operators.add(sender);
        const mode = ":alice!alice@localhost MODE #42 +o " + sender;
        line(server, sender, mode); broadcast(server, ch, mode, sender);
        replies.push("alice: you're an operator now — try KICK #42 bob");
    }
    for (const reply of replies) {
        const [bot, ...words] = reply.split(" ");
        const message = `:${bot}!${bot}@localhost PRIVMSG #42 :${words.join(" ")}`;
        line(server, sender, message);
        broadcast(server, ch, message, sender);
    }
    return replies;
}

export function botKick(server: IrcServer, target: string): string[] {
    const ch = server.channels.get("#42");
    if (!ch?.members.has(target) || !ch.operators.has("alice")) return [];
    const msg = `:alice!alice@localhost KICK #42 ${target} :Goodbye`;
    line(server, target, msg); broadcast(server, ch, msg); ch.members.delete(target); ch.operators.delete(target);
    return [`${target} was kicked from #42`];
}
