import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Validate token only if it exists in localStorage and not during Google redirect
  useEffect(() => {
    console.log("App mounted, initial token:", token);
    if (token && !window.location.search.includes("token=")) {
      console.log("Validating existing token");
      fetch("http://localhost:5000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          console.log("Token validation response status:", response.status);
          if (!response.ok) {
            console.log("Token validation failed, clearing token");
            localStorage.removeItem("token");
            setToken("");
          }
        })
        .catch((err) => {
          console.error("Token validation error:", err);
          localStorage.removeItem("token");
          setToken("");
        });
    } else {
      console.log(
        "Skipping token validation due to Google redirect or no token"
      );
    }
  }, []); // Run only on mount

  const handleLogin = (newToken) => {
    console.log("Handling login, new token:", newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setRegisteredEmail("");
  };

  const handleLogout = () => {
    console.log("Handling logout, clearing token");
    localStorage.removeItem("token");
    setToken("");
    setRegisteredEmail("");
  };

  const handleRegister = (email) => {
    console.log("Handling registration, email:", email);
    setRegisteredEmail(email);
  };

  console.log("App rendering, current state:", { token, registeredEmail });
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  registeredEmail={registeredEmail}
                  isRegistering={false}
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  registeredEmail={registeredEmail}
                  isRegistering={true}
                />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              token ? (
                <Dashboard token={token} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
