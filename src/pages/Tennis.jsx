import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import SportPageContent from "../components/sports/SportPageContent";

function Tennis() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Table Tennis</h1>
            <p className="page-intro">
              View table tennis fixtures, competition progress, live scoring, and
              completed match details.
            </p>
          </div>

          <div className="page-card">
            <SportPageContent sportName="Table Tennis" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Tennis;