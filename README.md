# LolanSMP website

Multi-page Minecraft server site with live status, rank shop, and an admin panel.
Admins log in with Discord or Google and edit everything from the browser.

## What you need
- Node.js 18 or newer on the machine that hosts the site (a VPS, Render, Railway, a home PC, etc.).
- This does NOT work on GitHub Pages or plain static hosting, because login and saving need the server.

## Setup
1. Copy `.env.example` to `.env` and fill it in (see below).
2. Run `node server.js` (or `npm start`) and open your BASE_URL address.
3. Go to `/admin.html`, log in, and click "Open admin panel".

## Username and password login
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`. The account is created on first start (passwords are stored hashed
in `data/users.json`, never in plain text). Log in at `/admin.html`. More accounts can be added, deleted or have their
password reset under Admin panel -> Admins -> Password accounts. Use a strong password of 8+ characters.
After 8 wrong attempts from one address, login is blocked for 10 minutes. Behind a proxy (Nginx, Cloudflare), set `TRUST_PROXY=1`.

## Discord login
1. https://discord.com/developers/applications -> New Application -> OAuth2.
2. Add the redirect: `YOUR_BASE_URL/auth/discord/callback`
3. Put the Client ID and Client Secret in `.env`.
4. Your Discord user ID: Discord Settings -> Advanced -> turn on Developer Mode, then right-click your name -> Copy User ID. Put it in `ADMIN_DISCORD_IDS`.

## Google login
1. https://console.cloud.google.com/apis/credentials -> Create credentials -> OAuth client ID -> Web application.
2. Add the authorized redirect URI: `YOUR_BASE_URL/auth/google/callback`
3. Put the Client ID and Client Secret in `.env`.
4. Put your Gmail address in `ADMIN_GOOGLE_EMAILS`.

You only need one login method. Username and password works on its own. Only people you list as admins can edit. If someone logs in but is not
approved, the login page shows their ID or email so you can add them under Admin panel -> Admins.

## Using the admin panel
- Tabs edit server details, colors, announcement, gamemodes, ranks, leaderboard, FAQ and admins.
- "Edit page text" lets you click and type directly on any heading, paragraph or button on the page you are viewing.
- Click "Save changes" to publish. Nothing goes live until you save.
- Data is stored in `data/config.json`. Back this file up.

## Notes
- Use your real https address as BASE_URL in production and a long random SESSION_SECRET.
- There is no buying or payment system by default: the shop only shows ranks and prices (all under 400). To bring Buy buttons back, turn on "Show Buy buttons" in Admin panel -> General and set a Store URL or a Buy link per rank.
- If you already saved settings, change old prices in Admin panel -> Ranks (saved settings override the defaults).
- Open the site at the same address as BASE_URL, or login cookies will not work.
