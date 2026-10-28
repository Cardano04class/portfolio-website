import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/app/data/projects";
import ProjectDescriptionPage from "./project-description-page";

type ProjectPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
    return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    const project = getProjectBySlug((await params).slug);
    if (!project) return {};
    return {
        title: `${project.title} | Mohamed Amine`,
        description: project.description,
        openGraph: { images: project.image },
        twitter: { images: [project.image] },
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    return <ProjectDescriptionPage project={project} />;
}
