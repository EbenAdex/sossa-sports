import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";
import facultyDepartments from "../data/facultyDepartments";
import heroImage from "../assets/sossamania-herro.jpg";

function asText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatLiveMatchTimer(timing) {
  const currentTiming = timing || {};
  const periodDurationMinutes = Number(currentTiming.periodDurationMinutes || 30);
  const totalSeconds = periodDurationMinutes * 60;

  let elapsed = Number(currentTiming.elapsedSeconds || 0);

  if (currentTiming.isRunning && currentTiming.currentPeriodStartedAt) {
    const startedAt = new Date(currentTiming.currentPeriodStartedAt).getTime();
    const now = Date.now();
    const liveElapsed = Math.max(Math.floor((now - startedAt) / 1000), 0);
    elapsed += liveElapsed;
  }

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function Home() {
  const navigate = useNavigate();
  const appData = useAppData() || {};

  const fixtures = asArray(appData.fixtures);
  const results = asArray(appData.results);
  const news = asArray(appData.news);
  const sports = asArray(appData.sports);
  const teams = asArray(appData.teams);
  const favourites = asArray(appData.favourites);
  const getSortedTable =
    typeof appData.getSortedTable === "function" ? appData.getSortedTable : () => [];

  const [searchCategory, setSearchCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const liveMatches = fixtures
    .filter((fixture) => ["Live", "Halftime", "Break"].includes(asText(fixture?.status)))
    .slice(0, 2);

  const upcomingFixtures = fixtures
    .filter(
      (fixture) =>
        asText(fixture?.status) === "Upcoming" && !Boolean(fixture?.postponed)
    )
    .slice(0, 4);

  const recentResults = results.slice(0, 4);
  const topStandings = asArray(getSortedTable("Football", "Male")).slice(0, 5);

 const qualifiedDepartments = useMemo(() => {
  const qualifiedDepartmentNames = new Set(
    teams
      .filter((team) => Boolean(team?.qualified))
      .map((team) => String(team.department || team.name || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return qualifiedDepartmentNames.size || facultyDepartments.length;
}, [teams]);

const totalTeams = teams.length;

  const searchableTeams = useMemo(() => {
    return teams.filter((team) => {
      const category = asText(team?.category).toLowerCase();
      const validCategory = ["male", "female"].includes(category);

      if (!validCategory) return false;

      return searchCategory === "all" || category === searchCategory.toLowerCase();
    });
  }, [teams, searchCategory]);

  const searchablePlayers = useMemo(() => {
    return searchableTeams.flatMap((team) =>
      asArray(team.players).map((player) => ({
        ...player,
        teamId: team.id,
        teamName: team.displayName || `${team.department || team.name} ${team.sport || ""} ${team.category || ""}`.trim(),
        category: team.category,
        sport: team.sport,
      }))
    );
  }, [searchableTeams]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchableTeams.filter((team) => {
      const displayName = asText(
        team?.displayName,
        `${asText(team?.department || team?.name)} ${asText(team?.sport)} ${asText(team?.category)}`
      ).toLowerCase();

      const departmentName = asText(team?.department || team?.name).toLowerCase();
      const sportName = asText(team?.sport).toLowerCase();

      return (
        displayName.includes(query) ||
        departmentName.includes(query) ||
        sportName.includes(query)
      );
    });
  }, [searchQuery, searchableTeams]);

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchablePlayers.filter((player) =>
      asText(player?.name).toLowerCase().includes(query)
    );
  }, [searchQuery, searchablePlayers]);

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matchedTeam = filteredTeams[0];
    if (matchedTeam) {
      navigate(`/teams/${matchedTeam.id}`);
      return;
    }

    const matchedPlayer = filteredPlayers[0];
    if (matchedPlayer) {
      navigate(`/players/${matchedPlayer.teamId}/${matchedPlayer.id}`);
      return;
    }

    alert("No matching team or player found.");
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <>
      <Navbar />

      <main className="homepage">
        <section
          className="homepage-hero"
          style={{
            backgroundImage: `linear-gradient(
              90deg,
              rgba(4, 15, 38, 0.72) 0%,
              rgba(4, 15, 38, 0.52) 38%,
              rgba(4, 15, 38, 0.2) 65%,
              rgba(4, 15, 38, 0.38) 100%
            ), url(${heroImage})`,
          }}
        >
          <div className="container">
            <div className="homepage-hero__content">
              <p className="homepage-hero__tag">SossaMania Competition Platform</p>
              <h1>Welcome to SossaMania</h1>
              <p>
                Track fixtures, results, rankings, standings, teams, and live match
                events across faculty games and departmental competitions.
              </p>

              <div className="homepage-hero__actions">
                <Link to="/fixtures" className="btn btn--primary">
                  View Fixtures
                </Link>
                <Link to="/results" className="btn btn--outline">
                  View Results
                </Link>
              </div>

              <div className="homepage-stats">
                <div className="homepage-stat-card">
                  <strong>{sports.length}</strong>
                  <span>Sports</span>
                </div>
               <div className="homepage-stat-card">
  <strong>{qualifiedDepartments}</strong>
  <span>Qualified Teams</span>
</div>

<div className="homepage-stat-card">
  <strong>{totalTeams}</strong>
  <span>Total Squads</span>
</div>
                <div className="homepage-stat-card">
                  <strong>{liveMatches.length}</strong>
                  <span>Live Matches</span>
                </div>
                <div className="homepage-stat-card">
                  <strong>{favourites.length}</strong>
                  <span>Watchlist</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-search-block">
          <div className="container">
            <div className="homepage-panel">
              <h2>Search Teams and Players</h2>
              <p>Search across male and female teams and player rosters.</p>

              <div className="homepage-search-row">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <input
                  type="text"
                  placeholder="Search by team or player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />

                <button type="button" className="btn btn--primary" onClick={handleSearch}>
                  Search
                </button>
              </div>

              {!!searchQuery.trim() && (
                <div className="homepage-search-results">
                  {filteredTeams.length > 0 && (
                    <div className="homepage-search-results__block">
                      <h3>Teams</h3>
                      <div className="search-list">
                        {filteredTeams.slice(0, 5).map((team) => (
                          <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className="search-list__item"
                          >
                            <strong>
                              {team.displayName ||
                                `${team.department || team.name} ${team.sport || ""} ${team.category || ""}`.trim()}
                            </strong>
                            <p>
                              {team.department || team.name} • {team.sport || "No sport"} •{" "}
                              {team.category || "No category"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPlayers.length > 0 && (
                    <div className="homepage-search-results__block">
                      <h3>Players</h3>
                      <div className="search-list">
                        {filteredPlayers.slice(0, 5).map((player) => (
                          <Link
                            key={`${player.teamId}-${player.id}`}
                            to={`/players/${player.teamId}/${player.id}`}
                            className="search-list__item"
                          >
                            <strong>{player.name}</strong>
                            <p>
                              {player.teamName} • {player.position || "No position"} •{" "}
                              {player.category || "No category"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTeams.length === 0 && filteredPlayers.length === 0 && (
                    <p className="homepage-empty">No matching team or player found.</p>
                  )}
                </div>
              )}

              <div className="homepage-sports-grid">
                {sports.length ? (
                  sports.map((sport) => (
                    <Link
                      to={asText(sport?.link, "#")}
                      className="homepage-sport-card"
                      key={asText(sport?.id, asText(sport?.name, "sport"))}
                    >
                      <div className="homepage-sport-card__image-wrap">
                        <img
                          src={
                            asText(sport?.name).toLowerCase() === "football"
                              ? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80"
                              : asText(sport?.name).toLowerCase() === "basketball"
                              ? "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80"
                              : asText(sport?.name).toLowerCase() === "volleyball"
                              ? "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80"
                              : "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80"
                          }
                          alt={asText(sport?.name, "Sport")}
                        />
                      </div>
                      <h3>{asText(sport?.name, "Sport")}</h3>
                    </Link>
                  ))
                ) : (
                  <p className="homepage-empty">No sports available yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-body">
          <div className="container homepage-body__grid">
            <div className="homepage-main">
              <div className="homepage-panel">
                <div className="homepage-section-head">
                  <h2>Live Matches</h2>
                  <Link to="/fixtures">More</Link>
                </div>

                {liveMatches.length ? (
                  <div className="homepage-match-grid">
                    {liveMatches.map((match) => (
                      <div className="homepage-match-card" key={asText(match?.id, "match")}>
                        <div className="homepage-match-card__top">
                          <span>{asText(match?.competitionName, "Competition")}</span>
                          <span className="homepage-badge">LIVE</span>
                        </div>

                        <h3>
                          {asText(match?.homeTeam, "Home")}{" "}
                          <strong>{asNumber(match?.score?.home, 0)}</strong> -{" "}
                          <strong>{asNumber(match?.score?.away, 0)}</strong>{" "}
                          {asText(match?.awayTeam, "Away")}
                        </h3>

                        <p>
                          <strong>Phase:</strong> {asText(match?.timing?.phase, match?.status || "Live")}
                        </p>

                        <p>
                          <strong>Timer:</strong> {formatLiveMatchTimer(match?.timing)}
                        </p>

                        <Link to={`/match/${match?.id}`} className="homepage-link-btn">
                          Match Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="homepage-empty">No live matches available.</p>
                )}
              </div>

              <div className="homepage-panel">
                <div className="homepage-section-head">
                  <h2>Upcoming Fixtures</h2>
                  <Link to="/fixtures">More</Link>
                </div>

                {upcomingFixtures.length ? (
                  <div className="homepage-fixture-grid">
                    {upcomingFixtures.map((fixture) => (
                      <div className="homepage-fixture-card" key={asText(fixture?.id, "fixture")}>
                        <h3>
                          {asText(fixture?.homeTeam, "Home")} vs{" "}
                          {asText(fixture?.awayTeam, "Away")}
                        </h3>
                        <p>{asText(fixture?.competitionName, "Competition")}</p>
                        <p>
                          {asText(fixture?.sport, "Sport")} •{" "}
                          {asText(fixture?.category || fixture?.gender, "Category")}
                        </p>
                        <p>{asText(fixture?.date, "Date")}</p>
                        <p>
                          {asText(fixture?.kickoffTime, "--")} • {asText(fixture?.venue, "Venue")}
                        </p>
                        <p>{asText(fixture?.stage, "Stage")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="homepage-empty">No upcoming fixtures available.</p>
                )}
              </div>

              <div className="homepage-panel">
                <div className="homepage-section-head">
                  <h2>Latest News</h2>
                  <Link to="/news">More</Link>
                </div>

                {news.length ? (
                  <div className="homepage-news-grid">
                    {news.slice(0, 2).map((item) => (
                      <div className="homepage-news-card" key={asText(item?.id, "news")}>
                        <div className="homepage-news-card__image">
                          <img
                            src={asText(item?.image, "")}
                            alt={asText(item?.title, "News")}
                          />
                        </div>
                        <div className="homepage-news-card__content">
                          <h3>{asText(item?.title, "News Title")}</h3>
                          <p>{asText(item?.summary, "No summary available.")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="homepage-empty">No news available.</p>
                )}
              </div>
            </div>

            <aside className="homepage-sidebar">
              <div className="homepage-panel">
                <div className="homepage-section-head">
                  <h2>Recent Results</h2>
                  <Link to="/results">More</Link>
                </div>

                {recentResults.length ? (
                  <div className="homepage-side-list">
                    {recentResults.map((result) => (
                      <div className="homepage-side-card" key={asText(result?.id, "result")}>
                        <h4>
                          {asText(result?.homeTeam, "Home")} {asNumber(result?.homeScore, 0)} -{" "}
                          {asNumber(result?.awayScore, 0)} {asText(result?.awayTeam, "Away")}
                        </h4>
                        <p>{asText(result?.competitionName, "Competition")}</p>
                        <p>
                          {asText(result?.sport, "Sport")} •{" "}
                          {asText(result?.category || result?.gender, "Category")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="homepage-empty">No recent results.</p>
                )}
              </div>

              <div className="homepage-panel">
                <div className="homepage-section-head">
                  <h2>Top Standings</h2>
                  <Link to="/table">More</Link>
                </div>

                {topStandings.length ? (
                  <div className="homepage-table-wrap">
                    <table className="homepage-table">
                      <thead>
                        <tr>
                          <th>Pos</th>
                          <th>Team</th>
                          <th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStandings.map((team) => (
                          <tr
                            key={asText(
                              team?.id,
                              `${asText(team?.team, "team")}-${asNumber(team?.position, 0)}`
                            )}
                          >
                            <td>{asNumber(team?.position, 0)}</td>
                            <td>{asText(team?.team, "Unknown Team")}</td>
                            <td>{asNumber(team?.points, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="homepage-empty">No standings available.</p>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;