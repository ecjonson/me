import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import { ProjectView } from "@/components/ProjectView";

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    return { title: project ? `${project.name} — Evan Jonson` : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    if (!project) notFound();
    return <ProjectView project={project} />;
}