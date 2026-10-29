"use client";

import { useEffect, useRef, useState } from "react";
import { botKick, botReply, command, createServer, type IrcServer } from "./server";
import type { DemoProps } from "../project-demo";

const CHIPS = ["PASS secretpass", "NICK you", "USER you 0 * :You", "JOIN #42", "PRIVMSG #42 :hi alice", "PRIVMSG #42 :op me", "KICK #42 bob"];
const prompt = "you@ircserv » ";

export default function FtIrcDemo({ active }: DemoProps) {
    const ref = useRef<IrcServer | null>(null);
    if (ref.current === null) ref.current = createServer();
    const server = ref.current;
    const [lines, setLines] = useState<string[]>([":ircserv NOTICE * :Connect with PASS, NICK and USER to get started."]);
    const [chat, setChat] = useState<{ nick: string; text: string }[]>([
        { nick: "alice", text: "Welcome to #42!" }, { nick: "bob", text: "Say hi, or ask Alice to op you." },
    ]);
    const [input, setInput] = useState("");
    const [nick, setNick] = useState("");
    const [members, setMembers] = useState(["@alice", "bob"]);
    const scroll = useRef<HTMLDivElement>(null);
    useEffect(() => { if (active && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [active, lines, chat]);

    function submit(raw: string) {
        const value = raw.trim(); if (!value) return;
        const nextRaw = command(server, nick, value);
        const renamed = value.match(/^NICK\s+(\S+)/i)?.[1];
        const nextNick = renamed && server.clients.has(renamed) ? renamed : nick;
        const after = server.clients.get(nextNick);
        const allLines = [...lines, `${prompt}${value}`, ...(value.toUpperCase().startsWith("NICK ") ? [] : nextRaw.map((l) => `S: ${l}`))];
        const effects: { nick: string; text: string }[] = [];
        const msg = value.match(/^PRIVMSG\s+(#\S+)\s+:(.*)$/i);
        const join = value.match(/^JOIN\s+(#\S+)/i);
        if (msg && after && server.channels.get(msg[1])?.members.has(nextNick)) {
            effects.push({ nick: nextNick, text: msg[2] });
            const oldBotLines = new Map(["alice", "bob"].map((bot) => [bot, [...(server.clients.get(bot)?.lines ?? [])]]));
            const botLines = botReply(server, nextNick, msg[2]);
            const sender = server.clients.get(nextNick);
            for (const l of sender?.lines ?? []) allLines.push(`S: ${l}`);
            if (sender) sender.lines = [];
            for (const botText of botLines) {
                const [bot, ...words] = botText.split(" ");
                effects.push({ nick: bot.replace(":", ""), text: words.join(" ") });
            }
            for (const bot of ["alice", "bob"]) {
                const c = server.clients.get(bot);
                for (const l of c?.lines.slice(oldBotLines.get(bot)!.length) ?? []) allLines.push(`S: ${l}`);
                if (c) c.lines = [];
            }
        }
        if (join && nextRaw.some((l) => l.includes(" 366 "))) effects.push({ nick: "", text: `— ${nextNick} joined #42 —` });
        if (/^KICK\s+#42\s+alice\b/i.test(value)) {
            for (const text of botKick(server, "alice")) effects.push({ nick: "", text: `— ${text} —` });
        }
        if (/^KICK\s+#42\s+bob/i.test(value) && nextRaw.some((l) => l.includes(" KICK #42 bob "))) effects.push({ nick: "", text: "— bob was kicked from #42 —" });
        const ch = server.channels.get("#42");
        if (ch) setMembers([...ch.members].map((n) => `${ch.operators.has(n) ? "@" : ""}${n}`));
        if (after?.registered || renamed) setNick(nextNick);
        if (renamed) setLines((old) => [...old, `${prompt}${value}`].slice(-160));
        setChat((old) => [...old, ...effects].slice(-80));
        if (!renamed) setLines(allLines.slice(-160)); setInput("");
    }

    return <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        <section className="min-w-0 border-b border-border lg:border-r lg:border-b-0" aria-label="IRC channel">
            <header className="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
                <span>#42 <span className="text-foreground/60">· {members.length} members</span></span><span>{members.join("  ")}</span>
            </header>
            <div className="h-[280px] overflow-y-auto px-3 py-3 sm:h-[320px]" role="log" aria-label="#42 chat messages">
                {chat.map((m, i) => m.nick ? <p key={i} className="mb-2 break-words font-mono text-xs leading-relaxed"><span className={m.nick === "you" ? "text-[#28c840]" : "text-[#febc2e]"}>{m.nick}</span><span className="text-muted-foreground">: </span><span>{m.text}</span></p> : <p key={i} className="my-3 text-center font-mono text-[10px] text-muted-foreground">{m.text}</p>)}
            </div>
        </section>
        <section className="min-w-0" aria-label="Raw IRC protocol">
            <header className="border-b border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">RAW PROTOCOL · TCP</header>
            <div ref={scroll} className="h-[280px] overflow-y-auto bg-[#0b0e14] px-3 py-3 font-mono text-[11px] leading-relaxed text-[#d8dee9] sm:h-[320px]" role="log" aria-label="Server messages">
                {lines.map((l, i) => <div key={i} className="break-all text-[#aeb6c4]">{l}</div>)}
                <label className="flex items-center"><span className="shrink-0 text-[#28c840]">{nick ? `${nick}@ircserv » ` : "ircserv » "}</span><span className="sr-only">IRC command</span><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(input); } }} spellCheck={false} autoCapitalize="off" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base text-[#d8dee9] caret-[#28c840] outline-none sm:text-[11px]" /></label>
            </div>
        </section>
        <div className="flex flex-wrap gap-1.5 border-t border-border p-3 lg:col-span-2" role="group" aria-label="Example IRC commands">{CHIPS.map((cmd) => <button key={cmd} type="button" onClick={() => submit(cmd)} className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-foreground/80 transition-colors hover:border-[#28c840]/60 hover:text-foreground">{cmd}</button>)}</div>
    </div>;
}
