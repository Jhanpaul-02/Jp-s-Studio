import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "../../../components/navbar";
import Footer from "../../../pages/Footer";
import { projects } from "../../../pages/myProjects";
import "./project-detail.css";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.number }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.number === id);

  return {
    title: project ? `${project.title} | Jp's Studio` : "Project not found | Jp's Studio",
    description: project?.description ?? "Explore projects by Jp's Studio.",
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((item) => item.number === id);

  if (!project) {
    notFound();
  }

  return (
    <>
      <NavBar />
      <main className="project-detail">
        <div className="project-detail__inner">
          <Link className="project-detail__back" href="/projects">
            <span aria-hidden="true">←</span> All projects
          </Link>

          <header className="project-detail__header">
            <p className="project-detail__eyebrow">PROJECT {project.number} / {project.category}</p>
            <h1>{project.title}</h1>
            <p className="project-detail__description">{project.description}</p>
          </header>

          <div className={`project-detail__visual project-detail__visual--${project.accent}`} aria-hidden="true">
            <div className="project-detail__mockup">
              <div className="project-detail__mockup-bar"><i /><i /><i /></div>
              <span>{project.category}</span>
              <strong>{project.title}</strong>
              <div className="project-detail__mockup-blocks"><i /><i /><i /></div>
            </div>
          </div>

          <section className="project-detail__overview" aria-labelledby="project-overview-title">
            <div>
              <p className="project-detail__eyebrow">OVERVIEW</p>
              <h2 id="project-overview-title">About this project</h2>
              <p>{project.description}</p>
            </div>
            <div>
              <p className="project-detail__eyebrow">BUILT WITH</p>
              <ul className="project-detail__stack">
                {project.stack.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}