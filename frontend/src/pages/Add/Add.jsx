import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Add() {
  const [form, setForm] = useState({
    title: "",
    priority: "Medium",
    dueDate: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const formattedDate = new Date(form.dueDate).toISOString().split("T")[0];
    // form.dueDate = formattedDate;
    const res = await fetch("https://task-manager-backend-ydyt.onrender.com/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify(form),
    });

    console.log("Add Task Response:", res);
    navigate("/");
  };

  return (
    <div className="form-container">
      <h2>Add Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          required
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}
