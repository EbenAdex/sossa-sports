import { createContext, useContext, useEffect, useMemo, useState } from "react";
import facultyDepartments from "../data/facultyDepartments";
import defaultSportRules from "../config/defaultSportRules";
import { defaultCompetitions } from "../data/competitions";

import {
  seedDefaultSportRules,
  subscribeToSportRules,
  updateSportRuleInFirestore,
} from "../services/sportRulesService";

import {
  subscribeToTeams,
  addTeamToFirestore,
  updateTeamInFirestore,
  deleteTeamFromFirestore,
} from "../services/teamService";

import {
  subscribeToFixtures,
  addFixtureToFirestore,
  updateFixtureInFirestore,
  deleteFixtureFromFirestore,
} from "../services/fixtureService";

import {
  subscribeToResults,
  addResultToFirestore,
  updateResultInFirestore,
  deleteResultFromFirestore,
} from "../services/resultService";

import {
  subscribeToTables,
  addTableRowToFirestore,
  updateTableRowInFirestore,
  deleteTableRowFromFirestore,
} from "../services/tableService";

import {
  subscribeToRankings,
  addRankingToFirestore,
  updateRankingInFirestore,
  deleteRankingFromFirestore,
} from "../services/rankingService";

import {
  subscribeToNews,
  addNewsToFirestore,
  updateNewsInFirestore,
  deleteNewsFromFirestore,
} from "../services/newsService";

import {
  subscribeToContactMessages,
  addContactMessageToFirestore,
  deleteContactMessageFromFirestore,
} from "../services/contactService";

import {
  seedDefaultCompetitions,
  subscribeToCompetitions,
  addCompetitionToFirestore,
  updateCompetitionInFirestore,
  deleteCompetitionFromFirestore,
} from "../services/competitionService";

import {
  seedDefaultSports,
  subscribeToSports,
  addSportToFirestore,
  updateSportInFirestore,
} from "../services/sportsService";

import {
  subscribeToFavourites,
  addFavouriteToFirestore,
  removeFavouriteFromFirestoreByMatchId,
} from "../services/favouriteService";

import {
  subscribeToMedals,
  addMedalToFirestore,
  updateMedalInFirestore,
  deleteMedalFromFirestore,
} from "../services/medalService";

import 
{
  subscribeToGallery,
  addGalleryItemToFirestore,
  updateGalleryItemInFirestore,
  deleteGalleryItemFromFirestore,
} from "../services/galleryService";

const AppDataContext = createContext();

const VALID_CATEGORIES = ["Male", "Female"];

const defaultSports = [
  { id: 1, name: "Football", link: "/sports/football" },
  { id: 2, name: "Basketball", link: "/sports/basketball" },
  { id: 3, name: "Volleyball", link: "/sports/volleyball" },
  { id: 4, name: "Table Tennis", link: "/sports/table-tennis" },
];

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function toPrimitiveText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function toPrimitiveId(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}



