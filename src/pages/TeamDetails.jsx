import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function TeamDetails() {
  const { id } = useParams();
  const { teams, getTeamFixtures } = useAppData();

  const team = teams.find((item) => String(item.id) === String(id));

  if (!team) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="container">
            <div className="page-card">
              <p>Team not found.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const fixtures = getTeamFixtures(team.id);
  const played = fixtures.filter((fixture) => fixture.status === "Ended");
  const upcoming = fixtures.filter(
    (fixture) => fixture.status === "Upcoming" && !fixture.postponed
  );
  const liveMatches = fixtures
    .filter((fixture) => ["Live", "Halftime", "Break"].includes(fixture?.status))
    .slice(0, 2);

  const displayName =
    team.displayName ||
    `${team.department || team.name} ${team.sport || ""} ${team.category || ""}`.trim();

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>{displayName}</h1>
            <p className="page-intro">
              Team profile, squad details, and match history.
            </p>
          </div>

          <div className="page-card">
            <div className="team-details">
              <div className="team-details__hero">
                <img src={team.logo} alt={displayName} className="team-details__logo" />
                <div className="hermes-card">
                  <h2 style={{ color: "#fff", marginTop: 0 }}>{displayName}</h2>
                  <p>{team.about}</p>
                  <p>
                    <strong>Department:</strong> {team.department || team.name}
                  </p>
                  <p>
                    <strong>Sport:</strong> {team.sport || "Not assigned"}
                  </p>
                  <p>
                    <strong>Category:</strong> {team.category}
                  </p>
                </div>
              </div>

              <div className="team-details__grid">
                <div className="team-panel">
                  <div className="hermes-card">
                  <h2>Coach Details</h2>
                  <p>
                    <strong>Name:</strong> {team.coach?.name || "Not updated"}
                  </p>
                  <p>
                    <strong>About:</strong> {team.coach?.about || "Not updated"}
                  </p>
                  <p>
                    <strong>Played:</strong> {played.length}
                  </p>
                  <p>
                    <strong>Upcoming:</strong> {upcoming.length}
                  </p>
                  <p>
                    <strong>Live:</strong> {liveMatches.length}
                  </p>
                  </div>
                </div>

                <div className="team-panel">
                  <h2>Team Match History</h2>
                  {fixtures.length ? (
                    <div className="search-list">
                      {fixtures.map((fixture) => (
                        <div className="search-list__item" key={fixture.id}>
                          <div className="team-match-history__title">
                            {fixture.homeTeam || "Home"} {fixture.score?.home ?? 0} -{" "}
                            {fixture.score?.away ?? 0} {fixture.awayTeam || "Away"}
                          </div>
                          <p>
                            {fixture.date || "No date"} • {fixture.sport || "Sport"} •{" "}
                            {fixture.status || "Unknown"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No match history available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="page-card">
            <h2 style={{ color: "#fff", marginTop: 0 }}>Squad List</h2>

            {team.players?.length ? (
              <div className="player-list">
                {team.players.map((player) => (
                  <Link
                    to={`/players/${team.id}/${player.id}`}
                    className="player-card"
                    key={player.id}
                  >
                    <h3 className="player-card__name">{player.name || "Unnamed Player"}</h3>
                    <p>
                      <strong>Position:</strong> {player.position}
                    </p>
                    <p>
                      <strong>Jersey:</strong> {player.jerseyNumber}
                    </p>
                    <p>
                      <strong>Appearances:</strong> {player.appearances || 0}
                    </p>
                    <p>
                      <strong>Goals:</strong> {player.goals || 0}
                    </p>
                    <p>
                      <strong>Clean Sheets:</strong> {player.cleanSheets || 0}
                    </p>
                    <p>
                      <strong>Points:</strong> {player.points || 0}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No players added yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default TeamDetails;