"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from '../app/pdfFile/logo.png'
import "./navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`site-navbar${isMenuOpen ? " menu-open" : ""}`}>
      <div className="logo-title">
        <Image src={Logo} alt="JP Studios" width={50} height={50} />
        <h2>Jp&apos;s Studio</h2>
      </div>

      <button
        className="nav-menu-toggle"
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="nav-mobile-content" id="primary-navigation">
        <ul>
          <li>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>About Me</Link>
          </li>
          <li>
            <Link href="/skills" onClick={() => setIsMenuOpen(false)}>Skills</Link>
          </li>
          <li>
            <Link href="/projects" onClick={() => setIsMenuOpen(false)}>Projects</Link>
          </li>
          <li>
            <Link href="#contact" onClick={() => setIsMenuOpen(false)}>Contact Me</Link>
          </li>
        </ul>
        <div>
          <a href='/LACSAMANA_JHAN_PAUL.pdf' download="LACSAMANA_JHAN_PAUL.pdf" className="resume-button" target="_blank">
            Resume ↓
          </a>
        </div>
      </div>
    </nav>
  );
}
