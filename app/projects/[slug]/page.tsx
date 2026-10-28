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
    // Child openGraph/twitter objects replace the root ones wholesale, so repeat every field.
    const title = `${project.title} | Mohamed Amine`;
    const description = project.description;
    return {
        title,
        description,
        openGraph: { title, description, images: project.image },
        twitter: { card: "summary_large_image", title, description, images: [project.image] },
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
