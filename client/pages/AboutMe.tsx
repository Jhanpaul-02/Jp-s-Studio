

import Image from 'next/image';
import './AboutMe.css';

const highlights = [
    { value: '5+', label: 'Years of Coding' },
    { value: '40+', label: 'Completed Projects' },
    { value: '100%', label: 'Happy Clients' },
];

export default function AboutMe() {
    return (
        <section className="about-section" id="about" aria-labelledby="about-title">
            <div className="about-portrait">
                <Image
                    src="/jp-portrait.png"
                    alt="Illustrated portrait of Jhan Paul"
                    fill
                    sizes="(max-width: 760px) 90vw, 42vw"
                    className="about-portrait-image"
                />
            </div>

            <div className="about-content">
                <p className="about-eyebrow">Who I am</p>
                <h2 id="about-title">About Me</h2>
                <p className="about-description">
                    I&apos;m a full-stack developer who enjoys building thoughtful, reliable web
                    experiences. I work across React, Next.js, and TypeScript, with an eye for
                    clean interfaces, maintainable code, and the details that make products feel
                    finished.
                </p>

                <dl className="about-highlights">
                    {highlights.map((highlight) => (
                        <div className="about-highlight" key={highlight.label}>
                            <dt>{highlight.value}</dt>
                            <dd>{highlight.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}