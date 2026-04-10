import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__wrapper">
        <div className="footer__brand">
          <h3>SossaMania Sports</h3>
          <p>
            The official sports competition platform for fixtures, results, live
            updates, teams, standings, rankings, medal tables, and competition
            information.
          </p>
        </div>

        <div className="footer__links">
          <div>
            <h4>Platform</h4>
            <Link to="/home">Home</Link>
            <Link to="/fixtures">Fixtures</Link>
            <Link to="/results">Results</Link>
            <Link to="/table">Table</Link>
          </div>

          <div>
            <h4>Community</h4>
            <Link to="/teams">Teams</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div>
            <h4>SossaMania Socials</h4>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="footer__social"
            >
              <span>📸</span>
              <span>Instagram</span>
            </a>

            <a
              href="https://tiktok.com/"
              target="_blank"
              rel="noreferrer"
              className="footer__social"
            >
              <span>🎵</span>
              <span>TikTok</span>
            </a>

            <a href="mailto:sossamania@gmail.com" className="footer__social">
              <span>✉️</span>
              <span>sossamania@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>©️ 2026 SossaMania Sports. All rights reserved.</p>
        <p className="footer__stamp">
          Designed and developed by <Link to="/about-developer">EbenAdex</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;