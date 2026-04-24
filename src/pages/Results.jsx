import { useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MatchCard from "../components/sports/MatchCard";
import { useAppData } from "../context/AppDataContext";

function Results() {
  const { results = [], sports = [] } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const availableSports = useMemo(() => {
    return sports
      .map((item) => String(item.name || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [sports]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const combined = [
        result.homeTeam,
        result.awayTeam,
        result.sport,
        result.category,
        result.gender,
        result.stage,
        result.competitionName,
        result.summary,
        result.venue,
        result.competitionGroup,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = combined.includes(searchTerm.toLowerCase());

      const matchesSport =
        sportFilter === "all" ||
        String(result.sport || "").toLowerCase() === sportFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "all" ||
        String(result.category || result.gender || "").toLowerCase() ===
          categoryFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesCategory;
    });
  }, [results, searchTerm, sportFilter, categoryFilter]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) =>
      `${String(b.date || "")} ${String(b.kickoffTime || "")}`.localeCompare(
        `${String(a.date || "")} ${String(a.kickoffTime || "")}`
      )
    );
  }, [filteredResults]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Results</h1>
            <p className="page-intro">Check out the latest completed match results.</p>
          </div>

          <div className="page-card">
            <div className="team-search-bar">
              <input
                type="text"
                placeholder="Search by team, sport, competition, stage, venue, or summary"
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
            </div>

            <div className="match-list">
              {sortedResults.length ? (
                sortedResults.map((result) => (
                  <MatchCard key={result.id} match={result} type="result" />
                ))
              ) : (
                <p>No results match your selected filters.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Results;