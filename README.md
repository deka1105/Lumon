# Lumon Industries — Severance Portfolio

A Severance-themed isometric portfolio with pixel art rooms, 3D first-person view, VHS elevator transitions, and a full admin CMS.

---

## Stack

- **Frontend** — Pixel art isometric engine (Canvas 2D) + Three.js first-person view
- **Backend** — Node.js + Express
- **Database** — Supabase (Postgres)
- **Auth** — Google OAuth via Supabase
- **Storage** — Supabase Storage (project images)
- **Deploy** — Render.com

---

## Setup

### 1. Supabase project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `schema.sql`
3. Go to **Storage** → create a bucket named `project-images` → set to **public**
4. Go to **Auth** → **Providers** → enable **Google**
5. Add your Render deploy URL to the **Redirect URLs** list: `https://your-app.onrender.com/auth/callback`

### 2. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials** → **OAuth 2.0 Client ID**
3. Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret** into Supabase Auth → Google provider

### 3. Environment variables

Copy `.env.example` to `.env` and fill in:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
SESSION_SECRET=any-long-random-string
ADMIN_EMAIL=your-google-email@gmail.com
PORT=3000
```

### 4. Local dev

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Render auto-detects `render.yaml` — just add the environment variables in the dashboard
4. Deploy

---

## Adding portraits

Drop your 7 pixel art portrait PNGs into `public/portraits/`:

```
public/portraits/
  mark.png
  helly.png
  irving.png
  dylan.png
  milchick.png
  burt.png
  cobel.png
```

Each should be **64×64px** PNG with transparent background. The character selection screen and HUD will pick them up automatically.

---

## Content management

Once deployed, go to `/admin` → sign in with your Google account.

From the admin dashboard you can:
- **Add / rename / delete floors** (domains)
- **Add / edit / delete rooms** (projects)
- **Upload project images** (drag & drop → auto-uploads to Supabase Storage)
- **Set layout position** (row/col) for each room
- **Set connection type** per room: `open` (shared wall), `corridor`, or `none`
- **Add metrics** (label + value pairs shown in the project card)

All changes appear live on the portfolio immediately — no code edits needed.

---

## File structure

```
/
├── server.js                  Main Express server
├── supabase.js                Supabase client
├── schema.sql                 DB schema + seed data (run in Supabase)
├── render.yaml                Render.com deploy config
├── .env.example               Environment variables template
├── routes/
│   ├── auth.js                Google OAuth via Supabase
│   ├── floors.js              Floors CRUD API
│   ├── rooms.js               Rooms CRUD API
│   └── upload.js              Image upload to Supabase Storage
├── middleware/
│   └── requireAuth.js         Session auth guard
└── public/
    ├── index.html             Portfolio (isometric + first-person)
    ├── admin.html             Admin CMS dashboard
    ├── admin-login.html       Google OAuth login page
    └── portraits/             Drop pixel art PNGs here
        ├── mark.png
        ├── helly.png
        └── ...
```

---

## Keyboard controls (portfolio)

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move character |
| Click on tile | Move to tile |
| Walk into door | Enter room (switches to first-person) |
| Click floor in building map | Travel to floor (VHS transition) |
| Click HUD panel label | Collapse / expand panel |

---

## Customizing floors & rooms

Edit via the admin dashboard at `/admin`. No code changes needed.

To update character clearance levels, edit the `character_floors` table directly in Supabase.

---

## Portrait image spec

- Size: 64×64px
- Format: PNG (transparent background preferred)
- Style: pixel art, front-facing portrait
- Naming: exactly as listed above (lowercase)
