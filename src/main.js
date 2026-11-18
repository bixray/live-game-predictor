import { demoFixtures } from "./demoFixtures.js";
import { predictFixture } from "./predictor.js";

const state = {
  sport: "football",
  status: "all",
  query: "",
  sort: "schedule",
  selectedId: "football-city-arsenal",
  homeAdvantage: 3,
};

const fixtureList = document.querySelector("#fixture-list");
const analysisContent = document.querySelector("#analysis-content");
const searchInput = document.querySelector("#match-search");
const sortSelect = document.querySelector("#sort-select");
const emptyState = document.querySelector("#empty-state");

document.querySelector("#desk-date").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short", month: "short", day: "numeric",
}).format(new Date());

const initials = (team) => team.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const percent = (number) => `${Math.round(number * 100)}%`;
const modelCopy = {
  football: "A Poisson goal model estimates the remaining scoreline from synthetic attack, defence, and form ratings.",
  basketball: "A pace-adjusted score projection compares synthetic attack and defence ratings with the current demo score.",
};

function visibleFixtures() {
  const query = state.query.trim().toLocaleLowerCase();
  return demoFixtures
    .filter((fixture) => fixture.sport === state.sport)
    .filter((fixture) => state.status === "all" || fixture.status === state.status)
    .filter((fixture) => !query || `${fixture.home} ${fixture.away} ${fixture.league}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => {
      if (state.sort === "confidence") {
        return predictFixture(b, state.homeAdvantage).favorite.probability
          - predictFixture(a, state.homeAdvantage).favorite.probability;
      }
      return a.start - b.start;
    });
}

function renderFixture(fixture) {
  const prediction = predictFixture(fixture, state.homeAdvantage);
  const isUpcoming = fixture.status === "upcoming";
  const statusText = isUpcoming ? "DEMO · UPCOMING" : "DEMO · IN PROGRESS";
  const clockText = isUpcoming
    ? `Illustrative start ${String(fixture.start).padStart(2, "0")}:00`
    : fixture.sport === "football" ? `Simulated ${fixture.minute}′` : `Simulated Q${Math.floor(fixture.minute / 12) + 1} · ${fixture.minute % 12 || 12}:00`;
  const scoreText = isUpcoming ? "—" : `${fixture.homeScore} – ${fixture.awayScore}`;
  const scoreCaption = isUpcoming ? "No score yet · demo" : "Simulated score";
  const row = document.createElement("button");
  row.type = "button";
  row.className = `fixture-row${fixture.id === state.selectedId ? " is-selected" : ""}`;
  row.setAttribute("aria-pressed", String(fixture.id === state.selectedId));
  row.setAttribute("aria-label", `${fixture.home} versus ${fixture.away}, ${statusText.toLowerCase()}, model leans ${prediction.favorite.label} at ${percent(prediction.favorite.probability)}`);
  row.innerHTML = `
    <span class="fixture-teams">
      <span class="fixture-meta"><span class="status-tag ${isUpcoming ? "status-upcoming" : ""}"><span class="demo-indicator-dot" aria-hidden="true"></span>${statusText}</span><span aria-hidden="true">·</span><span class="competition-name">${fixture.league}</span></span>
      <span class="team-pair">
        <span class="team-name"><span class="team-mark" aria-hidden="true">${initials(fixture.home)}</span>${fixture.home}</span>
        <span class="team-name"><span class="team-mark" aria-hidden="true">${initials(fixture.away)}</span>${fixture.away}</span>
      </span>
    </span>
    <span class="fixture-score-wrap">
      <span class="fixture-score"><span class="score-value">${scoreText === "—" ? "—" : fixture.homeScore}</span><span class="score-separator">${scoreText === "—" ? "" : "–"}</span><span class="score-value">${scoreText === "—" ? "" : fixture.awayScore}</span></span>
      <span class="score-caption">${isUpcoming ? clockText : scoreCaption}</span>
    </span>
    <span class="lean-cell"><span class="lean-name">${prediction.favorite.label === "Draw" ? "Draw" : `${prediction.favorite.label} lean`}</span><span class="lean-confidence">${percent(prediction.favorite.probability)} model</span></span>
  `;
  row.addEventListener("click", () => {
    state.selectedId = fixture.id;
    render();
  });
  return row;
}

function renderAnalysis(fixture) {
  if (!fixture) {
    analysisContent.innerHTML = `<p class="model-note">Choose a fixture to inspect its simulated inputs and model readout.</p>`;
    return;
  }
  const prediction = predictFixture(fixture, state.homeAdvantage);
  const isBasketball = fixture.sport === "basketball";
  const score = fixture.status === "in-progress"
    ? `<div class="analysis-score"><span>${fixture.homeScore}</span><span class="score-separator">–</span><span>${fixture.awayScore}</span><span class="score-caption">simulated score</span></div>`
    : `<div class="analysis-score"><span>Pre-game</span><span class="score-separator">·</span><span>demo</span></div>`;
  const outcomes = prediction.outcomes.map((outcome) => `
    <div class="probability-item"><span><span class="legend-swatch" aria-hidden="true"></span>${outcome.label}</span><strong>${percent(outcome.probability)}</strong></div>
  `).join("");
  const bar = prediction.outcomes.map((outcome) => `<span style="width:${outcome.probability * 100}%" title="${outcome.label}: ${percent(outcome.probability)}"></span>`).join("");
  const odds = Object.entries(fixture.odds).map(([key, value]) => {
    const label = key === "home" ? fixture.home : key === "away" ? fixture.away : "Draw";
    return `<div class="market-value"><span>${label}</span>${value}</div>`;
  }).join("");
  const timeContext = fixture.status === "upcoming"
    ? "pre-game team ratings"
    : isBasketball
      ? `simulated score after ${fixture.minute} of 48 minutes`
      : `simulated score after ${fixture.minute} of 90 minutes`;
  analysisContent.innerHTML = `
    <p class="analysis-game-meta">${fixture.league} <span aria-hidden="true">·</span> ${isBasketball ? "BASKETBALL" : "FOOTBALL"} <span aria-hidden="true">·</span> SIMULATED</p>
    <h2 class="analysis-title" id="analysis-title">${fixture.home}<br>vs ${fixture.away}</h2>
    ${score}
    <div class="probability-heading"><span>Outcome probability</span><span>DEMO MODEL</span></div>
    <div class="probability-bar" role="img" aria-label="${prediction.outcomes.map((o) => `${o.label} ${percent(o.probability)}`).join(", ")}">${bar}</div>
    <div class="probability-legend">${outcomes}</div>
    <p class="model-note"><strong>${prediction.favorite.label} lean · ${percent(prediction.favorite.probability)}</strong><br>${modelCopy[fixture.sport]} Uses ${timeContext}; it is an illustration, not a verified forecast.</p>
    <div class="home-advantage">
      <label class="control-label" for="home-advantage"><span>Home-court / home-pitch factor</span><output id="advantage-output" for="home-advantage">${state.homeAdvantage}</output></label>
      <input id="home-advantage" type="range" min="0" max="6" step="1" value="${state.homeAdvantage}" aria-label="Adjust the illustrative home advantage">
      <div class="range-ends"><span>Neutral</span><span>Strong</span></div>
    </div>
    <div class="market-block">
      <div class="market-heading"><span>ILLUSTRATIVE ODDS</span><span>DEMO ONLY</span></div>
      <div class="market-values">${odds}</div>
      <p class="analysis-disclaimer">Synthetic reference values, not from a bookmaker. For demonstration only; not betting advice.</p>
    </div>
  `;
  document.querySelector("#home-advantage").addEventListener("input", (event) => {
    state.homeAdvantage = Number(event.currentTarget.value);
    render();
    const slider = document.querySelector("#home-advantage");
    slider.focus();
  });
}

function render() {
  const fixtures = visibleFixtures();
  const selected = fixtures.find((fixture) => fixture.id === state.selectedId)
    ?? fixtures[0]
    ?? null;
  if (selected) state.selectedId = selected.id;
  fixtureList.replaceChildren(...fixtures.map(renderFixture));
  fixtureList.hidden = fixtures.length === 0;
  emptyState.hidden = fixtures.length > 0;
  document.querySelector("#fixture-total").textContent = `${fixtures.length} demo ${fixtures.length === 1 ? "match" : "matches"}`;
  document.querySelector("#fixtures-title").textContent = state.sport === "football" ? "Football slate" : "Basketball slate";
  renderAnalysis(selected);
}

document.querySelectorAll("[data-sport]").forEach((button) => {
  button.addEventListener("click", () => {
    state.sport = button.dataset.sport;
    state.status = "all";
    state.selectedId = demoFixtures.find((fixture) => fixture.sport === state.sport).id;
    document.querySelectorAll("[data-sport]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-status]").forEach((item) => {
      const active = item.dataset.status === "all";
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

document.querySelectorAll("[data-status]").forEach((button) => {
  button.addEventListener("click", () => {
    state.status = button.dataset.status;
    document.querySelectorAll("[data-status]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  render();
});
sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  render();
});

document.querySelector("#football-count").textContent = demoFixtures.filter((fixture) => fixture.sport === "football").length;
document.querySelector("#basketball-count").textContent = demoFixtures.filter((fixture) => fixture.sport === "basketball").length;
render();
