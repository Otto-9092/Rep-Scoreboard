# CEA Competition Scorecard

An interactive web scoreboard for tracking Customer Experience Agency (CEA) competition metrics across the Region 530 sales district. Hosted on GitHub Pages.

**Live site:** `https://YOUR-USERNAME.github.io/cea-scoreboard/` *(update after enabling Pages)*

---

## What this is

A single-page web app that reads three files from the `data/` folder and renders a leaderboard, per-agency detail view, and rules page. Reps can view it on any phone or laptop. You update it by editing CSV files directly in the GitHub web interface — no code changes required.

- **9 agencies** tracked: CW Seed, Fitts Seeds, Heiting Seed, JK Dean Ag, Keith Paul, Marker Ag, Meyer Seeds, MK Seeds, Soule Seed Company
- **20 scoring categories** totalling **530 points**
- **Two views:** ranked leaderboard (with expandable per-agency detail) and a full details grid
- **Rules & Definitions tab** auto-populated from `data/categories.csv`
- **Colour coding:** 0–50% red · 51–75% yellow · 76–100% green
- **"Available So Far" mode** ranks agencies only against categories whose deadline has passed
- **Print view** for meetings

---

## Setup — one-time (10 minutes)

1. **Create a new public GitHub repo** named `cea-scoreboard` (or anything you like — just update the link in `index.html` footer and `README.md` accordingly).
2. **Upload this folder's contents** to the repo root (drag-and-drop in the GitHub web UI works).
3. **Enable GitHub Pages:**
   - Repo → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** · Folder: **/ (root)** · Save.
4. Wait ~1 minute. Your site is live at `https://YOUR-USERNAME.github.io/cea-scoreboard/`.
5. Share the URL with your team.

---

## How to update

Everything lives in three files under `data/`. Edit them in the GitHub web UI (pencil icon → make change → commit).

### Update scores → `data/scores.csv`

One row per agency. Each column is a category ID (matches `categories.csv`). Enter the agency's earned points as a number. Leave blank if not yet scored.

Example:
```
agency,pk_session,harvest_data,dp_meeting,...
CW Seed,5,12,30,...
```

### Add / rename / edit categories → `data/categories.csv`

Each row = one category. Columns:

| Column | What it is |
| --- | --- |
| `id` | Short internal ID (no spaces, lowercase). Must match the column in `scores.csv`. |
| `name` | Full category name shown on the Rules tab. |
| `short_name` | Shorter label used in tight table cells. |
| `max_points` | Number, the maximum points possible. |
| `group` | One of the 5 groups from `config.json` (Training & PK, Planning & Admin, Customer Engagement, Data & Reporting, Rep Recognition). |
| `deadline` | ISO date `YYYY-MM-DD`. Used for "Available So Far" mode. |
| `description` | Longer description shown on the Rules tab. Wrap in double quotes if it contains commas. |

**To add a new category:**
1. Add a row to `categories.csv` with a new `id`.
2. Add a column with that same `id` to `scores.csv`.
3. Commit. The scoreboard picks it up on next load.

**To rename a category:** just change `name` / `short_name` / `description` — do NOT change `id` unless you also update `scores.csv`.

### Change colors, groups, footnotes → `data/config.json`

- `color_thresholds` — red / yellow cutoffs (%)
- `category_groups` — the order groups appear (edit here to reorder or rename groups; make sure `categories.csv` rows use the same spelling)
- `footnotes` — key/value pairs shown on the Rules tab

---

## File structure

```
cea-scoreboard/
├── index.html              # Main page
├── README.md               # This file
├── LICENSE                 # MIT License
├── .gitignore
├── assets/
│   ├── styles.css          # All styles
│   └── app.js              # All logic (vanilla JS, no build step)
├── data/
│   ├── config.json         # Colors, groups, title, footnotes
│   ├── categories.csv      # Categories + max points + descriptions
│   └── scores.csv          # Agency scores (edit this most often)
└── .github/
    └── workflows/
        └── pages.yml       # Optional: auto-deploy on push (usually not needed with Pages default)
```

---

## Known items to review

- **Two extra "PK Session" columns** (`pk_session_extra1`, `pk_session_extra2`) are placeholders kept from the source spreadsheet. Rename in `categories.csv` once their real purpose is confirmed.
- **Owner's Manual max points**: source spreadsheet header says "Max of 50 points" but the totals row shows 100. Set to **100** here — flip to 50 in `categories.csv` if that's wrong.
- **Deadlines**: many categories didn't have hard deadlines in the source. Reasonable defaults are used — adjust in `categories.csv` as needed.
- **Category descriptions**: draft text is pulled from the source spreadsheet where possible. Some categories need a fuller definition — edit `description` fields in `categories.csv` when you have time.
- **Repo URL in footer**: `index.html` and this README reference `YOUR-USERNAME` — search-replace with your actual GitHub username after uploading.

---

## Tech notes

- Vanilla HTML/CSS/JS. No framework, no build step, no dependencies.
- CSV parsing done inline (handles quoted fields and commas inside quotes).
- Works offline once loaded (though GitHub Pages CDN is very fast).
- Mobile-friendly.
- Print-friendly (hit the "Print View" button on the Leaderboard tab).

---

## License

MIT — see `LICENSE`.

Built for Region 530 by Mike Otto, Pioneer Territory Manager.
