/**
 * Long-form project blurbs keyed by slug.
 * Kept separate from the main project list so detail routing and static generation stay predictable.
 */
export const PROJECT_DESCRIPTIONS: Readonly<Record<string, string>> = {
    "ft_transcendence":
        "ClubsHub is a full-stack web platform built for 1337 School's club ecosystem. It enables students to discover clubs, manage events, communicate in real time via Socket.io, and interact with an AI-assisted RAG chatbot for instant platform information.",
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
