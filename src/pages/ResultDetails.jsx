import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function asText(value, fallback = "N/A") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function ResultDetails() {
  const { id } = useParams();
  const { results } = useAppData();

  const result = useMemo(() => {
    return asArray(results).find((item) => String(item?.id) === String(id));
  }, [results, id]);

  if (!result) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="container">
            <div className="page-card">
              <p>Result not found.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const events = asArray(result.events);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>
              {asText(result.homeTeam, "Home")} {asNumber(result.homeScore, 0)} -{" "}
              {asNumber(result.awayScore, 0)} {asText(result.awayTeam, "Away")}
            </h1>
            <p className="page-intro">Full match result details and live-event summary.</p>
          </div>

          <div className="page-grid">
            <div className="page-card">
              <h3>Match Information</h3>
              <p><strong>Competition:</strong> {asText(result.competitionName)}</p>
              <p><strong>Competition Type:</strong> {asText(result.competitionType)}</p>
              <p><strong>Sport:</strong> {asText(result.sport)}</p>
              <p><strong>Category:</strong> {asText(result.category || result.gender)}</p>
              <p><strong>Stage:</strong> {asText(result.stage)}</p>
              <p><strong>Group:</strong> {asText(result.competitionGroup)}</p>
              <p><strong>Date:</strong> {asText(result.date)}</p>
              <p><strong>Kickoff Time:</strong> {asText(result.kickoffTime)}</p>
              <p><strong>End Time:</strong> {asText(result.endTime)}</p>
              <p><strong>Venue:</strong> {asText(result.venue)}</p>
            </div>

            <div className="page-card">
              <h3>Summary</h3>
              <p>{asText(result.summary, "No summary available.")}</p>
            </div>

            <div className="page-card">
              <h3>Cards and Substitutions</h3>
              <p><strong>Home Yellow Cards:</strong> {asNumber(result.cards?.homeYellow, 0)}</p>
              <p><strong>Away Yellow Cards:</strong> {asNumber(result.cards?.awayYellow, 0)}</p>
              <p><strong>Home Red Cards:</strong> {asNumber(result.cards?.homeRed, 0)}</p>
              <p><strong>Away Red Cards:</strong> {asNumber(result.cards?.awayRed, 0)}</p>
              <p><strong>Home Substitutions:</strong> {asNumber(result.substitutions?.home, 0)}</p>
              <p><strong>Away Substitutions:</strong> {asNumber(result.substitutions?.away, 0)}</p>
            </div>

            <div className="page-card">
              <h3>Event Timeline</h3>

              {events.length ? (
                <div className="admin-list">
                  {events.map((event, index) => (
                    <div
                      key={event?.id ? String(event.id) : `event-${index}`}
                      className="admin-list-card"
                    >
                      <p><strong>Type:</strong> {asText(event?.type)}</p>
                      <p><strong>Minute:</strong> {asText(event?.minute)}</p>
                      <p><strong>Team Side:</strong> {asText(event?.teamSide)}</p>
                      <p><strong>Player ID:</strong> {asText(event?.playerId)}</p>
                      <p><strong>Player In:</strong> {asText(event?.playerInId)}</p>
                      <p><strong>Player Out:</strong> {asText(event?.playerOutId)}</p>
                      <p><strong>Points Value:</strong> {asText(event?.pointsValue)}</p>
                      <p><strong>Details:</strong> {asText(event?.details || event?.note)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No event details recorded.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ResultDetails;