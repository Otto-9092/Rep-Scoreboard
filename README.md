[README.md](https://github.com/user-attachments/files/32024930/README.md)
# CEA Championship Scoreboard

Interactive Pioneer-branded scoreboard for the Region 530 CEA Championship. Hosted on GitHub Pages. Fantasy-football-style standings, podium, weekly updates, and a Rules tab. Data lives in CSV files you edit right in the GitHub web interface.

**Live site:** `https://YOUR-USERNAME.github.io/cea-scoreboard/`

---

## What's inside

- **Standings tab** — Top-of-standings podium (gold/silver/bronze), Next Up event card, On the Clock (deadlines in next 30 days), This Week update banner, full ranked table with expandable per-agency detail.
- **Team Stats tab** — Full agency × category grid with color coding, filterable by category group.
- **Schedule tab** — All season events with day countdowns, past events greyed out, next event highlighted.
- **Rules & Definitions tab** — Every category's rules, max points, deadline, and description. Auto-populated from `data/categories.csv`.
- **Header season progress bar** — Shows how far through the 2026-2027 season we are.
- **% toggle** — Total (530 pts) vs. Available So Far (only categories past their deadline).
- **Print view.**
- **Mobile-friendly.**
- **Clear error messages** — if a data file is missing or misnamed, the page tells you exactly which file failed instead of hanging on "Loading...".

---

## One-time setup (10 minutes)

1. **Create a new public GitHub repo** named `cea-scoreboard` (or whatever you like).
2. **Upload this folder's contents** to the repo root. In the GitHub web UI: "Add file" -> "Upload files" -> drag the entire contents in.
3. **Enable Pages:** Settings -> Pages -> Source: "Deploy from a branch" -> Branch `main`, folder `/ (root)` -> Save. Wait ~1 minute.
4. **Update the repo URL** in `data/config.json` (the `repo_url` field) so the "Edit on GitHub" footer link works.
5. **(Optional) drop in the Pioneer logo** as `assets/pioneer-logo.png`. The page will use it automatically. Until then, a text-based "PIONEER" wordmark is shown.

Your site is live at `https://YOUR-USERNAME.github.io/cea-scoreboard/`.

---

## How to update

Everything lives in the `data/` folder. Edit in the GitHub web UI (pencil icon -> make change -> commit).

### Update scores -> `data/scores.csv`

One row per agency. Each column is a category ID that matches `categories.csv`. Enter earned points as a number. Leave blank for "not yet scored".

### Add / rename / edit categories -> `data/categories.csv`

Columns: `id`, `name`, `short_name`, `max_points`, `group`, `deadline` (YYYY-MM-DD), `description`.

**To add a new category:** add a row to `categories.csv` with a new `id`, then add a matching column to `scores.csv`. Commit both files in the same commit.

**To rename a category:** change `name` / `short_name` / `description`. Do NOT change `id` unless you also rename the column in `scores.csv`.

**To rename a PK Session placeholder:** find `pk_session_fall` or `pk_session_winter` in `categories.csv` and update `name`, `short_name`, `deadline`, and `description` with the real session details. Keep the `id` alone.

### Add events / next-event card -> `data/events.csv`

Columns: `date` (YYYY-MM-DD), `title`, `description`, `category` (optional, category ID), `link` (optional URL). The soonest upcoming event automatically becomes the "Next Up" card on the Standings tab. All events appear on the Schedule tab.

### Weekly update banner -> `data/updates.csv`

Columns: `date` (YYYY-MM-DD), `headline`, `body`. Add a new row each week. The most recent one appears at the top of the Standings tab as a "This Week" banner.

### Colors, groups, footnotes -> `data/config.json`

- `title`, `subtitle`, `season_start`, `season_end` — self-explanatory
- `color_thresholds` — red / yellow cutoffs (%). Currently 50 / 75.
- `category_groups` — the order groups appear. Edit here to reorder or rename groups; make sure `categories.csv` rows use the same spelling.
- `footnotes` — key/value pairs shown at the bottom of the Rules tab.
- `repo_url` — the "Edit on GitHub" footer link.

---

## Weekly update workflow (suggested)

Every Friday (or whenever):

1. Update `data/scores.csv` with the week's new points.
2. Add a new row to `data/updates.csv` with the week's headline + recap.
3. (Optional) add any new events to `data/events.csv`.
4. Commit. Site updates within ~30 seconds.

---

## File structure

```
cea-scoreboard/
+-- index.html
+-- README.md
+-- LICENSE                    (MIT)
+-- .gitignore
+-- assets/
|   +-- styles.css             Pioneer green/amber styling
|   +-- app.js                 All logic (vanilla JS, no build step)
|   +-- pioneer-logo.png       (Optional -- add your own)
+-- data/
|   +-- config.json            Colors, groups, title, footnotes
|   +-- categories.csv         Categories + max points + descriptions
|   +-- scores.csv             Agency scores (edit most often)
|   +-- events.csv             Upcoming events (Next Up card + Schedule tab)
|   +-- updates.csv            Weekly recap notes (This Week banner)
+-- .github/workflows/
    +-- pages.yml              Optional GitHub Actions deploy (usually not needed)
```

---

## Known items to review

- **PK Session placeholders** (`pk_session_fall`, `pk_session_winter`) are ready to be renamed when you schedule those sessions.
- **Owner's Manual max points** — set to 100 (matches the totals row in the source). Change to 50 in `categories.csv` if the "Max of 50" text in the source was correct.
- **Rules descriptions** — draft text pulled from the source spreadsheet where possible; some are thin. Edit `description` fields in `categories.csv` when you want to flesh them out (Rep Reward Qualifier specifically could use more detail).
- **Pioneer logo** — text wordmark shown until you drop `assets/pioneer-logo.png` in.
- **Repo URL** — change `data/config.json` -> `repo_url` and the footer link works.

---

## Tech notes

- Vanilla HTML/CSS/JS. No build step, no framework, no dependencies (except Google Fonts for Barlow Condensed / Inter).
- CSV parsing done inline; handles quoted fields and commas inside quotes.
- Works on any modern browser, mobile-friendly, print-friendly.
- If data fails to load, the loading curtain shows exactly which file is at fault -- no silent "Loading..." hangs.

---

## License

MIT -- see `LICENSE`.

Built for Region 530 by Mike Otto, Pioneer Territory Manager.
