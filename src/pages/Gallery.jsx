import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function Gallery() {
  const { gallery = [] } = useAppData();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(gallery.map((item) => item.category).filter(Boolean)),
    ];
    return ["All", ...uniqueCategories];
  }, [gallery]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return gallery;
    return gallery.filter((item) => item.category === activeCategory);
  }, [gallery, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Gallery</h1>
            <p className="page-intro">
              Explore memorable moments from competitions, ceremonies, and major sports events.
            </p>
          </div>

          <div className="page-card">
            <div className="sport-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? "sport-filter active" : "sport-filter"}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="gallery-grid">
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <Link
                    to={`/gallery/${item.id}`}
                    className="gallery-card"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="gallery-card__image"
                    />
                    <div className="gallery-card__content">
                      <h3>{item.title}</h3>
                      <p className="gallery-card__category">{item.category}</p>
                      <p className="gallery-card__description">
                        {item.description || "No description available."}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="homepage-empty">No gallery items available yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Gallery;