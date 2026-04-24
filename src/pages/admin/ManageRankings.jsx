import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppData } from "../../context/AppDataContext";
import facultyDepartments from "../../data/facultyDepartments";

function ManageRankings() {
  const { rankings, addRanking, updateRanking, deleteRanking } = useAppData();

  const [formData, setFormData] = useState({
    sport: "Athletics",
    category: "Male",
    department: "",
    eventName: "",
    rank: "",
    resultValue: "",
    points: "",
  });

  const [editingId, setEditingId] = useState(null);

  const rankingSports = useMemo(
    () => ["Athletics", "Swimming", "Track Events", "Chess", "Scrabble", "Checkers", "Ludo", "FC26", "Mortal Kombat"],
    []
  );

  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => {
      if (String(a.sport || "").localeCompare(String(b.sport || "")) !== 0) {
        return String(a.sport || "").localeCompare(String(b.sport || ""));
      }

      if (String(a.category || "").localeCompare(String(b.category || "")) !== 0) {
        return String(a.category || "").localeCompare(String(b.category || ""));
      }

      return Number(a.rank || 999) - Number(b.rank || 999);
    });
  }, [rankings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      sport: "Athletics",
      category: "Male",
      department: "",
      eventName: "",
      rank: "",
      resultValue: "",
      points: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      sport: formData.sport,
      category: formData.category,
      department: formData.department,
      eventName: formData.eventName,
      rank: Number(formData.rank),
      resultValue: formData.resultValue,
      points: Number(formData.points),
    };

    if (editingId) {
      await updateRanking(editingId, payload);
    } else {
      await addRanking(payload);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      sport: item.sport || "Athletics",
      category: item.category || "Male",
      department: item.department || "",
      eventName: item.eventName || "",
      rank: String(item.rank || ""),
      resultValue: item.resultValue || "",
      points: String(item.points || ""),
    });
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Rankings</h2>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <select name="sport" value={formData.sport} onChange={handleChange}>
              {rankingSports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {facultyDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="eventName"
              placeholder="Event name"
              value={formData.eventName}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="rank"
              placeholder="Rank"
              value={formData.rank}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="resultValue"
              placeholder="Score / Time / Distance"
              value={formData.resultValue}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="points"
              placeholder="Points"
              value={formData.points}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn--primary">
              {editingId ? "Update Ranking" : "Add Ranking"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-section-card">
        <h2>Ranking Records</h2>

        <div className="admin-list">
          {sortedRankings.length ? (
            sortedRankings.map((item) => (
              <div className="admin-list-card" key={item.id}>
                <h3>
                  {item.department} — {item.eventName}
                </h3>
                <p>
                  <strong>Sport:</strong> {item.sport}
                </p>
                <p>
                  <strong>Category:</strong> {item.category}
                </p>
                <p>
                  <strong>Rank:</strong> {item.rank}
                </p>
                <p>
                  <strong>Result:</strong> {item.resultValue}
                </p>
                <p>
                  <strong>Points:</strong> {item.points}
                </p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteRanking(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No ranking records yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ManageRankings;