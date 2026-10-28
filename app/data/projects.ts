import type { StaticImageData } from "next/image";
import clubshubLanding from "@/src/projects/clubshub/landing.webp";
import clubshubDashboard from "@/src/projects/clubshub/dashboard.webp";
import clubshubUpcoming from "@/src/projects/clubshub/upcoming-events.webp";
import clubshubCalendar from "@/src/projects/clubshub/event-calendar.webp";
import clubshubEvents from "@/src/projects/clubshub/events-management.webp";
import clubshubUsers from "@/src/projects/clubshub/user-management.webp";
import clubshubClubs from "@/src/projects/clubshub/club-selection.webp";
import inceptionCover from "@/src/projects/inception/cover.webp";
import minishellCover from "@/src/projects/minishell/cover.webp";
import pushSwapCover from "@/src/projects/push_swap/cover.webp";

/** Interactive preview on the project page; one lazily-loaded chunk per id (app/components/demos). */
export type DemoId = "push_swap" | "minishell" | "inception";

export type ProjectScreenshot = { image: StaticImageData; caption: string };

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
    image: StaticImageData;
    /** Shown as a gallery on the detail page, after the description. */
    screenshots?: readonly ProjectScreenshot[];
    demo?: DemoId;
};

export const projects: readonly Project[] = [
    {
        slug: "clubshub",
        title: "ClubsHub",
        description:
            "ClubsHub is a platform for 1337 clubs to manage their activities and share events with students. It makes it easier for students to discover events, stay informed, and get involved with different clubs.\n\nVisitors can browse events, upcoming activities and the event calendar, and ask the chatbot questions. Club presidents manage their club's members, events and details. Club members handle tasks according to the role and permissions they are given. 1337 staff manage clubs, events and users across the whole platform.\n\nI worked as DevOps engineer and on continuous testing in a team of five. I also built the 42 Intra OAuth sign-in, the sign-up, sign-in and logout flow, and the Arabic, English and French translations of the app.",
        role: "DevOps Engineer & Continuous Testing (team of 5)",
        highlights: [
            "Available in Arabic, English and French, with light and dark mode.",
            "Role and permission management for club members.",
            "Internal chat for club members, and an event calendar for upcoming activities.",
            "Students can join and take part in several clubs at once.",
            "Sign-in with 42 Intra OAuth and two-factor authentication.",
            "Runs in Docker Compose behind an NGINX reverse proxy with TLS.",
        ],
        tech: ["TypeScript", "React", "Node.js", "Express", "Socket.IO", "MongoDB", "Redis", "Docker", "NGINX"],
        github: "https://github.com/Cardano04class/ft_transcendence",
        featured: true,
        year: "2026",
        image: clubshubLanding,
        screenshots: [
            { image: clubshubDashboard, caption: "Staff dashboard: events and clubs across all 1337 campuses" },
            { image: clubshubUpcoming, caption: "Upcoming events, open to visitors" },
            { image: clubshubCalendar, caption: "Event calendar" },
            { image: clubshubEvents, caption: "Events management" },
            { image: clubshubUsers, caption: "Users management and club president roles" },
            { image: clubshubClubs, caption: "Club selection for members of several clubs" },
        ],
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
        demo: "inception",
        featured: true,
        year: "2025",
        image: inceptionCover,
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
        demo: "minishell",
        featured: true,
        year: "2024",
        image: minishellCover,
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
        demo: "push_swap",
        featured: false,
        year: "2024",
        image: pushSwapCover,
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
