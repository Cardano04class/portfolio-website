/**
 * Long-form project blurbs keyed by slug.
 * Kept separate from the main project list so detail routing and static generation stay predictable.
 */
export const PROJECT_DESCRIPTIONS: Readonly<Record<string, string>> = {
    "ft_transcendence":
        "A premium-tier Single-Page Pong game arena featuring online matches, matchmaking lobbies, chat systems, and active user metric dashboards.",
    "inception":
        "A secure, multi-container virtualized web server infrastructure built inside Alpine Linux environments using Docker Compose pipelines.",
    "minishell":
        "A feature-complete POSIX-compliant Unix command-line shell built in C, managing pipeline forks, file descriptor trees, and redirections.",
    "push_swap":
        "A highly optimized, mechanical Big-O stack sorting algorithm designed to minimize execution cost parameters via Pivot Partitions.",
};

export function getProjectDescription(slug: string): string | undefined {
    return PROJECT_DESCRIPTIONS[slug];
}
