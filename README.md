# CEA Championship Scoreboard

Pioneer-branded scoreboard for the 2026-2027 CEA Championship. Hosted on GitHub Pages.

Live: https://otto-9092.github.io/Rep-Scoreboard/

## Structure
```
Rep-Scoreboard/
+-- index.html
+-- assets/  (styles.css, app.js, pioneer-logo.png)
+-- data/    (config.json, categories.csv, scores.csv, events.csv, updates.csv)
```

## Weekly update workflow
1. Update `data/scores.csv` with the week's new points.
2. Add a row to `data/updates.csv` with the week's recap.
3. Commit + push. Site updates in ~30 seconds.

Built for the CEA Championship by Mike Otto, Pioneer Territory Manager. MIT licensed.
