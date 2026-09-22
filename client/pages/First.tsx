"use client";

import { Mascot } from "page-mascot";
import "./First.css";

export default function First() {
  return (
    <div className="home-container">
      <div className="left-side">
        <div className="upper">
          <h1 className="upper-left">Hello I am</h1>
          <h1 className="upper-right">Jp Lacsamana</h1>
        </div>
        <div className="lower">
          <h1 className="lower-left">Software</h1>
          <h1 className="lower-right">Developer</h1>
        </div>
        <div className="description">
          <p>
            Im Jp, I create clean, efficient, and functional web solutions that
            bring
          </p>
          <p>
            ideas to life, focusing on intuitive design and seamless performance
          </p>
          <p>across all platforms.</p>
        </div>
        <div className="social-icons">
          <ul>
            <li className="facebook-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" fill="white" />
                <path
                  d="M13.35 17v-4.2h1.4l.2-1.65h-1.6v-1.05c0-.48.13-.8.82-.8h.87V7.82c-.15-.02-.66-.07-1.25-.07-1.24 0-2.09.76-2.09 2.16v1.24h-1.4v1.65h1.4V17h1.65Z"
                  fill="black"
                />
              </svg>
            </li>
            <li aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.6-2.8 5.6-5.5 5.9.4.3.8 1 .8 2v2.9c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
                  fill="black"
                />
              </svg>
            </li>
            <li aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.5 8h4.8v15H.5V8Zm7.8 0h4.6v2.1h.1c.6-1.1 2.2-2.4 4.5-2.4 4.8 0 5.7 3.2 5.7 7.4V23h-4.8v-7c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8V23H8.3V8Z"
                  fill="black"
                />
              </svg>
            </li>
            <li aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm-.2 2A3.3 3.3 0 0 0 4 7.3v9.4A3.3 3.3 0 0 0 7.3 20h9.4a3.3 3.3 0 0 0 3.3-3.3V7.3A3.3 3.3 0 0 0 16.7 4H7.3Zm9.95 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                  fill="black"
                />
              </svg>
            </li>
          </ul>
        </div>
      </div>
      <div className="right-side">
        <div className="image-container">
          <Mascot
            directions="/mascots/jp-directions.webp"
            reactions="/mascots/jp-reactions.webp"
            size={500}
            label="JP portrait mascot"
            className="profile-mascot"
          />
        </div>
      </div>
    </div>
  );
}
