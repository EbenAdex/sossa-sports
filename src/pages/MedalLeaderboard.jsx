import { useMemo } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAppData } from "../context/AppDataContext";

function MedalLeaderboard() {
  const { medals } = useAppData();

  const sortedMedals = useMemo(() => {
    return [...medals].sort((a, b) => {
      if ((b.gold || 0) !== (a.gold || 0)) return (b.gold || 0) - (a.gold || 0);
      if ((b.silver || 0) !== (a.silver || 0)) return (b.silver || 0) - (a.silver || 0);
      if ((b.bronze || 0) !== (a.bronze || 0)) return (b.bronze || 0) - (a.bronze || 0);
      return (b.total || 0) - (a.total || 0);
    });
  }, [medals]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Medal Leaderboard</h1>
            <p className="page-intro">
              Follow the official departmental medal standings.
            </p>
          </div>

          <div className="page-card">
            <div className="page-table-wrap">
              <table className="page-table-dark">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Department</th>
                    <th>Gold</th>
                    <th>Silver</th>
                    <th>Bronze</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMedals.length ? (
                    sortedMedals.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.department}</td>
                        <td>{item.gold || 0}</td>
                        <td>{item.silver || 0}</td>
                        <td>{item.bronze || 0}</td>
                        <td>{item.total || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No medal records available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MedalLeaderboard;