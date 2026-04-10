import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";

function AdminResultForm({ onAddResult }) {
  const { fixtures } = useAppData();

  const [formData, setFormData] = useState({
    fixtureId: "",
    homeScore: "",
    awayScore: "",
    summary: "",
  });

  const endedFixtures = useMemo(() => {
    return fixtures.filter((fixture) => fixture.status === "Ended");
  }, [fixtures]);

  const selectedFixture = useMemo(() => {
    return endedFixtures.find(
      (fixture) => String(fixture.id) === String(formData.fixtureId)
    );
  }, [endedFixtures, formData.fixtureId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFixture) {
      alert("Please select an ended fixture.");
      return;
    }

    try {
      await onAddResult({
        fixtureId: selectedFixture.id,
        competitionId: selectedFixture.competitionId || "",
        competitionName: selectedFixture.competitionName || "",
        competitionType: selectedFixture.competitionType || "",
        sport: selectedFixture.sport || "",
        gender: selectedFixture.category || selectedFixture.gender || "",
        category: selectedFixture.category || selectedFixture.gender || "",
        homeTeam: selectedFixture.homeTeam || "",
        awayTeam: selectedFixture.awayTeam || "",
        homeScore: Number(formData.homeScore),
        awayScore: Number(formData.awayScore),
        date: selectedFixture.date || "",
        venue: selectedFixture.venue || "",
        stage: selectedFixture.stage || "",
        summary: formData.summary,
      });

      setFormData({
        fixtureId: "",
        homeScore: "",
        awayScore: "",
        summary: "",
      });
    } catch (error) {
      console.error("Add result failed:", error);
      alert(error.message || "Failed to add result.");
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <select
          name="fixtureId"
          value={formData.fixtureId}
          onChange={handleChange}
          required
        >
          <option value="">Select Ended Fixture</option>
          {endedFixtures.map((fixture) => (
            <option key={fixture.id} value={fixture.id}>
              {fixture.homeTeam} vs {fixture.awayTeam} - {fixture.sport}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={selectedFixture?.competitionName || ""}
          placeholder="Competition"
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.sport || ""}
          placeholder="Sport"
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.category || selectedFixture?.gender || ""}
          placeholder="Category"
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.stage || ""}
          placeholder="Stage"
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.homeTeam || ""}
          placeholder="Home Participant"
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.awayTeam || ""}
          placeholder="Away Participant"
          readOnly
        />

        <input
          type="number"
          name="homeScore"
          placeholder="Home Score"
          value={formData.homeScore}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="awayScore"
          placeholder="Away Score"
          value={formData.awayScore}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          value={selectedFixture?.date || ""}
          readOnly
        />

        <input
          type="text"
          value={selectedFixture?.venue || ""}
          placeholder="Venue"
          readOnly
        />

        <textarea
          name="summary"
          placeholder="Result summary"
          value={formData.summary}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <button type="submit" className="btn btn--primary">
        Add Result
      </button>
    </form>
  );
}

export default AdminResultForm;