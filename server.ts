import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Database setup
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'PLANNING',
      owner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'TODO',
      assignee_id INTEGER,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(assignee_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Middleware for Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'USER']
      );
      res.json({ id: result.lastID, name, email, role });
    } catch (err) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Project Routes
  app.get('/api/projects', authenticateToken, async (req: any, res) => {
    const projects = await db.all('SELECT * FROM projects');
    res.json(projects);
  });

  app.post('/api/projects', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const { title, description } = req.body;
    const result = await db.run(
      'INSERT INTO projects (title, description, owner_id) VALUES (?, ?, ?)',
      [title, description, req.user.id]
    );
    res.json({ id: result.lastID, title, description });
  });

  // Task Routes
  app.get('/api/tasks', authenticateToken, async (req: any, res) => {
    const tasks = await db.all(`
      SELECT t.*, p.title as project_title, u.name as assignee_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assignee_id = u.id
    `);
    res.json(tasks);
  });

  app.post('/api/tasks', authenticateToken, async (req: any, res) => {
    const { project_id, title, description, assignee_id, due_date } = req.body;
    const result = await db.run(
      'INSERT INTO tasks (project_id, title, description, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)',
      [project_id, title, description, assignee_id, due_date]
    );
    
    // Notification logic
    if (assignee_id) {
      await db.run(
        'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [assignee_id, `You have been assigned a new task: ${title}`]
      );
    }
    
    res.json({ id: result.lastID });
  });

  app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    const { status } = req.body;
    await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  });

  // User Routes
  app.get('/api/users', authenticateToken, async (req, res) => {
    const users = await db.all('SELECT id, name, role FROM users');
    res.json(users);
  });

  // Dashboard Stats
  app.get('/api/stats', authenticateToken, async (req, res) => {
    const projectCount = await db.get('SELECT COUNT(*) as count FROM projects');
    const taskCount = await db.get('SELECT COUNT(*) as count FROM tasks');
    const completedTasks = await db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "DONE"');
    
    // Simple time series data for charts (mocked by month)
    const chartData = [
      { name: 'Jan', tasks: 12 },
      { name: 'Feb', tasks: 19 },
      { name: 'Mar', tasks: 15 },
      { name: 'Apr', tasks: taskCount.count },
    ];

    res.json({
      projects: projectCount.count,
      tasks: taskCount.count,
      completed: completedTasks.count,
      chartData
    });
  });

  // Notifications
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [req.user.id]
    );
    res.json(notifications);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
