import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ onLogin }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await fetch(`https://task-manager-backend-zeta-seven.vercel.app${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        const { token } = data;
        localStorage.setItem("token", token);
        onLogin(token);
        navigate("/");
      } else {
        setError(data.message || "An error occurred");
      }

    } catch (err) {
      console.error("Login/Register error:", err);
      setError("Network error. Please check if the backend server is running.");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setError("");
            navigate(isLogin ? "/register" : "/login");
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
