/**
 * A small in-browser copy of Cardano04class/minishell, for the portfolio demo.
 * Messages, exit codes and quirks are copied from the compiled binary (see shell.test.ts).
 * Not a real shell: commands run against an in-memory filesystem, one line at a time.
 */

type Fs = Map<string, { dir: true } | { dir: false; text: string; exec?: boolean }>;
type Redir = { op: "<" | ">" | ">>" | "<<"; target: string; quoted: boolean };
type Cmd = { argv: string[]; redirs: Redir[] };
/** out is stdout (piped / redirected); err always goes to the screen, like stderr. */
type Io = { stdin: string; out: string[]; err: string[] };

export type InputResult = { output: string; prompt: string; exited?: number };

const HOME = "/home/visitor";
const LONG_MAX = BigInt("9223372036854775807");
const LONG_MIN = BigInt("-9223372036854775808");
const COMMANDS = ["ls", "cat", "grep", "wc", "sort", "head", "echo", "pwd"] as const;

function initialFs(): Fs {
    return new Map<string, { dir: true } | { dir: false; text: string; exec?: boolean }>([
        ["/", { dir: true }],
        ["/home", { dir: true }],
        [HOME, { dir: true }],
        [`${HOME}/projects`, { dir: true }],
        ["/tmp", { dir: true }],
        ["/usr/bin", { dir: true }],
        ["/bin", { dir: true }],
        [`${HOME}/about.txt`, { dir: false, text: "Mohamed Amine, software developer from Casablanca.\n" }],
        [`${HOME}/skills.txt`, { dir: false, text: "TypeScript\nReact\nC\nDocker\nNode.js\n" }],
        [`${HOME}/projects/minishell.txt`, { dir: false, text: "A small bash, written in C with a teammate.\n" }],
        ...COMMANDS.map((c) => [`/bin/${c}`, { dir: false, text: "", exec: true }] as const),
    ]);
}

