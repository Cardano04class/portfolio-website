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
import cub3dCover from "@/src/projects/cub3d/cover.webp";
import soLongCover from "@/src/projects/so_long/cover.webp";
import cub3dCorridor from "@/src/projects/cub3d/corridor.webp";
import cub3dRoom from "@/src/projects/cub3d/room.webp";

/** Interactive preview on the project page; one lazily-loaded chunk per id (app/components/demos). */
export type DemoId = "push_swap" | "minishell" | "inception" | "cub3d" | "so_long";

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
    /** GitHub logins of teammates, linked on the project page. */
    team?: readonly string[];
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
        team: ["issam22-laafer", "chikhidev", "MohamedKartit", "mofassa1"],
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
            "A small bash-like shell written in C with mobouifr. It reads a command line, splits it into tokens, parses it, and runs it: pipes, redirections, heredocs, environment variables and the usual builtins.\n\nThe project is mostly about processes and file descriptors: forking, wiring pipes between commands, and cleaning up afterwards.",
        role: "Pair project",
        highlights: [
            "A state-machine lexer that handles single and double quotes and special characters.",
            "Syntax checking, variable expansion, quote removal, and heredocs.",
            "Pipelines run with fork, pipe and dup2, with output and input redirections.",
            "Builtins: cd, echo, env, exit, export and unset.",
        ],
        tech: ["C", "Unix processes", "Pipes", "File descriptors", "Signals"],
        github: "https://github.com/Cardano04class/minishell",
        team: ["mobouifr"],
        demo: "minishell",
        featured: true,
        year: "2024",
        image: minishellCover,
    },
    {
        slug: "cub3d",
        title: "cub3D: a raycaster in C",
        description:
            "A first-person maze in the style of Wolfenstein 3D, written in C with mobouifr on top of the MiniLibX graphics library. Every frame casts one ray per screen column and draws a textured wall slice whose height depends on the distance.\n\nThe map comes from a .cub file that sets the four wall textures, the floor and ceiling colours, and a grid of walls with the player's start. The demo below runs the same algorithm, ported to TypeScript, on the repo's own maps.",
        role: "Pair project",
        highlights: [
            "Ray casting with DDA: one ray per column across a 60° field of view, with the fisheye distortion corrected.",
            "A different texture for each wall face (north, south, east, west), chosen from the ray direction and the side it hits.",
            "A .cub parser that checks the colours, the textures, a single player and walls closing the map.",
            "W A S D to move and the arrow keys to turn, with collision that slides along walls.",
        ],
        tech: ["C", "MiniLibX", "Raycasting", "Linear algebra"],
        github: "https://github.com/Cardano04class/cub3d",
        team: ["mobouifr"],
        featured: false,
        year: "2025",
        image: cub3dCover,
        screenshots: [
            { image: cub3dCorridor, caption: "Long corridor in the repo's bigger map" },
            { image: cub3dRoom, caption: "Textures change with the wall's facing direction" },
        ],
        demo: "cub3d",
    },
    {
        slug: "so_long",
        title: "so_long: a small 2D game",
        description:
            "A top-down 2D game in C with the MiniLibX graphics library: a king walks a brick dungeon, collects every bomb, and leaves through the door. The map comes from a .ber file of walls, floor, bombs, one exit and one start.\n\nBefore the game starts, the map is checked: it must be rectangular, closed by walls, contain exactly one player and one exit and at least one bomb, and a flood fill must reach every bomb and the exit. The demo below runs the same rules, ported to TypeScript, with the game's own sprites and maps.",
        role: "Solo project",
        highlights: [
            "Map validation: rectangular, closed by walls, valid characters, one player, one exit, at least one collectible.",
            "Flood fill from the player to prove every collectible and the exit can be reached.",
            "Tile rendering with MiniLibX: 45-pixel sprites for floor, walls, the player, bombs, and a door that opens once every bomb is collected.",
            "Move counter shown in the window, and keyboard controls with W A S D and the arrow keys.",
        ],
        tech: ["C", "MiniLibX", "Flood fill", "2D rendering"],
        github: "https://github.com/Cardano04class/so_long",
        featured: false,
        year: "2024",
        image: soLongCover,
        demo: "so_long",
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
