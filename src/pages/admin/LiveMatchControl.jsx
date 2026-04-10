import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppData } from "../../context/AppDataContext";

function text(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function LiveMatchControl() {
  const {
    fixtures,
    getTeamById,
    getSportRuleBySport,
    updateFixtureWithCallback,
    recalculateAllPlayerStats,
    syncSingleResultFromFixture,
    recalculateTablesFromEndedFixtures,
  } = useAppData();

  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);

  const [eventForm, setEventForm] = useState({
    minute: "",
    type: "Goal",
    teamSide: "home",
    playerId: "",
    playerInId: "",
    playerOutId: "",
    pointsValue: "1",
    note: "",
  });

  useEffect(() => {
    if (!selectedMatchId && fixtures.length) {
      setSelectedMatchId(String(fixtures[0].id));
    }
  }, [fixtures, selectedMatchId]);

  const selectedMatch = useMemo(() => {
    return fixtures.find((match) => String(match.id) === String(selectedMatchId)) || null;
  }, [fixtures, selectedMatchId]);

  const rule = useMemo(() => {
    if (!selectedMatch) return null;
    return getSportRuleBySport(selectedMatch.sport);
  }, [selectedMatch, getSportRuleBySport]);

  const timing = selectedMatch?.timing || {};

  const normalizeSport = (sport) => text(sport).trim().toLowerCase();

  const currentTeam = useMemo(() => {
    if (!selectedMatch) return null;
    return eventForm.teamSide === "home"
      ? getTeamById(selectedMatch.homeTeamId)
      : getTeamById(selectedMatch.awayTeamId);
  }, [selectedMatch, eventForm.teamSide, getTeamById]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!selectedMatch || !rule || rule.mode !== "clock") {
      setElapsedSeconds(0);
      return;
    }

    const computeElapsed = () => {
      const currentTiming = selectedMatch.timing || {};
      const storedElapsed = num(currentTiming.elapsedSeconds, 0);

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
  }, [selectedMatch, rule]);

  const totalPeriodSeconds =
    num((timing.periodDurationMinutes || rule?.minutesPerPeriod || 30) || 30, 0) * 60;

  const derivedRemainingSeconds =
    rule?.mode === "clock" ? Math.max(totalPeriodSeconds - elapsedSeconds, 0) : 0;

  const getCurrentClockMinute = () => {
    if (!rule || rule.mode !== "clock") return "";

    const periodMinutes = num(timing.periodDurationMinutes || rule.minutesPerPeriod, 30);
    const currentPeriod = num(timing.currentPeriod, 1);
    const elapsedMinutesInCurrentPeriod = Math.floor(elapsedSeconds / 60);
    const totalElapsedBeforeThisPeriod = (currentPeriod - 1) * periodMinutes;
    const totalMinute = totalElapsedBeforeThisPeriod + elapsedMinutesInCurrentPeriod;

    return String(totalMinute);
  };

  useEffect(() => {
    if (!selectedMatch || !rule || editingEventId) return;

    if (rule.mode === "clock") {
      setEventForm((prev) => ({
        ...prev,
        minute: getCurrentClockMinute(),
      }));
    }
  }, [elapsedSeconds, selectedMatch, rule, editingEventId]);

  useEffect(() => {
  if (!selectedMatch || !rule) return;
  if (rule.mode !== "clock") return;
  if (!timing.isRunning) return;
  if (num(timing.currentPeriod, 0) < 1) return;
  if (!timing.currentPeriodStartedAt) return;

  const storedElapsed = num(timing.elapsedSeconds, 0);
  const startedAt = new Date(timing.currentPeriodStartedAt).getTime();
  const now = Date.now();
  const liveElapsed = Math.max(Math.floor((now - startedAt) / 1000), 0);
  const totalLiveElapsed = storedElapsed + liveElapsed;

  if (totalLiveElapsed < totalPeriodSeconds) return;

  const autoStop = async () => {
    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const current = match.timing || {};
      const currentPeriod = num(current.currentPeriod, 1);
      const totalPeriods = num(current.totalPeriods || rule.periods, 2);
      const isFinalPeriod = currentPeriod >= totalPeriods;

      return {
        ...match,
        status: isFinalPeriod ? "Ended" : "Halftime",
        timing: {
          ...current,
          isRunning: false,
          phase: isFinalPeriod ? "Ended" : "Halftime",
          elapsedSeconds: totalPeriodSeconds,
          currentPeriodStartedAt: null,
        },
      };
    });

    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  autoStop();
}, [
  selectedMatch,
  rule,
  timing.isRunning,
  timing.currentPeriod,
  timing.elapsedSeconds,
  timing.currentPeriodStartedAt,
  totalPeriodSeconds,
  updateFixtureWithCallback,
  recalculateAllPlayerStats,
  syncSingleResultFromFixture,
  recalculateTablesFromEndedFixtures,
]);
  const resetEventForm = () => {
    setEventForm({
      minute: rule?.mode === "clock" ? getCurrentClockMinute() : "",
      type: normalizeSport(selectedMatch?.sport) === "football" ? "Goal" : "Score",
      teamSide: "home",
      playerId: "",
      playerInId: "",
      playerOutId: "",
      pointsValue: "1",
      note: "",
    });
    setEditingEventId(null);
  };

  const handleEventChange = (event) => {
    const { name, value } = event.target;

    setEventForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "teamSide" ? { playerId: "", playerInId: "", playerOutId: "" } : {}),
    }));
  };

  const recalculateMatchFromEvents = (match, events) => {
    const sport = normalizeSport(match.sport);

    const nextMatch = {
      ...match,
      score: { home: 0, away: 0 },
      cards: {
        homeYellow: 0,
        awayYellow: 0,
        homeRed: 0,
        awayRed: 0,
      },
      substitutions: {
        home: 0,
        away: 0,
      },
      events,
    };

    events.forEach((item) => {
      if (sport === "football" && item.type === "Goal") {
        nextMatch.score[item.teamSide] += 1;
      }

      if (["basketball", "volleyball", "table tennis"].includes(sport) && item.type === "Score") {
        nextMatch.score[item.teamSide] += num(item.pointsValue, 1);
      }

      if (item.type === "Yellow Card") {
        nextMatch.cards[item.teamSide === "home" ? "homeYellow" : "awayYellow"] += 1;
      }

      if (item.type === "Red Card") {
        nextMatch.cards[item.teamSide === "home" ? "homeRed" : "awayRed"] += 1;
      }

      if (item.type === "Substitution") {
        nextMatch.substitutions[item.teamSide] += 1;
      }
    });

    return nextMatch;
  };

  const handleAddOrUpdateEvent = async (event) => {
    event.preventDefault();

    if (!selectedMatch) return;

    const needsSinglePlayer =
      eventForm.type !== "Substitution" &&
      ["Goal", "Yellow Card", "Red Card", "Score"].includes(eventForm.type);

    if (rule?.mode !== "clock" && !eventForm.minute) return;
    if (needsSinglePlayer && !eventForm.playerId) return;
    if (eventForm.type === "Substitution" && (!eventForm.playerInId || !eventForm.playerOutId)) {
      return;
    }

    const savedMinute = rule?.mode === "clock" ? getCurrentClockMinute() : eventForm.minute;

    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => {
      let nextEvents = [...arr(match.events)];

      const payload = {
        id: editingEventId || Date.now(),
        minute: text(savedMinute, ""),
        type: text(eventForm.type, "Goal"),
        teamSide: text(eventForm.teamSide, "home"),
        playerId: eventForm.playerId ? Number(eventForm.playerId) : null,
        playerInId: eventForm.playerInId ? Number(eventForm.playerInId) : null,
        playerOutId: eventForm.playerOutId ? Number(eventForm.playerOutId) : null,
        pointsValue: num(eventForm.pointsValue, 1),
        note: text(eventForm.note, ""),
      };

      if (editingEventId) {
        nextEvents = nextEvents.map((item) =>
          String(item.id) === String(editingEventId) ? payload : item
        );
      } else {
        nextEvents = [payload, ...nextEvents];
      }

      return recalculateMatchFromEvents(match, nextEvents);
    });

    resetEventForm();
    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  const handleEditEvent = (eventItem) => {
    setEditingEventId(eventItem.id);
    setEventForm({
      minute: text(eventItem.minute, ""),
      type: text(eventItem.type, "Goal"),
      teamSide: text(eventItem.teamSide, "home"),
      playerId: eventItem.playerId ? String(eventItem.playerId) : "",
      playerInId: eventItem.playerInId ? String(eventItem.playerInId) : "",
      playerOutId: eventItem.playerOutId ? String(eventItem.playerOutId) : "",
      pointsValue: String(num(eventItem.pointsValue, 1)),
      note: text(eventItem.note, ""),
    });
  };

  const handleDeleteEvent = async (eventId) => {
    if (!selectedMatch) return;

    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const nextEvents = arr(match.events).filter(
        (item) => String(item.id) !== String(eventId)
      );
      return recalculateMatchFromEvents(match, nextEvents);
    });

    if (String(editingEventId) === String(eventId)) {
      resetEventForm();
    }

    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  const resolvePlayerName = (playerId, side) => {
    if (!selectedMatch || !playerId) return "Unknown Player";

    const team =
      side === "home"
        ? getTeamById(selectedMatch.homeTeamId)
        : getTeamById(selectedMatch.awayTeamId);

    return (
      team?.players?.find((player) => String(player.id) === String(playerId))?.name ||
      "Unknown Player"
    );
  };

  const handleStartClockMatch = async () => {
    if (!selectedMatch || !rule) return;

    const periodMinutes = num(rule.minutesPerPeriod, 30);

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      status: "Live",
      timing: {
        ...(match.timing || {}),
        mode: "clock",
        currentPeriod: 1,
        totalPeriods: num(rule.periods, 2),
        periodLabel: text(rule.periodLabel, "Half"),
        periodDurationMinutes: periodMinutes,
        breakDurationMinutes: num(rule.halftimeMinutes, 10),
        phase: "First Half",
        isRunning: true,
        startedAt: match.timing?.startedAt || new Date().toISOString(),
        currentPeriodStartedAt: new Date().toISOString(),
        breakStartedAt: null,
        pausedAt: null,
        elapsedSeconds: 0,
      },
    }));
  };

  const handlePauseClock = async () => {
    if (!selectedMatch) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      timing: {
        ...(match.timing || {}),
        isRunning: false,
        phase: "Paused",
        pausedAt: new Date().toISOString(),
        elapsedSeconds,
        currentPeriodStartedAt: null,
      },
    }));
  };

  const handleResumeClock = async () => {
    if (!selectedMatch) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      status: "Live",
      timing: {
        ...(match.timing || {}),
        isRunning: true,
        phase: num(match.timing?.currentPeriod, 1) === 1 ? "First Half" : "Second Half",
        currentPeriodStartedAt: new Date().toISOString(),
      },
    }));
  };

  const handleEndCurrentPeriod = async () => {
    if (!selectedMatch || !rule) return;
    if (num(timing.currentPeriod, 0) < 1) return;

    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const current = match.timing || {};
      const currentPeriod = num(current.currentPeriod, 1);
      const totalPeriods = num(current.totalPeriods || rule.periods, 2);
      const isFinalPeriod = currentPeriod >= totalPeriods;
      const halftimeAfter = num(rule.halftimeAfterPeriod, 1);
      const isHalftime = currentPeriod === halftimeAfter && !isFinalPeriod;

      return {
        ...match,
        status: isFinalPeriod ? "Ended" : "Halftime",
        timing: {
          ...current,
          isRunning: false,
          phase: isFinalPeriod ? "Ended" : "Halftime",
          elapsedSeconds: totalPeriodSeconds,
          currentPeriodStartedAt: null,
        },
      };
    });

    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  const handleStartNextClockPeriod = async () => {
    if (!selectedMatch || !rule) return;

    const currentPeriod = num(timing.currentPeriod, 0);
    const nextPeriod = currentPeriod + 1;
    const totalPeriods = num(timing.totalPeriods || rule.periods, 2);

    if (nextPeriod > totalPeriods) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
  ...match,
  status: "Live",
  timing: {
    ...(match.timing || {}),
    currentPeriod: nextPeriod,
    phase: nextPeriod === 2 ? "Second Half" : `Period ${nextPeriod}`,
    isRunning: true,
    currentPeriodStartedAt: new Date().toISOString(),
    breakStartedAt: null,
    pausedAt: null,
    elapsedSeconds: 0,
  },
}));
setElapsedSeconds(0);
  };

  const handleStartSetMatch = async () => {
    if (!selectedMatch || !rule) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      status: "Live",
      timing: {
        ...(match.timing || {}),
        mode: "sets",
        phase: "Set 1",
        isRunning: true,
        currentSetNumber: 1,
        homeSetsWon: 0,
        awaySetsWon: 0,
        currentSetHome: 0,
        currentSetAway: 0,
        sets: [],
      },
    }));
  };

  const handleUpdateCurrentSetScore = async (teamSide, delta) => {
    if (!selectedMatch) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const current = match.timing || {};
      const home = num(current.currentSetHome, 0);
      const away = num(current.currentSetAway, 0);

      return {
        ...match,
        timing: {
          ...current,
          currentSetHome: teamSide === "home" ? Math.max(0, home + delta) : home,
          currentSetAway: teamSide === "away" ? Math.max(0, away + delta) : away,
        },
      };
    });
  };

  const handleEndCurrentSet = async () => {
    if (!selectedMatch || !rule) return;

    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const current = match.timing || {};
      const setNumber = num(current.currentSetNumber, 1);
      const home = num(current.currentSetHome, 0);
      const away = num(current.currentSetAway, 0);

      let homeSetsWon = num(current.homeSetsWon, 0);
      let awaySetsWon = num(current.awaySetsWon, 0);

      const winner = home > away ? "home" : away > home ? "away" : null;
      if (winner === "home") homeSetsWon += 1;
      if (winner === "away") awaySetsWon += 1;

      const nextSets = [...arr(current.sets), { setNumber, home, away, winner }];

      const ended =
        homeSetsWon >= num(rule.setsToWin, 0) ||
        awaySetsWon >= num(rule.setsToWin, 0);

      return {
        ...match,
        status: ended ? "Ended" : "Break",
        timing: {
          ...current,
          phase: ended ? "Ended" : "Set Break",
          isRunning: false,
          homeSetsWon,
          awaySetsWon,
          sets: nextSets,
          currentSetHome: 0,
          currentSetAway: 0,
        },
      };
    });

    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  const handleStartNextSet = async () => {
    if (!selectedMatch) return;

    await updateFixtureWithCallback(selectedMatch.id, (match) => {
      const current = match.timing || {};
      const nextSetNumber = num(current.currentSetNumber, 1) + 1;

      return {
        ...match,
        status: "Live",
        timing: {
          ...current,
          phase: `Set ${nextSetNumber}`,
          isRunning: true,
          currentSetNumber: nextSetNumber,
          currentSetHome: 0,
          currentSetAway: 0,
        },
      };
    });
  };

  const handleEndMatch = async () => {
    if (!selectedMatch) return;

    const updatedFixture = await updateFixtureWithCallback(selectedMatch.id, (match) => ({
      ...match,
      status: "Ended",
      timing: {
        ...(match.timing || {}),
        phase: "Ended",
        isRunning: false,
        currentPeriodStartedAt: null,
      },
    }));

    await recalculateAllPlayerStats();
    await syncSingleResultFromFixture(updatedFixture);
    await recalculateTablesFromEndedFixtures();
  };

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(num(totalSeconds, 0) / 60);
    const seconds = num(totalSeconds, 0) % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <AdminLayout>
      <div className="admin-section-card">
        <h2>Live Match Control</h2>

        <select
          className="admin-select"
          value={selectedMatchId}
          onChange={(e) => {
            setSelectedMatchId(e.target.value);
            resetEventForm();
          }}
        >
          <option value="">Select match</option>
          {fixtures.map((match) => (
            <option key={String(match.id)} value={String(match.id)}>
              {text(match.homeTeam, "Home")} vs {text(match.awayTeam, "Away")}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <>
          <div className="admin-section-card">
            <h2>
              {text(selectedMatch.homeTeam, "Home")} {num(selectedMatch.score?.home, 0)} -{" "}
              {num(selectedMatch.score?.away, 0)} {text(selectedMatch.awayTeam, "Away")}
            </h2>

            <p><strong>Sport:</strong> {text(selectedMatch.sport, "N/A")}</p>
            <p><strong>Category:</strong> {text(selectedMatch.category, "N/A")}</p>
            <p><strong>Status:</strong> {text(selectedMatch.status, "N/A")}</p>
            <p><strong>Phase:</strong> {text(timing.phase, "Pre-Match")}</p>
          </div>

          {rule?.mode === "clock" && (
            <div className="admin-section-card">
              <h2>Clock Control</h2>

              <p>
                <strong>
                  {text(timing.periodLabel || rule?.periodLabel, "Half")} {num(timing.currentPeriod, 0)}
                </strong>
              </p>

              <p><strong>Timer:</strong> {formatSeconds(derivedRemainingSeconds)}</p>

              <div className="admin-actions">
                {(selectedMatch.status === "Upcoming" ||
                  (selectedMatch.status === "Live" && num(timing.currentPeriod, 0) === 0)) && (
                  <button type="button" onClick={handleStartClockMatch}>
                    Start First Half
                  </button>
                )}

                {timing.isRunning && (
                  <button type="button" onClick={handlePauseClock}>
                    Pause
                  </button>
                )}

                {timing.phase === "Paused" && (
                  <button type="button" onClick={handleResumeClock}>
                    Resume
                  </button>
                )}

                {selectedMatch.status === "Live" && num(timing.currentPeriod, 0) >= 1 && (
                  <button type="button" onClick={handleEndCurrentPeriod}>
                    End Current Half
                  </button>
                )}

                {selectedMatch.status === "Halftime" &&
                  num(timing.currentPeriod, 0) < num(timing.totalPeriods || rule?.periods, 0) && (
                    <button type="button" onClick={handleStartNextClockPeriod}>
                      Start Second Half
                    </button>
                  )}

                {selectedMatch.status !== "Ended" && (
                  <button type="button" onClick={handleEndMatch}>
                    End Match
                  </button>
                )}
              </div>
            </div>
          )}

          {rule?.mode === "sets" && (
            <div className="admin-section-card">
              <h2>Set Control</h2>

              <p><strong>Current Set:</strong> {num(timing.currentSetNumber, 0)}</p>
              <p>
                <strong>Sets Won:</strong> {text(selectedMatch.homeTeam, "Home")} {num(timing.homeSetsWon, 0)} -{" "}
                {num(timing.awaySetsWon, 0)} {text(selectedMatch.awayTeam, "Away")}
              </p>
              <p>
                <strong>Current Set Score:</strong> {text(selectedMatch.homeTeam, "Home")} {num(timing.currentSetHome, 0)} -{" "}
                {num(timing.currentSetAway, 0)} {text(selectedMatch.awayTeam, "Away")}
              </p>

              <div className="admin-actions">
                {selectedMatch.status === "Upcoming" && (
                  <button type="button" onClick={handleStartSetMatch}>
                    Start Match
                  </button>
                )}

                {selectedMatch.status === "Live" && (
                  <>
                    <button type="button" onClick={() => handleUpdateCurrentSetScore("home", 1)}>
                      +1 Home
                    </button>
                    <button type="button" onClick={() => handleUpdateCurrentSetScore("away", 1)}>
                      +1 Away
                    </button>
                    <button type="button" onClick={() => handleUpdateCurrentSetScore("home", -1)}>
                      -1 Home
                    </button>
                    <button type="button" onClick={() => handleUpdateCurrentSetScore("away", -1)}>
                      -1 Away
                    </button>
                    <button type="button" onClick={handleEndCurrentSet}>
                      End Current Set
                    </button>
                  </>
                )}

                {timing.phase === "Set Break" && selectedMatch.status !== "Ended" && (
                  <button type="button" onClick={handleStartNextSet}>
                    Start Next Set
                  </button>
                )}

                {selectedMatch.status !== "Ended" && (
                  <button type="button" onClick={handleEndMatch}>
                    End Match
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="admin-section-card">
            <h2>{editingEventId ? "Edit Event" : "Add Event"}</h2>

            <form className="admin-form" onSubmit={handleAddOrUpdateEvent}>
              <div className="admin-form__grid">
                <input
                  type="text"
                  name="minute"
                  placeholder={rule?.mode === "clock" ? "Auto minute from timer" : "Minute / Stage note"}
                  value={eventForm.minute}
                  onChange={handleEventChange}
                  readOnly={rule?.mode === "clock"}
                  required={rule?.mode !== "clock"}
                />

                <select name="teamSide" value={eventForm.teamSide} onChange={handleEventChange}>
                  <option value="home">{text(selectedMatch.homeTeam, "Home")}</option>
                  <option value="away">{text(selectedMatch.awayTeam, "Away")}</option>
                </select>

                <select name="type" value={eventForm.type} onChange={handleEventChange}>
                  {normalizeSport(selectedMatch.sport) === "football" ? (
                    <>
                      <option value="Goal">Goal</option>
                      <option value="Yellow Card">Yellow Card</option>
                      <option value="Red Card">Red Card</option>
                      <option value="Substitution">Substitution</option>
                    </>
                  ) : (
                    <>
                      <option value="Score">Score</option>
                      <option value="Substitution">Substitution</option>
                    </>
                  )}
                </select>

                {eventForm.type !== "Substitution" ? (
                  <select name="playerId" value={eventForm.playerId} onChange={handleEventChange}>
                    <option value="">Select player</option>
                    {arr(currentTeam?.players).map((player) => (
                      <option key={String(player.id)} value={String(player.id)}>
                        {text(player.name, "Unknown Player")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <select name="playerOutId" value={eventForm.playerOutId} onChange={handleEventChange}>
                      <option value="">Player out</option>
                      {arr(currentTeam?.players).map((player) => (
                        <option key={String(player.id)} value={String(player.id)}>
                          {text(player.name, "Unknown Player")}
                        </option>
                      ))}
                    </select>

                    <select name="playerInId" value={eventForm.playerInId} onChange={handleEventChange}>
                      <option value="">Player in</option>
                      {arr(currentTeam?.players).map((player) => (
                        <option key={String(player.id)} value={String(player.id)}>
                          {text(player.name, "Unknown Player")}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {["basketball", "volleyball", "table tennis"].includes(normalizeSport(selectedMatch.sport)) &&
                  eventForm.type === "Score" && (
                    <input
                      type="number"
                      name="pointsValue"
                      placeholder="Points value"
                      value={eventForm.pointsValue}
                      onChange={handleEventChange}
                    />
                  )}

                <textarea
                  name="note"
                  placeholder="Optional note"
                  value={eventForm.note}
                  onChange={handleEventChange}
                  rows="3"
                />
              </div>

              <div className="admin-actions">
                <button type="submit">{editingEventId ? "Update Event" : "Add Event"}</button>
                {editingEventId && (
                  <button type="button" onClick={resetEventForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-section-card">
            <h2>Match Events</h2>

            <div className="admin-list">
              {arr(selectedMatch.events).length ? (
                arr(selectedMatch.events).map((item) => (
                  <div className="admin-list-card" key={String(item.id)}>
                    <p>
                      <strong>{text(item.minute, "0")}'</strong> — {text(item.type, "Event")} —{" "}
                      {item.type === "Substitution"
                        ? `${resolvePlayerName(item.playerOutId, item.teamSide)} out, ${resolvePlayerName(
                            item.playerInId,
                            item.teamSide
                          )} in`
                        : resolvePlayerName(item.playerId, item.teamSide)}
                      {item.note ? ` — ${text(item.note, "")}` : ""}
                    </p>

                    <div className="admin-actions">
                      <button type="button" onClick={() => handleEditEvent(item)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteEvent(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No live events yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default LiveMatchControl;