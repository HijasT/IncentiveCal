(function () {
  "use strict";
  /* I keep the HTML simple and move logic here so GitHub hosting stays clean.
     The HTML uses onclick handlers, so I expose a few functions on window. */

  // If anything blows up (CDN blocked, typo, whatever), I want the UI to tell me.
  window.addEventListener("error", function (ev) {
    try {
      var out = document.getElementById("bulk-results");
      if (out) {
        out.innerHTML =
          '<div class="error">JavaScript error: ' +
          esc(ev.message || "Unknown error") +
          "</div>";
      }
    } catch (e) {
      // If even error rendering fails, at least the console will show it.
      console.error(ev);
    }
  });
  

  /* ============================================================
     Local quotes only
     I want zero external calls, so quotes are hardcoded.
  ============================================================ */
  var QUOTES = [
    "Every sale is a vote for your future.",
    "Targets don’t hit themselves.",
    "Small wins stack up fast. Keep going.",
    "Consistency beats motivation.",
    "Make the numbers boring by repeating the basics.",
    "You don’t need luck. You need follow up.",
    "One more call, one more close.",
    "Discipline is the real incentive.",
    "If it’s measurable, it’s manageable.",
    "Show up, then show results."
  ];

  function pickQuote() {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  /* ============================================================
     Tab switching
     I toggle visibility of the two main sections
     and keep the pill state in sync.
  ============================================================ */
  function activateTab(name) {
    document.querySelectorAll(".pill").forEach(function (p) {
      p.classList.remove("active");
    });
    document.querySelectorAll("section.card").forEach(function (c) {
      c.style.display = "none";
    });

    if (name === "individual") {
      document.getElementById("tab-ind").classList.add("active");
      document.getElementById("individual").style.display = "block";
    } else {
      document.getElementById("tab-bulk").classList.add("active");
      document.getElementById("bulk").style.display = "block";
    }
  }

  /* ============================================================
     Dark mode toggle
     I toggle a class on <html> so CSS variables switch theme.
  ============================================================ */
  var darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", function () {
      var isDark = document.documentElement.classList.toggle("dark");
      darkToggle.textContent = isDark ? "🌙" : "☀️";
      updateSlider("ind");
      updateSlider("bulk");
    });
  }

  /* ============================================================
     Slider gradient + badges
     Safari gets weird with CSS vars in range gradients,
     so I set the gradient directly from JS.
  ============================================================ */
  function updateSlider(prefix) {
    var slider = document.getElementById(prefix + "-split");
    if (!slider) return;

    var eq = parseInt(slider.value, 10);
    var pr = 100 - eq;

    var eqBadge = document.getElementById(prefix + "-equal-badge");
    var prBadge = document.getElementById(prefix + "-personal-badge");
    if (eqBadge) eqBadge.textContent = "Equal " + eq + "%";
    if (prBadge) prBadge.textContent = "Personal " + pr + "%";

    var isDark = document.documentElement.classList.contains("dark");
    var fillColor = isDark ? "#60a5fa" : "#0047AB";
    slider.style.background =
      "linear-gradient(to right," +
      fillColor +
      " " +
      eq +
      "%,rgba(150,150,150,0.3) " +
      eq +
      "%)";
  }

  updateSlider("ind");
  updateSlider("bulk");

  /* ============================================================
     Tier logic
     This is the only place I define tiers.
  ============================================================ */
  function getTier(pct) {
    if (pct >= 85 && pct <= 100) return { text: "Tier 1 (2.5%)", rate: 0.025 };
    if (pct > 100 && pct <= 110) return { text: "Tier 2 (3%)", rate: 0.03 };
    if (pct > 110) return { text: "Tier 3 (3.5%)", rate: 0.035 };
    return { text: "Below Target", rate: 0 };
  }

  /* ============================================================
     UI helpers
  ============================================================ */
  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
    }, 2500);
  }

  function copyResult(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast("Result copied to clipboard!");
        })
        .catch(function () {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Result copied!");
    } catch (e) {
      showToast("Copy failed. Please copy manually.");
    }
    document.body.removeChild(ta);
  }

  function box(label, val) {
    return (
      '<div class="result-box">' +
      '<div class="rb-label">' +
      label +
      "</div>" +
      '<div class="rb-val">' +
      val +
      "</div>" +
      "</div>"
    );
  }

  function fmt(n) {
    return Number(n).toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function num(x) {
    if (x === null || x === undefined) return NaN;
    var s = String(x).replace(/,/g, "").trim();
    if (!s) return NaN;
    var n = Number(s);
    return isNaN(n) ? NaN : n;
  }

  /* ============================================================
     Individual breakdown chart
  ============================================================ */
  function buildChart(eqAmt, prAmt, eqPct, prPct) {
    if (eqAmt + prAmt <= 0) return "";

    var max = Math.max(eqAmt, prAmt);
    var eqW = Math.max(6, Math.round((eqAmt / max) * 100));
    var prW = Math.max(6, Math.round((prAmt / max) * 100));
    var tot = eqAmt + prAmt;
    var eqShare = Math.round((eqAmt / tot) * 100);
    var prShare = 100 - eqShare;

    return (
      '<div class="chart-wrap">' +
      '<div class="chart-title">Incentive Breakdown</div>' +
      '<div class="bar-row">' +
      '<div class="bar-label">Equal (' +
      eqPct +
      "%)</div>" +
      '<div class="bar-track">' +
      '<div class="bar-fill blue" style="width:0%" data-w="' +
      eqW +
      '%">AED ' +
      eqAmt.toFixed(2) +
      "</div>" +
      "</div>" +
      '<div class="bar-amount darkBlue">' +
      eqShare +
      "% of total</div>" +
      "</div>" +
      '<div class="bar-row">' +
      '<div class="bar-label">Personal (' +
      prPct +
      "%)</div>" +
      '<div class="bar-track">' +
      '<div class="bar-fill brown" style="width:0%" data-w="' +
      prW +
      '%">AED ' +
      prAmt.toFixed(2) +
      "</div>" +
      "</div>" +
      '<div class="bar-amount darkBrown">' +
      prShare +
      "% of total</div>" +
      "</div>" +
      "</div>"
    );
  }

  function animateBars() {
    document.querySelectorAll(".bar-fill[data-w]").forEach(function (el) {
      var target = el.getAttribute("data-w");
      setTimeout(function () {
        el.style.width = target;
      }, 60);
    });
  }

  /* ============================================================
     Individual calculation
  ============================================================ */
  function calculateIndividual() {
    var target = parseFloat(document.getElementById("ind-target").value);
    var total = parseFloat(document.getElementById("ind-total").value);
    var personal = parseFloat(document.getElementById("ind-personal").value);
    var count = parseInt(document.getElementById("ind-count").value, 10);
    var eq = parseInt(document.getElementById("ind-split").value, 10) / 100;
    var out = document.getElementById("ind-results");

    if (
      isNaN(target) || target <= 0 ||
      isNaN(total) || total < 0 ||
      isNaN(personal) || personal < 0 ||
      isNaN(count) || count <= 0
    ) {
      out.innerHTML = '<div class="error">Please fill in all fields with valid numbers before calculating.</div>';
      return;
    }

    var pct = (total / target) * 100;
    var tier = getTier(pct);
    var pr = 1 - eq;
    var pool = total * tier.rate;
    var eqSplit = (pool * eq) / count;
    var pShare = (personal / total) * (pool * pr);
    var totalInc = eqSplit + pShare;

    var eqPct = Math.round(eq * 100);
    var prPct = Math.round(pr * 100);

    var extra = 1695;
    var nt = total + extra;
    var np = personal + extra;
    var newTier = getTier((nt / target) * 100);
    var newPool = nt * newTier.rate;
    var newInc = ((newPool * eq) / count) + (np / nt) * (newPool * pr);
    var diff = newInc - totalInc;

    var tClass = tier.rate === 0 ? "tier-none" : "";

    var projHtml = "";
    if (tier.rate > 0) {
      projHtml =
        '<div class="projection-box">&#128161; Sell extra AED ' +
        extra.toLocaleString() +
        ": projected AED " +
        newInc.toFixed(2) +
        " (" +
        (diff >= 0 ? "+" : "") +
        diff.toFixed(2) +
        (newTier.rate !== tier.rate ? ", upgrades to " + newTier.text : "") +
        ")</div>";
    }

    var shareText =
      "Smart Incentive Calculator v4.0\n" +
      "================================\n" +
      "Tier: " + tier.text + " (" + pct.toFixed(2) + "% of target)\n" +
      "Incentive Pool: AED " + fmt(pool) + "\n" +
      "Equal Split (" + eqPct + "%): AED " + eqSplit.toFixed(3) + "\n" +
      "Personal Share (" + prPct + "%): AED " + pShare.toFixed(3) + "\n" +
      "--------------------------------\n" +
      "Total Incentive: AED " + totalInc.toFixed(2) + "\n\n" +
      "Calculated using https://hijast.github.io/IncentiveCal/";

    out.innerHTML =
      '<div class="result-grid">' +
      box("Tier", '<span class="tier-badge ' + tClass + '">' + tier.text + "</span>") +
      box("Achievement", pct.toFixed(2) + "%") +
      box("Pool", "AED " + fmt(pool)) +
      box("Equal (" + eqPct + "%)", '<span class="darkBlue">AED ' + eqSplit.toFixed(3) + "</span>") +
      box("Personal (" + ((personal / total) * 100).toFixed(2) + "%)", '<span class="darkBrown">AED ' + pShare.toFixed(3) + "</span>") +
      "</div>" +
      '<div class="highlight-total">Total Incentive: <span class="accentText">AED ' + totalInc.toFixed(2) + "</span></div>" +
      projHtml +
      '<div class="quote">' + esc(pickQuote()) + "</div>" +
      buildChart(eqSplit, pShare, eqPct, prPct) +
      '<button class="btn-share" id="shareBtn">&#128279; Copy Result</button>';

    var btn = document.getElementById("shareBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        copyResult(shareText);
      });
    }

    animateBars();
  }

  /* ============================================================
     Bulk extraction: detect target without fixed cell references
  ============================================================ */
  function detectTarget(rows) {
    for (var tr = 0; tr < rows.length; tr++) {
      var row = rows[tr] || [];
      for (var tc = 0; tc < row.length; tc++) {
        var cell = row[tc];
        if (typeof cell === "string" && cell.toLowerCase().indexOf("target") !== -1) {
          for (var vc = tc + 1; vc < row.length; vc++) {
            var val = num(row[vc]);
            if (val > 0) return val;
          }
          for (var vcl = tc - 1; vcl >= 0; vcl--) {
            var valLeft = num(row[vcl]);
            if (valLeft > 0) return valLeft;
          }
        }
      }
    }
    return null;
  }

  /* ============================================================
     Bulk state
  ============================================================ */
  var _allStaff = [];
  var _bulkEqPct = 60;
  var _bulkPrPct = 40;
  var _bulkEq = 0.6;
  var _bulkPr = 0.4;
  var _bulkTarget = null;

  /* ============================================================
     Bulk math + render
  ============================================================ */
  function applyBulkMathAndRender() {
    var out = document.getElementById("bulk-results");
    var dwn = document.getElementById("downloadBtn");
    var printBtn = document.getElementById("printBtn");

    if (!_allStaff.length || !_bulkTarget || _bulkTarget <= 0) {
      out.innerHTML = '<div class="error">No valid staff data or target to calculate incentives.</div>';
      if (dwn) dwn.style.display = "none";
      if (printBtn) printBtn.style.display = "none";
      window._bulkData = null;
      return;
    }

    var staff = _allStaff.slice();
    var teamTotal = staff.reduce(function (sum, s) { return sum + s.Sales; }, 0);
    var pct = (teamTotal / _bulkTarget) * 100;
    var tier = getTier(pct);
    var pool = teamTotal * tier.rate;
    var eqSplit = staff.length ? (pool * _bulkEq) / staff.length : 0;

    staff.forEach(function (s) {
      var personalPct = teamTotal > 0 ? (s.Sales / teamTotal) * 100 : 0;
      var pShare = teamTotal > 0 ? (s.Sales / teamTotal) * (pool * _bulkPr) : 0;
      s.PersonalPct = personalPct.toFixed(3);
      s.P30 = pShare;
      s.EqSplit = Number(eqSplit.toFixed(3));
      s.TotalInc = Number((eqSplit + pShare).toFixed(2));
    });

    staff.sort(function (a, b) { return b.TotalInc - a.TotalInc; });

    _allStaff = staff;
    _bulkEqPct = Math.round(_bulkEq * 100);
    _bulkPrPct = Math.round(_bulkPr * 100);

    window._bulkData = staff.map(function (s) {
      return {
        Staff: s.Staff,
        Packages: s.Packages,
        Sales: Number(s.Sales.toFixed(2)),
        PersonalPct: Number(s.PersonalPct),
        PersonalShare: Number(s.P30.toFixed(3)),
        EqualSplit: Number(s.EqSplit.toFixed(3)),
        TotalIncentive: Number(s.TotalInc.toFixed(2))
      };
    });

    var tClass = tier.rate === 0 ? "tier-none" : "";

    var summaryHtml =
      '<div class="result-grid" style="margin-bottom:8px">' +
      box("Tier", '<span class="tier-badge ' + tClass + '">' + tier.text + "</span>") +
      box("Achievement", pct.toFixed(2) + "%") +
      box("Team Total", "AED " + fmt(teamTotal)) +
      box("Staff Count", String(_allStaff.length)) +
      box("Equal / Person", '<span class="darkBlue">AED ' + (eqSplit || 0).toFixed(3) + "</span>") +
      "</div>";

    var searchHtml =
      '<div class="search-wrap">' +
      '<span class="search-icon">&#128269;</span>' +
      '<input type="text" id="bulk-search" placeholder="Search staff name..." oninput="filterBulkTable()" />' +
      "</div>";

    out.innerHTML = summaryHtml + searchHtml + '<div id="bulk-table-container"></div>';

    renderBulkTable(_allStaff);

    if (dwn) dwn.style.display = "inline-flex";
    if (printBtn) printBtn.style.display = "inline-flex";
  }

  /* ============================================================
     Bulk processing
  ============================================================ */
   function calculateBulk() {
    var out = document.getElementById("bulk-results");
    var dwn = document.getElementById("downloadBtn");
    var printBtn = document.getElementById("printBtn");

    // This line is the canary in the coal mine.
    // If you don’t see it, onclick isn’t firing or calculateBulk isn’t available.
    if (out) out.innerHTML = '<div class="note">Processing… reading workbook.</div>';

    if (dwn) dwn.style.display = "none";
    if (printBtn) printBtn.style.display = "none";

    try {
      var monthEl = document.getElementById("bulk-month");
      var yearEl = document.getElementById("bulk-year");
      var fileEl = document.getElementById("bulk-file");
      var splitEl = document.getElementById("bulk-split");

      if (!monthEl || !yearEl || !fileEl || !splitEl) {
        if (out) out.innerHTML = '<div class="error">Bulk UI inputs not found. Check element IDs in HTML.</div>';
        return;
      }

      var month = monthEl.value;
      var year = parseInt(yearEl.value, 10);
      var file = fileEl.files && fileEl.files[0];
      var eq = parseInt(splitEl.value, 10) / 100;

      window._bulkData = null;
      _allStaff = [];
      _bulkTarget = null;

      if (!file || !month || isNaN(year)) {
        if (out) out.innerHTML = '<div class="error">Please choose month, year, and select an Excel file.</div>';
        return;
      }

      // If your company blocks CDNs, XLSX will be undefined.
      if (typeof XLSX === "undefined") {
        if (out) {
          out.innerHTML =
            '<div class="error">Excel parser (XLSX) is not available. Your network may be blocking the CDN.</div>' +
            '<div class="note">Fix: allow cdnjs.cloudflare.com or download xlsx.full.min.js locally and reference it from the repo.</div>';
        }
        return;
      }

      _bulkEq = eq;
      _bulkPr = 1 - eq;

      var reader = new FileReader();

      reader.onerror = function () {
        if (out) out.innerHTML = '<div class="error">Could not read the file. Browser blocked the read.</div>';
      };

      reader.onload = function (e) {
        try {
          if (out) out.innerHTML = '<div class="note">Workbook loaded. Detecting sheet and month column…</div>';

          var wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });

          var yy = String(year).slice(-2);
          var candidates = [month + " " + yy, month + yy];

          var sheetName = null;
          for (var i = 0; i < wb.SheetNames.length; i++) {
            var raw = wb.SheetNames[i];
            var lower = raw.trim().toLowerCase();
            for (var j = 0; j < candidates.length; j++) {
              if (lower === candidates[j].toLowerCase()) {
                sheetName = raw;
                break;
              }
            }
            if (sheetName) break;
          }

          if (!sheetName) {
            if (out) {
              out.innerHTML =
                '<div class="error">Sheet not found for ' + esc(month + " " + yy) + ".</div>" +
                '<div class="note">Expected sheet name like: "' + esc(month + " " + yy) + '" or "' + esc(month + yy) + '".</div>' +
                '<div class="note">Found sheets: ' + esc(wb.SheetNames.join(", ")) + "</div>";
            }
            return;
          }

          var sheet = wb.Sheets[sheetName];
          var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

          if (!rows.length) {
            if (out) out.innerHTML = '<div class="error">Selected sheet is empty: ' + esc(sheetName) + "</div>";
            return;
          }

          var detectedTarget = detectTarget(rows);
          if (!detectedTarget || detectedTarget <= 0) {
            if (out) out.innerHTML = '<div class="error">Target not detected in sheet "' + esc(sheetName) + '".</div>';
            return;
          }
          _bulkTarget = detectedTarget;

          var headerIdx = -1;
          for (var r = 0; r < rows.length; r++) {
            var row0 = rows[r] && rows[r][0];
            if (row0 && String(row0).trim().toUpperCase() === "STAFF") {
              headerIdx = r;
              break;
            }
          }
          if (headerIdx === -1) {
            if (out) out.innerHTML = '<div class="error">Header row not found (expected "STAFF" in column A).</div>';
            return;
          }

          var headerRow = rows[headerIdx] || [];
          var monthLabel1 = (month + " " + yy).toLowerCase();
          var monthLabel2 = (month + yy).toLowerCase();
          var monthColIdx = -1;

          for (var c = 0; c < headerRow.length; c++) {
            var cell = headerRow[c];
            if (!cell) continue;
            var text = String(cell).replace(/\s+/g, " ").trim().toLowerCase();
            var hasMonth = text.indexOf(monthLabel1) !== -1 || text.indexOf(monthLabel2) !== -1;
            var hasTotal = text.indexOf("total") !== -1;
            if (hasMonth && hasTotal) {
              monthColIdx = c;
              break;
            }
          }

          if (monthColIdx === -1) {
            if (out) out.innerHTML = '<div class="error">Month total column not found for ' + esc(month + " " + yy) + ".</div>";
            return;
          }

          var staff = [];
          for (var iRow = headerIdx + 1; iRow < rows.length; iRow += 2) {
            var row1 = rows[iRow] || [];
            var row2 = rows[iRow + 1] || [];

            var nameCell = row1[0];
            if (!nameCell) continue;

            var cleanName = String(nameCell).trim();
            var lowerName = cleanName.toLowerCase();

            if (
              lowerName.indexOf("grand total") === 0 ||
              lowerName.indexOf("grand totals") === 0 ||
              lowerName.indexOf("total ") === 0 ||
              lowerName === "total"
            ) continue;

            var packages = num(row1[monthColIdx]);
            var sales = num(row2[monthColIdx]);

            if (isNaN(packages) && isNaN(sales)) continue;

            staff.push({
              Staff: cleanName,
              Packages: isNaN(packages) ? 0 : packages,
              Sales: isNaN(sales) ? 0 : sales
            });
          }

          if (!staff.length) {
            if (out) out.innerHTML = '<div class="error">No staff rows detected for this month column.</div>';
            return;
          }

          _allStaff = staff;
          applyBulkMathAndRender();
        } catch (err2) {
          console.error(err2);
          if (out) out.innerHTML = '<div class="error">Bulk parsing failed: ' + esc(err2.message || String(err2)) + "</div>";
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      if (out) out.innerHTML = '<div class="error">Bulk processing failed: ' + esc(err.message || String(err)) + "</div>";
    }
  }}

  /* ============================================================
     Bulk search filter
  ============================================================ */
  function filterBulkTable() {
    var input = document.getElementById("bulk-search");
    var q = input ? input.value.toLowerCase().trim() : "";
    var filtered = q
      ? _allStaff.filter(function (s) { return s.Staff.toLowerCase().indexOf(q) !== -1; })
      : _allStaff;

    renderBulkTable(filtered);
  }

  /* ============================================================
     Remove staff row and recalc
  ============================================================ */
  function removeStaff(origIndex) {
    origIndex = parseInt(origIndex, 10);
    if (isNaN(origIndex) || origIndex < 0 || origIndex >= _allStaff.length) return;
    _allStaff.splice(origIndex, 1);
    applyBulkMathAndRender();
  }

  /* ============================================================
     Bulk results table
  ============================================================ */
  function renderBulkTable(staff) {
    var container = document.getElementById("bulk-table-container");
    if (!container) return;

    if (!staff.length) {
      container.innerHTML = '<div class="no-results">No staff match your search.</div>';
      return;
    }

    var html =
      '<div class="table-wrap"><table><thead><tr>' +
      "<th>Rank</th>" +
      "<th>Staff</th>" +
      "<th>Packages</th>" +
      "<th>Total (AED)</th>" +
      "<th>Personal %</th>" +
      "<th>Personal " + _bulkPrPct + "% (AED)</th>" +
      "<th>Equal " + _bulkEqPct + "% (AED)</th>" +
      "<th>Total Incentive (AED)</th>" +
      "<th>Remove</th>" +
      "</tr></thead><tbody>";

    staff.forEach(function (s) {
      var orig = _allStaff.indexOf(s);
      var rankClass = orig === 0 ? "rank-1" : orig === 1 ? "rank-2" : orig === 2 ? "rank-3" : "";
      var medal = orig === 0 ? "🥇 " : orig === 1 ? "🥈 " : orig === 2 ? "🥉 " : "";

      html +=
        '<tr class="' + rankClass + '">' +
        '<td style="color:var(--muted);font-size:12px">' + medal + (orig + 1) + "</td>" +
        "<td><strong>" + esc(s.Staff) + "</strong></td>" +
        "<td>" + (s.Packages || 0) + "</td>" +
        "<td>" + s.Sales.toFixed(2) + "</td>" +
        "<td>" + s.PersonalPct + "%</td>" +
        '<td class="darkBrown">' + s.P30.toFixed(3) + "</td>" +
        '<td class="darkBlue">' + s.EqSplit.toFixed(3) + "</td>" +
        '<td><span class="total-inc">' + s.TotalInc.toFixed(2) + "</span></td>" +
        '<td><button type="button" class="btn-mini" onclick="removeStaff(' + orig + ')">✕</button></td>' +
        "</tr>";
    });

    container.innerHTML = html + "</tbody></table></div>";
  }

  /* ============================================================
     Excel download
  ============================================================ */
  function downloadBulk() {
    if (!window._bulkData || !window._bulkData.length) return;
    var ws = XLSX.utils.json_to_sheet(window._bulkData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incentives");
    XLSX.writeFile(wb, "Bulk_Incentives_v4.0.xlsx");
  }

  /* ============================================================
     Print / PDF
  ============================================================ */
  function printBulk() {
    window.print();
  }

  /* ============================================================
     Enter key triggers individual calculation
  ============================================================ */
  ["ind-target", "ind-total", "ind-personal", "ind-count"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") calculateIndividual();
    });
  });

  /* I expose the functions that the HTML onclick attributes call.
     That way splitting JS out doesn’t break anything. */
  window.activateTab = activateTab;
  window.updateSlider = updateSlider;
  window.calculateIndividual = calculateIndividual;
  window.calculateBulk = calculateBulk;
  window.downloadBulk = downloadBulk;
  window.printBulk = printBulk;
  window.filterBulkTable = filterBulkTable;
  window.removeStaff = removeStaff;
})();
