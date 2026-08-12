# MHGAMING Tier Testing Website

Upload these files to the root of your GitHub Pages repository.

## Live results
GitHub Pages is static, so live Discord bot results must come from the bot's public API.

1. Open `config.js`.
2. Set `window.MHGAMING_API` to the public URL of the Wispbyte bot web server.
3. The bot web server exposes `/api/data` and reads the same `database/database.json` used by the bot.

Do not put your Discord bot token in this repository.

## GitHub Pages
Settings → Pages → Deploy from branch → `main` → `/ (root)`.
