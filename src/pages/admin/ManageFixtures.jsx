import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminFixtureForm from "../../components/admin/AdminFixtureForm";
import { useAppData } from "../../context/AppDataContext";
import ConfirmModal from "../../components/common/ConfirmModal";

function ManageFixtures() {
  const {
    fixtures,
    competitions,
    teams,
    addFixture,
    deleteFixture,
    updateFixture,
    updateFixtureWithCallback,
    recalculateAllPlayerStats,
    syncResultsFromEndedFixtures,
    syncSingleResultFromFixture,
    recalculateTablesFromEndedFixtures,
  } = useAppData();

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

  const [editingFixtureId, setEditingFixtureId] = useState(null);
  const [editForm, setEditForm] = useState({
    sport: "Football",
    category: "Male",
    stage: "Group Stage",
    competitionId: "",
    competitionName: "",
    competitionType: "",
    participantMode: "",
    ownerDepartment: "",
    competitionGroup: "",
    homeTeamId: "",
    awayTeamId: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    kickoffTime: "",
    endTime: "",
    venue: "",
    status: "Upcoming",
    postponed: false,
  });

  const selectedCompetition = useMemo(() => {
    return competitions.find(
      (item) => String(item.id) === String(editForm.competitionId)
    );
  }, [competitions, editForm.competitionId]);

  const availableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        String(team.sport || "").toLowerCase() === String(editForm.sport || "").toLowerCase() &&
        String(team.category || "").toLowerCase() === String(editForm.category || "").toLowerCase()
    );
  }, [teams, editForm.sport, editForm.category]);

  const sortedFixtures = useMemo(() => {
    return [...fixtures].sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || ""))
    );
  }, [fixtures]);

  const handleAddFixture = async (fixture) => {
    await addFixture(fixture);
  };

  const handleStartEdit = (fixture) => {
    setEditingFixtureId(fixture.id);
    setEditForm({
      sport: fixture.sport || "Football",
      category: fixture.category || fixture.gender || "Male",
      stage: fixture.stage || "Group Stage",
      competitionId: fixture.competitionId || "",
      competitionName: fixture.competitionName || "",
      competitionType: fixture.competitionType || "",
      participantMode: fixture.participantMode || "",
      ownerDepartment: fixture.ownerDepartment || "",
      competitionGroup: fixture.competitionGroup || "",
      homeTeamId: fixture.homeTeamId || "",
      awayTeamId: fixture.awayTeamId || "",
      homeTeam: fixture.homeTeam || "",
      awayTeam: fixture.awayTeam || "",
      date: fixture.date || "",
      kickoffTime: fixture.kickoffTime || "",
      endTime: fixture.endTime || "",
      venue: fixture.venue || "",
      status: fixture.status || "Upcoming",
      postponed: !!fixture.postponed,
    });
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditForm((prev) => {
      const nextValue = type === "checkbox" ? checked : value;

      if (name === "competitionId") {
        const competition = competitions.find(
          (item) => String(item.id) === String(value)
        );

        return {
          ...prev,
          competitionId: value,
          competitionName: competition?.name || "",
          competitionType: competition?.competitionType || "",
          participantMode: competition?.participantMode || "",
          ownerDepartment: competition?.ownerDepartment || "",
        };
      }

      if (name === "sport") {
        return {
          ...prev,
          sport: value,
          homeTeamId: "",
          awayTeamId: "",
          homeTeam: "",
          awayTeam: "",
        };
      }

      if (name === "category") {
        return {
          ...prev,
          category: value,
          homeTeamId: "",
          awayTeamId: "",
          homeTeam: "",
          awayTeam: "",
        };
      }

      if (name === "homeTeamId") {
        const selectedTeam = teams.find((team) => String(team.id) === String(value));

        return {
          ...prev,
          homeTeamId: value,
          homeTeam: selectedTeam?.department || selectedTeam?.name || "",
        };
      }

      if (name === "awayTeamId") {
        const selectedTeam = teams.find((team) => String(team.id) === String(value));

        return {
          ...prev,
          awayTeamId: value,
          awayTeam: selectedTeam?.department || selectedTeam?.name || "",
        };
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editForm.competitionId) {
      alert("Please select a competition.");
      return;
    }

    if (!editForm.homeTeamId || !editForm.awayTeamId) {
      alert("Please select both teams.");
      return;
    }

    if (editForm.homeTeamId === editForm.awayTeamId) {
      alert("Home and away teams cannot be the same.");
      return;
    }

    
    const homeTeamRecord = teams.find(
  (team) => String(team.id) === String(editForm.homeTeamId)
);

const awayTeamRecord = teams.find(
  (team) => String(team.id) === String(editForm.awayTeamId)
);

if (!homeTeamRecord || !awayTeamRecord) {
  alert("Please select valid teams.");
  return;
}

if (
  String(homeTeamRecord.sport || "").toLowerCase() !== String(editForm.sport || "").toLowerCase() ||
  String(awayTeamRecord.sport || "").toLowerCase() !== String(editForm.sport || "").toLowerCase()
) {
  alert("Selected teams do not match the chosen sport.");
  return;
}

if (
  String(homeTeamRecord.category || "").toLowerCase() !== String(editForm.category || "").toLowerCase() ||
  String(awayTeamRecord.category || "").toLowerCase() !== String(editForm.category || "").toLowerCase()
) {
  alert("Selected teams do not match the chosen category.");
  return;
}

if (
  String(homeTeamRecord.department || homeTeamRecord.name || "").toLowerCase() ===
  String(awayTeamRecord.department || awayTeamRecord.name || "").toLowerCase()
) {
  alert("A department cannot play against itself.");
  return;
}

if (
  String(editForm.sport).toLowerCase() === "football" &&
  String(editForm.stage).toLowerCase() === "group stage" &&
  !String(editForm.competitionGroup || "").trim()
) {
  alert("Group is required for football group-stage fixtures.");
  return;
}

    await updateFixture(editingFixtureId, {
      ...editForm,
      gender: editForm.category,
      homeTeamId: editForm.homeTeamId,
      awayTeamId: editForm.awayTeamId,
      homeTeam: homeTeamRecord?.department || homeTeamRecord?.name || "",
      awayTeam: awayTeamRecord?.department || awayTeamRecord?.name || "",
      postponed: editForm.status === "Postponed" ? true : editForm.postponed,
    });

    setEditingFixtureId(null);

    await recalculateAllPlayerStats();
    await syncResultsFromEndedFixtures();
    await recalculateTablesFromEndedFixtures();
  };

  const handleCancelEdit = () => {
    setEditingFixtureId(null);
  };

  const handleDeleteFixture = async (id) => {
    await deleteFixture(id);
  };

  const handleStartMatch = async (id) => {
    await updateFixture(id, {
      status: "Live",
      postponed: false,
    });
  };

 const handleFinishMatch = async (id) => {
  const updatedFixture = await updateFixtureWithCallback(id, (fixture) => ({
    ...fixture,
    status: "Ended",
    postponed: false,
  }));

  await recalculateAllPlayerStats();
  await syncSingleResultFromFixture(updatedFixture);
  await recalculateTablesFromEndedFixtures();
};

  const handlePostponeMatch = async (id) => {
    await updateFixture(id, {
      status: "Postponed",
      postponed: true,
    });
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Fixtures</h2>
        <p>Add, update, postpone, start, end, and delete fixtures.</p>
        <AdminFixtureForm onAddFixture={handleAddFixture} />
      </div>

      {editingFixtureId && (
        <div className="admin-section-card">
          <h2>Edit Fixture</h2>

          <form className="admin-form" onSubmit={handleSaveEdit}>
            <div className="admin-form__grid">
              <select
                name="competitionId"
                value={editForm.competitionId}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Competition</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </select>

              <select
                name="sport"
                value={editForm.sport}
                onChange={handleEditChange}
                required
              >
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>

              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <select
                name="stage"
                value={editForm.stage}
                onChange={handleEditChange}
                required
              >
                <option value="Group Stage">Group Stage</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final">Semi Final</option>
                <option value="Third Place">Third Place</option>
                <option value="Final">Final</option>
              </select>

              <select
                name="homeTeamId"
                value={editForm.homeTeamId}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Home Team</option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.displayName || `${team.department || team.name} ${team.sport} ${team.category}`}
                  </option>
                ))}
              </select>

              <select
                name="awayTeamId"
                value={editForm.awayTeamId}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Away Team</option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.displayName || `${team.department || team.name} ${team.sport} ${team.category}`}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="competitionGroup"
                value={editForm.competitionGroup}
                onChange={handleEditChange}
                placeholder="Group"
              />

              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="kickoffTime"
                value={editForm.kickoffTime}
                onChange={handleEditChange}
                placeholder="Kickoff time"
                required
              />

              <input
                type="text"
                name="endTime"
                value={editForm.endTime}
                onChange={handleEditChange}
                placeholder="End time"
                required
              />

              <input
                type="text"
                name="venue"
                value={editForm.venue}
                onChange={handleEditChange}
                placeholder="Venue"
                required
              />

              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Ended">Ended</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>

            <div className="admin-actions">
              <button type="submit">Save Fixture</button>
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section-card">
        <h2>Fixture List</h2>

        <div className="admin-list">
          {sortedFixtures.length ? (
            sortedFixtures.map((fixture) => (
              <div className="admin-list-card" key={fixture.id}>
                <h3>
                  {fixture.homeTeam} vs {fixture.awayTeam}
                </h3>
                <p>
                  <strong>Competition:</strong> {fixture.competitionName || "N/A"}
                </p>
                <p>
                  <strong>Competition Type:</strong> {fixture.competitionType || "N/A"}
                </p>
                <p>
                  <strong>Sport:</strong> {fixture.sport}
                </p>
                <p>
                  <strong>Category:</strong> {fixture.category || fixture.gender}
                </p>
                <p>
                  <strong>Stage:</strong> {fixture.stage}
                </p>
                <p>
                  <strong>Group:</strong> {fixture.competitionGroup || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {fixture.status}
                </p>
                <p>
                  <strong>Date:</strong> {fixture.date}
                </p>
                <p>
                  <strong>Time:</strong> {fixture.kickoffTime} - {fixture.endTime}
                </p>
                <p>
                  <strong>Venue:</strong> {fixture.venue}
                </p>

                <div className="admin-actions">
                  <button type="button" onClick={() => handleStartEdit(fixture)}>
                    Edit
                  </button>
                <button
  type="button"
  onClick={() =>
    openConfirm({
      title: "Delete Fixture",
      message: `Delete fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}?`,
      onConfirm: async () => {
        await handleDeleteFixture(fixture.id);
      },
      danger: true,
    })
  }
>
  Delete
</button>

                  {fixture.status !== "Live" && fixture.status !== "Ended" && (
                    <button type="button" onClick={() => handleStartMatch(fixture.id)}>
                      Start Match
                    </button>
                  )}

                  {fixture.status !== "Ended" && (
                  <button
  type="button"
  onClick={() =>
    openConfirm({
      title: "End Match",
      message: `End match: ${fixture.homeTeam} vs ${fixture.awayTeam}?`,
      onConfirm: async () => {
        await handleFinishMatch(fixture.id);
      },
      danger: false,
    })
  }
>
  End Match
</button>
                  )} 

                  {fixture.status !== "Postponed" && (
                <button
  type="button"
  onClick={() =>
    openConfirm({
      title: "Postpone Fixture",
      message: `Postpone fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}?`,
      onConfirm: async () => {
        await handlePostponeMatch(fixture.id);
      },
      danger: false,
    })
  }
>
  Postpone
</button>
                  )}

                 
                </div>
              </div>
            ))
          ) : (
            <p>No fixtures available.</p>
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

export default ManageFixtures;