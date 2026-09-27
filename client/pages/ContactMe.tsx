
'use client';

import { useState, type FormEvent } from 'react';
import './ContactMe.css';

const contactEmail = 'hello@jpstudios.dev';

export default function ContactMe() {
    const [status, setStatus] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get('name'));
        const email = String(formData.get('email'));
        const subject = String(formData.get('subject'));
        const message = String(formData.get('message'));
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailtoUrl = `mailto:${contactEmail}?${new URLSearchParams({ subject, body })}`;

        window.location.href = mailtoUrl;
        setStatus('Your email app should open with your message ready to send.');
    }

    return (
        <section className="contact-section" id="contact" aria-labelledby="contact-title">
            <div className="contact-copy">
                <p className="contact-eyebrow">Let&apos;s talk</p>
                <h2 id="contact-title">Get in Touch</h2>
                <p className="contact-description">
                    Have an exciting product idea or architectural challenge you&apos;d like to
                    discuss? Drop me a message and let&apos;s construct something incredible
                    together.
                </p>

                <address className="contact-details">
                    <a className="contact-detail" href={`mailto:${contactEmail}`}>
                        <span className="contact-icon" aria-hidden="true">@</span>
                        <span>
                            <span className="contact-detail-label">Email</span>
                            <span className="contact-detail-value">{contactEmail}</span>
                        </span>
                    </a>
                    <a className="contact-detail" href="tel:+639123456789">
                        <span className="contact-icon" aria-hidden="true">↗</span>
                        <span>
                            <span className="contact-detail-label">Phone</span>
                            <span className="contact-detail-value">+63 912 345 6789</span>
                        </span>
                    </a>
                    <div className="contact-detail">
                        <span className="contact-icon" aria-hidden="true">⌖</span>
                        <span>
                            <span className="contact-detail-label">Location</span>
                            <span className="contact-detail-value">Manila, Philippines</span>
                        </span>
                    </div>
                </address>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                    <label>
                        Your Name
                        <input name="name" type="text" placeholder="Your name" autoComplete="name" required />
                    </label>
                    <label>
                        Email Address
                        <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                    </label>
                </div>
                <label>
                    Subject
                    <input name="subject" type="text" placeholder="Project partnership" required />
                </label>
                <label>
                    Your Message
                    <textarea name="message" placeholder="Tell me about your project..." required />
                </label>
                <button className="contact-submit" type="submit">Send Message</button>
                <p className="contact-status" role="status" aria-live="polite">{status}</p>
            </form>
        </section>
    );
}