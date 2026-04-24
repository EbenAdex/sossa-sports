import { Link, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const { user, hasRegistered, isAdmin } = useAuth();
  const { sports = [] } = useAppData();

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenDropdown("");
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? "" : dropdownName));
  };

  const homeLink = user ? "/home" : "/";

  const visibleSports = useMemo(() => {
    return sports.filter((sport) => {
      const name = String(sport?.name || "").trim();
      const link = String(sport?.link || "").trim();

      if (!name) return false;
      if (!link || link === "#") return false;

      return true;
    });
  }, [sports]);

  return (
    <header className="navbar">
      <div className="container navbar__wrapper">
        <Link to={homeLink} className="navbar__logo" onClick={closeMenu}>
          Sossamania <span>Sports</span>
        </Link>

        <button
          className="navbar__toggle"
          onClick={handleToggleMenu}
          type="button"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
          <NavLink to={homeLink} className="navbar__home-link" onClick={closeMenu}>
            Home
          </NavLink>

          {user && (
            <>
              <div className="navbar__dropdown">
                <button
                  type="button"
                  className="navbar__dropdown-toggle"
                  onClick={() => toggleDropdown("sports")}
                >
                  Sports
                </button>

                <div
                  className={`navbar__dropdown-menu ${
                    openDropdown === "sports" ? "navbar__dropdown-menu--open" : ""
                  }`}
                >
                  {visibleSports.length ? (
                    visibleSports.map((sport) => (
                      <NavLink
                        key={sport.id}
                        to={sport.link}
                        className="navbar__dropdown-link"
                        onClick={closeMenu}
                      >
                        {sport.name}
                      </NavLink>
                    ))
                  ) : (
                    <span className="navbar__dropdown-link">No sports pages yet</span>
                  )}
                </div>
              </div>

              <div className="navbar__dropdown">
                <button
                  type="button"
                  className="navbar__dropdown-toggle"
                  onClick={() => toggleDropdown("activity")}
                >
                  Activity
                </button>

                <div
                  className={`navbar__dropdown-menu ${
                    openDropdown === "activity" ? "navbar__dropdown-menu--open" : ""
                  }`}
                >
                  <NavLink to="/news" className="navbar__dropdown-link" onClick={closeMenu}>
                    News
                  </NavLink>
                  <NavLink to="/teams" className="navbar__dropdown-link" onClick={closeMenu}>
                    Teams
                  </NavLink>
                  <NavLink to="/fixtures" className="navbar__dropdown-link" onClick={closeMenu}>
                    Fixtures
                  </NavLink>
                  <NavLink to="/results" className="navbar__dropdown-link" onClick={closeMenu}>
                    Results
                  </NavLink>
                  <NavLink to="/table" className="navbar__dropdown-link" onClick={closeMenu}>
                    Table
                  </NavLink>
                  <NavLink to="/medals" className="navbar__dropdown-link" onClick={closeMenu}>
                    Medals
                  </NavLink>
                  <NavLink to="/rankings" className="navbar__dropdown-link" onClick={closeMenu}>
                    Rankings
                  </NavLink>
                  <NavLink
                    to="/leaderboards"
                    className="navbar__dropdown-link"
                    onClick={closeMenu}
                  >
                    Leaderboards
                  </NavLink>
                </div>
              </div>
            </>
          )}

          <div className="navbar__dropdown">
            <button
              type="button"
              className="navbar__dropdown-toggle"
              onClick={() => toggleDropdown("profile")}
            >
              Profile
            </button>

            <div
              className={`navbar__dropdown-menu ${
                openDropdown === "profile" ? "navbar__dropdown-menu--open" : ""
              }`}
            >
              {!hasRegistered && !user && (
                <NavLink to="/register" className="navbar__dropdown-link" onClick={closeMenu}>
                  Register
                </NavLink>
              )}

              {!user && (
                <>
                  <NavLink to="/login" className="navbar__dropdown-link" onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink
                    to="/forgot-password"
                    className="navbar__dropdown-link"
                    onClick={closeMenu}
                  >
                    Forgot Password
                  </NavLink>
                  <NavLink to="/admin/login" className="navbar__dropdown-link" onClick={closeMenu}>
                    Admin Login
                  </NavLink>
                </>
              )}

              {user && (
                <NavLink to="/profile" className="navbar__dropdown-link" onClick={closeMenu}>
                  My Profile
                </NavLink>
              )}

              {user && isAdmin && (
                <NavLink to="/admin" className="navbar__dropdown-link" onClick={closeMenu}>
                  Admin Dashboard
                </NavLink>
              )}

              {user && isAdmin && (
                <NavLink
                  to="/admin/favourites"
                  className="navbar__dropdown-link"
                  onClick={closeMenu}
                >
                  Manage Watchlists
                </NavLink>
              )}

              {user && (
                <>
                  <NavLink to="/favourites" className="navbar__dropdown-link" onClick={closeMenu}>
                    Favourite
                  </NavLink>
                  <NavLink to="/gallery" className="navbar__dropdown-link" onClick={closeMenu}>
                    Gallery
                  </NavLink>
                  <NavLink to="/calendar" className="navbar__dropdown-link" onClick={closeMenu}>
                    Calendar
                  </NavLink>
                  <NavLink to="/faq" className="navbar__dropdown-link" onClick={closeMenu}>
                    FAQ
                  </NavLink>
                  <NavLink to="/contact" className="navbar__dropdown-link" onClick={closeMenu}>
                    Contact
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;