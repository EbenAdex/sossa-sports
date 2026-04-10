import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function GalleryDetails() {
  const { id } = useParams();
  const { gallery = [] } = useAppData();

  const item = useMemo(() => {
    return gallery.find((entry) => String(entry.id) === String(id));
  }, [gallery, id]);

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="container">
            <div className="page-card">
              <h2>Gallery item not found.</h2>
              <Link to="/gallery" className="btn btn--primary">
                Back to Gallery
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <p className="gallery-details__category">{item.category || "General"}</p>
            <h1>{item.title}</h1>
            <p className="page-intro">
              Full gallery preview and event write-up.
            </p>
          </div>

          <div className="page-card gallery-details-card">
            <img
              src={item.image}
              alt={item.title}
              className="gallery-details__image"
            />

            <div className="gallery-details__content">
              <h3>{item.title}</h3>
              <p>{item.description || "No description available."}</p>

              <Link to="/gallery" className="btn btn--outline">
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default GalleryDetails;