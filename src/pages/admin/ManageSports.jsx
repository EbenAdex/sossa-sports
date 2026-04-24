import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppData } from "../../context/AppDataContext";

function ManageSports() {
  const { sports, teams, addSport, updateSport, updateTeam } = useAppData();

  const [sportForm, setSportForm] = useState({
    name: "",
    image: "",
    description: "",
    link: "",
    showOnHomepage: false,
  });

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [editingSportId, setEditingSportId] = useState(null);

  const [editSportForm, setEditSportForm] = useState({
    name: "",
    image: "",
    description: "",
    link: "",
    showOnHomepage: false,
  });

  const sortedSports = useMemo(() => {
    return [...sports].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [sports]);

  const handleSportChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSportForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSportChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditSportForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSport = (event) => {
    event.preventDefault();

    if (!sportForm.name.trim()) return;

    addSport({
      id: Date.now(),
      name: sportForm.name.trim(),
      image:
        sportForm.image ||
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=800&q=80",
      description: sportForm.description,
      link: sportForm.link.trim(),
      showOnHomepage: Boolean(sportForm.showOnHomepage),
    });

    setSportForm({
      name: "",
      image: "",
      description: "",
      link: "",
      showOnHomepage: false,
    });
  };

  const handleStartEditSport = (sport) => {
    setEditingSportId(sport.id);
    setEditSportForm({
      name: sport.name || "",
      image: sport.image || "",
      description: sport.description || "",
      link: sport.link || "",
      showOnHomepage: Boolean(sport.showOnHomepage),
    });
  };

  const handleSaveSportEdit = (event) => {
    event.preventDefault();

    updateSport(editingSportId, {
      name: editSportForm.name.trim(),
      image: editSportForm.image,
      description: editSportForm.description,
      link: editSportForm.link.trim(),
      showOnHomepage: Boolean(editSportForm.showOnHomepage),
    });

    setEditingSportId(null);
  };

  const handleAssignTeam = async (event) => {
    event.preventDefault();

    if (!selectedSport || !selectedTeamId) return;

    const team = teams.find((item) => String(item.id) === String(selectedTeamId));
    if (!team) return;

    const alreadyAssigned = team.sports?.includes(selectedSport);
    if (alreadyAssigned) return;

    await updateTeam(team.id, {
      sports: [...(team.sports || []), selectedSport],
    });

    setSelectedSport("");
    setSelectedTeamId("");
  };

  const handleRemoveTeamFromSport = async (team, sportName) => {
    await updateTeam(team.id, {
      sports: (team.sports || []).filter((item) => item !== sportName),
    });
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Sports</h2>
        <p>Add sports and assign qualified teams to those sports.</p>

        <form className="admin-form" onSubmit={handleAddSport}>
          <div className="admin-form__grid">
            <input
              type="text"
              name="name"
              placeholder="Sport name"
              value={sportForm.name}
              onChange={handleSportChange}
              required
            />

            <input
              type="text"
              name="image"
              placeholder="Sport image URL (optional)"
              value={sportForm.image}
              onChange={handleSportChange}
            />

            <input
              type="text"
              name="link"
              placeholder="Route link (leave empty if no route yet)"
              value={sportForm.link}
              onChange={handleSportChange}
            />

            <textarea
              name="description"
              placeholder="Sport description"
              value={sportForm.description}
              onChange={handleSportChange}
              rows="3"
            />
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              name="showOnHomepage"
              checked={sportForm.showOnHomepage}
              onChange={handleSportChange}
            />
            <span>Show on homepage sports section</span>
          </label>

          <button type="submit" className="btn btn--primary">
            Add Sport
          </button>
        </form>
      </div>

      {editingSportId && (
        <div className="admin-section-card">
          <h2>Edit Sport</h2>

          <form className="admin-form" onSubmit={handleSaveSportEdit}>
            <div className="admin-form__grid">
              <input
                type="text"
                name="name"
                placeholder="Sport name"
                value={editSportForm.name}
                onChange={handleEditSportChange}
                required
              />

              <input
                type="text"
                name="image"
                placeholder="Sport image URL"
                value={editSportForm.image}
                onChange={handleEditSportChange}
              />

              <input
                type="text"
                name="link"
                placeholder="Route link"
                value={editSportForm.link}
                onChange={handleEditSportChange}
              />

              <textarea
                name="description"
                placeholder="Sport description"
                value={editSportForm.description}
                onChange={handleEditSportChange}
                rows="3"
              />
            </div>

            <label className="remember-me">
              <input
                type="checkbox"
                name="showOnHomepage"
                checked={editSportForm.showOnHomepage}
                onChange={handleEditSportChange}
              />
              <span>Show on homepage sports section</span>
            </label>

            <div className="admin-actions">
              <button type="submit">Save Sport</button>
              <button type="button" onClick={() => setEditingSportId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section-card">
        <h2>Assign Teams to Sports</h2>

        <form className="admin-form admin-inline-form" onSubmit={handleAssignTeam}>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option value="">Select sport</option>
            {sortedSports.map((sport) => (
              <option key={sport.id} value={sport.name}>
                {sport.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
          >
            <option value="">Select team</option>
            {teams
              .filter((team) => team.qualified)
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.category})
                </option>
              ))}
          </select>

          <button type="submit" className="btn btn--primary">
            Assign Team
          </button>
        </form>
      </div>

      <div className="admin-section-card">
        <h2>Sports List</h2>

        <div className="admin-list">
          {sortedSports.map((sport) => {
            const assignedTeams = teams.filter((team) =>
              team.sports?.includes(sport.name)
            );

            return (
              <div className="admin-list-card" key={sport.id}>
                <h3>{sport.name}</h3>
                <p>{sport.description || "No description yet."}</p>

                <p>
                  <strong>Route:</strong> {sport.link || "No route assigned yet"}
                </p>

                <p>
                  <strong>Homepage Visibility:</strong>{" "}
                  {sport.showOnHomepage ? "Visible on homepage" : "Hidden from homepage"}
                </p>

                <p>
                  <strong>Assigned Teams:</strong>{" "}
                  {assignedTeams.length
                    ? assignedTeams
                        .map((team) => `${team.name} (${team.category})`)
                        .join(", ")
                    : "No teams assigned yet"}
                </p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleStartEditSport(sport)}>
                    Edit Sport
                  </button>

                  {assignedTeams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => handleRemoveTeamFromSport(team, sport.name)}
                    >
                      Remove {team.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ManageSports;