/*!
Smart Incentive Calculator
Copyright (c) 2026 HT
License: Internal distribution only. Not for use by Smart Salem or affiliates.
*/

(function bootStamp(){
  var buildId = "HT-" + new Date().toISOString();
  window.__BUILD_ID__ = buildId;
  window.__OWNER_TOKEN__ = "HT:2026:INTERNAL:DISTRIBUTION";
  function setWm(id){
    var el = document.getElementById(id);
    if (el) el.textContent = "Licensed to HT • Build " + buildId;
  }
  setWm("wm");
  setWm("wm2");
})();

/* Tabs */
function activateTab(name) {
  document.querySelectorAll(".pill").forEach(function(p){ p.classList.remove("active"); });
  document.querySelectorAll("section.card").forEach(function(c){ c.style.display = "none"; });

  if (name === "individual") {
    document.getElementById("tab-ind").classList.add("active");
    document.getElementById("individual").style.display = "block";
  } else {
    document.getElementById("tab-bulk").classList.add("active");
    document.getElementById("bulk").style.display = "block";
  }
}

/* Dark mode */
var darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.addEventListener("click", function() {
    var isDark = document.documentElement.classList.toggle("dark");
    darkToggle.textContent = isDark ? "🌙" : "☀️";
    updateSlider("ind");
    updateSlider("bulk");
  });
}

/* Slider */
function updateSlider(prefix) {
  var slider = document.getElementById(prefix + "-split");
  if (!slider) return;
  var eq = parseInt(slider.value, 10);
  var pr = 100 - eq;

  var eb = document.getElementById(prefix + "-equal-badge");
  var pb = document.getElementById(prefix + "-personal-badge");
  if (eb) eb.textContent = "Equal " + eq + "%";
  if (pb) pb.textContent = "Personal " + pr + "%";

  var isDark = document.documentElement.classList.contains("dark");
  var fillColor = isDark ? "#60a5fa" : "#0047AB";
  slider.style.background = "linear-gradient(to right," + fillColor + " " + eq + "%,rgba(150,150,150,0.3) " + eq + "%)";
}

updateSlider("ind");
updateSlider("bulk");

/* Toast */
function showToast(msg) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function(){ t.classList.remove("show"); }, 2500);
}

/* Tier logic */
function getTier(pct) {
  if (pct >= 85 && pct <= 100) return { text: "Tier 1 (2.5%)", rate: 0.025 };
  if (pct > 100 && pct <= 110) return { text: "Tier 2 (3%)", rate: 0.03 };
  if (pct > 110) return { text: "Tier 3 (3.5%)", rate: 0.035 };
  return { text: "Below Target", rate: 0 };
}

