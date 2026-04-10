import { useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MatchCard from "../components/sports/MatchCard";
import { useAppData } from "../context/AppDataContext";

function Results() {
  const { results } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const combined = [
        result.homeTeam,
        result.awayTeam,
        result.sport,
        result.category,
        result.stage,
        result.competitionName,
        result.summary,
        result.venue,
      ]
        .join(" ")
        .toLowerCase();

      return combined.includes(searchTerm.toLowerCase());
    });
  }, [results, searchTerm]);

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
            </div>

            <div className="match-list">
              {filteredResults.length ? (
                filteredResults.map((result) => (
                  <MatchCard key={result.id} match={result} type="result" />
                ))
              ) : (
                <p>No results match your search.</p>
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