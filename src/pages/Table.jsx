import { useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function Table() {
  const { table } = useAppData();

  const [selectedSport, setSelectedSport] = useState("Football");
  const [selectedCategory, setSelectedCategory] = useState("Male");

  const filteredRows = useMemo(() => {
    return (table || [])
      .filter(
        (row) =>
          String(row.sport || "").toLowerCase() ===
            String(selectedSport || "").toLowerCase() &&
          String(row.category || "").toLowerCase() ===
            String(selectedCategory || "").toLowerCase()
      )
      .sort((a, b) => {
        if ((b.points ?? 0) !== (a.points ?? 0)) {
          return (b.points ?? 0) - (a.points ?? 0);
        }
        if ((b.goalDifference ?? 0) !== (a.goalDifference ?? 0)) {
          return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
        }
        return (b.goalsFor ?? 0) - (a.goalsFor ?? 0);
      });
  }, [table, selectedSport, selectedCategory]);

  const groupARows = useMemo(() => {
    return filteredRows.filter(
      (row) => String(row.competitionGroup || "").toLowerCase() === "group a"
    );
  }, [filteredRows]);

  const groupBRows = useMemo(() => {
    return filteredRows.filter(
      (row) => String(row.competitionGroup || "").toLowerCase() === "group b"
    );
  }, [filteredRows]);

  const ungroupedRows = useMemo(() => {
    return filteredRows.filter(
      (row) => !String(row.competitionGroup || "").trim()
    );
  }, [filteredRows]);

  const hasGroupedTable = groupARows.length > 0 || groupBRows.length > 0;

  const renderTable = (rows) => (
    <div className="homepage-table-wrap">
      <table className="homepage-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || `${row.team}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.team}</td>
                <td>{row.played ?? 0}</td>
                <td>{row.won ?? 0}</td>
                <td>{row.drawn ?? 0}</td>
                <td>{row.lost ?? 0}</td>
                <td>{row.goalsFor ?? 0}</td>
                <td>{row.goalsAgainst ?? 0}</td>
                <td>{row.goalDifference ?? 0}</td>
                <td>{row.points ?? 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No table data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>League Table</h1>
            <p className="page-intro">Follow standings by sport and category.</p>
          </div>

          <div className="filter-row">
            <label>
              Sport
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
              >
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>
            </label>

            <label>
              Category
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>

          {hasGroupedTable ? (
            <>
              {groupARows.length > 0 && (
                <div className="page-card">
                  <h2>Group A</h2>
                  {renderTable(groupARows)}
                </div>
              )}

              {groupBRows.length > 0 && (
                <div className="page-card">
                  <h2>Group B</h2>
                  {renderTable(groupBRows)}
                </div>
              )}
            </>
          ) : (
            <div className="page-card">
              {renderTable(ungroupedRows)}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Table;