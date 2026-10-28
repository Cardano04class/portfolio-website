export type Project = {
    slug: string;
    title: string;
    role: string;
    description: string;
    highlights: readonly string[];
    tech: readonly string[];
    github: string;
    featured: boolean;
    year: string;
    image: string;
};

export const projects: readonly Project[] = [
    {
        slug: "ft_transcendence",
        title: "ft_transcendence: ClubsHub",
        description:
            "ClubsHub is a web platform for 1337 School's student clubs, built by a team of five. Students browse and join clubs, run events, chat in real time, and ask an AI assistant about the platform.\n\nI was responsible for continuous integration and testing, on the DevOps side of the team.",
        role: "DevOps, continuous integration & testing (team of 5)",
        highlights: [
            "Real-time club chat with Socket.IO, and a per-club role and permission system.",
            "Sign-in with 42 Intra OAuth, two-factor auth, and JWT in HttpOnly cookies; Redis handles token blacklisting and rate limiting.",
            "AI assistant using retrieval (Groq LLM, Voyage AI embeddings, ChromaDB), plus AI moderation of event content.",
            "The whole stack runs in Docker Compose behind an NGINX reverse proxy with TLS.",
        ],
        tech: ["TypeScript", "React", "Node.js", "Express", "Socket.IO", "MongoDB", "Redis", "Docker", "NGINX"],
        github: "https://github.com/Cardano04class/ft_transcendence",
        featured: true,
        year: "2026",
        image: "/images/projects/transcendence.png",
    },
    {
        slug: "inception",
        title: "Inception: Docker web infrastructure",
        description:
            "A WordPress site served from three containers I built from scratch with my own Dockerfiles, no prebuilt images: NGINX, WordPress with PHP-FPM, and MariaDB.\n\nDocker Compose wires them together on a private bridge network, and the site's data persists on the host between restarts.",
        role: "Solo project",
        highlights: [
            "Each service has its own Dockerfile, based on Debian Bullseye.",
            "NGINX is the only entry point and accepts HTTPS only.",
            "Containers reach each other by name on a dedicated Docker bridge network.",
            "Database and site files persist through bind mounts; configuration comes from environment variables.",
        ],
        tech: ["Docker", "Docker Compose", "NGINX", "WordPress", "PHP-FPM", "MariaDB", "TLS"],
        github: "https://github.com/Cardano04class/Inception",
        featured: true,
        year: "2025",
        image: "/images/projects/inception.png",
    },
    {
        slug: "minishell",
        title: "minishell: a Unix shell in C",
        description:
            "A small bash-like shell written in C with a teammate. It reads a command line, splits it into tokens, parses it, and runs it: pipes, redirections, heredocs, environment variables and the usual builtins.\n\nThe project is mostly about processes and file descriptors: forking, wiring pipes between commands, and cleaning up afterwards.",
        role: "Pair project",
        highlights: [
            "A state-machine lexer that handles single and double quotes and special characters.",
            "Syntax checking, variable expansion, quote removal, and heredocs.",
            "Pipelines run with fork, pipe and dup2, with output and input redirections.",
            "Builtins: cd, echo, env, exit, export and unset.",
        ],
        tech: ["C", "Unix processes", "Pipes", "File descriptors", "Signals"],
        github: "https://github.com/Cardano04class/minishell",
        featured: true,
        year: "2024",
        image: "/images/projects/minishell.png",
    },
    {
        slug: "push_swap",
        title: "push_swap: sorting with two stacks",
        description:
            "Sort a list of integers using two stacks and a small set of moves (swap, push, rotate, reverse rotate), in as few moves as possible.\n\nMy solution picks, at each step, the number that is cheapest to move into its place in the other stack.",
        role: "Solo project",
        highlights: [
            "For every number, computes how many rotations it costs to bring it and its target position to the top.",
            "Rotates both stacks together when they go the same direction, to save moves.",
            "Handles small inputs with a dedicated sort for three numbers.",
            "Validates input and rejects duplicates and values outside the int range.",
        ],
        tech: ["C", "Algorithms", "Linked lists"],
        github: "https://github.com/Cardano04class/Push_swap",
        featured: false,
        year: "2024",
        image: "/images/projects/push_swap.png",
    },
];

/** Tag line like `[REACT] — [NODE.JS] — [TYPESCRIPT]`; falls back to the year. */
export function projectTagsLine(project: Project): string {
    const tags = project.tech.slice(0, 3).map((t) => `[${t.toUpperCase()}]`);
    return tags.length === 0 ? `[${project.year}]` : tags.join(" — ");
}

export function getProjectBySlug(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug);
}
