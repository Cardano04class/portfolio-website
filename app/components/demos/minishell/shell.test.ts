import { test } from "node:test";
import assert from "node:assert/strict";
import { createShell } from "./shell.ts";

/**
 * Every expected string was captured by piping the same lines into the compiled
 * Cardano04class/minishell (env: HOME=/home/visitor USER=visitor PATH=/usr/bin:/bin).
 * The demo copies that binary, quirks included.
 */
function session(...lines: string[]) {
    const sh = createShell();
    let out = "";
    let exited: number | undefined;
    for (const line of lines) {
        if (exited !== undefined) break;
        const r = sh.input(line);
        out += r.output;
        exited = r.exited;
    }
    return { out, exited };
}
const out = (...lines: string[]) => session(...lines).out;

test("echo and -n", () => {
    assert.equal(out("echo hi"), "hi\n");
    assert.equal(out("echo -n hi"), "hi");
    assert.equal(out("echo -nnn -n a b"), "a b");
    assert.equal(out("echo a  b   c"), "a b c\n");
    assert.equal(out('echo ""'), "\n");
    assert.equal(out('echo "" a'), " a\n");
    assert.equal(out("echo a; echo b"), "a; echo b\n");
});

test("quotes and expansion, as the binary does them", () => {
    assert.equal(out('echo "$USER $HOME"'), "visitor /home/visitor\n");
    assert.equal(out("echo '$USER'"), "$USER\n");
    assert.equal(out('echo a"b"c'), "abc\n");
    assert.equal(out(`echo "a'b'c"`), "a'b'c\n");
    assert.equal(out("echo $NOPE."), ".\n");
    assert.equal(out("echo $"), "$\n");
    assert.equal(out("echo $USER$USER"), "visitorvisitor\n");
    assert.equal(out("echo $NOPE x"), " x\n");
    assert.equal(out('echo $"USER"'), "$USER\n");
    assert.equal(out("echo ~"), "~\n");
    assert.equal(out('export A="a   b"', "echo $A"), "a   b\n");
});

test("syntax errors set $? to 2", () => {
    assert.equal(out('echo "unclosed', "echo $?"), "syntax error: unclosed quotes\n2\n");
    assert.equal(out("| ls"), "syntax error: '|'\n");
    assert.equal(out("echo hi |"), "syntax error: '|'\n");
    assert.equal(out("echo >"), "syntax error: '>'\n");
    assert.equal(out("echo hi >> "), "syntax error: '>>'\n");
    assert.equal(out("cat <<"), "syntax error: '<<'\n");
    assert.equal(out("ls | | wc", "echo $?"), "syntax error near unexpected token \n2\n");
});

test("command lookup and exit codes", () => {
    assert.equal(out("nosuchcmd", "echo $?"), "nosuchcmd: command not found\n127\n");
    assert.equal(out("$NOPE", "echo $?"), ": command not found\n127\n");
    assert.equal(out("unset PATH", "ls", "echo $?"), "ls: No such file or directory\n127\n");
    assert.equal(out("./about.txt", "echo $?"), "./about.txt: Permission denied\n126\n");
    assert.equal(out("/tmp", "echo $?"), "/tmp: Is a directory\n126\n");
});

test("exit", () => {
    assert.deepEqual(session("exit 1 2", "echo $?"), { out: "exit\nminishell: exit: too many arguments\n1\n", exited: undefined });
    assert.deepEqual(session("exit abc"), { out: "exit\nminishell: exit: abc: numeric argument required\n", exited: 2 });
    assert.equal(session("exit 300").exited, 44);
    assert.equal(session("exit -1").exited, 255);
    assert.equal(session("exit 9223372036854775808").exited, 2);
    assert.deepEqual(session("echo hi | exit 5", "echo $?"), { out: "5\n", exited: undefined });
});

test("export, env, unset", () => {
    assert.equal(out("export A=1 B", "env | grep A"), "A=1\n");
    assert.equal(out("export A=1 B", "export | grep B"), "declare -x B\n");
    assert.equal(out("export A=1", "export | grep A"), 'declare -x A="1"\ndeclare -x PATH="/usr/bin:/bin"\n');
    assert.equal(out("export A=1", "export A+=2", "echo $A"), "12\n");
    assert.equal(out("export A=", "env | grep A"), "");
    assert.equal(out("export 1A=2", "echo $?"), "Invalid Name: Undefined error: 0\n1\n");
    assert.equal(out("export A=1", "unset A", "echo $A."), ".\n");
    assert.equal(out("unset 1A", "echo $?"), "0\n");
    assert.equal(out("export X=1 | cat", "echo $X."), ".\n");
    assert.equal(out("export"), [
        'declare -x HOME="/home/visitor"',
        'declare -x PATH="/usr/bin:/bin"',
        'declare -x PWD="/home/visitor"',
        'declare -x USER="visitor"',
        "",
    ].join("\n"));
});

