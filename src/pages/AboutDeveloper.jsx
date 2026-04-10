import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function AboutDeveloper() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>About the Developer</h1>
            <p className="page-intro">
              Reach EbenAdex for projects, collaborations, and technical inquiries.
            </p>
          </div>

          <div className="page-grid">
            <div className="page-card">
              <h3>Contact Details</h3>
              <p><strong>WhatsApp:</strong> +234XXXXXXXXXX</p>
              <p><strong>Email:</strong> yourmail@example.com</p>
              <p><strong>Instagram:</strong> @yourinstagramhandle</p>
            </div>

            <div className="page-card">
              <h3>Services</h3>
              <p>
                Frontend development, React applications, admin dashboards, UI
                implementation, and web product builds.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AboutDeveloper;