# CEA Championship Scoreboard

Interactive Pioneer-branded scoreboard for the Region 530 CEA Championship. Hosted on GitHub Pages. Fantasy-football-style standings, podium, weekly updates, and a Rules tab. Data lives in CSV files you edit right in the GitHub web interface.

**Live site:** `https://otto-9092.github.io/Rep-Scoreboard/`

---

## Critical: file structure must be exactly this

The app fetches files at specific relative paths. If anything is at the wrong path, the page won't render correctly.

```
Rep-Scoreboard/                <-- repo root
+-- index.html
+-- README.md
+-- LICENSE
+-- .gitignore
+-- assets/
|   +-- styles.css
|   +-- app.js
|   +-- pioneer-logo.png
+-- data/
    +-- config.json
    +-- categories.csv
    +-- scores.csv
    +-- events.csv
    +-- updates.csv
```

**Two files at root, three in `assets/`, five in `data/`.** That's it.

---

## One-time setup (10 minutes)

1. **Delete everything currently in your Rep-Scoreboard repo** (the flat / broken upload).
2. **Extract this zip.** You'll see a `cea-scoreboard/` folder with the correct structure.
3. **Upload the contents to GitHub:**
   - In your repo -> "Add file" -> "Upload files"
   - Open the extracted `cea-scoreboard/` folder in File Explorer
   - **Select the CONTENTS** (index.html, README.md, LICENSE, .gitignore, plus the `assets` and `data` FOLDERS themselves)
   - Drag them all onto the GitHub upload area at once
   - GitHub should preserve the folder structure -- verify you see `assets/styles.css`, `data/config.json`, etc. in the file list before committing
   - Commit with a message like "Full rebuild -- Pioneer branded"
4. **Enable Pages** (if not already): Settings -> Pages -> Deploy from a branch -> main -> `/ (root)` -> Save.
5. Wait ~1 minute, then visit `https://otto-9092.github.io/Rep-Scoreboard/`. Hard refresh (Ctrl+Shift+R) if it looks like the old broken version.

---

## What's inside

- **Standings tab** -- Championship podium (gold/silver/bronze), Next Up event card, On the Clock (deadlines in next 30 days), This Week update banner, full ranked table with expandable per-agency detail.
- **Team Stats tab** -- Full agency x category grid, filterable by group.
- **Schedule tab** -- All season events, past greyed out, next highlighted.
- **Rules & Definitions tab** -- Every category's rules, max points, deadline, description.
- **Season Progress bar** in header.
- **% toggle** -- Total (530 pts) vs. Available So Far.
- **Print view.**
- **Mobile-friendly.**
- **Clear error messages** -- if a data file is missing, the page tells you which one.

---

## How to update

Everything lives in `data/`. Edit in the GitHub web UI (pencil icon -> make change -> commit).

- `scores.csv` -- one row per agency, columns match category IDs. Blank = not yet scored.
- `categories.csv` -- id, name, short_name, max_points, group, deadline, description. Add a row to add a category (also add matching column to scores.csv).
- `events.csv` -- date, title, description. Soonest becomes "Next Up" card.
- `updates.csv` -- date, headline, body. Latest becomes "This Week" banner. Great for weekly workflow.
- `config.json` -- colors, groups, title, footnotes, repo URL.

---

## Weekly update workflow

Every Friday (or whenever):

1. Update `data/scores.csv` with the week's new points.
2. Add a new row to `data/updates.csv` with the week's headline + recap.
3. Add any new events to `data/events.csv`.
4. Commit. Site updates within ~30 seconds.

---

## Known items to review

- **PK Session placeholders** (`pk_session_fall`, `pk_session_winter`) ready to rename when scheduled.
- **Owner's Manual max points** currently 100 -- source spreadsheet was ambiguous ("Max of 50" text but totals row said 100).
- **Rep Reward Qualifier** description could be fleshed out with the 6 sub-categories.

---

## License

MIT -- see `LICENSE`.

Built for Region 530 by Mike Otto, Pioneer Territory Manager.
