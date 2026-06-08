const searchInput = document.querySelector("#affiliate-search");
const filterSelect = document.querySelector("#affiliate-filter");
const resultsEl = document.querySelector("#affiliate-results");
const countEl = document.querySelector("#affiliate-count");

let affiliates = [];

function valueOrDash(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAirings(daily, weekly) {
  const parts = [];
  if (daily) parts.push(`${daily} daily`);
  if (weekly) parts.push(`${weekly} weekly`);
  return parts.length ? parts.join(" / ") : "—";
}

function renderResults() {
  if (!resultsEl || !countEl) return;

  const query = (searchInput?.value || "").trim().toLowerCase();
  const filter = filterSelect?.value || "all";

  const matches = affiliates
    .filter((affiliate) => filter === "all" || affiliate.distributionType === filter)
    .filter((affiliate) => !query || affiliate.searchText.includes(query));

  countEl.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} shown`;

  if (!matches.length) {
    resultsEl.innerHTML = `<div class="empty-results">No affiliate match found. Try searching by a nearby market, station, or network</div>`;
    return;
  }

  resultsEl.innerHTML = matches
    .map((affiliate) => {
      const market = affiliate.market || affiliate.dma || "Regional / national";
      const station = affiliate.station || affiliate.affiliation || affiliate.dma || "SportsWrap distribution";
      return `
        <article class="affiliate-card">
          <span class="market">${escapeHtml(market)}</span>
          <h2>${escapeHtml(station)}</h2>
          <dl>
            <div><dt>Network</dt><dd>${escapeHtml(valueOrDash(affiliate.affiliation))}</dd></div>
            <div><dt>Weekday</dt><dd>${escapeHtml(valueOrDash(affiliate.weekday))}</dd></div>
            <div><dt>Weekend</dt><dd>${escapeHtml(valueOrDash(affiliate.weekend))}</dd></div>
            <div><dt>Airings</dt><dd>${escapeHtml(formatAirings(affiliate.dailyAirings, affiliate.weeklyAirings))}</dd></div>
            <div><dt>DMA</dt><dd>${escapeHtml(valueOrDash(affiliate.dma))}</dd></div>
          </dl>
        </article>
      `;
    })
    .join("");
}

async function loadAffiliates() {
  if (!resultsEl || !countEl) return;

  try {
    const response = await fetch("data/affiliates.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Affiliate data unavailable");
    const data = await response.json();
    affiliates = data.affiliates || [];
    renderResults();
  } catch (error) {
    countEl.textContent = "Affiliate data unavailable";
    resultsEl.innerHTML = `<div class="empty-results">Affiliate search is temporarily unavailable. Please use the contact form for affiliate information</div>`;
  }
}

searchInput?.addEventListener("input", renderResults);
filterSelect?.addEventListener("change", renderResults);

loadAffiliates();
