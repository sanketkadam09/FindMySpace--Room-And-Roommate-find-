import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useContext(AuthContext);

  const [redirectMessage, setRedirectMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Show redirect message if coming from a protected route
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        credentials: "include", // important for httpOnly cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user & token in AuthContext
        authLogin(data.user, data.token);

        // Redirect user to previous page or dashboard
        const redirectTo = location.state?.from || "/dashboard";
        navigate(redirectTo);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-indigo-100"
      style={{ backgroundImage: "url('/image/bg.jpg')" }} // ✅ Use real image path
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-800 mb-2">
          Login to Your Account
        </h2>

        {redirectMessage && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
            <p className="text-sm text-amber-700">{redirectMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <span
              onClick={() => !isLoading && setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-sm text-indigo-600 font-medium select-none"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-indigo-600">
            <a href="/signup" className="hover:underline">Create Account</a>
            <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
