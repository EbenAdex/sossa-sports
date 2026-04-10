import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function Welcome() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-card" style={{ textAlign: "center" }}>
            <h1>Welcome to SossaMania Sports</h1>
            <p className="page-intro">
              SossaMania is the official platform for fixtures, results, standings,
              rankings, medal tables, live match updates, and team information across
              faculty and departmental competitions.
            </p>

            <div className="homepage-hero__actions" style={{ justifyContent: "center" }}>
              <Link to="/register" className="btn btn--primary">
                Register
              </Link>
              <Link to="/login" className="btn btn--outline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Welcome;