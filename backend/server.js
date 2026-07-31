const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple file-based database
const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { users: [], purchases: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Serve static frontend files in unified deployment mode
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
  });
}

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const db = readDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password, // In real production → hash this!
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDB(db);

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Get user purchases
app.get('/api/my-courses/:userId', (req, res) => {
  const db = readDB();
  const purchases = db.purchases.filter(p => p.userId === req.params.userId && p.status === 'unlocked');
  res.json(purchases);
});

// Request access after payment
app.post('/api/request-access', (req, res) => {
  const { userId, courseId, transactionId, note } = req.body;
  const db = readDB();

  // Check if already requested
  const existing = db.purchases.find(p => p.userId === userId && p.courseId === courseId);
  if (existing) {
    return res.json({ success: true, message: 'Already requested', status: existing.status });
  }

  db.purchases.push({
    id: crypto.randomUUID(),
    userId,
    courseId,
    transactionId: transactionId || '',
    note: note || '',
    status: 'pending', // pending → unlocked by admin
    requestedAt: new Date().toISOString()
  });

  writeDB(db);
  res.json({ success: true, message: 'Access request submitted. We will unlock it soon.' });
});

// ========== ADMIN ROUTES ==========
// Get all pending requests
app.get('/api/admin/pending', (req, res) => {
  const db = readDB();
  const pending = db.purchases.filter(p => p.status === 'pending');
  res.json(pending);
});

// Unlock a course (you will use this)
app.post('/api/admin/unlock', (req, res) => {
  const { purchaseId, secret } = req.body;

  // Simple secret key (change this!)
  if (secret !== 'devmaster2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const db = readDB();
  const purchase = db.purchases.find(p => p.id === purchaseId);
  if (!purchase) return res.status(404).json({ error: 'Not found' });

  purchase.status = 'unlocked';
  purchase.unlockedAt = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, message: 'Course unlocked!' });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});