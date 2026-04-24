import { useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MatchCard from "../components/sports/MatchCard";
import { useAppData } from "../context/AppDataContext";

function Fixtures() {
  const { fixtures = [], sports = [] } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const availableSports = useMemo(() => {
    return sports
      .map((item) => String(item.name || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [sports]);

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
        fixture.gender,
        fixture.status,
        fixture.competitionGroup,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = combined.includes(searchTerm.toLowerCase());

      const matchesSport =
        sportFilter === "all" ||
        String(fixture.sport || "").toLowerCase() === sportFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "all" ||
        String(fixture.category || fixture.gender || "").toLowerCase() ===
          categoryFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        String(fixture.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesCategory && matchesStatus;
    });
  }, [fixtures, searchTerm, sportFilter, categoryFilter, statusFilter]);

  const groupedFixtures = useMemo(() => {
    const grouped = filteredFixtures.reduce((acc, fixture) => {
      const key = fixture.date || "Undated";

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(fixture);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        matches: grouped[date].sort((a, b) =>
          String(a.kickoffTime || "").localeCompare(String(b.kickoffTime || ""))
        ),
      }));
  }, [filteredFixtures]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Fixtures</h1>
            <p className="page-intro">View upcoming match schedules and fixtures.</p>
          </div>

          <div className="page-card">
            <div className="team-search-bar">
              <input
                type="text"
                placeholder="Search fixtures by team, sport, competition, stage, or venue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
                <option value="all">All Sports</option>
                {availableSports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>

            {groupedFixtures.length ? (
              groupedFixtures.map(({ date, matches }) => (
                <section className="fixture-group" key={date}>
                  <h2 className="fixture-group__title">{date}</h2>
                  <div className="match-list">
                    {matches.map((fixture) => (
                      <MatchCard
                        key={fixture.id || fixture.localId}
                        match={fixture}
                        type="fixture"
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p>No fixtures match your selected filters.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Fixtures;