import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function NewsDetails() {
  const { id } = useParams();
  const { news = [] } = useAppData();

  const article = useMemo(() => {
    return news.find((item) => String(item.id) === String(id));
  }, [news, id]);

  if (!article) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="container">
            <div className="page-card">
              <h2>News article not found.</h2>
              <Link to="/news" className="btn btn--primary">
                Back to News
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const fullText =
    article.content || article.summary || article.excerpt || "No article available.";

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <p className="news-details__meta">
              {article.category || "General"} {article.date ? `• ${article.date}` : ""}
            </p>
            <h1>{article.title || "Untitled News"}</h1>
            <p className="page-intro">Full news article and event details.</p>
          </div>

          <div className="page-card news-details-card">
            {article.image && (
              <img
                src={article.image}
                alt={article.title || "News"}
                className="news-details__image"
              />
            )}

            <div className="news-details__content">
              {article.summary && (
                <p className="news-details__summary">{article.summary}</p>
              )}

              <p className="news-details__body">{fullText}</p>

              <Link to="/news" className="btn btn--outline">
                Back to News
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default NewsDetails;