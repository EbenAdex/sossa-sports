import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout, isAdmin, updateProfile, changePassword, adminOverride } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    department: "",
    level: "",
    accountType: "user",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      fullName: user.fullName || "",
      department: user.department || "",
      level: user.level || "",
      accountType: user.accountType || "user",
    });
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (adminOverride) {
        setMessage("Admin override profile cannot be edited from this page.");
        return;
      }

      await updateProfile({
        fullName: profileForm.fullName.trim(),
        department: profileForm.department.trim(),
        level: profileForm.level.trim(),
        accountType: profileForm.accountType,
      });

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    try {
      if (adminOverride) {
        setPasswordMessage("Admin override password cannot be changed here.");
        return;
      }

      if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
        setPasswordMessage("New password must be at least 8 characters.");
        return;
      }

      await changePassword(passwordForm.newPassword);
      setPasswordForm({ newPassword: "" });
      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("recent")) {
        setPasswordMessage("Please logout and login again before changing your password.");
        return;
      }

      setPasswordMessage(error.message || "Failed to change password.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="container">
          <div className="page-header-block">
            <h1>Profile</h1>
            <p className="page-intro">
              Manage your account, role type, and password.
            </p>
          </div>

          <div className="page-grid">
            <div className="page-card">
              <h3>Account Information</h3>
              <p><strong>Email:</strong> {user?.email || "N/A"}</p>
              <p><strong>Role:</strong> {isAdmin ? "admin" : user?.role || "user"}</p>

              {message && <p className="auth-success">{message}</p>}

              <form className="auth-form" onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                  required
                  disabled={adminOverride}
                />

                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={profileForm.department}
                  onChange={handleProfileChange}
                  required
                  disabled={adminOverride}
                />

                <input
                  type="text"
                  name="level"
                  placeholder="Level"
                  value={profileForm.level}
                  onChange={handleProfileChange}
                  required
                  disabled={adminOverride}
                />

                <select
                  name="accountType"
                  value={profileForm.accountType}
                  onChange={handleProfileChange}
                  disabled={adminOverride}
                >
                  <option value="user">Normal User</option>
                  <option value="player">Player</option>
                </select>

                <button type="submit" className="btn btn--primary" disabled={adminOverride}>
                  Save Profile
                </button>
              </form>
            </div>

            <div className="page-card">
              <h3>Change Password</h3>

              {passwordMessage && <p className="auth-success">{passwordMessage}</p>}

              <form className="auth-form" onSubmit={handleChangePassword}>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={adminOverride}
                />

                <button type="submit" className="btn btn--primary" disabled={adminOverride}>
                  Update Password
                </button>
              </form>

              <button
                type="button"
                className="btn btn--outline"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Profile;