function safeText(value, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeBoolean(value) {
  return value === true;
}

function isValidCategory(category) {
  return VALID_CATEGORIES.includes(category);
}

export { isValidCategory };

export function AppDataProvider({ children }) {
  const [rawFixtures, setRawFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [news, setNews] = useState([]);
  const [table, setTable] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [sportRules, setSportRules] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [sports, setSports] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [medals, setMedals] = useState([]);
  const [gallery, setGallery] = useState([]);
  useEffect(() => {
    seedDefaultSportRules(defaultSportRules);
    seedDefaultCompetitions(defaultCompetitions);
    seedDefaultSports(defaultSports);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSportRules(setSportRules);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCompetitions(setCompetitions);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSports((firestoreSports) => {
      const uniqueSports = firestoreSports.filter((sport, index, array) => {
        const currentName = normalizeText(sport?.name);
        return (
          index ===
          array.findIndex((item) => normalizeText(item?.name) === currentName)
        );
      });

      setSports(uniqueSports);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToFavourites(setFavourites);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToFixtures(setRawFixtures);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToResults(setResults);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToNews(setNews);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTables(setTable);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTeams(setTeams);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRankings(setRankings);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMedals(setMedals);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToContactMessages(setContactMessages);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToGallery(setGallery);
    return () => unsubscribe();
  }, []);

   const addGalleryItem = async (item) => {
  await addGalleryItemToFirestore(item);
};

const updateGalleryItem = async (id, updates) => {
  await updateGalleryItemInFirestore(id, updates);
};

const deleteGalleryItem = async (id) => {
  await deleteGalleryItemFromFirestore(id);
};

  const getSportRuleBySport = (sportName) =>
    sportRules.find(
      (rule) => normalizeText(rule?.sport) === normalizeText(sportName)
    );

  const updateSportRule = async (id, updates) => {
    await updateSportRuleInFirestore(id, updates);
  };

  const getTeamById = (teamId) =>
    teams.find((team) => String(team.id) === String(teamId));

  const getTeamByLegacyNameAndCategory = (teamName, category, sport ="") =>
    teams.find(
      (team) =>
        normalizeText(team?.name) === normalizeText(teamName) &&
        normalizeText(team?.category) === normalizeText(category) &&
        (!sport || normalizeText(team?.sport) === normalizeText(sport))
    );

  const getPlayerById = (teamId, playerId) => {
    const team = getTeamById(teamId);
    return team?.players?.find((player) => String(player.id) === String(playerId));
  };

const fixtures = useMemo(() => {
  return rawFixtures.map((fixture) => {
    const safeHomeTeamId = toPrimitiveId(fixture.homeTeamId, "");
    const safeAwayTeamId = toPrimitiveId(fixture.awayTeamId, "");
    const safeHomeLegacyName = toPrimitiveText(
      fixture.homeTeam || fixture.legacyHomeTeamName,
      ""
    );
    const safeAwayLegacyName = toPrimitiveText(
      fixture.awayTeam || fixture.legacyAwayTeamName,
      ""
    );
    const safeCategory = toPrimitiveText(fixture.category || fixture.gender, "");
     
     const safeSport = toPrimitiveText(fixture.sport, "");

    const homeTeamRecord =
      getTeamById(safeHomeTeamId) ||
      getTeamByLegacyNameAndCategory(safeHomeLegacyName, safeCategory, safeSport);

    const awayTeamRecord =
      getTeamById(safeAwayTeamId) ||
      getTeamByLegacyNameAndCategory(safeAwayLegacyName, safeCategory, safeSport);

    return {
      ...fixture,
      id: toPrimitiveId(fixture.id || fixture.localId, ""),
      localId: toPrimitiveId(fixture.localId, ""),
      competitionId: toPrimitiveId(fixture.competitionId, ""),
      competitionName: toPrimitiveText(fixture.competitionName, ""),
      competitionType: toPrimitiveText(fixture.competitionType, ""),
      participantMode: toPrimitiveText(fixture.participantMode, ""),
      ownerDepartment: toPrimitiveText(fixture.ownerDepartment, ""),
      competitionGroup: toPrimitiveText(fixture.competitionGroup, ""),
      sport: toPrimitiveText(fixture.sport, ""),
      stage: toPrimitiveText(fixture.stage, ""),
      category:
        toPrimitiveText(fixture.category, "") ||
        toPrimitiveText(fixture.gender, "") ||
        toPrimitiveText(homeTeamRecord?.category, "") ||
        toPrimitiveText(awayTeamRecord?.category, ""),
      gender:
        toPrimitiveText(fixture.gender, "") ||
        toPrimitiveText(fixture.category, "") ||
        toPrimitiveText(homeTeamRecord?.category, "") ||
        toPrimitiveText(awayTeamRecord?.category, ""),
      homeTeamId: toPrimitiveId(homeTeamRecord?.id || fixture.homeTeamId, ""),
      awayTeamId: toPrimitiveId(awayTeamRecord?.id || fixture.awayTeamId, ""),
      homeTeam:
        toPrimitiveText(homeTeamRecord?.name, "") ||
        toPrimitiveText(fixture.homeTeam, "Unknown Team"),
      awayTeam:
        toPrimitiveText(awayTeamRecord?.name, "") ||
        toPrimitiveText(fixture.awayTeam, "Unknown Team"),
      date: toPrimitiveText(fixture.date, ""),
      kickoffTime: toPrimitiveText(fixture.kickoffTime, ""),
      endTime: toPrimitiveText(fixture.endTime, ""),
      venue: toPrimitiveText(fixture.venue, ""),
      status: toPrimitiveText(fixture.status, "Upcoming"),
      postponed: Boolean(fixture.postponed),
      score: {
        home: Number(fixture.score?.home ?? 0),
        away: Number(fixture.score?.away ?? 0),
      },
      cards: {
        homeYellow: Number(fixture.cards?.homeYellow ?? 0),
        awayYellow: Number(fixture.cards?.awayYellow ?? 0),
        homeRed: Number(fixture.cards?.homeRed ?? 0),
        awayRed: Number(fixture.cards?.awayRed ?? 0),
      },
      substitutions: {
        home: Number(fixture.substitutions?.home ?? 0),
        away: Number(fixture.substitutions?.away ?? 0),
      },
      lineups: {
        homeCoach: toPrimitiveText(fixture.lineups?.homeCoach, ""),
        awayCoach: toPrimitiveText(fixture.lineups?.awayCoach, ""),
        homePlayerIds: ensureArray(fixture.lineups?.homePlayerIds),
        awayPlayerIds: ensureArray(fixture.lineups?.awayPlayerIds),
      },
      events: ensureArray(fixture.events),
      timing:
        fixture.timing && typeof fixture.timing === "object"
          ? fixture.timing
          : {
              mode: "clock",
              currentPeriod: 0,
              totalPeriods: 2,
              periodLabel: "Half",
              periodDurationMinutes: 30,
              breakDurationMinutes: 10,
              phase: "Pre-Match",
              isRunning: false,
              startedAt: null,
              pausedAt: null,
              currentPeriodStartedAt: null,
              breakStartedAt: null,
              elapsedSeconds: 0,
              homeSetsWon: 0,
              awaySetsWon: 0,
              sets: [],
              currentSetNumber: 0,
              currentSetHome: 0,
              currentSetAway: 0,
            },
    };
  });
}, [rawFixtures, teams]);

  const addCompetition = async (competition) => {
    await addCompetitionToFirestore(competition);
  };

  const updateCompetition = async (id, updates) => {
    await updateCompetitionInFirestore(id, updates);
  };

  const deleteCompetition = async (id) => {
    await deleteCompetitionFromFirestore(id);
  };

  const addContactMessage = async (message) => {
    await addContactMessageToFirestore(message);
  };

  const deleteContactMessage = async (id) => {
    await deleteContactMessageFromFirestore(id);
  };

  const addFixture = async (fixture) => {
    await addFixtureToFirestore(fixture);
  };

  const deleteFixture = async (id) => {
    await deleteFixtureFromFirestore(id);
  };

  const updateFixture = async (id, updates) => {
    await updateFixtureInFirestore(id, updates);
  };

  const updateFixtureWithCallback = async (id, callback) => {
    const currentFixture = rawFixtures.find(
      (fixture) => String(fixture.id) === String(id)
    );

    if (!currentFixture) return null;

    const updatedFixture = callback(currentFixture);
    await updateFixtureInFirestore(id, updatedFixture);
    return updatedFixture;
  };

  const addMedal = async (medal) => {
    await addMedalToFirestore(medal);
  };

  const updateMedal = async (id, updates) => {
    const gold = Number(updates.gold) || 0;
    const silver = Number(updates.silver) || 0;
    const bronze = Number(updates.bronze) || 0;

    await updateMedalInFirestore(id, {
      ...updates,
      gold,
      silver,
      bronze,
      total: gold + silver + bronze,
    });
  };

  const deleteMedal = async (id) => {
    await deleteMedalFromFirestore(id);
  };

  const addResult = async (result) => {
    await addResultToFirestore(result);
  };

  const updateResult = async (id, updates) => {
    await updateResultInFirestore(id, updates);
  };

  const deleteResult = async (id) => {
    await deleteResultFromFirestore(id);
  };

  const syncSingleResultFromFixture = async (fixture) => {
    if (!fixture || fixture.status !== "Ended") return;

    const existing = results.find(
      (result) =>
        String(result.fixtureId || result.localId || result.id) === String(fixture.id)
    );

    const buildSummaryFromEvents = (fixtureItem) => {
      const events = ensureArray(fixtureItem.events);

      if (!events.length) {
        return `${fixtureItem.homeTeam} ${fixtureItem.score?.home ?? 0} - ${
          fixtureItem.score?.away ?? 0
        } ${fixtureItem.awayTeam}`;
      }

      return events
        .filter((event) =>
          ["Goal", "Score", "Red Card", "Yellow Card", "Substitution"].includes(
            event.type
          )
        )
        .slice(0, 10)
        .map((event) => {
          const minute = event.minute ? `${event.minute}'` : "";
          const teamName =
            event.teamSide === "home" ? fixtureItem.homeTeam : fixtureItem.awayTeam;

          if (event.type === "Substitution") return `${minute} Substitution - ${teamName}`;
          if (event.type === "Goal") return `${minute} Goal - ${teamName}`;
          if (event.type === "Score") return `${minute} Score - ${teamName}`;
          if (event.type === "Yellow Card") return `${minute} Yellow Card - ${teamName}`;
          if (event.type === "Red Card") return `${minute} Red Card - ${teamName}`;

          return `${minute} ${event.type} - ${teamName}`;
        })
        .join(" • ");
    };

    const payload = {
      fixtureId: fixture.id,
      localId: fixture.id,
      competitionId: fixture.competitionId || "",
      competitionName: fixture.competitionName || "",
      competitionType: fixture.competitionType || "",
      participantMode: fixture.participantMode || "",
      ownerDepartment: fixture.ownerDepartment || "",
      sport: fixture.sport || "",
      gender: fixture.category || fixture.gender || "",
      category: fixture.category || fixture.gender || "",
      stage: fixture.stage || "",
      competitionGroup: fixture.competitionGroup || "",
      homeTeamId: fixture.homeTeamId ?? null,
      awayTeamId: fixture.awayTeamId ?? null,
      homeTeam: fixture.homeTeam || "",
      awayTeam: fixture.awayTeam || "",
      homeScore: fixture.score?.home ?? 0,
      awayScore: fixture.score?.away ?? 0,
      date: fixture.date || "",
      kickoffTime: fixture.kickoffTime || "",
      endTime: fixture.endTime || "",
      venue: fixture.venue || "",
      cards: {
        homeYellow: fixture.cards?.homeYellow ?? 0,
        awayYellow: fixture.cards?.awayYellow ?? 0,
        homeRed: fixture.cards?.homeRed ?? 0,
        awayRed: fixture.cards?.awayRed ?? 0,
      },
      substitutions: {
        home: fixture.substitutions?.home ?? 0,
        away: fixture.substitutions?.away ?? 0,
      },
      events: ensureArray(fixture.events),
      summary: buildSummaryFromEvents(fixture),
    };

    if (existing) {
      await updateResultInFirestore(existing.id, payload);
    } else {
      await addResultToFirestore(payload);
    }
  };

  const syncResultsFromEndedFixtures = async () => {
    const endedFixtures = fixtures.filter((fixture) => fixture.status === "Ended");

    for (const fixture of endedFixtures) {
      await syncSingleResultFromFixture(fixture);
    }
  };

  const addNews = async (item) => {
    await addNewsToFirestore(item);
  };

  const updateNews = async (id, updates) => {
    await updateNewsInFirestore(id, updates);
  };

  const deleteNews = async (id) => {
    await deleteNewsFromFirestore(id);
  };

  const updateTableRow = async (id, field, value) => {
    await updateTableRowInFirestore(id, {
      [field]: ["team", "sport", "category"].includes(field) ? value : Number(value),
    });
  };

  const addTableTeam = async (teamName, 
    sport = "Football", category = "Male",
    competitionGroup = ""
  ) => {
    await addTableRowToFirestore({
      sport,
      category,
      competitionGroup,
      team: teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 1,
    });
  };

  const deleteTableTeam = async (id) => {
    await deleteTableRowFromFirestore(id);
  };

  const getSortedTable = (sport = "Football", category = "Male", competitionGroup = "") => {
    return [...table]
      .filter(
        (row) =>
          String(row.sport || "").toLowerCase() === sport.toLowerCase() &&
          String(row.category || "").toLowerCase() === category.toLowerCase() &&
          String(row.competitionGroup || "").toLowerCase() === competitionGroup.toLowerCase()
      )
      .sort((a, b) => {
        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0);
        if ((b.goalDifference ?? 0) !== (a.goalDifference ?? 0)) {
          return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
        }
        return (b.goalsFor ?? 0) - (a.goalsFor ?? 0);
      })
      .map((row, index) => ({
        ...row,
        position: index + 1,
      }));
  };

  const recalculateTablesFromEndedFixtures = async () => {
    const leagueFixtures = fixtures.filter(
      (fixture) =>
        String(fixture.sport || "").toLowerCase() === "football" &&
        String(fixture.stage || "").toLowerCase() === "group stage" &&
        fixture.status === "Ended" &&
        ["male", "female"].includes(String(fixture.category || "").toLowerCase())
    );

    const grouped = {};

    leagueFixtures.forEach((fixture) => {
      const key = `${fixture.sport}__${fixture.category}__${fixture.competitionGroup}`;
      if (!grouped[key]) grouped[key] = {};

      const homeName = fixture.homeTeam;
      const awayName = fixture.awayTeam;
      const homeScore = fixture.score?.home ?? 0;
      const awayScore = fixture.score?.away ?? 0;

      const ensureTeam = (teamName) => {
        if (!grouped[key][teamName]) {
          grouped[key][teamName] = {
            sport: fixture.sport,
            category: fixture.category,
            competitionGroup: fixture.competitionGroup,
            team: teamName,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            position: 1,
          };
        }
      };

      ensureTeam(homeName);
      ensureTeam(awayName);

      grouped[key][homeName].played += 1;
      grouped[key][awayName].played += 1;
      grouped[key][homeName].goalsFor += homeScore;
      grouped[key][homeName].goalsAgainst += awayScore;
      grouped[key][awayName].goalsFor += awayScore;
      grouped[key][awayName].goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        grouped[key][homeName].won += 1;
        grouped[key][homeName].points += 3;
        grouped[key][awayName].lost += 1;
      } else if (awayScore > homeScore) {
        grouped[key][awayName].won += 1;
        grouped[key][awayName].points += 3;
        grouped[key][homeName].lost += 1;
      } else {
        grouped[key][homeName].drawn += 1;
        grouped[key][awayName].drawn += 1;
        grouped[key][homeName].points += 1;
        grouped[key][awayName].points += 1;
      }
    });

    const existingRows = [...table];

    for (const key of Object.keys(grouped)) {
      const rows = Object.values(grouped[key])
        .map((row) => ({
          ...row,
          goalDifference: row.goalsFor - row.goalsAgainst,
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        })
        .map((row, index) => ({
          ...row,
          position: index + 1,
        }));

      for (const row of rows) {
        const existing = existingRows.find(
          (item) =>
            String(item.team || "").toLowerCase() === String(row.team || "").toLowerCase() &&
            String(item.sport || "").toLowerCase() === String(row.sport || "").toLowerCase() &&
            String(item.category || "").toLowerCase() === String(row.category || "").toLowerCase()
              &&
            String(item.competitionGroup || "").toLowerCase() 
            === String(row.competitionGroup || "").toLowerCase()
        );

        if (existing) {
          await updateTableRowInFirestore(existing.id, row);
        } else {
          await addTableRowToFirestore(row);
        }
      }
    }
  };

  const addTeam = async (team) => {
  await addTeamToFirestore({
    ...team,
    department: team.department || team.name || "",
    name: team.name || team.department || "",
    sport: team.sport || "",
    displayName:
      team.displayName ||
      `${team.department || team.name || "Team"} ${team.sport || ""} ${team.category || ""} Team`.trim(),
    players: team.players || [],
  });
};

  const updateTeam = async (id, updates) => {
  await updateTeamInFirestore(id, {
    ...updates,
    department: updates.department || updates.name || "",
    name: updates.name || updates.department || "",
    sport: updates.sport || "",
    displayName:
      updates.displayName ||
      `${updates.department || updates.name || "Team"} ${updates.sport || ""} ${updates.category || ""} Team`.trim(),
  });
};
  const deleteTeam = async (id) => {
    await deleteTeamFromFirestore(id);
  };

  const addPlayerToTeam = async (teamId, player) => {
    const team = teams.find((item) => String(item.id) === String(teamId));
    if (!team) return;

    const currentPlayers = team.players || [];
    if (currentPlayers.length >= 30) return;

    await updateTeamInFirestore(teamId, {
      players: [...currentPlayers, player],
    });
  };

  const updatePlayerInTeam = async (teamId, playerId, updates) => {
    const team = teams.find((item) => String(item.id) === String(teamId));
    if (!team) return;

    const updatedPlayers = (team.players || []).map((player) =>
      String(player.id) === String(playerId) ? { ...player, ...updates } : player
    );

    await updateTeamInFirestore(teamId, {
      players: updatedPlayers,
    });
  };

  const deletePlayerFromTeam = async (teamId, playerId) => {
    const team = teams.find((item) => String(item.id) === String(teamId));
    if (!team) return;

    const updatedPlayers = (team.players || []).filter(
      (player) => String(player.id) !== String(playerId)
    );

    await updateTeamInFirestore(teamId, {
      players: updatedPlayers,
    });
  };

  const isSquadValid = (teamId) => {
    const team = teams.find((item) => String(item.id) === String(teamId));
    if (!team) return false;

    const count = (team.players || []).length;
    return count >= 25 && count <= 30;
  };

  const recalculateAllPlayerStats = () => {
    setTeams((prevTeams) => {
      const nextTeams = prevTeams.map((team) => ({
        ...team,
        players: (team.players || []).map((player) => ({
          ...player,
          goals: 0,
          cleanSheets: 0,
          appearances: 0,
          points: 0,
        })),
      }));

      const fixturesForStats = fixtures.filter((fixture) =>
        ["Ended", "Live"].includes(fixture.status)
      );

      fixturesForStats.forEach((fixture) => {
        const homeTeam = nextTeams.find((team) => String(team.id) === String(fixture.homeTeamId));
        const awayTeam = nextTeams.find((team) => String(team.id) === String(fixture.awayTeamId));

        const homeAppearanceIds = new Set([
          ...ensureArray(fixture.lineups?.homePlayerIds),
          ...ensureArray(fixture.events)
            .filter((event) => event.type === "Substitution" && event.teamSide === "home")
            .map((event) => event.playerInId)
            .filter(Boolean),
        ]);

        const awayAppearanceIds = new Set([
          ...ensureArray(fixture.lineups?.awayPlayerIds),
          ...ensureArray(fixture.events)
            .filter((event) => event.type === "Substitution" && event.teamSide === "away")
            .map((event) => event.playerInId)
            .filter(Boolean),
        ]);

        if (homeTeam) {
          homeTeam.players = (homeTeam.players || []).map((player) =>
            homeAppearanceIds.has(player.id)
              ? { ...player, appearances: (player.appearances || 0) + 1 }
              : player
          );
        }

        if (awayTeam) {
          awayTeam.players = (awayTeam.players || []).map((player) =>
            awayAppearanceIds.has(player.id)
              ? { ...player, appearances: (player.appearances || 0) + 1 }
              : player
          );
        }

        ensureArray(fixture.events).forEach((event) => {
          const currentTeam = event.teamSide === "home" ? homeTeam : awayTeam;
          if (!currentTeam || !event.playerId) return;

          currentTeam.players = (currentTeam.players || []).map((player) => {
            if (String(player.id) !== String(event.playerId)) return player;

            if (normalizeText(fixture.sport) === "football" && event.type === "Goal") {
              return { ...player, goals: (player.goals || 0) + 1 };
            }

            if (
              ["basketball", "volleyball", "table tennis"].includes(
                normalizeText(fixture.sport)
              ) &&
              event.type === "Score"
            ) {
              return {
                ...player,
                points: (player.points || 0) + (Number(event.pointsValue) || 1),
              };
            }

            return player;
          });
        });

        if (fixture.status === "Ended" && normalizeText(fixture.sport) === "football") {
          if ((fixture.score?.away ?? 0) === 0 && homeTeam) {
            const validHomeKeepers = (homeTeam.players || []).filter(
              (player) =>
                normalizeText(player.position) === "goalkeeper" &&
                homeAppearanceIds.has(player.id)
            );

            if (validHomeKeepers.length) {
              const keeperIds = new Set(validHomeKeepers.map((player) => player.id));
              homeTeam.players = (homeTeam.players || []).map((player) =>
                keeperIds.has(player.id)
                  ? { ...player, cleanSheets: (player.cleanSheets || 0) + 1 }
                  : player
              );
            }
          }

          if ((fixture.score?.home ?? 0) === 0 && awayTeam) {
            const validAwayKeepers = (awayTeam.players || []).filter(
              (player) =>
                normalizeText(player.position) === "goalkeeper" &&
                awayAppearanceIds.has(player.id)
            );

            if (validAwayKeepers.length) {
              const keeperIds = new Set(validAwayKeepers.map((player) => player.id));
              awayTeam.players = (awayTeam.players || []).map((player) =>
                keeperIds.has(player.id)
                  ? { ...player, cleanSheets: (player.cleanSheets || 0) + 1 }
                  : player
              );
            }
          }
        }
      });

      return nextTeams;
    });
  };

  const getTeamFixtures = (teamId) =>
    fixtures.filter(
      (fixture) =>
        String(fixture.homeTeamId) === String(teamId) ||
        String(fixture.awayTeamId) === String(teamId)
    );

  const getPlayerMatchHistory = (teamId, playerId) => {
    const teamFixtures = getTeamFixtures(teamId);

    return teamFixtures.filter((fixture) => {
      const started =
        ensureArray(fixture.lineups?.homePlayerIds).includes(playerId) ||
        ensureArray(fixture.lineups?.awayPlayerIds).includes(playerId);

      const subbedIn = ensureArray(fixture.events).some(
        (event) =>
          event.type === "Substitution" && String(event.playerInId) === String(playerId)
      );

      const hadEvent = ensureArray(fixture.events).some(
        (event) => String(event.playerId) === String(playerId)
      );

      return started || subbedIn || hadEvent;
    });
  };

  const addSport = async (sport) => {
    await addSportToFirestore(sport);
  };

  const updateSport = async (id, updates) => {
    await updateSportInFirestore(id, updates);
  };

  const toggleFavouriteMatch = async (matchId) => {
    const exists = favourites.some((item) => String(item.matchId) === String(matchId));

    if (exists) {
      await removeFavouriteFromFirestoreByMatchId(matchId);
    } else {
      await addFavouriteToFirestore(matchId);
    }
  };

  const removeFavouriteMatch = async (matchId) => {
    await removeFavouriteFromFirestoreByMatchId(matchId);
  };

  const isFavouriteMatch = (matchId) =>
    favourites.some((item) => String(item.matchId) === String(matchId));

  const addRanking = async (ranking) => {
    await addRankingToFirestore(ranking);
  };

  const updateRanking = async (id, updates) => {
    await updateRankingInFirestore(id, updates);
  };

  const deleteRanking = async (id) => {
    await deleteRankingFromFirestore(id);
  };

  const getRankingsBySportAndCategory = (sport, category) => {
    return [...rankings]
      .filter(
        (item) =>
          String(item.sport || "").toLowerCase() === String(sport || "").toLowerCase() &&
          String(item.category || "").toLowerCase() === String(category || "").toLowerCase()
      )
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  };

  const value = useMemo(
    () => ({
      competitions,
      addCompetition,
      updateCompetition,
      deleteCompetition,
      fixtures,
      rawFixtures,
      results,
      news,
      table,
      teams,
      sports,
      favourites,
      facultyDepartments,
      getTeamById,
      getPlayerById,
      getTeamFixtures,
      getPlayerMatchHistory,
      addFixture,
      deleteFixture,
      updateFixture,
      updateFixtureWithCallback,
      addResult,
      updateResult,
      deleteResult,
      syncResultsFromEndedFixtures,
      syncSingleResultFromFixture,
      addNews,
      updateNews,
      deleteNews,
      updateTableRow,
      addTableTeam,
      deleteTableTeam,
      getSortedTable,
      recalculateTablesFromEndedFixtures,
      setTable,
      addTeam,
      updateTeam,
      deleteTeam,
      addPlayerToTeam,
      updatePlayerInTeam,
      deletePlayerFromTeam,
      isSquadValid,
      recalculateAllPlayerStats,
      addSport,
      updateSport,
      toggleFavouriteMatch,
      removeFavouriteMatch,
      isFavouriteMatch,
      rankings,
      addRanking,
      updateRanking,
      deleteRanking,
      getRankingsBySportAndCategory,
      contactMessages,
      addContactMessage,
      deleteContactMessage,
      sportRules,
      getSportRuleBySport,
      updateSportRule,
      medals,
      addMedal,
      updateMedal,
      deleteMedal,
      gallery,
      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
    }),
    [
      competitions,
      fixtures,
      rawFixtures,
      results,
      news,
      table,
      teams,
      sports,
      favourites,
      rankings,
      contactMessages,
      sportRules,
      medals,
      gallery,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}