/* Helpers */
function fmt(n) {
  return Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function box(label, val) {
  return '<div class="result-box"><div class="rb-label">' + label + '</div><div class="rb-val">' + val + "</div></div>";
}

/* Individual calculator */
var quotes = [
  "Every sale brings you closer to success.",
  "Push a little harder, your future self will thank you.",
  "Small wins compound into big results.",
  "Be the reason someone earns a compliment today."
];

function calculateIndividual() {
  var target = parseFloat(document.getElementById("ind-target").value);
  var total = parseFloat(document.getElementById("ind-total").value);
  var personal = parseFloat(document.getElementById("ind-personal").value);
  var count = parseInt(document.getElementById("ind-count").value, 10);
  var eq = parseInt(document.getElementById("ind-split").value, 10) / 100;
  var out = document.getElementById("ind-results");

  if (!out) return;

  if (
    isNaN(target) || target <= 0 ||
    isNaN(total) || total < 0 ||
    isNaN(personal) || personal < 0 ||
    isNaN(count) || count <= 0 ||
    total === 0
  ) {
    out.innerHTML = '<div class="error">Please fill in valid values.</div>';
    return;
  }

  var pct = (total / target) * 100;
  var tier = getTier(pct);
  var pr = 1 - eq;
  var pool = total * tier.rate;
  var eqSplit = (pool * eq) / count;
  var pShare = (personal / total) * (pool * pr);
  var totalInc = eqSplit + pShare;

  var tClass = tier.rate === 0 ? "tier-none" : "";
  var eqPct = Math.round(eq * 100);

  out.innerHTML =
    '<div class="result-grid">' +
      box("Tier", '<span class="tier-badge ' + tClass + '">' + tier.text + "</span>") +
      box("Achievement", pct.toFixed(2) + "%") +
      box("Pool", "AED " + fmt(pool)) +
      box("Equal (" + eqPct + "%)", '<span style="color:var(--darkblue);font-weight:800">AED ' + eqSplit.toFixed(3) + "</span>") +
      box("Personal", '<span style="color:var(--darkbrown);font-weight:800">AED ' + pShare.toFixed(3) + "</span>") +
    "</div>" +
    '<div class="highlight-total">Total Incentive: <span class="total-strong">AED ' + totalInc.toFixed(2) + "</span></div>" +
    '<div class="quote">' + quotes[Math.floor(Math.random() * quotes.length)] + "</div>";
}

/* Month and year dropdown defaults */
(function initMonthYear(){
  var mSel = document.getElementById("bulk-month");
  var ySel = document.getElementById("bulk-year");
  if (!mSel || !ySel) return;

  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  months.forEach(function(m, i){
    var opt = document.createElement("option");
    opt.value = String(i + 1);
    opt.textContent = m;
    mSel.appendChild(opt);
  });

  var now = new Date();
  var thisYear = now.getFullYear();
  for (var y = thisYear - 3; y <= thisYear + 1; y++) {
    var oy = document.createElement("option");
    oy.value = String(y);
    oy.textContent = String(y);
    ySel.appendChild(oy);
  }

  mSel.value = String(now.getMonth() + 1);
  ySel.value = String(thisYear);
})();

/* Bulk state */
var _allStaff = [];
var _excluded = new Set();
var _bulkEqPct = 60;
var _bulkPrPct = 40;
var _bulkSummary = null;
window._bulkData = null;

/* Bulk calculation with resilient sheet detection
   This version avoids hard coded cell addresses by searching labels.
   It also ignores Grand Total style rows.
*/
function calculateBulk() {
  var fileInput = document.getElementById("bulk-file");
  var out = document.getElementById("bulk-results");
  var meta = document.getElementById("bulk-meta");
  var dwn = document.getElementById("downloadBtn");
  var pdf = document.getElementById("downloadPdfBtn");

  if (!out || !meta || !fileInput) return;

  out.innerHTML = "";
  meta.textContent = "";
  if (dwn) dwn.style.display = "none";
  if (pdf) pdf.style.display = "none";
  window._bulkData = null;
  _allStaff = [];
  _excluded = new Set();
  _bulkSummary = null;

  var file = fileInput.files && fileInput.files[0];
  if (!file) {
    out.innerHTML = '<div class="error">Select an Excel file first.</div>';
    return;
  }

  var monthNum = parseInt(document.getElementById("bulk-month").value, 10);
  var yearFull = parseInt(document.getElementById("bulk-year").value, 10);
  var eq = parseInt(document.getElementById("bulk-split").value, 10) / 100;
  var pr = 1 - eq;

  _bulkEqPct = Math.round(eq * 100);
  _bulkPrPct = Math.round(pr * 100);

  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });

      var sheetName = findMonthSheetName(wb.SheetNames, monthNum, yearFull);
      if (!sheetName) {
        out.innerHTML = '<div class="error">Could not find the month sheet. Expected names like "Feb 26" or "Feb26".</div>';
        return;
      }

      var sheet = wb.Sheets[sheetName];

      var extracted = extractTrackerMonth(sheet, monthNum, yearFull);
      if (!extracted || !extracted.staff || !extracted.staff.length) {
        out.innerHTML = '<div class="error">No staff rows extracted. The sheet layout might have changed.</div>';
        return;
      }

      var target = extracted.target;
      var teamTotal = extracted.teamTotal;
      var staff = extracted.staff;

      if (!isFinite(target) || target <= 0 || !isFinite(teamTotal) || teamTotal < 0) {
        out.innerHTML = '<div class="error">Could not read target or team total correctly.</div>';
        return;
      }

      var pct = (teamTotal / target) * 100;
      var tier = getTier(pct);
      var pool = teamTotal * tier.rate;
      var eqSplit = staff.length ? (pool * eq) / staff.length : 0;

      staff.forEach(function(s){
        s.PersonalPct = teamTotal > 0 ? ((s.Total / teamTotal) * 100).toFixed(3) : "0.000";
        s.PShare = teamTotal > 0 ? (s.Total / teamTotal) * (pool * pr) : 0;
        s.EqSplit = Number(eqSplit.toFixed(3));
        s.TotalInc = Number((eqSplit + s.PShare).toFixed(2));
      });

      staff.sort(function(a,b){ return b.TotalInc - a.TotalInc; });

      _allStaff = staff;

      window._bulkData = staff.map(function(s){
        return {
          Staff: s.Staff,
          Packages: s.Packages,
          TotalSales: Number(s.Total.toFixed(2)),
          PersonalPct: Number(s.PersonalPct),
          PersonalShare: Number(s.PShare.toFixed(3)),
          EqualSplit: Number(s.EqSplit.toFixed(3)),
          TotalIncentive: Number(s.TotalInc.toFixed(2))
        };
      });

      _bulkSummary = {
        sheetName: sheetName,
        monthNum: monthNum,
        yearFull: yearFull,
        staffCount: staff.length,
        target: target,
        teamTotal: teamTotal,
        achievementPct: pct,
        tier: tier,
        pool: pool,
        eqSplit: eqSplit
      };

      meta.textContent =
        "Sheet: " + sheetName +
        " • Staff: " + staff.length +
        " • Target: AED " + fmt(target) +
        " • Team Total: AED " + fmt(teamTotal) +
        " • Achievement: " + pct.toFixed(2) + "%";

      renderBulkTable(staff);

      if (dwn) dwn.style.display = "inline-flex";
      if (pdf) pdf.style.display = "inline-flex";

    } catch (err) {
      console.error(err);
      out.innerHTML = '<div class="error">Failed to parse this workbook.</div>';
    }
  };

  reader.readAsArrayBuffer(file);
}