export function createShell() {
    const fs = initialFs();
    const env = new Map([
        ["HOME", HOME],
        ["USER", "visitor"],
        ["PATH", "/usr/bin:/bin"],
        ["PWD", HOME],
    ]);
    const exported = new Set<string>(); // `export NAME` without a value
    let cwd = HOME;
    let oldpwd: string | null = null;
    let status = 0;
    /** A line with `<<` waits here while the visitor types the heredoc bodies, one delimiter at a time. */
    let heredoc: { cmds: Cmd[]; pending: Redir[]; lines: string[]; bodies: string[] } | null = null;

    const abs = (p: string) => {
        const parts = (p.startsWith("/") ? p : `${cwd}/${p}`).split("/");
        const out: string[] = [];
        for (const part of parts) {
            if (part === "..") out.pop();
            else if (part && part !== ".") out.push(part);
        }
        return `/${out.join("/")}`;
    };

    // ---- lexer + parser (the binary's grammar: words, quotes, | < > >> <<) ----
    function parse(line: string): Cmd[] | { error: string } {
        type Tok = { word: string; quoted: boolean } | { op: "|" | Redir["op"] };
        const toks: Tok[] = [];
        let i = 0;
        while (i < line.length) {
            const c = line[i];
            if (c === " " || c === "\t") { i++; continue; }
            if (c === "|" ) { toks.push({ op: "|" }); i++; continue; }
            if (c === "<" || c === ">") {
                const op = c === "<" ? (line[i + 1] === c ? "<<" : "<") : line[i + 1] === c ? ">>" : ">";
                toks.push({ op });
                i += op.length;
                continue;
            }
            let word = "";
            let quoted = false;
            while (i < line.length && !" \t|<>".includes(line[i])) {
                const q = line[i];
                if (q === "'" || q === '"') {
                    const end = line.indexOf(q, i + 1);
                    if (end < 0) return { error: "syntax error: unclosed quotes" };
                    word += q + line.slice(i + 1, end) + q; // kept for expansion, removed later
                    quoted = true;
                    i = end + 1;
                } else word += line[i++];
            }
            toks.push({ word, quoted });
        }
        const cmds: Cmd[] = [{ argv: [], redirs: [] }];
        for (let t = 0; t < toks.length; t++) {
            const tok = toks[t];
            const cur = cmds[cmds.length - 1];
            if ("word" in tok) { cur.argv.push(tok.word); continue; }
            const next = toks[t + 1];
            if (tok.op === "|") {
                if (cur.argv.length === 0 && cur.redirs.length === 0) {
                    return { error: t === 0 ? "syntax error: '|'" : "syntax error near unexpected token " };
                }
                if (!next) return { error: "syntax error: '|'" };
                cmds.push({ argv: [], redirs: [] });
                continue;
            }
            if (!next) return { error: `syntax error: '${tok.op}'` };
            if (!("word" in next)) return { error: "syntax error near unexpected token " };
            cur.redirs.push({ op: tok.op, target: next.word, quoted: next.quoted });
            t++;
        }
        return cmds;
    }

    /** $VAR and $? expansion plus quote removal, the way the binary does it (no word splitting, $"x" keeps the $). */
    function expand(word: string, inHeredoc = false): string {
        let out = "";
        let i = 0;
        let quote: string | null = null;
        while (i < word.length) {
            const c = word[i];
            if (!inHeredoc && (c === "'" || c === '"') && (quote === null || quote === c)) {
                quote = quote ? null : c;
                i++;
                continue;
            }
            if (c === "$" && quote !== "'") {
                if (word[i + 1] === "?") { out += String(status); i += 2; continue; }
                // Copied quirk: $<digit> drops everything after it in the word.
                if (/[0-9]/.test(word[i + 1] ?? "")) break;
                const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(word.slice(i + 1));
                if (m) { out += env.get(m[0]) ?? ""; i += 1 + m[0].length; continue; }
            }
            out += c;
            i++;
        }
        return out;
    }

    // ---- builtins ----
    const validName = (n: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(n);
    type Builtin = (args: string[], io: Io, inPipe: boolean) => number | { exit: number };
    const builtins: Record<string, Builtin> = {
        echo(args, io) {
            let i = 0;
            while (i < args.length && /^-n+$/.test(args[i])) i++;
            io.out.push(args.slice(i).join(" ") + (i > 0 ? "" : "\n"));
            return 0;
        },
        pwd(_a, io) { io.out.push(`${cwd}\n`); return 0; },
        cd(args, io, inPipe) {
            let target: string;
            if (args.length === 0) {
                const home = env.get("HOME");
                if (!home) { io.err.push("cd: HOME not set\n"); return 1; }
                target = home;
            } else if (args[0] === "-") {
                if (!oldpwd) { io.err.push("cd: OLDPWD not set\n"); return 1; }
                target = oldpwd;
                io.out.push(`${oldpwd}\n`);
            } else target = args[0];
            const p = abs(target);
            if (args.length > 1 || !fs.get(p)?.dir) { io.err.push("cd: No such file or directory\n"); return 0; }
            if (!inPipe) { oldpwd = cwd; cwd = p; env.set("OLDPWD", oldpwd); env.set("PWD", cwd); }
            return 0;
        },
        export(args, io, inPipe) {
            if (args.length === 0) {
                const names = [...new Set([...env.keys(), ...exported])].filter((k) => k !== "OLDPWD" && k !== "_").sort();
                for (const k of names) io.out.push(env.has(k) ? `declare -x ${k}="${env.get(k)}"\n` : `declare -x ${k}\n`);
                return 0;
            }
            let code = 0;
            for (const a of args) {
                const m = /^([^=+]*)(\+?=)?([\s\S]*)$/.exec(a)!;
                if (!validName(m[1])) { io.err.push("Invalid Name: Undefined error: 0\n"); code = 1; continue; }
                if (inPipe) continue;
                if (!m[2]) exported.add(m[1]);
                else env.set(m[1], (m[2] === "+=" ? env.get(m[1]) ?? "" : "") + m[3]);
            }
            return code;
        },
        unset(args, _io, inPipe) {
            if (!inPipe) for (const a of args) { env.delete(a); exported.delete(a); }
            return 0;
        },
        env(_a, io) {
            for (const [k, v] of env) if (v !== "" && k !== "PATH") io.out.push(`${k}=${v}\n`);
            return 0;
        },
        exit(args, io, inPipe) {
            if (!inPipe) io.err.push("exit\n");
            if (args.length === 0) return { exit: status };
            const n = args[0];
            if (!/^[+-]?\d{1,19}$/.test(n) || BigInt(n) > LONG_MAX || BigInt(n) < LONG_MIN) {
                io.err.push(`minishell: exit: ${n}: numeric argument required\n`);
                return inPipe ? 2 : { exit: 2 };
            }
            if (args.length > 1) { io.err.push("minishell: exit: too many arguments\n"); return 1; }
            const code = Number(BigInt.asUintN(8, BigInt(n)));
            return inPipe ? code : { exit: code };
        },
    };

    // ---- fake coreutils, only what pipes in the demo need ----
    const lines = (s: string) => (s === "" ? [] : s.replace(/\n$/, "").split("\n"));
    const pad = (n: number) => String(n).padStart(8);
    const readFile = (name: string, io: Io, cmd: string): string | null => {
        const f = fs.get(abs(name));
        if (!f) { io.err.push(`${cmd}: ${name}: No such file or directory\n`); return null; }
        if (f.dir) { io.err.push(`${cmd}: ${name}: Is a directory\n`); return null; }
        return f.text;
    };
    const coreutils: Record<string, (args: string[], io: Io) => number> = {
        ls(args, io) {
            const dir = abs(args[0] ?? ".");
            const entry = fs.get(dir);
            if (!entry) { io.err.push(`ls: ${args[0]}: No such file or directory\n`); return 1; }
            if (!entry.dir) { io.out.push(`${args[0]}\n`); return 0; }
            const names = [...fs.keys()]
                .filter((p) => p !== dir && p.startsWith(dir === "/" ? "/" : `${dir}/`) && !p.slice(dir.length + 1).includes("/"))
                .map((p) => p.slice(p.lastIndexOf("/") + 1))
                .sort();
            if (names.length) io.out.push(names.join("\n") + "\n");
            return 0;
        },
        cat(args, io) {
            if (args.length === 0) { io.out.push(io.stdin); return 0; }
            let code = 0;
            for (const a of args) {
                const t = readFile(a, io, "cat");
                if (t === null) code = 1; else io.out.push(t);
            }
            return code;
        },
        grep(args, io) {
            const flags = args.filter((a) => a.startsWith("-"));
            const [pattern, file] = args.filter((a) => !a.startsWith("-"));
            if (pattern === undefined) { io.err.push("usage: grep pattern [file]\n"); return 2; }
            const text = file === undefined ? io.stdin : readFile(file, io, "grep");
            if (text === null) return 2;
            let re: RegExp;
            const ci = flags.includes("-i") ? "i" : "";
            const literal = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ci);
            // A quantified group like (a+)+ can backtrack for seconds and freeze the tab: match it literally instead.
            if (/\)[*+?{]/.test(pattern)) re = literal;
            else try { re = new RegExp(pattern, ci); } catch { re = literal; }
            const hits = lines(text).filter((l) => re.test(l));
            if (hits.length) io.out.push(hits.join("\n") + "\n");
            return hits.length ? 0 : 1;
        },
        wc(args, io) {
            const flags = args.filter((a) => a.startsWith("-")).join("");
            const file = args.find((a) => !a.startsWith("-"));
            const text = file === undefined ? io.stdin : readFile(file, io, "wc");
            if (text === null) return 1;
            const counts = [
                ["l", lines(text).length],
                ["w", text.split(/\s+/).filter(Boolean).length],
                ["c", new TextEncoder().encode(text).length],
            ] as const;
            const shown = counts.filter(([k]) => !flags || flags.includes(k)).map(([, n]) => pad(n)).join("");
            io.out.push(shown + (file ? ` ${file}` : "") + "\n");
            return 0;
        },
        sort(args, io) {
            const text = args[0] === undefined ? io.stdin : readFile(args[0], io, "sort");
            if (text === null) return 2;
            const l = lines(text).sort();
            if (l.length) io.out.push(l.join("\n") + "\n");
            return 0;
        },
        head(args, io) {
            const n = args[0] === "-n" ? Number(args[1]) || 10 : 10;
            const file = args[0] === "-n" ? args[2] : args[0];
            const text = file === undefined ? io.stdin : readFile(file, io, "head");
            if (text === null) return 1;
            const l = lines(text).slice(0, n);
            if (l.length) io.out.push(l.join("\n") + "\n");
            return 0;
        },
    };

    // ---- execution ----
    function resolve(name: string): string | { error: string; code: number } {
        if (name.includes("/")) {
            const f = fs.get(abs(name));
            if (!f) return { error: `${name}: No such file or directory`, code: 127 };
            if (f.dir) return { error: `${name}: Is a directory`, code: 126 };
            if (!f.exec) return { error: `${name}: Permission denied`, code: 126 };
            return name.slice(name.lastIndexOf("/") + 1);
        }
        const path = env.get("PATH");
        if (!path) return { error: `${name}: No such file or directory`, code: 127 };
        for (const d of path.split(":")) {
            const f = fs.get(`${d}/${name}`);
            if (f && !f.dir && f.exec) return name;
        }
        return { error: `${name}: command not found`, code: 127 };
    }

    /** Applies redirections; returns stdin text and where to write stdout, or an error that ends the session. */
    function redirect(cmd: Cmd, heredocs: string[]): { stdin: string | null; outFile: { path: string; append: boolean } | null } | { fatal: string; code: number } {
        let stdin: string | null = null;
        let outFile: { path: string; append: boolean } | null = null;
        for (const r of cmd.redirs) {
            if (r.op === "<<") { stdin = heredocs.shift() ?? ""; continue; }
            const name = expand(r.target);
            const p = abs(name);
            if (r.op === "<") {
                const f = fs.get(p);
                if (!f || f.dir) return { fatal: "Read-only file system", code: 127 };
                stdin = f.text;
                continue;
            }
            if (name === "") return { fatal: ": No such file or directory", code: 1 };
            if (fs.get(p)?.dir) return { fatal: `${name}: Is a directory`, code: 1 };
            const parent = p.slice(0, p.lastIndexOf("/")) || "/";
            if (!fs.get(parent)?.dir) return { fatal: `${name}: No such file or directory`, code: 1 };
            const prev = fs.get(p);
            fs.set(p, { dir: false, text: r.op === ">>" && prev && !prev.dir ? prev.text : "" });
            outFile = { path: p, append: true };
        }
        return { stdin, outFile };
    }

    function run(cmds: Cmd[], heredocs: string[]): { output: string; exited?: number } {
        const inPipe = cmds.length > 1;
        let stdin = "";
        let screen = "";
        for (const [idx, cmd] of cmds.entries()) {
            const io: Io = { stdin, out: [], err: [] };
            const r = redirect(cmd, heredocs);
            if ("fatal" in r) return { output: screen + r.fatal + "\n", exited: r.code };
            if (r.stdin !== null) io.stdin = r.stdin;
            const argv = cmd.argv.map((w) => expand(w));
            let code = 0;
            let exit: number | undefined;
            const found = argv.length === 0 || Object.hasOwn(builtins, argv[0]) ? argv[0] : resolve(argv[0]);
            if (found === undefined) code = 0;
            else if (typeof found !== "string") { io.err.push(found.error + "\n"); code = found.code; }
            else if (Object.hasOwn(builtins, found)) {
                const res = builtins[found](argv.slice(1), io, inPipe);
                if (typeof res === "number") code = res; else exit = res.exit;
            } else code = coreutils[found](argv.slice(1), io);
            screen += io.err.join("");
            const text = io.out.join("");
            if (r.outFile) {
                const f = fs.get(r.outFile.path);
                // ponytail: 64 KB per file keeps `cat f >> f` loops from eating memory; real cat refuses instead.
                if (f && !f.dir) f.text = (f.text + text).slice(0, 65536);
            } else if (idx === cmds.length - 1) screen += text;
            stdin = r.outFile ? "" : text;
            if (exit !== undefined) return { output: screen, exited: exit };
            if (idx === cmds.length - 1) status = code;
        }
        return { output: screen };
    }

    return {
        input(line: string): InputResult {
            if (heredoc) {
                if (line !== expand(heredoc.pending[0].target)) {
                    heredoc.lines.push(expand(line, true));
                    return { output: "", prompt: ">" };
                }
                heredoc.bodies.push(heredoc.lines.length ? heredoc.lines.join("\n") + "\n" : "");
                heredoc.pending.shift();
                heredoc.lines = [];
                if (heredoc.pending.length) return { output: "", prompt: ">" };
                const { cmds, bodies } = heredoc;
                heredoc = null;
                return { ...run(cmds, bodies), prompt: "minishell$ " };
            }
            if (line.trim() === "") return { output: "", prompt: "minishell$ " };
            const parsed = parse(line);
            if ("error" in parsed) {
                status = 2;
                return { output: parsed.error + "\n", prompt: "minishell$ " };
            }
            const pending = parsed.flatMap((c) => c.redirs.filter((r) => r.op === "<<"));
            if (pending.length) {
                heredoc = { cmds: parsed, pending, lines: [], bodies: [] };
                return { output: "", prompt: ">" };
            }
            return { ...run(parsed, []), prompt: "minishell$ " };
        },
        /** Ctrl-C: drops the current line or heredoc and sets $? to 130, like the binary. */
        interrupt() {
            heredoc = null;
            status = 130;
        },
        complete: (word: string) => [...new Set([...Object.keys(builtins), ...COMMANDS])].filter((c) => c.startsWith(word)),
    };
}
