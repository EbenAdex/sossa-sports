import { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

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

function MatchDetails() {
  const { id } = useParams();
  const { fixtures, getTeamById, getSportRuleBySport } = useAppData();

  const match = useMemo(() => {
    return asArray(fixtures).find((item) => String(item.id) === String(id)) || null;
  }, [fixtures, id]);

  const rule = useMemo(() => {
    if (!match) return null;
    return getSportRuleBySport(match.sport);
  }, [match, getSportRuleBySport]);

  const timing = match?.timing || {};

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!match || !rule || rule.mode !== "clock" || match.status !== "Live") {
      setElapsedSeconds(0);
      return;
    }

    const computeElapsed = () => {
      const currentTiming = match.timing || {};
      const storedElapsed = asNumber(currentTiming.elapsedSeconds, 0);

      if (!currentTiming.isRunning || !currentTiming.currentPeriodStartedAt) {
        return storedElapsed;
      }

      const startedAt = new Date(currentTiming.currentPeriodStartedAt).getTime();
      const now = Date.now();
      const liveElapsed = Math.floor((now - startedAt) / 1000);

      return Math.max(storedElapsed + liveElapsed, 0);
    };

    setElapsedSeconds(computeElapsed());

    const interval = setInterval(() => {
      setElapsedSeconds(computeElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [match, rule]);

  const totalPeriodSeconds =
    asNumber((timing.periodDurationMinutes || rule?.minutesPerPeriod || 30) || 30, 0) * 60;

  const derivedRemainingSeconds =
    rule?.mode === "clock" ? Math.max(totalPeriodSeconds - elapsedSeconds, 0) : 0;

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(asNumber(totalSeconds, 0) / 60);
    const seconds = asNumber(totalSeconds, 0) % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (!match) {
    return (
      <>
        <Navbar />
        <main className="page section">
          <div className="container">
            <p>Match not found.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);

  const resolvePlayerName = (team, playerId) =>
    asText(
      asArray(team?.players).find((player) => String(player.id) === String(playerId))?.name,
      "Unknown Player"
    );

  return (
    <>
      <Navbar />
      <main className="page section">
        <div className="container">
          <div className="match-details-page">
            <section className="match-details-hero">
              <p className="match-details-hero__meta">
                {asText(match.sport, "Sport")} • {asText(match.category, "Category")}
              </p>

              <h1 className="match-details-hero__title">
                {asText(match.homeTeam, "Home")} <span>{asNumber(match.score?.home, 0)}</span> -{" "}
                <span>{asNumber(match.score?.away, 0)}</span> {asText(match.awayTeam, "Away")}
              </h1>

              <p className="match-details-hero__status">
                Status: {match.postponed ? "Postponed" : asText(match.status, "N/A")}
              </p>

              {match.status === "Live" && rule?.mode === "clock" && (
                <p className="match-details-hero__timer">
                  <strong>
                    {asText(timing.periodLabel || rule?.periodLabel, "Half")} {asNumber(timing.currentPeriod, 0)}: {formatSeconds(derivedRemainingSeconds)}
                  </strong>
                </p>
              )}

              {match.status === "Live" && rule?.mode === "sets" && (
                <p className="match-details-hero__timer">
                  <strong>
                    Set {asNumber(timing.currentSetNumber, 0)}: {asText(match.homeTeam, "Home")} {asNumber(timing.currentSetHome, 0)} - {asNumber(timing.currentSetAway, 0)} {asText(match.awayTeam, "Away")}
                  </strong>
                </p>
              )}
            </section>

            <section className="match-details-grid">
              <div className="match-panel">
                <h2>Match Information</h2>
                <p><strong>Competition:</strong> {asText(match.competitionName, "N/A")}</p>
                <p><strong>Competition Type:</strong> {asText(match.competitionType, "N/A")}</p>
                <p><strong>Stage:</strong> {asText(match.stage, "N/A")}</p>
                <p><strong>Group:</strong> {asText(match.competitionGroup, "N/A")}</p>
                <p><strong>Date:</strong> {asText(match.date, "N/A")}</p>
                <p><strong>Kickoff:</strong> {asText(match.kickoffTime, "N/A")}</p>
                <p><strong>End Time:</strong> {asText(match.endTime, "N/A")}</p>
                <p><strong>Venue:</strong> {asText(match.venue, "N/A")}</p>
              </div>

              <div className="match-panel">
                <h2>Match Statistics</h2>
                <p><strong>{asText(match.homeTeam, "Home")}</strong> — Yellow Cards: {asNumber(match.cards?.homeYellow, 0)}</p>
                <p><strong>{asText(match.awayTeam, "Away")}</strong> — Yellow Cards: {asNumber(match.cards?.awayYellow, 0)}</p>
                <p><strong>{asText(match.homeTeam, "Home")}</strong> — Red Cards: {asNumber(match.cards?.homeRed, 0)}</p>
                <p><strong>{asText(match.awayTeam, "Away")}</strong> — Red Cards: {asNumber(match.cards?.awayRed, 0)}</p>
                <p><strong>{asText(match.homeTeam, "Home")}</strong> — Substitutions: {asNumber(match.substitutions?.home, 0)}</p>
                <p><strong>{asText(match.awayTeam, "Away")}</strong> — Substitutions: {asNumber(match.substitutions?.away, 0)}</p>
              </div>
            </section>

            <section className="match-details-grid">
              <div className="match-panel">
                <h2>Lineups</h2>

                <div className="lineup-block">
                  <h3>{asText(match.homeTeam, "Home")}</h3>
                  <p><strong>Coach:</strong> {asText(match.lineups?.homeCoach, "Not yet updated")}</p>
                  {asArray(match.lineups?.homePlayerIds).length ? (
                    <ul className="lineup-list">
                      {asArray(match.lineups?.homePlayerIds).map((playerId) => (
                        <li key={String(playerId)}>
                          {resolvePlayerName(homeTeam, playerId)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No lineup submitted yet.</p>
                  )}
                </div>

                <div className="lineup-block">
                  <h3>{asText(match.awayTeam, "Away")}</h3>
                  <p><strong>Coach:</strong> {asText(match.lineups?.awayCoach, "Not yet updated")}</p>
                  {asArray(match.lineups?.awayPlayerIds).length ? (
                    <ul className="lineup-list">
                      {asArray(match.lineups?.awayPlayerIds).map((playerId) => (
                        <li key={String(playerId)}>
                          {resolvePlayerName(awayTeam, playerId)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No lineup submitted yet.</p>
                  )}
                </div>
              </div>

              <div className="match-panel">
                <h2>Live Events</h2>

                {asArray(match.events).length ? (
                  <div className="events-list">
                    {asArray(match.events).map((item) => {
                      const currentTeam = item.teamSide === "home" ? homeTeam : awayTeam;

                      return (
                        <div className="event-item" key={String(item.id)}>
                          <strong>{asText(item.minute, "0")}</strong> — {asText(item.type, "Event")} —{" "}
                          {item.type === "Substitution"
                            ? `${resolvePlayerName(currentTeam, item.playerOutId)} out, ${resolvePlayerName(
                                currentTeam,
                                item.playerInId
                              )} in`
                            : resolvePlayerName(currentTeam, item.playerId)}
                          {item.note ? ` — ${asText(item.note, "")}` : ""}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No live events yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MatchDetails;