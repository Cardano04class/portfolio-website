"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import { memo } from "react";
import { projects, projectTagsLine, type Project } from "@/app/data/projects";
import { useProjectNavigation } from "@/app/hooks/use-project-navigation";

type ProjectGridCardProps = {
    project: Project;
    index: number;
    onSelect: (slug: string) => void;
};

const ProjectGridCard = memo(function ProjectGridCard({
    project,
    index,
    onSelect,
}: ProjectGridCardProps) {
    return (
        <article
            className="min-w-0 w-full contain-[layout_paint]"
            style={{
                contentVisibility: "auto",
                containIntrinsicSize: "auto 480px",
            }}
        >
            <button
                type="button"
                onClick={() => onSelect(project.slug)}
                className="group w-full cursor-pointer text-left outline-none ring-foreground/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <div className="relative isolate aspect-16/10 w-full overflow-hidden rounded-sm border border-border bg-muted">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        quality={75}
                        className="object-contain object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 p-2 sm:p-3"
                        priority={index === 0}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 sm:text-[11px]">
                        {project.year}
                    </span>
                    {project.featured ? (
                        <span className="rounded-sm border border-border bg-muted/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/50 sm:text-[10px]">
                            Featured
                        </span>
                    ) : null}
                </div>
                <h2 className="mt-2 font-black uppercase leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl">
                    {project.title}
                </h2>
                <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-foreground/45 sm:text-[11px]">
                    {projectTagsLine(project)}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/55 sm:text-base">
                    {project.description}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/35 sm:text-[11px]">
                    View project details
                </p>
            </button>
        </article>
    );
});

export default function ProjectsPage() {
    const { isNavigating, transitionKey, navigateToProject } = useProjectNavigation();

    return (
        <main className="min-h-screen w-full overflow-x-hidden border-t border-border bg-background text-foreground">
            {isNavigating && (
                <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
                    <motion.div
                        key={transitionKey}
                        className="absolute inset-0 bg-[#0a0a0a]"
                        initial={{ y: "100%" }}
                        animate={{
                            y: ["100%", "0%", "0%"],
                        }}
                        transition={{
                            duration: 1.25,
                            times: [0, 0.24, 1],
                            ease: "easeInOut",
                        }}
                    />
                </div>
            )}

            <section
                className="projects-page-section mx-auto max-w-[1920px] px-5 py-14 sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16 lg:py-24 xl:px-24"
                aria-label="All projects"
            >
                <header className="mb-10 max-w-2xl md:mb-14 lg:mb-16">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/45 sm:text-[11px]">
                            Portfolio
                        </span>
                        <span className="hidden h-px w-8 bg-border sm:block" aria-hidden />
                        <Link
                            href="/"
                            className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/40 transition-colors hover:text-foreground/70 sm:text-[11px]"
                        >
                            Back to home
                        </Link>
                    </div>
                    <h1 className="mt-4 text-3xl font-black uppercase leading-[0.95] tracking-tighter text-foreground sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
                        All Projects
                    </h1>
                    <p className="mt-5 text-sm leading-relaxed text-foreground/55 sm:text-base md:text-lg">
                        Full list of work—same craft as the featured section. Open any card for the full case study.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-12 sm:gap-14 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:gap-x-10 lg:gap-y-16 xl:grid-cols-3">
                    {projects.map((project, index) => (
                        <ProjectGridCard
                            key={project.slug}
                            project={project}
                            index={index}
                            onSelect={navigateToProject}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}
