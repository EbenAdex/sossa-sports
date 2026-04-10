import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import sossaManiaDepartments from "../../data/sossaManiaDepartments";
import { useAppData } from "../../context/AppDataContext";

function ManageCompetitions() {
  const { competitions, addCompetition, updateCompetition, deleteCompetition } = useAppData();

  const [formData, setFormData] = useState({
    name: "",
    competitionType: "faculty",
    ownerDepartment: "",
    participantMode: "department",
    status: "active",
    year: new Date().getFullYear().toString(),
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "competitionType" && value === "faculty"
        ? {
            ownerDepartment: "",
            participantMode: "department",
          }
        : {}),
      ...(name === "competitionType" && value === "hod"
        ? {
            participantMode: "level",
          }
        : {}),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      competitionType: "faculty",
      ownerDepartment: "",
      participantMode: "department",
      status: "active",
      year: new Date().getFullYear().toString(),
    });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Competition name is required.");
      return;
    }

    if (formData.competitionType === "hod" && !formData.ownerDepartment) {
      alert("Please select the owning department for HOD Games.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      competitionType: formData.competitionType,
      ownerDepartment:
        formData.competitionType === "hod" ? formData.ownerDepartment : "",
      participantMode:
        formData.competitionType === "faculty" ? "department" : "level",
      status: formData.status,
      year: formData.year,
    };

    if (editingId) {
      await updateCompetition(editingId, payload);
    } else {
      await addCompetition(payload);
    }

    resetForm();
  };

  const handleEdit = (competition) => {
    setEditingId(competition.id);
    setFormData({
      name: competition.name || "",
      competitionType: competition.competitionType || "faculty",
      ownerDepartment: competition.ownerDepartment || "",
      participantMode: competition.participantMode || "department",
      status: competition.status || "active",
      year: competition.year || new Date().getFullYear().toString(),
    });
  };

  const handleDelete = async (id) => {
    await deleteCompetition(id);
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Competitions</h2>
        <p>Create and manage Faculty Games and HOD Games.</p>
      </div>

      <div className="admin-section-card">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <input
              type="text"
              name="name"
              placeholder="Competition name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <select
              name="competitionType"
              value={formData.competitionType}
              onChange={handleChange}
            >
              <option value="faculty">Faculty Games</option>
              <option value="hod">Departmental HOD Games</option>
            </select>

            {formData.competitionType === "hod" && (
              <select
                name="ownerDepartment"
                value={formData.ownerDepartment}
                onChange={handleChange}
                required
              >
                <option value="">Select Owning Department</option>
                {sossaManiaDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              name="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="admin-actions">
            <button type="submit">
              {editingId ? "Update Competition" : "Create Competition"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-section-card">
        <div className="admin-list">
          {competitions.length ? (
            competitions.map((competition) => (
              <div className="admin-list-card" key={competition.id}>
                <h3>{competition.name}</h3>
                <p>
                  <strong>Type:</strong> {competition.competitionType}
                </p>
                <p>
                  <strong>Owner Department:</strong>{" "}
                  {competition.ownerDepartment || "N/A"}
                </p>
                <p>
                  <strong>Participant Mode:</strong> {competition.participantMode}
                </p>
                <p>
                  <strong>Status:</strong> {competition.status}
                </p>
                <p>
                  <strong>Year:</strong> {competition.year}
                </p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleEdit(competition)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(competition.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No competitions yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ManageCompetitions;