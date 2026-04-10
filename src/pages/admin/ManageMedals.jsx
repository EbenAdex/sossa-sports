import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import facultyDepartments from "../../data/facultyDepartments";
import { useAppData } from "../../context/AppDataContext";

function ManageMedals() {
  const { medals, addMedal, updateMedal, deleteMedal } = useAppData();

  const [formData, setFormData] = useState({
    department: "",
    gold: "",
    silver: "",
    bronze: "",
  });

  const [editingId, setEditingId] = useState(null);

  const sortedMedals = useMemo(() => {
    return [...medals].sort((a, b) => {
      if ((b.gold || 0) !== (a.gold || 0)) return (b.gold || 0) - (a.gold || 0);
      if ((b.silver || 0) !== (a.silver || 0)) return (b.silver || 0) - (a.silver || 0);
      if ((b.bronze || 0) !== (a.bronze || 0)) return (b.bronze || 0) - (a.bronze || 0);
      return ((b.total || 0) - (a.total || 0));
    });
  }, [medals]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      department: "",
      gold: "",
      silver: "",
      bronze: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const gold = Number(formData.gold) || 0;
    const silver = Number(formData.silver) || 0;
    const bronze = Number(formData.bronze) || 0;

    const payload = {
      department: formData.department,
      gold,
      silver,
      bronze,
      total: gold + silver + bronze,
    };

    if (editingId) {
      await updateMedal(editingId, payload);
    } else {
      await addMedal(payload);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      department: item.department || "",
      gold: String(item.gold || 0),
      silver: String(item.silver || 0),
      bronze: String(item.bronze || 0),
    });
  };

  const handleDelete = async (id) => {
    await deleteMedal(id);
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Medals</h2>
        <p>Add, edit, and delete departmental medal records.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
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
              type="number"
              name="gold"
              placeholder="Gold"
              value={formData.gold}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="silver"
              placeholder="Silver"
              value={formData.silver}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="bronze"
              placeholder="Bronze"
              value={formData.bronze}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn--primary">
              {editingId ? "Update Medal Record" : "Add Medal Record"}
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
        <h2>Medal Records</h2>

        <div className="admin-list">
          {sortedMedals.length ? (
            sortedMedals.map((item, index) => (
              <div className="admin-list-card" key={item.id}>
                <h3>
                  {index + 1}. {item.department}
                </h3>
                <p>
                  <strong>Gold:</strong> {item.gold || 0}
                </p>
                <p>
                  <strong>Silver:</strong> {item.silver || 0}
                </p>
                <p>
                  <strong>Bronze:</strong> {item.bronze || 0}
                </p>
                <p>
                  <strong>Total:</strong> {item.total || 0}
                </p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No medal records yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ManageMedals;