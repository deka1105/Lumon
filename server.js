require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseConfigured = process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL !== 'your_supabase_project_url';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'lumon-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// If Supabase not configured, API routes return 503 with helpful message
if (supabaseConfigured) {
  app.use('/api/floors', require('./routes/floors'));
  app.use('/api/rooms',  require('./routes/rooms'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/auth',   require('./routes/auth'));
  app.get('/auth/callback', require('./routes/auth').callback);
} else {
  app.use('/api', (req, res) => {
    res.status(503).json({
      error: 'Supabase not configured',
      message: 'Add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY to your .env file.',
      docs: 'See README.md → Setup → Step 1'
    });
  });
}

// Admin — protected
app.get('/admin', (req, res) => {
  if (!supabaseConfigured) return res.redirect('/admin-login.html?error=no_supabase');
  if (!req.session.admin) return res.redirect('/admin-login.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Global error handler — never crash on unhandled errors
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  Lumon Industries — Employee Terminal');
  console.log('  ─────────────────────────────────────');
  console.log(`  Portfolio  →  http://localhost:${PORT}`);
  console.log(`  Admin      →  http://localhost:${PORT}/admin`);
  console.log('');
  if (supabaseConfigured) {
    console.log('  Supabase   →  connected');
  } else {
    console.log('  Supabase   →  NOT configured (portfolio runs on fallback data)');
    console.log('  Add keys to .env to enable admin + live content');
  }
  console.log('');
});
