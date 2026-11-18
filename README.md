# Bixray's Live Predictor

A responsive football and basketball prediction dashboard with clearly labeled simulated fixtures, scores, team ratings, predictions, and illustrative odds. It is a demo—not a live sports feed, bookmaker connection, or source of betting advice.

**Live website:** [bixray.github.io/live-game-predictor](https://bixray.github.io/live-game-predictor/)

## Run locally

The app is static and has no build step or package dependencies. From the repository root, start any static file server, for example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## What the demo does

- Switch between football and basketball slates; filter by match status, search by team or league, and sort by schedule or model confidence.
- Select a fixture to inspect its outcome probabilities and adjust the home-pitch/home-court assumption.
- Football predictions use a Poisson model for remaining goals. Basketball predictions use a pace-adjusted score projection and logistic win probability.
- The fixture catalog, ratings, scores, start times, and decimal odds are fixed illustrative data in `src/demoFixtures.js`. They are not updated from a provider.

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes this static app on pushes to `main` or `bixray-live-game-predictor`, and supports manual runs. GitHub Pages is enabled for Actions deployment, and the repository homepage points to the live website. After a successful deployment, the site is served at [https://bixray.github.io/live-game-predictor/](https://bixray.github.io/live-game-predictor/).

## Replacing the demo data

`src/demoFixtures.js` is the current data boundary. Replace its local fixture array with a provider adapter that supplies normalized fixture snapshots and team ratings, while keeping credentials in a trusted server-side integration rather than browser code. Update the notice and labels before presenting provider data as live; odds require an authorized provider and must remain identified by source and timestamp. The shipped app intentionally makes no claim of provider connectivity.
