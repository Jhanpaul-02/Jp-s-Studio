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
            Im Jp, I create clean, efficient, and functional web solutions that bring
          </p>
          <p>
            ideas to life, focusing on intuitive design and seamless performance
          </p>
          <p>across all platforms.</p>
        </div>
        <div className="social-icons">
          <ul>
            <li>FB</li>
            <li>IG</li>
            <li>LI</li>
            <li>TT</li>
          </ul>
        </div>
      </div>
      <div className="right-side">
        <div className="image-container">hi</div>
      </div>
    </div>
  );
}
