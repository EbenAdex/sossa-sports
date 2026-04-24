import { useMemo } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MatchCard from "../components/sports/MatchCard";
import { useAppData } from "../context/AppDataContext";

function Favourites() {
  const { fixtures = [], favourites = [] } = useAppData();

  const favouriteMatches = useMemo(() => {
    const favouriteIds = new Set(
      favourites.map((item) => String(item.matchId || "")).filter(Boolean)
    );

    return fixtures.filter((fixture) =>
      favouriteIds.has(String(fixture.id || fixture.localId || ""))
    );
  }, [fixtures, favourites]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Favourite Matches</h1>
            <p className="page-intro">
              Track matches you have marked for quick access and updates.
            </p>
          </div>

          <div className="page-card">
            {favouriteMatches.length ? (
              <div className="match-list">
                {favouriteMatches.map((match) => (
                  <MatchCard
                    key={match.id || match.localId}
                    match={match}
                    type="fixture"
                  />
                ))}
              </div>
            ) : (
              <p>No favourite matches yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Favourites;