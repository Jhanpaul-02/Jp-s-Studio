"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProjects, type Project } from "../lib/projects";
import "./myProjects.css";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        fetchProjects("/api/projects?featured=true")
            .then((projectList) => {
                if (isMounted) setProjects(projectList);
            })
            .catch(() => {
                if (isMounted) setHasError(true);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="projects-section" aria-labelledby="projects-title">
            <div className="projects-shell">
                <div className="projects-header">
                    <p className="projects-eyebrow">Selected work</p>
                    <h2 id="projects-title">My Projects</h2>
                </div>

                {isLoading ? (
                    <p className="projects-state" role="status">Loading projects...</p>
                ) : hasError ? (
                    <p className="projects-state" role="alert">Projects are unavailable right now.</p>
                ) : projects.length === 0 ? (
                    <p className="projects-state">No projects have been published yet.</p>
                ) : (
                    <div className="projects-list">
                    {projects.map((project, index) => (
                        <article
                            key={`${project.title}-${index}`}
                            className={`project-row ${index % 2 === 1 ? "reverse" : ""}`}
                        >
                            <div className="project-preview" aria-hidden="true">
                                {project.thumbnail_url ? (
                                    <div
                                        className="project-thumbnail-image"
                                        style={{ backgroundImage: `url("${project.thumbnail_url}")` }}
                                    />
                                ) : (
                                    <div className="preview-window">
                                        <div className="preview-bar"><i /><i /><i /></div>
                                        <div className="preview-content">
                                            <span className="preview-label">{project.category}</span>
                                            <strong>{project.title}</strong>
                                            <div className="preview-blocks"><i /><i /><i /></div>
                                            <div className="preview-chart"><span /><span /><span /><span /><span /></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="project-info">
                                <span className="project-number">{project.project_number}</span>
                                <h3>{project.title}</h3>
                                <p className="project-description">{project.short_description}</p>
                                <ul className="tech-list">
                                    {project.stack.map((tool) => (
                                        <li key={tool}>{tool}</li>
                                    ))}
                                </ul>

                                <Link href={`/projects/${project.project_number}`} className="project-link" aria-label={`View ${project.title}`}>
                                    ↗
                                </Link>
                            </div>
                        </article>
                    ))}
                    </div>
                )}

                <a href="#projects-title" className="projects-more-button">
                    View all projects <span aria-hidden="true">↗</span>
                </a>
            </div>
        </section>
    );
}