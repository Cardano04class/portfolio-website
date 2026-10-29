/** IPv4 helpers for the NetPractice demo: masks in dotted or /CIDR form, network checks, routes. */

export const toInt = (ip: string): number | null => {
    const parts = ip.trim().split(".");
    if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
    return parts.reduce((acc, p) => acc * 256 + Number(p), 0);
};
export const toIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

/** Accepts "255.255.255.128" or "/25"; returns the prefix length, or null if it is not a valid mask. */
export function prefixOf(mask: string): number | null {
    const m = mask.trim();
    if (/^\/\d{1,2}$/.test(m)) {
        const p = Number(m.slice(1));
        return p <= 32 ? p : null;
    }
    const n = toInt(m);
    if (n === null) return null;
    const bits = n.toString(2).padStart(32, "0");
    return /^1*0*$/.test(bits) ? bits.indexOf("0") === -1 ? 32 : bits.indexOf("0") : null;
}

export const maskOf = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
export const network = (ip: number, prefix: number) => (ip & maskOf(prefix)) >>> 0;
export const broadcast = (ip: number, prefix: number) => (network(ip, prefix) | (~maskOf(prefix) >>> 0)) >>> 0;

/** A usable host address: not the network or broadcast address (except /31 and /32 point-to-point). */
export function isHost(ip: number, prefix: number): boolean {
    if (prefix >= 31) return true;
    return ip !== network(ip, prefix) && ip !== broadcast(ip, prefix);
}

export const sameNet = (a: number, b: number, prefix: number) => network(a, prefix) === network(b, prefix);

/** Parses a route destination: "default", "0.0.0.0/0" or "a.b.c.d/p". */
export function parseRoute(dest: string): { net: number; prefix: number } | null {
    const d = dest.trim();
    if (d === "default" || d === "0.0.0.0/0") return { net: 0, prefix: 0 };
    const [ip, p] = d.split("/");
    const n = toInt(ip ?? "");
    const prefix = Number(p);
    if (n === null || !/^\d{1,2}$/.test(p ?? "") || prefix > 32) return null;
    return network(n, prefix) === n ? { net: n, prefix } : null;
}

/** Reserved ranges NetPractice rejects on hosts: 127/8 loopback and 0/8, 224/3 multicast and above. */
export function isReserved(ip: number): boolean {
    const first = ip >>> 24;
    return first === 0 || first === 127 || first >= 224;
}
