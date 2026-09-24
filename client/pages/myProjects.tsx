import "./myProjects.css";

const projects = [
    {
        title: "Atlas Commerce",
        category: "E-commerce platform",
        number: "01",
        description:
            "A storefront experience designed to make product discovery and checkout feel effortless.",
        stack: ["Next.js", "MongoDB", "Stripe"],
        accent: "commerce",
    },
    {
        title: "Flow Desk",
        category: "Productivity SaaS",
        number: "02",
        description:
            "A focused workspace for teams to organize projects, assign work, and keep momentum visible.",
        stack: ["React", "Node.js", "PostgreSQL"],
        accent: "workspace",
    },
    {
        title: "Signal Studio",
        category: "Creative portfolio",
        number: "03",
        description:
            "A personal brand experience built to make selected work, process, and point of view memorable.",
        stack: ["Figma", "Next.js", "CMS"],
        accent: "studio",
    },
    {
        title: "Pulse Analytics",
        category: "Data visualization",
        number: "04",
        description:
            "A reporting dashboard that turns complex product and customer data into useful decisions.",
        stack: ["TypeScript", "React", "Figma"],
        accent: "analytics",
    },
];

export default function Projects() {
    return (
        <section className="projects-section" aria-labelledby="projects-title">
            <div className="projects-shell">
                <div className="projects-header">
                    <p className="projects-eyebrow">Selected work</p>
                    <h2 id="projects-title">My Projects</h2>
                </div>

                <div className="projects-list">
                    {projects.map((project, index) => (
                        <article
                            key={`${project.title}-${index}`}
                            className={`project-row ${project.accent} ${index % 2 === 1 ? "reverse" : ""}`}
                        >
                            <div className="project-preview" aria-hidden="true">
                                <div className="preview-window">
                                    <div className="preview-bar"><i /><i /><i /></div>
                                    <div className="preview-content">
                                        <span className="preview-label">{project.category}</span>
                                        <strong>{project.title}</strong>
                                        <div className="preview-blocks"><i /><i /><i /></div>
                                        <div className="preview-chart"><span /><span /><span /><span /><span /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="project-info">
                                <span className="project-number">{project.number}</span>
                                <h3>{project.title}</h3>
                                <p className="project-description">{project.description}</p>
                                <ul className="tech-list">
                                    {project.stack.map((tool) => (
                                        <li key={tool}>{tool}</li>
                                    ))}
                                </ul>

                                <a href="#contact" className="project-link" aria-label={`View ${project.title}`}>
                                    ↗
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                <a href="#projects-title" className="projects-more-button">
                    View all projects <span aria-hidden="true">↗</span>
                </a>
            </div>
        </section>
    );
}