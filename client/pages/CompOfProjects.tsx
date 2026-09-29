
"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "./myProjects";
import "./CompOfProjects.css";

const categories = ["All projects", ...new Set(projects.map((project) => project.category))];

export default function CompOfProjects() {
    const [activeCategory, setActiveCategory] = useState("All projects");
    const visibleProjects = activeCategory === "All projects"
        ? projects
        : projects.filter((project) => project.category === activeCategory);

    return (
        <section className="project-archive" aria-labelledby="project-archive-title">
            <div className="project-archive__inner">
                <header className="project-archive__header">
                    <div>
                        <p className="project-archive__eyebrow">JP&apos;S STUDIO / WORK ARCHIVE</p>
                        <h1 id="project-archive-title">Projects<span>.</span></h1>
                        <p className="project-archive__summary">
                            A collection of digital products, interfaces, and ideas brought to life.
                        </p>
                    </div>
                    <div className="project-archive__count" aria-label={`${projects.length} projects in the archive`}>
                        <strong>{String(projects.length).padStart(2, "0")}</strong>
                        <span>PROJECTS<br />IN THE ARCHIVE</span>
                    </div>
                </header>

                <div className="project-archive__toolbar">
                    <p aria-live="polite">SHOWING {String(visibleProjects.length).padStart(2, "0")} PROJECTS</p>
                    <div className="project-archive__filters" role="group" aria-label="Filter projects by category">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                className={activeCategory === category ? "is-active" : ""}
                                aria-pressed={activeCategory === category}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="project-archive__grid">
                    {visibleProjects.map((project) => (
                        <article className="archive-project" key={project.title}>
                            <Link
                                className="archive-project__link"
                                href={`/projects/${project.number}`}
                                aria-label={`View ${project.title} project`}
                            >
                                <div className={`archive-project__art archive-project__art--${project.accent}`} aria-hidden="true">
                                    <div className="archive-project__window">
                                        <div className="archive-project__window-bar"><i /><i /><i /></div>
                                        <div className="archive-project__window-content">
                                            <span>{project.category}</span>
                                            <strong>{project.title}</strong>
                                            <div className="archive-project__composition"><i /><i /><i /></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <div className="archive-project__details">
                                <p className="archive-project__category">{project.number} / {project.category}</p>
                                <h2>{project.title}</h2>
                                <p className="archive-project__description">{project.description}</p>
                                <ul className="archive-project__stack" aria-label={`${project.title} technology stack`}>
                                    {project.stack.map((tool) => <li key={tool}>{tool}</li>)}
                                </ul>
                                <Link className="archive-project__view-link" href={`/projects/${project.number}`}>
                                    View project <span aria-hidden="true">↗</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}