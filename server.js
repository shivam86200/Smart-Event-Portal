const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const users = new Map();

app.use(express.json());

app.use(express.static(__dirname));

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (users.has(email)) {
    return res.status(409).json({ message: 'This email is already registered. Please login.' });
  }

  users.set(email, { name, email, password });
  return res.status(201).json({ message: 'Registration successful. You can now login.' });
});

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.get(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    message: `Login successful. Welcome, ${user.name}.`,
    user: {
      name: user.name,
      email: user.email
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Event Management Portal' });
});

app.get('/api/stack', (req, res) => {
  res.json({
    frontend: 'HTML/CSS/JavaScript',
    backend: 'Node.js',
    database: 'None in this version'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Smart Event Management Portal running on port ${port}`);
});