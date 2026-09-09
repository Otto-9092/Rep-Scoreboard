// CEA Competition Scorecard
// Loads data/config.json, data/categories.csv, data/scores.csv
// Renders leaderboard, details grid, and rules pages.

const CONFIG_URL = 'data/config.json';
const CATEGORIES_URL = 'data/categories.csv';
const SCORES_URL = 'data/scores.csv';

// ---- CSV parser (handles quoted fields, commas inside quotes, escaped quotes) ----
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false, i = 0;
  // strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i+1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++; continue;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  // drop trailing empty rows
  while (rows.length && rows[rows.length-1].every(x => x === '')) rows.pop();
  return rows;
}

function csvToObjects(text) {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = r[i] !== undefined ? r[i] : '');
    return obj;
  });
}

// ---- Bucketing / coloring ----
function colorClass(pct, thresholds) {
  if (pct === null || pct === undefined || isNaN(pct)) return 'pending';
  if (pct <= thresholds.red_max) return 'red';
  if (pct <= thresholds.yellow_max) return 'yellow';
  return 'green';
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function deadlinePassed(iso) {
  if (!iso) return false;
  return iso <= todayISO();
}

// ---- Rendering ----
let CONFIG, CATEGORIES, SCORES;

async function loadAll() {
  const [cfg, catsText, scoresText] = await Promise.all([
    fetch(CONFIG_URL).then(r => r.json()),
    fetch(CATEGORIES_URL).then(r => r.text()),
    fetch(SCORES_URL).then(r => r.text()),
  ]);
  CONFIG = cfg;
  CATEGORIES = csvToObjects(catsText).map(c => ({
    ...c,
    max_points: parseFloat(c.max_points) || 0,
  }));
  SCORES = csvToObjects(scoresText);

  document.getElementById('site-title').textContent = CONFIG.title;
  document.getElementById('site-subtitle').textContent = CONFIG.subtitle;
  document.title = CONFIG.title;
  document.getElementById('load-time').textContent = new Date().toLocaleString('en-GB', { hour12: false });

  renderLeaderboard();
  renderDetails();
  renderRules();
  attachTabs();
}

function computeAgencyRow(agency) {
  let earned = 0, totalMax = 0, soFarEarned = 0, soFarMax = 0;
  const perCat = {};
  CATEGORIES.forEach(cat => {
    const raw = agency[cat.id];
    const val = raw === '' || raw === undefined ? null : parseFloat(raw);
    const numeric = val === null || isNaN(val) ? 0 : val;
    totalMax += cat.max_points;
    earned += numeric;
    const passed = deadlinePassed(cat.deadline);
    if (passed) {
      soFarMax += cat.max_points;
      soFarEarned += numeric;
    }
    perCat[cat.id] = {
      value: val,
      max: cat.max_points,
      pct: cat.max_points > 0 && val !== null ? (numeric / cat.max_points) * 100 : null,
      passed,
    };
  });
  return {
    agency: agency.agency,
    earned, totalMax, soFarEarned, soFarMax,
    pctTotal: totalMax > 0 ? (earned / totalMax) * 100 : 0,
    pctSoFar: soFarMax > 0 ? (soFarEarned / soFarMax) * 100 : null,
    perCat,
  };
}

function assignRanks(rows, sortKey) {
  // Sort by sortKey desc. Handle null (soFar with 0 max) as -1.
  const sorted = [...rows].sort((a,b) => {
    const av = a[sortKey] === null ? -1 : a[sortKey];
    const bv = b[sortKey] === null ? -1 : b[sortKey];
    return bv - av;
  });
  let currentRank = 0, lastValue = null, index = 0;
  sorted.forEach(r => {
    index++;
    const v = r[sortKey];
    if (v !== lastValue) {
      currentRank = index;
      lastValue = v;
    }
    r.rank = currentRank;
  });
  return sorted;
}

function renderLeaderboard() {
  const basis = document.getElementById('pct-basis').value;
  const rows = SCORES.map(computeAgencyRow);
  const sortKey = basis === 'total' ? 'pctTotal' : 'pctSoFar';
  const ranked = assignRanks(rows, sortKey);

  const tbody = document.querySelector('#leaderboard-table tbody');
  tbody.innerHTML = '';

  ranked.forEach((row, idx) => {
    const pct = basis === 'total' ? row.pctTotal : row.pctSoFar;
    const pctDisplay = pct === null ? '—' : `${pct.toFixed(1)}%`;
    const cls = colorClass(pct === null ? 0 : pct, CONFIG.color_thresholds);
    const earnedDisplay = basis === 'total'
      ? `${row.earned} / ${row.totalMax}`
      : (row.soFarMax > 0 ? `${row.soFarEarned} / ${row.soFarMax}` : `${row.earned} / 0`);

    const rankClass = row.rank <= 3 ? `rank-${row.rank}` : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-rank ${rankClass}">${row.rank}</td>
      <td class="col-agency">${escapeHtml(row.agency)}</td>
      <td class="col-total">${earnedDisplay}</td>
      <td class="col-pct">${pctDisplay}</td>
      <td class="col-bar"><div class="bar"><div class="bar-fill ${cls}" style="width:${pct === null ? 0 : Math.min(100, pct)}%"></div></div></td>
    `;
    tr.dataset.agency = row.agency;
    tbody.appendChild(tr);

    // Detail row
    const detailTr = document.createElement('tr');
    detailTr.className = 'detail-row';
    detailTr.dataset.forAgency = row.agency;
    const td = document.createElement('td');
    td.colSpan = 5;
    td.innerHTML = renderDetailPanel(row);
    detailTr.appendChild(td);
    tbody.appendChild(detailTr);

    tr.addEventListener('click', () => {
      const isOpen = detailTr.classList.contains('visible');
      // Close all first
      document.querySelectorAll('.detail-row.visible').forEach(d => d.classList.remove('visible'));
      document.querySelectorAll('#leaderboard-table tbody tr.expanded').forEach(d => d.classList.remove('expanded'));
      if (!isOpen) {
        detailTr.classList.add('visible');
        tr.classList.add('expanded');
      }
    });
  });
}

function renderDetailPanel(row) {
  const groups = {};
  CATEGORIES.forEach(cat => {
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push(cat);
  });
  const groupOrder = CONFIG.category_groups;
  let html = '<div class="detail-groups">';
  groupOrder.forEach(g => {
    if (!groups[g]) return;
    html += `<div class="detail-group"><h4>${escapeHtml(g)}</h4><div class="detail-cats">`;
    groups[g].forEach(cat => {
      const pc = row.perCat[cat.id];
      const hasScore = pc.value !== null;
      const cls = hasScore ? colorClass(pc.pct, CONFIG.color_thresholds) : (pc.passed ? 'red' : 'pending');
      const pts = hasScore ? `${pc.value} / ${pc.max}` : `— / ${pc.max}`;
      const deadlineNote = pc.passed
        ? `<span class="deadline-tag">Due ${fmtDate(cat.deadline)} · closed</span>`
        : `<span class="deadline-tag">Due ${fmtDate(cat.deadline)}</span>`;
      html += `<div class="detail-cat ${cls}">
        <div class="cat-name">${escapeHtml(cat.short_name || cat.name)}${deadlineNote}</div>
        <div class="cat-pts">${pts}</div>
      </div>`;
    });
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

function renderDetails() {
  const rows = SCORES.map(computeAgencyRow);
  const ranked = assignRanks(rows, 'pctSoFar');
  const groupFilter = document.getElementById('group-filter').value;

  // Populate group filter (idempotent)
  const gf = document.getElementById('group-filter');
  if (gf.options.length === 1) {
    CONFIG.category_groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g; opt.textContent = g;
      gf.appendChild(opt);
    });
    gf.addEventListener('change', renderDetails);
  }

  const shownCats = groupFilter
    ? CATEGORIES.filter(c => c.group === groupFilter)
    : CATEGORIES;

  // Group categories by group for header row
  const groupsInOrder = [];
  CONFIG.category_groups.forEach(g => {
    const cs = shownCats.filter(c => c.group === g);
    if (cs.length) groupsInOrder.push({ group: g, cats: cs });
  });

  const thead = document.querySelector('#details-table thead');
  const tbody = document.querySelector('#details-table tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Header row 1: group spans
  const hr1 = document.createElement('tr');
  hr1.innerHTML = `<th rowspan="2">Agency</th>`;
  groupsInOrder.forEach(g => {
    hr1.innerHTML += `<th class="group-header" colspan="${g.cats.length}">${escapeHtml(g.group)}</th>`;
  });
  hr1.innerHTML += `<th rowspan="2">Total</th>`;
  thead.appendChild(hr1);

  // Header row 2: category names
  const hr2 = document.createElement('tr');
  groupsInOrder.forEach(g => {
    g.cats.forEach(cat => {
      hr2.innerHTML += `<th class="cat-col" title="${escapeHtml(cat.name)} · Max ${cat.max_points} · Due ${fmtDate(cat.deadline)}">${escapeHtml(cat.short_name || cat.name)}</th>`;
    });
  });
  thead.appendChild(hr2);

  // Body rows
  ranked.forEach(row => {
    const tr = document.createElement('tr');
    let html = `<td class="agency-cell">${escapeHtml(row.agency)}</td>`;
    let totalShown = 0, maxShown = 0;
    groupsInOrder.forEach(g => {
      g.cats.forEach(cat => {
        const pc = row.perCat[cat.id];
        const hasScore = pc.value !== null;
        const cls = hasScore ? colorClass(pc.pct, CONFIG.color_thresholds) : 'pending';
        const display = hasScore ? pc.value : '—';
        html += `<td class="score-cell ${cls}" title="${escapeHtml(cat.name)}">${display}</td>`;
        maxShown += cat.max_points;
        if (hasScore) totalShown += pc.value;
      });
    });
    html += `<td class="total-cell">${totalShown} / ${maxShown}</td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

function renderRules() {
  const container = document.getElementById('rules-content');
  container.innerHTML = '';
  CONFIG.category_groups.forEach(g => {
    const catsInGroup = CATEGORIES.filter(c => c.group === g);
    if (!catsInGroup.length) return;
    const groupDiv = document.createElement('div');
    groupDiv.className = 'rule-group';
    groupDiv.innerHTML = `<h3>${escapeHtml(g)}</h3>`;
    catsInGroup.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'rule-card';
      card.innerHTML = `
        <div class="rule-header">
          <div class="rule-name">${escapeHtml(cat.name)}</div>
          <div class="rule-meta">${cat.max_points} pts · Due ${fmtDate(cat.deadline) || 'TBD'}</div>
        </div>
        <p class="rule-desc">${escapeHtml(cat.description || '')}</p>
      `;
      groupDiv.appendChild(card);
    });
    container.appendChild(groupDiv);
  });

  const fn = document.getElementById('footnotes-content');
  fn.innerHTML = '';
  Object.entries(CONFIG.footnotes || {}).forEach(([k,v]) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`;
    fn.appendChild(p);
  });

  document.getElementById('total-available').textContent =
    CATEGORIES.reduce((sum,c) => sum + c.max_points, 0);
  document.getElementById('total-agencies').textContent = SCORES.length;
}

function attachTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
    });
  });
  document.getElementById('pct-basis').addEventListener('change', renderLeaderboard);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

loadAll().catch(err => {
  console.error(err);
  document.getElementById('site-subtitle').textContent =
    'Error loading data. Check that data/*.csv and data/config.json exist and are valid.';
});
