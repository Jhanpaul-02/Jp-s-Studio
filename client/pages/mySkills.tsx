import "./mySkills.css";

const skillGroups = [
    {
        name: "Frontend",
        skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"],
    },
    {
        name: "Backend",
        skills: ["Node.js", "Express.js", "REST APIs"],
    },
    {
        name: "Database",
        skills: ["MongoDB", "MySQL"],
    },
    {
        name: "Tools & Workflow",
        skills: ["Git", "GitHub", "VS Code", "Figma", "Postman"],
    },
];

export default function MySkills() {
    return (
        <section className="skills-section" aria-labelledby="skills-title">
            <div className="skills-content">
                <p className="skills-eyebrow">Tech stack</p>
                <h2 id="skills-title">Tools I use to build useful things.</h2>
                <p className="skills-intro">
                    The tools and technologies I use to create clean, functional, and
                    reliable web experiences.
                </p>

                <div className="skill-groups">
                    {skillGroups.map((group) => (
                        <div className="skill-group" key={group.name}>
                            <h3>{group.name}</h3>
                            <ul>
                                {group.skills.map((skill) => (
                                    <li key={skill}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}