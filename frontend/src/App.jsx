import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Add from "./pages/Add/Add";
import Update from "./pages/Update/Update";

// Protected Route wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = React.useState(() =>
    localStorage.getItem("token")
  );

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Register Page */}
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Home Page */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Add Task */}
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <Add />
            </PrivateRoute>
          }
        />

        {/* Update Task */}
        <Route
          path="/update/:id"
          element={
            <PrivateRoute>
              <Update />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
