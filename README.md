# LolanSMP website (GitHub Pages version)

Free hosting on GitHub Pages. No server, no database. The admin panel saves your changes by committing
`config.json` to your repository, using a GitHub token.

## 1. Put the site on GitHub
1. Create a free account at github.com and click New repository (for example `lolansmp`). Public is fine.
2. Upload ALL files from this folder to the main page of the repo, including `.nojekyll`. Use "Add file" -> "Upload files".
3. Repo Settings -> Pages -> Build and deployment -> Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`. Save.
4. After a minute your site is live at `https://YOURNAME.github.io/lolansmp/`.

## 2. Create your admin token
1. GitHub -> Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens -> Generate new token.
2. Repository access: "Only select repositories" -> choose your site repo.
3. Permissions -> Repository permissions -> Contents: "Read and write". Generate and copy the token.

## 3. Edit the site
1. Open `/admin.html` on your site, enter `yourname/lolansmp` and paste the token, then Log in.
2. Change anything in the admin panel, then click "Save changes". The site updates about a minute later.
3. The token is kept in your browser only. Click Log out on shared computers.

## Good to know
- Who can edit is controlled by GitHub: only people with write access to the repo (and a token) can save.
- Discord, Google and username/password logins need a server, so they are not in this version. Use the server version for those.
- Buying/payments are off by default. Prices are all under 400.
- Live player count and the server icon load from the visitor's browser, so they work on GitHub Pages.
- Every save is a commit, so you can undo changes from the repo's History.
- To use your own domain, add it under Settings -> Pages -> Custom domain.
