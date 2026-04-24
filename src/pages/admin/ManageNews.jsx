import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminNewsForm from "../../components/admin/AdminNewsForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAppData } from "../../context/AppDataContext";

function ManageNews() {
  const { news = [], addNews, updateNews, deleteNews } = useAppData();

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    danger: true,
  });

  const [editingNewsId, setEditingNewsId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    image: "",
    summary: "",
    content: "",
  });

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    );
  }, [news]);

  const openConfirm = ({ title, message, onConfirm, danger = true }) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
      danger,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      danger: true,
    });
  };

  const handleAddNews = async (newNews) => {
    await addNews({
      ...newNews,
      summary: newNews.summary || "",
      content: newNews.content || newNews.summary || "",
    });
  };

  const handleStartEdit = (item) => {
    setEditingNewsId(item.id);
    setEditForm({
      title: item.title || "",
      category: item.category || "",
      image: item.image || "",
      summary: item.summary || "",
      content: item.content || item.summary || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingNewsId(null);
    setEditForm({
      title: "",
      category: "",
      image: "",
      summary: "",
      content: "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editForm.title.trim()) {
      alert("News title is required.");
      return;
    }

    await updateNews(editingNewsId, {
      title: editForm.title.trim(),
      category: editForm.category.trim(),
      image: editForm.image.trim(),
      summary: editForm.summary.trim(),
      content: editForm.content.trim() || editForm.summary.trim(),
    });

    handleCancelEdit();
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage News</h2>
        <p>Publish and manage sports-related updates and announcements.</p>
        <AdminNewsForm onAddNews={handleAddNews} />
      </div>

      {editingNewsId && (
        <div className="admin-section-card">
          <h2>Edit News</h2>

          <form className="admin-form" onSubmit={handleSaveEdit}>
            <div className="admin-form__grid">
              <input
                type="text"
                name="title"
                placeholder="News title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={editForm.category}
                onChange={handleEditChange}
              />

              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={editForm.image}
                onChange={handleEditChange}
              />

              <textarea
                name="summary"
                placeholder="Summary"
                value={editForm.summary}
                onChange={handleEditChange}
                rows="3"
              />

              <textarea
                name="content"
                placeholder="Full content"
                value={editForm.content}
                onChange={handleEditChange}
                rows="6"
              />
            </div>

            <div className="admin-actions">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section-card">
        <h2>News List</h2>

        <div className="admin-list">
          {sortedNews.length ? (
            sortedNews.map((item) => (
              <div className="admin-list-card" key={item.id}>
                <h3>{item.title || "Untitled News"}</h3>

                <p>
                  <strong>Category:</strong> {item.category || "General"}
                </p>

                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title || "News"}
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      borderRadius: "12px",
                      marginBottom: "1rem",
                      objectFit: "cover",
                    }}
                  />
                )}

                <p>{item.summary || item.content || item.excerpt || "No summary available."}</p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleStartEdit(item)}>
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openConfirm({
                        title: "Delete News",
                        message: `Delete news: ${item.title || "Untitled News"}?`,
                        onConfirm: async () => {
                          await deleteNews(item.id);
                        },
                        danger: true,
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No news available yet.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={closeConfirm}
        onConfirm={async () => {
          if (confirmState.onConfirm) {
            await confirmState.onConfirm();
          }
          closeConfirm();
        }}
        danger={confirmState.danger}
      />
    </AdminLayout>
  );
}

export default ManageNews;