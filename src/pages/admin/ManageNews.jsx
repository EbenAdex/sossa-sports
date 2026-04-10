import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminNewsForm from "../../components/admin/AdminNewsForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAppData } from "../../context/AppDataContext";

function ManageNews() {
  const { news = [], addNews, deleteNews } = useAppData();

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    danger: true,
  });

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

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage News</h2>
        <p>Publish and manage sports-related updates and announcements.</p>
        <AdminNewsForm onAddNews={handleAddNews} />
      </div>

      <div className="admin-section-card">
        <h2>News List</h2>

        <div className="admin-list">
          {news.length ? (
            news.map((item) => (
              <div className="admin-list-card" key={item.id}>
                <h3>{item.title || "Untitled News"}</h3>
                <p>
                  <strong>Category:</strong> {item.category || "General"}
                </p>
                <p>{item.summary || item.content || item.excerpt || "No summary available."}</p>

                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openConfirm({
                        title: "Delete News",
                        message: `Delete news: ${item.title}?`,
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