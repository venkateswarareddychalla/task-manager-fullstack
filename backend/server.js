import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();
app.use(express.json());
app.use(cors());

// DB initialization
const dbPath = join(__dirname, "database.db");
const db = new Database(dbPath);

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    priority TEXT,
    dueDate TEXT,
    createdAT TEXT DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`).run();

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000/"));

// Health check
app.get("/", (req, res) => res.send("API is Working"));

// JWT utils
const JWT_SECRET_KEY = "#JWT_SECRET_KEY";
const generateJWTToken = (id) => jwt.sign({ id }, JWT_SECRET_KEY, { expiresIn: "30d" });

// --------------------- USER APIs ---------------------

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Name, Email and Password are required" });

  try {
    const userExists = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (userExists)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = db.prepare(`INSERT INTO users(name, email, password) VALUES(?, ?, ?)`);
    const result = insert.run(name, email, hashedPassword);

    const token = generateJWTToken(result.lastInsertRowid);
    res.status(200).json({ success: true, message: "User Registered Successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

  if (!user)
    return res.status(400).json({ success: false, message: "Invalid User" });

  try {
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ success: false, message: "Invalid Password" });

    const token = generateJWTToken(user.id);
    return res.status(200).json({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --------------------- AUTH MIDDLEWARE ---------------------

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Invalid Token" });

  jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
    if (error)
      return res.status(403).json({ success: false, message: "Invalid Token" });
    req.userId = payload.id;
    next();
  });
};

// --------------------- TASK APIs ---------------------

// Add Task
app.post("/tasks", authenticateToken, (req, res) => {
  const { title, priority, dueDate } = req.body;

  if (!title || !priority || !dueDate)
    return res
      .status(400)
      .json({ success: false, message: "Title, Priority and Due Date are required" });

  const due = new Date(dueDate);
  if (isNaN(due)) return res.status(400).json({ success: false, message: "Invalid Due Date" });

  db.prepare(
    `INSERT INTO tasks(title, priority, dueDate, userId) VALUES(?, ?, ?, ?)`
  ).run(title, priority, dueDate, req.userId);

  return res.status(200).json({ success: true, message: "Task Added Successfully" });
});

// Get Tasks (sorted by priority + due date)
const priorityOrder = { High: 1, Medium: 2, Low: 3 };

app.get("/tasks", authenticateToken, (req, res) => {
  const tasks = db.prepare(`SELECT * FROM tasks WHERE userId = ?`).all(req.userId);

  tasks.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority])
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (a.dueDate !== b.dueDate)
      return new Date(a.dueDate) - new Date(b.dueDate);
    return new Date(a.createdAT) - new Date(b.createdAT);
  });

  return res.status(200).json({ success: true, tasks });
});

// Update Task
app.put("/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, priority, dueDate } = req.body;

  db.prepare(
    `UPDATE tasks SET title = ?, priority = ?, dueDate = ? WHERE id = ? AND userId = ?`
  ).run(title, priority, dueDate, id, req.userId);

  return res.status(200).json({ success: true, message: "Task Updated Successfully" });
});

// Delete Task
app.delete("/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare(`DELETE FROM tasks WHERE id = ? AND userId = ?`).run(id, req.userId);

  return res.status(200).json({ success: true, message: "Task Deleted Successfully" });
});
