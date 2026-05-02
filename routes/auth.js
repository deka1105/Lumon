const router = require('express').Router();
const { supabasePublic } = require('../supabase');

// GET /api/auth/google — redirect to Google OAuth
router.get('/google', async (req, res) => {
  const { data, error } = await supabasePublic.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${req.protocol}://${req.get('host')}/auth/callback` }
  });
  if (error || !data.url) return res.status(500).send('OAuth error');
  res.redirect(data.url);
});

// GET /auth/callback — Supabase redirects here after Google login
async function callback(req, res) {
  const code = req.query.code;
  if (!code) return res.redirect('/admin-login.html?error=no_code');
  const { data, error } = await supabasePublic.auth.exchangeCodeForSession(code);
  if (error || !data.session) return res.redirect('/admin-login.html?error=session');
  const email = data.session.user.email;
  if (email !== process.env.ADMIN_EMAIL) {
    return res.redirect('/admin-login.html?error=unauthorized');
  }
  req.session.admin = { email, id: data.session.user.id };
  res.redirect('/admin');
}

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.admin) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ email: req.session.admin.email });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.callback = callback;
module.exports = router;
