import Link from "next/link";
import Image from "next/image";
import Logo from '../app/pdfFile/logo.png'
import "./navbar.css"; // import your CSS file

export default function Navbar() {
  return (
    <nav>
      {/* Logo + Title */}
      <div className="logo-title">
        <Image src={Logo} alt="Jp's Studio Logo" width={50} height={50} />
        <h2>Jp's Studio</h2>
      </div>

      {/* Navigation Links */}
      <ul>
        <li>
          <Link href="/about">About Me</Link>
        </li>
        <li>
          <Link href="/skills">Skills</Link>
        </li>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
        <li>
          <Link href="/contact">Contact Me</Link>
        </li>
      </ul>
      <div>
        <a href='/LACSAMANA_JHAN_PAUL.pdf' download="LACSAMANA_JHAN_PAUL.pdf" className="resume-button">
          Resume ⬇
        </a>
      </div>
    </nav>
  );
}
