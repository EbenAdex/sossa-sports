import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const {
    login,
    rememberEmail,
    forgetRememberedEmail,
    rememberedEmail,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: rememberedEmail || "",
    password: "",
    rememberMe: !!rememberedEmail,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (formData.rememberMe) {
        rememberEmail(formData.email.trim());
      } else {
        forgetRememberedEmail();
      }

      navigate("/home");
    } catch (error) {
      const message = String(error?.message || "");

      if (
        message.toLowerCase().includes("user-not-found") ||
        message.toLowerCase().includes("invalid-credential")
      ) {
        setErrorMessage("Invalid login details. If you do not have an account yet, please register first.");
        return;
      }

      setErrorMessage(error.message || "Login failed.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="page section">
        <div className="container auth-page">
          <div className="auth-card">
            <h1>Login</h1>
            <p>Sign in to access SossaMania.</p>

            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>

              <button type="submit" className="btn btn--primary">
                Login
              </button>
            </form>

            <p className="auth-switch">
              Need an account? <Link to="/register">Register</Link>
            </p>

            <p className="auth-switch">
              Forgot your password? <Link to="/forgot-password">Reset it</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Login;