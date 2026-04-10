import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      await resetPassword(email.trim());
      setMessage("Password reset email sent successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to send password reset email.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="page section">
        <div className="container auth-page">
          <div className="auth-card">
            <h1>Forgot Password</h1>
            <p>Enter your email address to receive a password reset link.</p>

            {message && <p className="auth-success">{message}</p>}
            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" className="btn btn--primary">
                Send Reset Link
              </button>
            </form>

            <p className="auth-switch">
              Back to <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForgotPassword;