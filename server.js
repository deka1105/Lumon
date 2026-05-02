require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// API routes
app.use('/api/floors',    require('./routes/floors'));
app.use('/api/rooms',     require('./routes/rooms'));
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/auth',      require('./routes/auth'));

// Admin — protected
app.get('/admin', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin-login.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Auth callback from Supabase Google OAuth
app.get('/auth/callback', require('./routes/auth').callback);

app.listen(PORT, () => console.log(`Lumon terminal live on port ${PORT}`));
