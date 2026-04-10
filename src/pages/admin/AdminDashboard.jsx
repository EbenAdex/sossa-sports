import AdminLayout from "../../components/admin/AdminLayout";
import { useAppData } from "../../context/AppDataContext";
import { useMemo } from "react";

function AdminDashboard() {
  const { fixtures, results, news, sports, teams, rankings, contactMessages } = useAppData();

  const totalFixtures = fixtures.length;
  const totalResults = results.length;
  const totalNews = news.length;
  const totalSports = sports.length;
  const totalTeams = teams.length;
  const totalRankings = rankings.length;
  const totalMessages = contactMessages.length;
  const liveMatches = fixtures.filter((fixture) => fixture.status === "Live").length;
  const qualifiedTeams = teams.filter((team) => team.qualified).length;

const qualifiedDepartments = useMemo(() => {
  const qualifiedDepartmentNames = new Set(
    (teams || [])
      .filter((team) => Boolean(team?.qualified))
      .map((team) => String(team.department || team.name || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return qualifiedDepartmentNames.size;
}, [teams]);

const totalSquads = (teams || []).length;

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="admin-dashboard__stats">
          <div className="admin-stat-card">
            <span>Total Fixtures</span>
            <strong>{totalFixtures}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Total Results</span>
            <strong>{totalResults}</strong>
          </div>

          <div className="admin-stat-card">
            <span>News Posts</span>
            <strong>{totalNews}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Sports Categories</span>
            <strong>{totalSports}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Live Matches</span>
            <strong>{liveMatches}</strong>
          </div>
<div className="admin-stat-card">
  <strong>{qualifiedDepartments}</strong>
  <span>Qualified Teams</span>
</div>

<div className="admin-stat-card">
  <strong>{totalSquads}</strong>
  <span>Total Squads</span>
</div>

          <div className="admin-stat-card">
            <span>Ranking Records</span>
            <strong>{totalRankings}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Contact Messages</span>
            <strong>{totalMessages}</strong>
          </div>
        </div>

        <div className="admin-section-card">
          <h2>Admin Overview</h2>
          <p>
            This dashboard reflects live SossaMania platform data, including fixtures,
            results, teams, standings, rankings, sports categories, and active matches.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;