/* Sheet name detection for "Feb 26" or "Feb26" */
function findMonthSheetName(sheetNames, monthNum, yearFull) {
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var mon = months[monthNum - 1];
  var yy = String(yearFull).slice(2);

  var candidates = [
    mon + " " + yy,
    mon + yy,
    mon.toLowerCase() + " " + yy,
    mon.toLowerCase() + yy,
    mon.toUpperCase() + " " + yy,
    mon.toUpperCase() + yy
  ];

  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    for (var j = 0; j < sheetNames.length; j++) {
      if (String(sheetNames[j]).trim() === c) return sheetNames[j];
    }
  }

  var loose = new RegExp("^" + mon + "\\s*" + yy + "$", "i");
  for (var k = 0; k < sheetNames.length; k++) {
    if (loose.test(String(sheetNames[k]).trim())) return sheetNames[k];
  }

  return null;
}

/* Tracker extraction without hard coded cell numbers
   Strategy:
   1 Convert sheet to 2D array with cell text preserved
   2 Find the header row that contains the month labels
   3 Choose the correct column for the selected month
   4 Walk down and read staff merged names plus package count and total sales for that month column
   5 Ignore rows like "Grand Total"
   6 Find target and team total by searching labels
*/
function extractTrackerMonth(sheet, monthNum, yearFull) {
  var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" });
  if (!rows || !rows.length) return null;

  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var mon = months[monthNum - 1];
  var yy = String(yearFull).slice(2);
  var monthKeys = [
    mon + " " + yy,
    mon + yy,
    mon.toLowerCase() + " " + yy,
    mon.toLowerCase() + yy
  ];

  function norm(v){
    return String(v || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isGrandTotal(name){
    var n = norm(name);
    return n === "grand total" || n === "grand totals" || n === "total" || n === "totals";
  }

  function toNum(v){
    if (v === null || v === undefined) return NaN;
    if (typeof v === "number") return v;
    var s = String(v).replace(/,/g, "").trim();
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  var headerRowIndex = -1;
  var monthColIndex = -1;

  for (var r = 0; r < Math.min(rows.length, 80); r++) {
    for (var c = 0; c < rows[r].length; c++) {
      var cell = norm(rows[r][c]);
      for (var mk = 0; mk < monthKeys.length; mk++) {
        if (cell === norm(monthKeys[mk])) {
          headerRowIndex = r;
          monthColIndex = c;
          break;
        }
      }
      if (monthColIndex !== -1) break;
    }
    if (monthColIndex !== -1) break;
  }

  if (monthColIndex === -1) return null;

  var target = findValueNearLabel(rows, ["target"], toNum);
  var teamTotal = findValueNearLabel(rows, ["total sales", "team total", "grand total"], toNum);

  var staff = [];
  var lastName = "";

  for (var i = headerRowIndex + 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row) continue;

    var nameCandidate = row[0];
    var name = String(nameCandidate || "").trim();
    if (!name) name = lastName;
    if (!name) continue;

    if (isGrandTotal(name)) continue;

    lastName = name;

    var pkgCount = toNum(row[monthColIndex]);
    var salesRow = rows[i + 1] || [];
    var salesVal = toNum(salesRow[monthColIndex]);

    var packages = isFinite(pkgCount) ? pkgCount : 0;
    var totalSales = isFinite(salesVal) ? salesVal : 0;

    if (packages === 0 && totalSales === 0) {
      continue;
    }

    staff.push({
      Staff: name,
      Packages: packages,
      Total: totalSales
    });

    i += 1;
  }

  if (!isFinite(teamTotal) || teamTotal <= 0) {
    teamTotal = staff.reduce(function(s, x){ return s + x.Total; }, 0);
  }

  return { staff: staff, target: target, teamTotal: teamTotal };
}

/* Find a number near a label, resilient to moved cells */
function findValueNearLabel(rows, labelList, parseFn) {
  function norm(v){
    return String(v || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  for (var r = 0; r < Math.min(rows.length, 120); r++) {
    for (var c = 0; c < (rows[r] || []).length; c++) {
      var cell = norm(rows[r][c]);
      for (var i = 0; i < labelList.length; i++) {
        if (cell === norm(labelList[i])) {
          var right = (rows[r] || [])[c + 1];
          var down = ((rows[r + 1] || []) || [])[c];
          var downRight = ((rows[r + 1] || []) || [])[c + 1];

          var a = parseFn(right);
          if (isFinite(a)) return a;

          var b = parseFn(down);
          if (isFinite(b)) return b;

          var d = parseFn(downRight);
          if (isFinite(d)) return d;
        }
      }
    }
  }
  return NaN;
}

/* Search filter */
function filterBulkTable() {
  var qEl = document.getElementById("bulk-search");
  if (!qEl) return;
  var q = qEl.value.toLowerCase().trim();

  var filtered = q
    ? _allStaff.filter(function(s){ return s.Staff.toLowerCase().indexOf(q) !== -1; })
    : _allStaff;

  renderBulkTable(filtered);
}

/* Bulk table renderer with medals, staff removal, recalculation */
function renderBulkTable(staff) {
  var out = document.getElementById("bulk-results");
  if (!out) return;

  if (!staff || !staff.length) {
    out.innerHTML = '<div class="error">No staff to display.</div>';
    return;
  }

  var html =
    '<div class="table-wrap"><table><thead><tr>' +
      '<th>Rank</th>' +
      '<th>Staff</th>' +
      '<th>Packages</th>' +
      '<th>Total Sales (AED)</th>' +
      '<th>Total Incentive (AED)</th>' +
      '<th>Action</th>' +
    '</tr></thead><tbody>';

  var baseList = _allStaff.filter(function(s){ return !_excluded.has(s.Staff); });

  baseList.sort(function(a,b){ return b.TotalInc - a.TotalInc; });

  staff.forEach(function(s) {
    if (_excluded.has(s.Staff)) return;

    var origIndex = baseList.indexOf(s);
    if (origIndex < 0) origIndex = 99999;

    var rankClass = origIndex === 0 ? "rank-1" : origIndex === 1 ? "rank-2" : origIndex === 2 ? "rank-3" : "";
    var medal = origIndex === 0 ? "🥇 " : origIndex === 1 ? "🥈 " : origIndex === 2 ? "🥉 " : "";

    html +=
      '<tr class="' + rankClass + '">' +
        '<td style="color:var(--muted);font-size:12px">' + medal + (origIndex + 1) + '</td>' +
        '<td><strong>' + esc(s.Staff) + '</strong></td>' +
        '<td>' + Number(s.Packages).toFixed(0) + '</td>' +
        '<td>' + Number(s.Total).toFixed(2) + '</td>' +
        '<td><strong style="font-size:16px">' + Number(s.TotalInc).toFixed(2) + '</strong></td>' +
        '<td><button class="btn secondary" style="margin-top:0;padding:7px 10px" onclick="excludeStaff(\'' + esc(s.Staff).replace(/&#39;/g, "\\'") + '\')">Remove</button></td>' +
      "</tr>";
  });

  html += "</tbody></table></div>";

  out.innerHTML = html;
}

/* Remove staff and recalc incentives based on remaining staff */
function excludeStaff(name) {
  _excluded.add(name);
  recalcAfterExclusion();
  showToast("Removed: " + name);
}

/* Recalc after exclusions */
function recalcAfterExclusion() {
  if (!_bulkSummary) return;

  var eq = parseInt(document.getElementById("bulk-split").value, 10) / 100;
  var pr = 1 - eq;

  var remaining = _allStaff.filter(function(s){ return !_excluded.has(s.Staff); });
  if (!remaining.length) return;

  var target = _bulkSummary.target;

  var teamTotal = remaining.reduce(function(sum, s){ return sum + s.Total; }, 0);
  var pct = (teamTotal / target) * 100;
  var tier = getTier(pct);
  var pool = teamTotal * tier.rate;
  var eqSplit = (pool * eq) / remaining.length;

  remaining.forEach(function(s){
    s.PersonalPct = teamTotal > 0 ? ((s.Total / teamTotal) * 100).toFixed(3) : "0.000";
    s.PShare = teamTotal > 0 ? (s.Total / teamTotal) * (pool * pr) : 0;
    s.EqSplit = Number(eqSplit.toFixed(3));
    s.TotalInc = Number((eqSplit + s.PShare).toFixed(2));
  });

  remaining.sort(function(a,b){ return b.TotalInc - a.TotalInc; });

  var meta = document.getElementById("bulk-meta");
  if (meta) {
    meta.textContent =
      "Sheet: " + _bulkSummary.sheetName +
      " • Staff: " + remaining.length +
      " • Target: AED " + fmt(target) +
      " • Team Total: AED " + fmt(teamTotal) +
      " • Achievement: " + pct.toFixed(2) + "%";
  }

  window._bulkData = remaining.map(function(s){
    return {
      Staff: s.Staff,
      Packages: s.Packages,
      TotalSales: Number(s.Total.toFixed(2)),
      TotalIncentive: Number(s.TotalInc.toFixed(2))
    };
  });

  var qEl = document.getElementById("bulk-search");
  var q = qEl ? qEl.value.toLowerCase().trim() : "";
  var filtered = q
    ? remaining.filter(function(s){ return s.Staff.toLowerCase().indexOf(q) !== -1; })
    : remaining;

  _allStaff = remaining;
  renderBulkTable(filtered);
}

/* Excel download */
function downloadBulk() {
  if (!window._bulkData || !window._bulkData.length) return;
  var ws = XLSX.utils.json_to_sheet(window._bulkData);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Incentives");
  XLSX.writeFile(wb, "Bulk_Incentives_v3.1.xlsx");
}

/* PDF download without extra libraries
   This uses the browser print dialog to save as PDF.
   It opens a clean window with a simple table and watermark.
*/
function downloadBulkPdf() {
  if (!window._bulkData || !window._bulkData.length) return;

  var buildId = window.__BUILD_ID__ || "";
  var rows = window._bulkData;

  var html = "<html><head><title>Bulk Incentives PDF</title>" +
    "<meta charset='utf-8' />" +
    "<style>body{font-family:Arial,sans-serif;padding:18px}h2{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#eee} .wm{margin-top:12px;font-size:11px;color:#666}</style>" +
    "</head><body>";

  html += "<h2>Bulk Incentives</h2>";
  if (_bulkSummary) {
    html += "<div style='font-size:12px;color:#444'>Sheet: " + esc(_bulkSummary.sheetName) +
      " • Staff: " + rows.length +
      " • Target: AED " + fmt(_bulkSummary.target) +
      "</div>";
  }

  html += "<table><thead><tr><th>Staff</th><th>Packages</th><th>Total Sales</th><th>Total Incentive</th></tr></thead><tbody>";

  rows.forEach(function(r){
    html += "<tr><td>" + esc(r.Staff) + "</td><td>" + Number(r.Packages || 0).toFixed(0) + "</td><td>" + Number(r.TotalSales || 0).toFixed(2) + "</td><td><b>" + Number(r.TotalIncentive || 0).toFixed(2) + "</b></td></tr>";
  });

  html += "</tbody></table>";
  html += "<div class='wm'>Licensed to HT • Build " + esc(buildId) + "</div>";
  html += "</body></html>";

  var w = window.open("", "_blank");
  if (!w) { showToast("Popup blocked. Allow popups to export PDF."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* Enter key for individual */
["ind-target","ind-total","ind-personal","ind-count"].forEach(function(id){
  var el = document.getElementById(id);
  if (el) el.addEventListener("keydown", function(e){
    if (e.key === "Enter") calculateIndividual();
  });
});
