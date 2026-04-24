import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminFixtureForm from "../../components/admin/AdminFixtureForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAppData } from "../../context/AppDataContext";

function asText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function ManageFixtures() {
  const {
    fixtures = [],
    competitions = [],
    teams = [],
    sports = [],
    addFixture,
    deleteFixture,
    updateFixture,
    updateFixtureWithCallback,
    recalculateAllPlayerStats,
    syncResultsFromEndedFixtures,
    syncSingleResultFromFixture,
    recalculateTablesFromEndedFixtures,
  } = useAppData();

  const [editingFixtureId, setEditingFixtureId] = useState(null);

  const [fixtureSportFilter, setFixtureSportFilter] = useState("all");
  const [fixtureCategoryFilter, setFixtureCategoryFilter] = useState("all");
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState("all");
  const [fixtureSearchTerm, setFixtureSearchTerm] = useState("");

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    danger: true,
  });

  const [editForm, setEditForm] = useState({
    sport: "",
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

  const sportNames = useMemo(() => {
    const values = sports
      .map((sport) => asText(sport?.name).trim())
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [sports]);

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

  const selectedCompetition = useMemo(() => {
    return competitions.find(
      (item) => String(item.id) === String(editForm.competitionId)
    );
  }, [competitions, editForm.competitionId]);

  const availableTeams = useMemo(() => {
    return teams.filter((team) => {
      const sportMatch =
        asText(team?.sport).toLowerCase() === asText(editForm.sport).toLowerCase();

      const categoryMatch =
        asText(team?.category).toLowerCase() === asText(editForm.category).toLowerCase();

      return sportMatch && categoryMatch;
    });
  }, [teams, editForm.sport, editForm.category]);

  const filteredFixtures = useMemo(() => {
    return fixtures.filter((fixture) => {
      const combined = [
        fixture.homeTeam,
        fixture.awayTeam,
        fixture.sport,
        fixture.stage,
        fixture.venue,
        fixture.competitionName,
        fixture.category,
        fixture.status,
        fixture.competitionGroup,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = combined.includes(fixtureSearchTerm.toLowerCase());

      const matchesSport =
        fixtureSportFilter === "all" ||
        asText(fixture.sport).toLowerCase() === fixtureSportFilter.toLowerCase();

      const matchesCategory =
        fixtureCategoryFilter === "all" ||
        asText(fixture.category || fixture.gender).toLowerCase() ===
          fixtureCategoryFilter.toLowerCase();

      const matchesStatus =
        fixtureStatusFilter === "all" ||
        asText(fixture.status).toLowerCase() === fixtureStatusFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesCategory && matchesStatus;
    });
  }, [
    fixtures,
    fixtureSearchTerm,
    fixtureSportFilter,
    fixtureCategoryFilter,
    fixtureStatusFilter,
  ]);

  const sortedFixtures = useMemo(() => {
    return [...filteredFixtures].sort((a, b) =>
      `${asText(a.date)} ${asText(a.kickoffTime)}`.localeCompare(
        `${asText(b.date)} ${asText(b.kickoffTime)}`
      )
    );
  }, [filteredFixtures]);

  const handleAddFixture = async (fixture) => {
    await addFixture(fixture);
  };

  const handleStartEdit = (fixture) => {
    setEditingFixtureId(fixture.id);
    setEditForm({
      sport: asText(fixture.sport),
      category: asText(fixture.category || fixture.gender, "Male"),
      stage: asText(fixture.stage, "Group Stage"),
      competitionId: asText(fixture.competitionId),
      competitionName: asText(fixture.competitionName),
      competitionType: asText(fixture.competitionType),
      participantMode: asText(fixture.participantMode),
      ownerDepartment: asText(fixture.ownerDepartment),
      competitionGroup: asText(fixture.competitionGroup),
      homeTeamId: asText(fixture.homeTeamId),
      awayTeamId: asText(fixture.awayTeamId),
      homeTeam: asText(fixture.homeTeam),
      awayTeam: asText(fixture.awayTeam),
      date: asText(fixture.date),
      kickoffTime: asText(fixture.kickoffTime),
      endTime: asText(fixture.endTime),
      venue: asText(fixture.venue),
      status: asText(fixture.status, "Upcoming"),
      postponed: Boolean(fixture.postponed),
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
          competitionName: asText(competition?.name),
          competitionType: asText(competition?.competitionType),
          participantMode: asText(competition?.participantMode),
          ownerDepartment: asText(competition?.ownerDepartment),
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
          homeTeam: asText(selectedTeam?.department || selectedTeam?.name),
        };
      }

      if (name === "awayTeamId") {
        const selectedTeam = teams.find((team) => String(team.id) === String(value));

        return {
          ...prev,
          awayTeamId: value,
          awayTeam: asText(selectedTeam?.department || selectedTeam?.name),
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

    if (!editForm.sport) {
      alert("Please select a sport.");
      return;
    }

    if (!editForm.homeTeamId || !editForm.awayTeamId) {
      alert("Please select both teams.");
      return;
    }

    if (String(editForm.homeTeamId) === String(editForm.awayTeamId)) {
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
      asText(homeTeamRecord.sport).toLowerCase() !== asText(editForm.sport).toLowerCase() ||
      asText(awayTeamRecord.sport).toLowerCase() !== asText(editForm.sport).toLowerCase()
    ) {
      alert("Selected teams do not match the chosen sport.");
      return;
    }

    if (
      asText(homeTeamRecord.category).toLowerCase() !==
        asText(editForm.category).toLowerCase() ||
      asText(awayTeamRecord.category).toLowerCase() !==
        asText(editForm.category).toLowerCase()
    ) {
      alert("Selected teams do not match the chosen category.");
      return;
    }

    if (
      asText(homeTeamRecord.department || homeTeamRecord.name).toLowerCase() ===
      asText(awayTeamRecord.department || awayTeamRecord.name).toLowerCase()
    ) {
      alert("A department cannot play against itself.");
      return;
    }

    if (
      asText(editForm.sport).toLowerCase() === "football" &&
      asText(editForm.stage).toLowerCase() === "group stage" &&
      !asText(editForm.competitionGroup).trim()
    ) {
      alert("Group is required for football group-stage fixtures.");
      return;
    }

    await updateFixture(editingFixtureId, {
      ...editForm,
      gender: editForm.category,
      homeTeamId: editForm.homeTeamId,
      awayTeamId: editForm.awayTeamId,
      homeTeam: asText(homeTeamRecord.department || homeTeamRecord.name),
      awayTeam: asText(awayTeamRecord.department || awayTeamRecord.name),
      postponed: editForm.status === "Postponed" ? true : Boolean(editForm.postponed),
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

    if (!updatedFixture) return;

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
                    {asText(competition.name)}
                  </option>
                ))}
              </select>

              <select
                name="sport"
                value={editForm.sport}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Sport</option>
                {sportNames.map((sportName) => (
                  <option key={sportName} value={sportName}>
                    {sportName}
                  </option>
                ))}
              </select>

              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                type="text"
                name="stage"
                value={editForm.stage}
                onChange={handleEditChange}
                placeholder="Stage"
                required
              />

              <select
                name="homeTeamId"
                value={editForm.homeTeamId}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Home Team</option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {asText(
                      team.displayName,
                      `${asText(team.department || team.name)} ${asText(team.sport)} ${asText(
                        team.category
                      )}`
                    )}
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
                    {asText(
                      team.displayName,
                      `${asText(team.department || team.name)} ${asText(team.sport)} ${asText(
                        team.category
                      )}`
                    )}
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

        <div className="team-search-bar">
          <input
            type="text"
            placeholder="Search by team, competition, stage, venue or group"
            value={fixtureSearchTerm}
            onChange={(e) => setFixtureSearchTerm(e.target.value)}
          />

          <select
            value={fixtureSportFilter}
            onChange={(e) => setFixtureSportFilter(e.target.value)}
          >
            <option value="all">All Sports</option>
            {sportNames.map((sportName) => (
              <option key={sportName} value={sportName}>
                {sportName}
              </option>
            ))}
          </select>

          <select
            value={fixtureCategoryFilter}
            onChange={(e) => setFixtureCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={fixtureStatusFilter}
            onChange={(e) => setFixtureStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>

        <div className="admin-list">
          {sortedFixtures.length ? (
            sortedFixtures.map((fixture) => (
              <div className="admin-list-card" key={fixture.id}>
                <h3>
                  {asText(fixture.homeTeam, "Home")} vs {asText(fixture.awayTeam, "Away")}
                </h3>

                <p>
                  <strong>Competition:</strong> {asText(fixture.competitionName, "N/A")}
                </p>

                <p>
                  <strong>Competition Type:</strong> {asText(fixture.competitionType, "N/A")}
                </p>

                <p>
                  <strong>Sport:</strong> {asText(fixture.sport, "N/A")}
                </p>

                <p>
                  <strong>Category:</strong> {asText(fixture.category || fixture.gender, "N/A")}
                </p>

                <p>
                  <strong>Stage:</strong> {asText(fixture.stage, "N/A")}
                </p>

                <p>
                  <strong>Group:</strong> {asText(fixture.competitionGroup, "N/A")}
                </p>

                <p>
                  <strong>Status:</strong> {asText(fixture.status, "N/A")}
                </p>

                <p>
                  <strong>Date:</strong> {asText(fixture.date, "N/A")}
                </p>

                <p>
                  <strong>Time:</strong> {asText(fixture.kickoffTime, "--")} -{" "}
                  {asText(fixture.endTime, "--")}
                </p>

                <p>
                  <strong>Venue:</strong> {asText(fixture.venue, "N/A")}
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
                        message: `Delete fixture: ${asText(fixture.homeTeam)} vs ${asText(
                          fixture.awayTeam
                        )}?`,
                        onConfirm: async () => {
                          await handleDeleteFixture(fixture.id);
                        },
                        danger: true,
                      })
                    }
                  >
                    Delete
                  </button>

                  {asText(fixture.status) !== "Live" && asText(fixture.status) !== "Ended" && (
                    <button type="button" onClick={() => handleStartMatch(fixture.id)}>
                      Start Match
                    </button>
                  )}

                  {asText(fixture.status) !== "Ended" && (
                    <button
                      type="button"
                      onClick={() =>
                        openConfirm({
                          title: "End Match",
                          message: `End match: ${asText(fixture.homeTeam)} vs ${asText(
                            fixture.awayTeam
                          )}?`,
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

                  {asText(fixture.status) !== "Postponed" && (
                    <button
                      type="button"
                      onClick={() =>
                        openConfirm({
                          title: "Postpone Fixture",
                          message: `Postpone fixture: ${asText(fixture.homeTeam)} vs ${asText(
                            fixture.awayTeam
                          )}?`,
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