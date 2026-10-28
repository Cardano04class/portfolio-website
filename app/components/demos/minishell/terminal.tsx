"use client";

import { useEffect, useRef, useState } from "react";
import { createShell } from "./shell";

const PROMPT = "minishell$ ";
const EXAMPLES = [
    'echo "hi $USER" | wc -c',
    "cat skills.txt | grep -i c | sort",
    "export A=42",
    "echo $A > /tmp/a",
    "cat << EOF",
    'echo "unclosed',
    "echo $?",
    "exit",
] as const;

type Line = { kind: "in" | "out"; prompt?: string; text: string };

export default function MinishellTerminal() {
    const shellRef = useRef<ReturnType<typeof createShell> | null>(null);
    const shell = () => shellRef.current ?? (shellRef.current = createShell());
    const [lines, setLines] = useState<Line[]>([
        { kind: "out", text: "Cardano04class/minishell, rebuilt for the browser. Try the commands below, or type your own.\n" },
    ]);
    const [prompt, setPrompt] = useState(PROMPT);
    const [value, setValue] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    function submit(line: string) {
        const r = shell().input(line);
        const next: Line[] = [{ kind: "in", prompt, text: line }];
        if (r.output) next.push({ kind: "out", text: r.output });
        if (r.exited !== undefined) {
            shellRef.current = createShell();
            next.push({ kind: "out", text: `[process exited with status ${r.exited}; new session]\n` });
            setPrompt(PROMPT);
        } else setPrompt(r.prompt);
        setLines((l) => [...l, ...next].slice(-200));
        if (line.trim() && prompt === PROMPT) setHistory((h) => [...h.filter((x) => x !== line), line].slice(-50));
        setCursor(null);
        setValue("");
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            submit(value);
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            if (!history.length) return;
            const i = e.key === "ArrowUp" ? Math.max(0, (cursor ?? history.length) - 1) : Math.min(history.length, (cursor ?? history.length) + 1);
            setCursor(i);
            setValue(history[i] ?? "");
        } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
            e.preventDefault();
            shell().interrupt();
            setLines((l) => [...l, { kind: "in" as const, prompt, text: `${value}^C` }].slice(-200));
            setPrompt(PROMPT);
            setValue("");
        } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            setLines([]);
        } else if (e.key === "Tab") {
            e.preventDefault();
            const word = value.split(" ").pop() ?? "";
            const hits = shell().complete(word);
            if (word && hits.length === 1) setValue(value.slice(0, value.length - word.length) + hits[0] + " ");
        } else if (e.key === "Escape") {
            inputRef.current?.blur();
        }
    }

    return (
        <div className="grid">
            <div
                ref={scrollRef}
                onClick={() => inputRef.current?.focus()}
                role="log"
                aria-label="Terminal output"
                className="h-[340px] cursor-text overflow-y-auto bg-[#0b0e14] px-4 py-3 font-mono text-[13px] leading-relaxed text-[#d8dee9] sm:h-[380px]"
            >
                {lines.map((l, i) =>
                    l.kind === "in" ? (
                        <div key={i} className="whitespace-pre-wrap break-all">
                            <span className={l.prompt === PROMPT ? "text-[#28c840]" : "text-[#febc2e]"}>{l.prompt}</span>
                            {l.text}
                        </div>
                    ) : (
                        <div key={i} className="whitespace-pre-wrap break-all text-[#aeb6c4]">
                            {l.text}
                        </div>
                    ),
                )}
                <label className="flex items-center">
                    <span className={prompt === PROMPT ? "text-[#28c840]" : "text-[#febc2e]"}>{prompt}</span>
                    <span className="sr-only">Command</span>
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={onKeyDown}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        enterKeyHint="send"
                        className="min-w-0 flex-1 bg-transparent text-base text-[#d8dee9] caret-[#28c840] outline-none sm:text-[13px]"
                    />
                </label>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-border p-3" role="group" aria-label="Example commands">
                {EXAMPLES.map((cmd) => (
                    <button
                        key={cmd}
                        type="button"
                        onClick={() => {
                            submit(cmd);
                            inputRef.current?.focus({ preventScroll: true });
                        }}
                        className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-foreground/80 transition-colors hover:border-[#28c840]/60 hover:text-foreground"
                    >
                        {cmd}
                    </button>
                ))}
            </div>
        </div>
    );
}
