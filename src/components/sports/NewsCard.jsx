import { Link } from "react-router-dom";

function NewsCard({ item }) {
  const previewText =
    item.summary || item.content || item.excerpt || "No summary available.";

  return (
    <Link to={`/news/${item.id}`} className="news-card">
      {item.image && (
        <img
          src={item.image}
          alt={item.title || "News"}
          className="news-card__image"
        />
      )}

      <div className="news-card__content">
        <p className="news-card__category">{item.category || "General"}</p>
        <h3>{item.title || "Untitled News"}</h3>
        <p>{previewText}</p>
      </div>
    </Link>
  );
}

export default NewsCard;