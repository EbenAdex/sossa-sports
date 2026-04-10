import hodLevels from "../data/hodLevels";
import sportFormats from "../data/sportFormats";
import SossaManiaDepartments from "../data/sossaManiaDepartments";

export function getParticipantsForCompetition(competition) {
  if (!competition) return [];

  if (competition.competitionType === "faculty") {
    return SossaManiaDepartments.map((department) => ({
      id: department,
      name: department,
      type: "department",
    }));
  }

  if (competition.competitionType === "hod") {
    return hodLevels.map((level) => ({
      id: level,
      name: `${level} Level`,
      type: "level",
    }));
  }

  return [];
}

export function getStagesForSport(sportName) {
  if (!sportName) return [];
  return sportFormats[sportName] || [];
}