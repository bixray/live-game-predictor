const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function poisson(lambda, goals) {
  let probability = Math.exp(-lambda);
  for (let count = 1; count <= goals; count += 1) probability *= lambda / count;
  return probability;
}

function footballPrediction(fixture, homeAdvantage) {
  const { stats, minute, homeScore, awayScore } = fixture;
  const remaining = minute === null ? 1 : clamp((90 - minute) / 90, 0, 1);
  const homeGoalsLeft = 1.34 * stats.homeAttack * stats.awayDefense
    * (1 + stats.homeForm * 0.025) * (1 + homeAdvantage * 0.012) * remaining;
  const awayGoalsLeft = 1.26 * stats.awayAttack * stats.homeDefense
    * (1 + stats.awayForm * 0.025) * (1 - homeAdvantage * 0.006) * remaining;
  let home = 0;
  let draw = 0;
  let away = 0;

  for (let homeRemaining = 0; homeRemaining <= 8; homeRemaining += 1) {
    for (let awayRemaining = 0; awayRemaining <= 8; awayRemaining += 1) {
      const probability = poisson(homeGoalsLeft, homeRemaining) * poisson(awayGoalsLeft, awayRemaining);
      const finalHome = homeScore + homeRemaining;
      const finalAway = awayScore + awayRemaining;
      if (finalHome > finalAway) home += probability;
      else if (finalHome === finalAway) draw += probability;
      else away += probability;
    }
  }
  return [
    { key: "home", label: fixture.home, probability: home },
    { key: "draw", label: "Draw", probability: draw },
    { key: "away", label: fixture.away, probability: away },
  ];
}

function basketballPrediction(fixture, homeAdvantage) {
  const { stats, minute, homeScore, awayScore } = fixture;
  const elapsed = minute === null ? 0 : clamp(minute, 0, 48);
  const remaining = 48 - elapsed;
  const homeRate = 2.28 * stats.homeAttack * (1 / stats.awayDefense);
  const awayRate = 2.25 * stats.awayAttack * (1 / stats.homeDefense);
  const projectedMargin = homeScore - awayScore
    + (homeRate - awayRate) * remaining
    + homeAdvantage * 0.72;
  const homeProbability = 1 / (1 + Math.exp(-projectedMargin / 10.5));
  return [
    { key: "home", label: fixture.home, probability: homeProbability },
    { key: "away", label: fixture.away, probability: 1 - homeProbability },
  ];
}

export function predictFixture(fixture, homeAdvantage = 3) {
  const outcomes = fixture.sport === "football"
    ? footballPrediction(fixture, homeAdvantage)
    : basketballPrediction(fixture, homeAdvantage);
  const total = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
  const normalized = outcomes.map((outcome) => ({
    ...outcome,
    probability: outcome.probability / total,
  }));
  return {
    outcomes: normalized,
    favorite: normalized.reduce((best, outcome) => (
      outcome.probability > best.probability ? outcome : best
    )),
  };
}
