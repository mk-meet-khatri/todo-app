import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Login({
  onLogin,
  onRegister,
  registeredEmail,
  isRegistering: isRegisteringProp,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(isRegisteringProp);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync isRegistering state with prop when it changes
  useEffect(() => {
    console.log("isRegisteringProp changed:", isRegisteringProp);
    setIsRegistering(isRegisteringProp);
  }, [isRegisteringProp]);

  // Handle Google login token
  useEffect(() => {
    console.log("Login component mounted, location:", location);
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      console.log("Token from URL:", token);
      if (token) {
        console.log("Processing Google login token");
        onLogin(token);
        navigate("/dashboard", { replace: true });
      } else {
        console.log("No token found in URL, rendering login form");
      }
    } catch (err) {
      console.error("Error in token handling:", err);
      setError("Failed to process Google login. Please try again.");
    }
  }, [location, onLogin, navigate]);

  // Auto-fill email after registration
  useEffect(() => {
    if (registeredEmail) {
      console.log("Filling email from registration:", registeredEmail);
      setEmail(registeredEmail);
      setIsRegistering(false);
    }
  }, [registeredEmail]);

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", { email, password, isRegistering });
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    const endpoint = isRegistering ? "register" : "login";
    try {
      const response = await fetch(
        `https://todo-app-fyxu.onrender.com/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        }
      );
      const data = await response.json();
      console.log(`${endpoint} response:`, data);
      if (response.ok) {
        if (isRegistering) {
          setError("");
          setPassword("");
          onRegister(email);
          setSuccess("Registration successful! Please log in.");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          onLogin(data.access_token);
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError(data.message || "Operation failed");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
      console.error("Error:", err);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Initiating Google login");
    window.location.href = "https://todo-app-fyxu.onrender.com/auth/google";
  };

  // Fallback UI to prevent blank screen
  console.log("Rendering Login component, state:", {
    email,
    password,
    error,
    success,
    isRegistering,
  });
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isRegistering ? "Register" : "Login"}
        </h1>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mb-4 text-center">{success}</p>
        )}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {isRegistering ? "Register" : "Login"}
        </button>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-2 bg-gray-100 text-gray-800 p-2 rounded border border-gray-300 hover:bg-gray-200 transition flex items-center justify-center"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            setSuccess("");
            if (!isRegistering) setPassword("");
            navigate(isRegistering ? "/login" : "/register", { replace: true });
          }}
          className="w-full mt-2 text-blue-500 hover:underline"
        >
          {isRegistering ? "Switch to Login" : "Switch to Register"}
        </button>
      </div>
    </div>
  );
}

export default Login;
