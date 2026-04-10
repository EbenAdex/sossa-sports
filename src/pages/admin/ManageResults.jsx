import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminResultForm from "../../components/admin/AdminResultForm";
import { useAppData } from "../../context/AppDataContext";

function ManageResults() {
  const { results, fixtures, addResult, updateResult, deleteResult } = useAppData();

  const [editingResultId, setEditingResultId] = useState(null);
  const [editForm, setEditForm] = useState({
    fixtureId: "",
    competitionId: "",
    competitionName: "",
    competitionType: "",
    sport: "",
    category: "",
    homeTeam: "",
    awayTeam: "",
    homeScore: "",
    awayScore: "",
    date: "",
    venue: "",
    summary: "",
    stage: "",
  });

  const endedFixtures = useMemo(() => {
    return fixtures.filter((fixture) => fixture.status === "Ended");
  }, [fixtures]);

  useEffect(() => {
    if (!editingResultId) return;

    const resultToEdit = results.find((item) => item.id === editingResultId);

    if (resultToEdit) {
      setEditForm({
        fixtureId: resultToEdit.fixtureId || "",
        competitionId: resultToEdit.competitionId || "",
        competitionName: resultToEdit.competitionName || "",
        competitionType: resultToEdit.competitionType || "",
        sport: resultToEdit.sport || "",
        category: resultToEdit.category || resultToEdit.gender || "",
        homeTeam: resultToEdit.homeTeam || "",
        awayTeam: resultToEdit.awayTeam || "",
        homeScore: String(resultToEdit.homeScore ?? ""),
        awayScore: String(resultToEdit.awayScore ?? ""),
        date: resultToEdit.date || "",
        venue: resultToEdit.venue || "",
        summary: resultToEdit.summary || "",
        stage: resultToEdit.stage || "",
      });
    }
  }, [editingResultId, results]);

  const handleAddResult = async (newResult) => {
    try {
      await addResult(newResult);
    } catch (error) {
      console.error("ManageResults add failed:", error);
      alert(error.message || "Failed to add result.");
    }
  };

  const handleStartEdit = (result) => {
    setEditingResultId(result.id);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    if (name === "fixtureId") {
      const selectedFixture = endedFixtures.find(
        (fixture) => String(fixture.id) === String(value)
      );

      setEditForm((prev) => ({
        ...prev,
        fixtureId: value,
        competitionId: selectedFixture?.competitionId || "",
        competitionName: selectedFixture?.competitionName || "",
        competitionType: selectedFixture?.competitionType || "",
        sport: selectedFixture?.sport || "",
        category: selectedFixture?.category || selectedFixture?.gender || "",
        homeTeam: selectedFixture?.homeTeam || "",
        awayTeam: selectedFixture?.awayTeam || "",
        date: selectedFixture?.date || "",
        venue: selectedFixture?.venue || "",
        stage: selectedFixture?.stage || "",
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    try {
      await updateResult(editingResultId, {
        ...editForm,
        gender: editForm.category,
        homeScore: Number(editForm.homeScore),
        awayScore: Number(editForm.awayScore),
      });

      setEditingResultId(null);
    } catch (error) {
      console.error("ManageResults update failed:", error);
      alert(error.message || "Failed to update result.");
    }
  };

  const handleCancelEdit = () => {
    setEditingResultId(null);
  };

  const handleDeleteResult = async (id) => {
    try {
      await deleteResult(id);

      if (editingResultId === id) {
        setEditingResultId(null);
      }
    } catch (error) {
      console.error("ManageResults delete failed:", error);
      alert(error.message || "Failed to delete result.");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Results</h2>
        <p>View, add, update, and delete match outcomes across all competitions.</p>
        <AdminResultForm onAddResult={handleAddResult} />
      </div>

      {editingResultId && (
        <div className="admin-section-card">
          <h2>Edit Result</h2>

          <form className="admin-form" onSubmit={handleSaveEdit}>
            <div className="admin-form__grid">
              <select
                name="fixtureId"
                value={editForm.fixtureId}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Ended Fixture</option>
                {endedFixtures.map((fixture) => (
                  <option key={fixture.id} value={fixture.id}>
                    {fixture.homeTeam} vs {fixture.awayTeam} - {fixture.sport}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="competitionName"
                placeholder="Competition"
                value={editForm.competitionName}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="sport"
                placeholder="Sport"
                value={editForm.sport}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={editForm.category}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="stage"
                placeholder="Stage"
                value={editForm.stage}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="homeTeam"
                placeholder="Home Team"
                value={editForm.homeTeam}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="awayTeam"
                placeholder="Away Team"
                value={editForm.awayTeam}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="number"
                name="homeScore"
                placeholder="Home Score"
                value={editForm.homeScore}
                onChange={handleEditChange}
                required
              />

              <input
                type="number"
                name="awayScore"
                placeholder="Away Score"
                value={editForm.awayScore}
                onChange={handleEditChange}
                required
              />

              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={handleEditChange}
                readOnly
              />

              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={editForm.venue}
                onChange={handleEditChange}
                readOnly
              />

              <textarea
                name="summary"
                placeholder="Result summary"
                value={editForm.summary}
                onChange={handleEditChange}
                rows="4"
              />
            </div>

            <div className="admin-actions">
              <button type="submit">Save Result</button>
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section-card">
        <h2>Results List</h2>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Competition</th>
                <th>Sport</th>
                <th>Category</th>
                <th>Stage</th>
                <th>Result</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {results.length ? (
                results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.competitionName || "N/A"}</td>
                    <td>{result.sport}</td>
                    <td>{result.category || result.gender}</td>
                    <td>{result.stage || "N/A"}</td>
                    <td>
                      {result.homeTeam} {result.homeScore} - {result.awayScore}{" "}
                      {result.awayTeam}
                    </td>
                    <td>{result.date}</td>
                    <td>{result.venue}</td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" onClick={() => handleStartEdit(result)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResult(result.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No results available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ManageResults;