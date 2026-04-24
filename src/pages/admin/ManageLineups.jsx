import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppData } from "../../context/AppDataContext";

function asText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function getCoachName(team) {
  if (!team) return "";
  if (typeof team.coach === "object" && team.coach !== null) {
    return asText(team.coach.name, "");
  }
  if (typeof team.coach === "string") {
    return team.coach;
  }
  return asText(team.coachName, "");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function ManageLineups() {
  const { fixtures = [], getTeamById, updateFixtureWithCallback } = useAppData();

  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [homeCoach, setHomeCoach] = useState("");
  const [awayCoach, setAwayCoach] = useState("");
  const [homePlayerIds, setHomePlayerIds] = useState([]);
  const [awayPlayerIds, setAwayPlayerIds] = useState([]);

  useEffect(() => {
    if (!selectedMatchId && fixtures.length) {
      setSelectedMatchId(String(fixtures[0].id));
    }
  }, [fixtures, selectedMatchId]);

  const selectedMatch = useMemo(() => {
    return (
      fixtures.find((match) => String(match.id) === String(selectedMatchId)) || null
    );
  }, [fixtures, selectedMatchId]);

  const homeTeam = useMemo(() => {
    return selectedMatch ? getTeamById(selectedMatch.homeTeamId) : null;
  }, [selectedMatch, getTeamById]);

  const awayTeam = useMemo(() => {
    return selectedMatch ? getTeamById(selectedMatch.awayTeamId) : null;
  }, [selectedMatch, getTeamById]);

  useEffect(() => {
    if (!selectedMatch) return;

    setHomeCoach(
      asText(selectedMatch.lineups?.homeCoach) || getCoachName(homeTeam) || ""
    );

    setAwayCoach(
      asText(selectedMatch.lineups?.awayCoach) || getCoachName(awayTeam) || ""
    );

    setHomePlayerIds(asArray(selectedMatch.lineups?.homePlayerIds));
    setAwayPlayerIds(asArray(selectedMatch.lineups?.awayPlayerIds));
  }, [selectedMatch, homeTeam, awayTeam]);

  const togglePlayer = (side, playerId) => {
    if (side === "home") {
      setHomePlayerIds((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId]
      );
      return;
    }

    setAwayPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleUseTeamCoachNames = () => {
    setHomeCoach(getCoachName(homeTeam));
    setAwayCoach(getCoachName(awayTeam));
  };

  const handleSaveLineup = async () => {
    if (!selectedMatch) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      lineups: {
        ...(match.lineups || {}),
        homeCoach: asText(homeCoach),
        awayCoach: asText(awayCoach),
        homePlayerIds,
        awayPlayerIds,
      },
    }));

    alert("Lineup saved successfully.");
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Manage Lineups</h2>
        <p>Lineups are saved by player ID and coach names can be loaded from team data.</p>

        <select
          className="admin-select"
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
        >
          <option value="">Select match</option>
          {fixtures.map((match) => (
            <option key={match.id} value={match.id}>
              {match.homeTeam} vs {match.awayTeam}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <div className="admin-section-card">
          <h2>
            {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
          </h2>

          <div className="admin-form__grid">
            <input
              type="text"
              placeholder="Home Coach"
              value={homeCoach}
              onChange={(e) => setHomeCoach(e.target.value)}
            />

            <input
              type="text"
              placeholder="Away Coach"
              value={awayCoach}
              onChange={(e) => setAwayCoach(e.target.value)}
            />
          </div>

          <div className="admin-actions" style={{ marginBottom: "1rem" }}>
            <button type="button" onClick={handleUseTeamCoachNames}>
              Load Team Coach Names
            </button>
          </div>

          <div className="search-modal__grid">
            <div className="search-panel">
              <h3>{selectedMatch.homeTeam} Starters</h3>
              <p>
                <strong>Coach:</strong> {homeCoach || "No coach assigned"}
              </p>

              {homeTeam?.players?.length ? (
                homeTeam.players.map((player) => (
                  <label className="remember-me" key={player.id}>
                    <input
                      type="checkbox"
                      checked={homePlayerIds.includes(player.id)}
                      onChange={() => togglePlayer("home", player.id)}
                    />
                    <span>
                      {player.name} — {player.position || "No position"}
                    </span>
                  </label>
                ))
              ) : (
                <p>No players available.</p>
              )}
            </div>

            <div className="search-panel">
              <h3>{selectedMatch.awayTeam} Starters</h3>
              <p>
                <strong>Coach:</strong> {awayCoach || "No coach assigned"}
              </p>

              {awayTeam?.players?.length ? (
                awayTeam.players.map((player) => (
                  <label className="remember-me" key={player.id}>
                    <input
                      type="checkbox"
                      checked={awayPlayerIds.includes(player.id)}
                      onChange={() => togglePlayer("away", player.id)}
                    />
                    <span>
                      {player.name} — {player.position || "No position"}
                    </span>
                  </label>
                ))
              ) : (
                <p>No players available.</p>
              )}
            </div>
          </div>

          <div className="admin-actions">
            <button type="button" onClick={handleSaveLineup}>
              Save Lineup
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManageLineups;