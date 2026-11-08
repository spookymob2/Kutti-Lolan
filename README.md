# Lolan SMP website with Discord login

A small Node server (no npm packages needed, Node 18 or newer) that serves the site, stores
content in `data.json`, and handles Discord login and the admin login.

## 1. Create the Discord application
1. Open https://discord.com/developers/applications and click **New Application**.
2. Go to **OAuth2**. Copy the **Client ID** and **Client Secret**.
3. Under **Redirects**, add: `YOUR_BASE_URL/auth/callback`
   (for local testing: `http://localhost:3000/auth/callback`).

## 2. Configure
1. Copy `.env.example` to `.env`.
2. Fill in `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` and `BASE_URL`.
3. Set `SESSION_SECRET` to a long random string.
4. To make yourself admin through Discord: in Discord turn on Developer Mode
   (Settings > Advanced), right-click your name, **Copy User ID**, and put it in `ADMIN_DISCORD_IDS`
   (comma separated for several people).
5. Admin password login: `ADMIN_USER` and `ADMIN_PASS` (default `admin` / `admin`).
   **Change these before going live.** Delete both lines to turn password login off.

## 3. Run
```
node server.js
```
Open http://localhost:3000

## How it works
- **Login with Discord** (sidebar): players log in and can post one review each (edit or delete it later).
- **Admin login** (sidebar): admin/admin from `.env`, or any Discord ID listed in `ADMIN_DISCORD_IDS`.
  Admins can add, edit and delete updates, events, rules, staff, creators, leaderboards, reviews and settings.
- All permission checks happen on the server, so the admin password is not exposed in the page.
- Live server status comes from api.mcsrvstat.us (uses the Java IP in Settings).
- Put your logo and images in `public/assets/images/`.
- Back up `data.json` to keep your content. Use HTTPS in production (a reverse proxy such as Nginx or Caddy).

## Hosting notes
- **Any VPS:** unzip, create `.env`, run `node server.js` (or `npx pm2 start server.js --name lolan` to keep it running).
  Put Nginx or Caddy in front for HTTPS.
- **Docker:** `docker build -t lolan .` then
  `docker run -d -p 3000:3000 -v lolan-data:/data --env-file .env lolan`
- **Render / Railway / similar:** create a Node web service, start command `node server.js`, add the
  variables from `.env.example` in the dashboard, and attach a persistent disk. Set `DATA_DIR` to the disk path
  (for example `/data`). Without a persistent disk, `data.json` is erased on restart.
- Always set `BASE_URL` to your real public address and add `BASE_URL/auth/callback` as a redirect in the Discord portal.
- Back up `data.json` regularly.
