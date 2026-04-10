import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { getStagesForSport } from "../../utils/competitionHelpers";

const availableSports = ["Football", "Basketball", "Volleyball", "Table Tennis"];

function AdminFixtureForm({ onAddFixture }) {
  const { competitions, teams } = useAppData();

  const [formData, setFormData] = useState({
    competitionId: "",
    sport: "Football",
    category: "Male",
    stage: "Group Stage",
    competitionGroup: "",
    homeTeamId: "",
    awayTeamId: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    kickoffTime: "",
    endTime: "",
    venue: "",
    status: "Upcoming",
  });

  const selectedCompetition = useMemo(() => {
    return competitions.find(
      (item) => String(item.id) === String(formData.competitionId)
    );
  }, [competitions, formData.competitionId]);

  const availableStages = useMemo(() => {
    return getStagesForSport(formData.sport);
  }, [formData.sport]);

  const selectableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        String(team.sport || "").toLowerCase() === String(formData.sport || "").toLowerCase() &&
        String(team.category || "").toLowerCase() === String(formData.category || "").toLowerCase()
    );
  }, [teams, formData.sport, formData.category]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      if (name === "competitionId") {
        return {
          ...prev,
          competitionId: value,
        };
      }

      if (name === "sport") {
        const stages = getStagesForSport(value);

        return {
          ...prev,
          sport: value,
          stage: stages[0] || "",
          homeTeamId: "",
          awayTeamId: "",
          homeTeam: "",
          awayTeam: "",
        };
      }

      if (name === "category") {
        return {
          ...prev,
          category: value,
          homeTeamId: "",
          awayTeamId: "",
          homeTeam: "",
          awayTeam: "",
        };
      }

      if (name === "homeTeamId") {
        const selectedTeam = teams.find((team) => String(team.id) === String(value));

        return {
          ...prev,
          homeTeamId: value,
          homeTeam: selectedTeam?.department || selectedTeam?.name || "",
        };
      }

      if (name === "awayTeamId") {
        const selectedTeam = teams.find((team) => String(team.id) === String(value));

        return {
          ...prev,
          awayTeamId: value,
          awayTeam: selectedTeam?.department || selectedTeam?.name || "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.competitionId) {
      alert("Please select a competition.");
      return;
    }

    if (!formData.homeTeamId || !formData.awayTeamId) {
      alert("Please select both teams.");
      return;
    }

    if (String(formData.homeTeamId) === String(formData.awayTeamId)) {
      alert("Home and away teams cannot be the same.");
      return;
    }

    const homeTeamRecord = teams.find(
      (team) => String(team.id) === String(formData.homeTeamId)
    );

    const awayTeamRecord = teams.find(
      (team) => String(team.id) === String(formData.awayTeamId)
    );

    if (!homeTeamRecord || !awayTeamRecord) {
      alert("Please select valid home and away teams.");
      return;
    }

    if (
      String(homeTeamRecord.sport || "").toLowerCase() !== String(formData.sport || "").toLowerCase() ||
      String(awayTeamRecord.sport || "").toLowerCase() !== String(formData.sport || "").toLowerCase()
    ) {
      alert("Selected teams do not match the chosen sport.");
      return;
    }

    if (
      String(homeTeamRecord.category || "").toLowerCase() !== String(formData.category || "").toLowerCase() ||
      String(awayTeamRecord.category || "").toLowerCase() !== String(formData.category || "").toLowerCase()
    ) {
      alert("Selected teams do not match the chosen category.");
      return;
    }

    if (
      String(formData.sport).toLowerCase() === "football" &&
      String(formData.stage).toLowerCase() === "group stage" &&
      !String(formData.competitionGroup || "").trim()
    ) {
      alert("Group is required for football group-stage fixtures.");
      return;
    }

    if (
      String(homeTeamRecord.department || homeTeamRecord.name || "").toLowerCase() ===
      String(awayTeamRecord.department || awayTeamRecord.name || "").toLowerCase()
    ) {
      alert("A department cannot play against itself.");
      return;
    }

    onAddFixture({
      ...formData,
      competitionName: selectedCompetition?.name || "",
      competitionType: selectedCompetition?.competitionType || "",
      participantMode: selectedCompetition?.participantMode || "",
      ownerDepartment: selectedCompetition?.ownerDepartment || "",
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      homeTeam: homeTeamRecord?.department || homeTeamRecord?.name || "",
      awayTeam: awayTeamRecord?.department || awayTeamRecord?.name || "",
      gender: formData.category,
      postponed: false,
      status: "Upcoming",
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
      lineups: {
        homeCoach: "",
        awayCoach: "",
        homePlayerIds: [],
        awayPlayerIds: [],
      },
      events: [],
      timing: {
        mode: "clock",
        currentPeriod: 0,
        totalPeriods: 0,
        periodLabel: "",
        periodDurationMinutes: 0,
        breakDurationMinutes: 0,
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
    });

    setFormData({
      competitionId: "",
      sport: "Football",
      category: "Male",
      stage: "Group Stage",
      competitionGroup: "",
      homeTeamId: "",
      awayTeamId: "",
      homeTeam: "",
      awayTeam: "",
      date: "",
      kickoffTime: "",
      endTime: "",
      venue: "",
      status: "Upcoming",
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <select
          name="competitionId"
          value={formData.competitionId}
          onChange={handleChange}
          required
        >
          <option value="">Select Competition</option>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </select>

        <select name="sport" value={formData.sport} onChange={handleChange}>
          {availableSports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>

        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select name="stage" value={formData.stage} onChange={handleChange}>
          {availableStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="competitionGroup"
          placeholder="Group (optional)"
          value={formData.competitionGroup}
          onChange={handleChange}
        />

        <select
          name="homeTeamId"
          value={formData.homeTeamId}
          onChange={handleChange}
          required
        >
          <option value="">Select Home Team</option>
          {selectableTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.displayName || `${team.department || team.name} ${team.sport} ${team.category}`}
            </option>
          ))}
        </select>

        <select
          name="awayTeamId"
          value={formData.awayTeamId}
          onChange={handleChange}
          required
        >
          <option value="">Select Away Team</option>
          {selectableTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.displayName || `${team.department || team.name} ${team.sport} ${team.category}`}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="kickoffTime"
          placeholder="Kickoff Time"
          value={formData.kickoffTime}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="endTime"
          placeholder="End Time"
          value={formData.endTime}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={formData.venue}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn btn--primary">
        Add Fixture
      </button>
    </form>
  );
}

export default AdminFixtureForm;