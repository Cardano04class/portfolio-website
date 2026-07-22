import { PROJECT_DESCRIPTIONS } from "./project-descriptions";

export type Project = {
    slug: string;
    title: string;
    role: string;
    description: string;
    highlights: readonly string[];
    tech: readonly string[];
    github: string;
    live: string;
    featured: boolean;
    year: string;
    image: string;
};

type ProjectCore = Omit<Project, "description">;

const projectCoreList: readonly ProjectCore[] = [
    {
        slug: "ft_transcendence",
        title: "ft_transcendence: ClubsHub Ecosystem Platform",
        role: "DevOps Engineer & Continuous Testing",
        highlights: [
            "Engineered full-stack 1337 School club ecosystem with real-time Socket.io communication channels.",
            "Integrated AI-powered RAG chatbot & event content moderation pipelines for automated community support.",
            "Configured robust multi-container Docker & Nginx infrastructure with 42 OAuth, 2FA, and Redis rate-limiting."
        ],
        tech: ["React", "Node.js", "TypeScript", "Socket.io", "MongoDB", "Redis", "Docker", "AI / RAG"],
        github: "https://github.com/Cardano04class/ft_transcendence",
        live: "https://github.com/Cardano04class/ft_transcendence",
        featured: true,
        year: "2025",
        image: "/images/projects/transcendence.png"
    },
    {
        slug: "inception",
        title: "Inception: System Infrastructure Virtualizer",
        role: "System Architect",
        highlights: [
            "Constructed fully sandboxed, modular container environments via Docker Compose structures.",
            "Configured isolated custom system network layers, dynamic volume storage, and root SSL layers.",
            "Orchestrated secure multi-service configurations running WordPress, Nginx, and databases."
        ],
        tech: ["Docker", "Alpine Linux", "Nginx", "TLS", "System Architecture"],
        github: "https://github.com/Cardano04class",
        live: "https://github.com/Cardano04class",
        featured: true,
        year: "2025",
        image: "/images/projects/inception.png"
    },
    {
        slug: "minishell",
        title: "minishell: Custom Command-Line Interpreter",
        role: "Systems Developer",
        highlights: [
            "Engineered a Unix shell execution loop complete with parsing trees and syntax validation.",
            "Managed strict pipe connections, process redirections, file descriptor trees, and signals.",
            "Implemented core POSIX shell builtins with absolute zero memory allocation leaks."
        ],
        tech: ["C", "POSIX", "Unix Systems", "Processes"],
        github: "https://github.com/Cardano04class",
        live: "https://github.com/Cardano04class",
        featured: true,
        year: "2024",
        image: "/images/projects/minishell.png"
    },
    {
        slug: "push_swap",
        title: "push_swap: Complexity Sort Optimizer",
        role: "Algorithms Developer",
        highlights: [
            "Designed mechanical sort cost weighing algorithms optimizing double stack arrays.",
            "Minimized assembly list operations to theoretical limits under strict Big-O constraints.",
            "Engineered efficient pivot chunk partition calculations for maximum performance scaling."
        ],
        tech: ["C", "Algorithms", "Big-O Optimization", "Complexity"],
        github: "https://github.com/Cardano04class",
        live: "https://github.com/Cardano04class",
        featured: false,
        year: "2024",
        image: "/images/projects/push_swap.png"
    }
];

export const projects: readonly Project[] = projectCoreList.map((core) => ({
    ...core,
    description: PROJECT_DESCRIPTIONS[core.slug] ?? ""
}));

export function getProjectBySlug(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug);
}
