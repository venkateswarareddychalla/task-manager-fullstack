import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      const url = "https://task-manager-backend-ydyt.onrender.com/tasks";
      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await fetch(url, options);
      const data = await response.json();
      const { tasks } = data;
      setTasks(tasks);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    await fetch(`https://task-manager-backend-ydyt.onrender.com/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Task Manager</h2>
        <div>
          <Link to="/add" className="nav-link">
            Add Task
          </Link>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <h3>Your Tasks</h3>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.dueDate}</td>
              <td>
                <button onClick={() => navigate(`/update/${t.id}`)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