test("cd and pwd", () => {
    assert.equal(out("pwd", "cd ..", "pwd", "cd -"), "/home/visitor\n/home\n/home/visitor\n");
    assert.equal(out("cd /nope", "echo $?"), "cd: No such file or directory\n0\n");
    assert.equal(out("cd a b"), "cd: No such file or directory\n");
    assert.equal(out("cd /tmp | cat", "pwd"), "/home/visitor\n");
    assert.equal(out("unset HOME", "cd"), "cd: HOME not set\n");
    assert.equal(out("cd -"), "cd: OLDPWD not set\n");
    assert.equal(out("cd projects", "pwd", "cd", "pwd"), "/home/visitor/projects\n/home/visitor\n");
});

test("redirections", () => {
    assert.equal(out("echo hi > /tmp/o", "cat /tmp/o", "echo more >> /tmp/o", "cat < /tmp/o"), "hi\nhi\nmore\n");
    assert.equal(out("echo a > /tmp/m1 > /tmp/m2", "cat /tmp/m1", "cat /tmp/m2"), "a\n");
    assert.equal(out("> /tmp/x", "echo $?"), "0\n");
    // The binary exits when a redirection fails before a builtin or command.
    assert.deepEqual(session("cat < /nope", "echo $?"), { out: "Read-only file system\n", exited: 127 });
    assert.deepEqual(session("echo > /tmp", "echo $?"), { out: "/tmp: Is a directory\n", exited: 1 });
    assert.deepEqual(session("echo hi > $NOPE", "echo $?"), { out: ": No such file or directory\n", exited: 1 });
});

test("heredoc (expands even when the delimiter is quoted, like the binary)", () => {
    assert.equal(out("cat << EOF", "hello $USER", "EOF"), "hello visitor\n");
    assert.equal(out("cat << 'EOF'", "hello $USER", "EOF"), "hello visitor\n");
    assert.equal(out("<< E cat", "x", "E"), "x\n");
    const sh = createShell();
    assert.equal(sh.input("cat << EOF").prompt, ">");
    sh.interrupt();
    assert.equal(sh.input("echo $?").output, "130\n");
});

test("pipes and the small set of fake commands", () => {
    assert.equal(out("echo a | cat | cat"), "a\n");
    assert.equal(out('echo "hi $USER" | wc -c'), "      11\n");
    // The binary's env skips PATH (export still lists it).
    assert.equal(out("env"), "HOME=/home/visitor\nUSER=visitor\nPWD=/home/visitor\n");
    assert.equal(out("env | wc -l"), "       3\n");
    assert.equal(out("cat nope", "echo $?"), "cat: nope: No such file or directory\n1\n");
    assert.equal(out("ls"), "about.txt\nprojects\nskills.txt\n");
});

test("Ctrl-C at the prompt sets $? to 130", () => {
    const sh = createShell();
    sh.interrupt();
    assert.equal(sh.input("echo $?").output, "130\n");
});

test("Tab completion offers each command once", () => {
    assert.deepEqual(createShell().complete("ech"), ["echo"]);
});

test("errors go to the screen, not into pipes or files (stderr)", () => {
    assert.equal(out("cat nope | wc -l"), "cat: nope: No such file or directory\n       0\n");
    assert.equal(out("nosuch > /tmp/y", "cat /tmp/y"), "nosuch: command not found\n");
});

test("$<digit> drops the rest of the word, like the binary", () => {
    assert.equal(out("echo $1x"), "\n");
    assert.equal(out("echo a$2b"), "a\n");
});

test("fake commands take file arguments", () => {
    assert.equal(out("wc -l skills.txt"), "       5 skills.txt\n");
    assert.equal(out("sort skills.txt"), "C\nDocker\nNode.js\nReact\nTypeScript\n");
    assert.equal(out("head -n 2 skills.txt"), "TypeScript\nReact\n");
    assert.equal(out("ls about.txt"), "about.txt\n");
});

test("names from Object.prototype are just unknown commands", () => {
    assert.equal(out("__proto__", "echo $?"), "__proto__: command not found\n127\n");
    assert.equal(out("valueOf"), "valueOf: command not found\n");
});

test("a pathological grep pattern returns quickly", () => {
    const t0 = Date.now();
    out("echo aaaaaaaaaaaaaaaaaaaaaaaaaaaa! | grep '(a+)+$'");
    assert.ok(Date.now() - t0 < 2000, `${Date.now() - t0} ms`);
});
