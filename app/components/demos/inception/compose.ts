/**
 * The Cardano04class/Inception stack as data, and the `make` targets as step lists.
 * Log lines are the echoes from the repo's entrypoints. Values from .env are placeholders,
 * and the WordPress entrypoint's debug echo of the admin password is left out on purpose.
 */

export type ServiceId = "mariadb" | "wordpress" | "nginx";
export type ServiceState = "absent" | "built" | "starting" | "running";
export type Stack = { readonly services: Record<ServiceId, ServiceState>; readonly network: boolean; readonly data: boolean };

export const SERVICES: readonly { id: ServiceId; image: string; port: string; dependsOn?: ServiceId }[] = [
    { id: "mariadb", image: "bullseye · mariadb", port: "3306" },
    { id: "wordpress", image: "bullseye · php-fpm 7.4", port: "9000", dependsOn: "mariadb" },
    { id: "nginx", image: "bullseye · nginx + TLS", port: "443 → host", dependsOn: "wordpress" },
];

/** One animation step: apply `set` to the stack and print `log`. */
export type Step = { log: string; source: ServiceId | "make" | "compose"; set?: Partial<Stack["services"]>; network?: boolean; data?: boolean };

export const EMPTY: Stack = {
    services: { mariadb: "absent", wordpress: "absent", nginx: "absent" },
    network: false,
    data: false,
};

const BUILD: Step[] = [
    { source: "make", log: "mkdir -p /home/mamir/data/wordpress /home/mamir/data/mariadb", data: true },
    { source: "compose", log: "docker compose -f srcs/docker-compose.yml build" },
    { source: "compose", log: "[+] Building mariadb (FROM debian:bullseye)", set: { mariadb: "built" } },
    { source: "compose", log: "[+] Building wordpress (FROM debian:bullseye)", set: { wordpress: "built" } },
    { source: "compose", log: "[+] Building nginx (FROM debian:bullseye)", set: { nginx: "built" } },
];

// depends_on only orders container start: compose starts all three, then each entrypoint does its own waiting.
const UP: Step[] = [
    { source: "compose", log: "docker compose -f srcs/docker-compose.yml up -d" },
    { source: "compose", log: "Network inception  Created", network: true },
    { source: "compose", log: "Container mariadb  Started", set: { mariadb: "starting" } },
    { source: "compose", log: "Container wordpress  Started", set: { wordpress: "starting" } },
    { source: "compose", log: "Container nginx  Started", set: { nginx: "starting" } },
    { source: "mariadb", log: "Waiting for mysqld to be ready..." },
    { source: "wordpress", log: "Waiting for database at mariadb..." },
    { source: "nginx", log: "Generating SSL certificates..." },
    { source: "nginx", log: "listening on 443 ssl (TLSv1.2 TLSv1.3)", set: { nginx: "running" } },
    { source: "mariadb", log: "mysqld is ready" },
    { source: "mariadb", log: "Creating database and user..." },
    { source: "mariadb", log: "Database and user creation completed", set: { mariadb: "running" } },
    { source: "wordpress", log: "Database ready!" },
    { source: "wordpress", log: "Downloading WordPress..." },
    { source: "wordpress", log: "✓ WordPress installation completed successfully", set: { wordpress: "running" } },
];

const DOWN: Step[] = [
    { source: "compose", log: "docker compose -f srcs/docker-compose.yml down" },
    { source: "compose", log: "Container nginx  Removed", set: { nginx: "built" } },
    { source: "compose", log: "Container wordpress  Removed", set: { wordpress: "built" } },
    { source: "compose", log: "Container mariadb  Removed", set: { mariadb: "built" } },
    { source: "compose", log: "Network inception  Removed", network: false },
];

const PRUNE: Step[] = [
    { source: "compose", log: "docker system prune -a --force", set: { mariadb: "absent", wordpress: "absent", nginx: "absent" } },
    { source: "make", log: "sudo rm -rf /home/mamir/data/wordpress/* /home/mamir/data/mariadb/*", data: false },
];

export type Target = "make" | "make down" | "make re";

/** Steps a Makefile target runs from the current state. `make` is all = setup + build + up, `make re` is fclean + all. */
export function stepsFor(target: Target, stack: Stack): Step[] {
    const anyUp = stack.network || Object.values(stack.services).some((s) => s !== "absent" && s !== "built");
    const down = anyUp ? DOWN : [{ source: "compose" as const, log: "Nothing to stop." }];
    if (target === "make down") return down;
    if (target === "make re") return [...(anyUp ? DOWN : []), ...PRUNE, ...BUILD, ...UP];
    // Re-running `make` on a running stack: build is cached and up finds everything running.
    if (anyUp) {
        return [
            ...BUILD.slice(0, 2),
            { source: "compose", log: "docker compose -f srcs/docker-compose.yml up -d" },
            ...SERVICES.map((s) => ({ source: "compose" as const, log: `Container ${s.id}  Running` })),
        ];
    }
    return [...BUILD, ...UP];
}

export function apply(stack: Stack, step: Step): Stack {
    return {
        services: step.set ? { ...stack.services, ...step.set } : stack.services,
        network: step.network ?? stack.network,
        data: step.data ?? stack.data,
    };
}

/** The path of an HTTPS request, hop by hop; fails at the first container that is not running. */
export type Hop = { from: string; to: ServiceId; label: string };
export const REQUEST: readonly Hop[] = [
    { from: "browser", to: "nginx", label: "GET / over HTTPS :443 (TLS 1.2/1.3)" },
    { from: "nginx", to: "wordpress", label: "fastcgi_pass wordpress:9000" },
    { from: "wordpress", to: "mariadb", label: "SQL query to mariadb:3306" },
];

export function request(stack: Stack): { hops: Hop[]; ok: boolean; log: string } {
    const hops: Hop[] = [];
    for (const hop of REQUEST) {
        if (stack.services[hop.to] !== "running") {
            const log =
                hop.to === "nginx"
                    ? "curl: (7) Failed to connect to mamir.42.fr port 443: Connection refused"
                    : hop.to === "wordpress"
                      ? "502 Bad Gateway (nginx): php-fpm at wordpress:9000 is not running"
                      : "Error establishing a database connection (WordPress)";
            return { hops, ok: false, log };
        }
        hops.push(hop);
    }
    return { hops, ok: true, log: "200 OK: WordPress page served through nginx → php-fpm → mariadb" };
}
