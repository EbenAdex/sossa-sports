import { useState } from "react";

function AdminNewsForm({ onAddNews }) {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    summary: "",
    content: "",
    image: "",
    date: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newNews = {
      id: Date.now(),
      category: formData.category.trim(),
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim() || formData.summary.trim(),
      date: formData.date.trim(),
      image:
        formData.image.trim() ||
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=800&q=80",
    };

    onAddNews(newNews);

    setFormData({
      category: "",
      title: "",
      summary: "",
      content: "",
      image: "",
      date: "",
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="title"
          placeholder="News Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="date"
          placeholder="Date (e.g. April 8, 2026)"
          value={formData.date}
          onChange={handleChange}
        />

        <input
          type="text"
          name="image"
          placeholder="Image URL (optional)"
          value={formData.image}
          onChange={handleChange}
        />

        <textarea
          name="summary"
          placeholder="Short summary for the news card"
          value={formData.summary}
          onChange={handleChange}
          rows="3"
          required
        />

        <textarea
          name="content"
          placeholder="Full news content for the details page"
          value={formData.content}
          onChange={handleChange}
          rows="6"
        />
      </div>

      <button type="submit" className="btn btn--primary">
        Publish News
      </button>
    </form>
  );
}

export default AdminNewsForm;