const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'notion-clone-super-secret-key-2024';
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ==================== AUTH ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const db = readDB();
    const user = db.user;
    if (!user || user.email !== email)
      return res.status(401).json({ message: 'Invalid credentials' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const db = readDB();
  const { id, name, email } = db.user;
  res.json({ id, name, email });
});

// ==================== TODOS ====================

app.get('/api/todos', authenticate, (req, res) => {
  const db = readDB();
  res.json(db.todos || []);
});

app.post('/api/todos', authenticate, (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const db = readDB();
  const newTodo = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.todos = db.todos || [];
  db.todos.unshift(newTodo);
  writeDB(db);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority, dueDate } = req.body;
  const db = readDB();
  const idx = (db.todos || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Todo not found' });
  db.todos[idx] = {
    ...db.todos[idx],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
    ...(priority !== undefined && { priority }),
    ...(dueDate !== undefined && { dueDate }),
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  res.json(db.todos[idx]);
});

// Soft delete → move to trash
app.delete('/api/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = (db.todos || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Todo not found' });
  const [todo] = db.todos.splice(idx, 1);
  todo.trashedAt = new Date().toISOString();
  db.trash = db.trash || [];
  db.trash.unshift(todo);
  writeDB(db);
  res.json({ message: 'Moved to trash', todo });
});

app.patch('/api/todos/:id/toggle', authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = (db.todos || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Todo not found' });
  db.todos[idx].completed = !db.todos[idx].completed;
  db.todos[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json(db.todos[idx]);
});

// ==================== TRASH ====================

// Get all trashed items
app.get('/api/trash', authenticate, (req, res) => {
  const db = readDB();
  res.json(db.trash || []);
});

// Restore from trash
app.patch('/api/trash/:id/restore', authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = (db.trash || []).findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Item not found in trash' });
  const [todo] = db.trash.splice(idx, 1);
  delete todo.trashedAt;
  todo.updatedAt = new Date().toISOString();
  db.todos = db.todos || [];
  db.todos.unshift(todo);
  writeDB(db);
  res.json(todo);
});

// Permanently delete one item from trash
app.delete('/api/trash/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const before = (db.trash || []).length;
  db.trash = (db.trash || []).filter(t => t.id !== id);
  if (db.trash.length === before)
    return res.status(404).json({ message: 'Item not found in trash' });
  writeDB(db);
  res.json({ message: 'Permanently deleted' });
});

// Empty entire trash
app.delete('/api/trash', authenticate, (req, res) => {
  const db = readDB();
  db.trash = [];
  writeDB(db);
  res.json({ message: 'Trash emptied' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
