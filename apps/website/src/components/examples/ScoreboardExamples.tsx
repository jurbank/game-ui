import { Button, Panel, Scoreboard, type ScoreboardRow } from "@game-ui/react";
import { useState } from "react";

interface MatchPlayer {
  id: string;
  name: string;
  score: number;
  kills: number;
  deaths: number;
  alive: boolean;
}

const match: MatchPlayer[] = [
  { id: "p1", name: "Nova", score: 1240, kills: 12, deaths: 4, alive: true },
  { id: "p2", name: "Rook", score: 980, kills: 9, deaths: 7, alive: false },
  { id: "p3", name: "Wisp", score: 1510, kills: 15, deaths: 3, alive: true },
  { id: "p4", name: "Kite", score: 1240, kills: 11, deaths: 5, alive: false },
];

/**
 * Match results. Ranking, tie handling, and who won are decided here, in the
 * example's own game code, and passed to Scoreboard as finished rows.
 */
export function MatchResults() {
  const [finished, setFinished] = useState(true);

  const ranked = [...match].sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const rows: ScoreboardRow[] = ranked.map((player, index) => {
    const tied = ranked.filter((other) => other.score === player.score).length > 1;
    const place = ranked.findIndex((other) => other.score === player.score) + 1;
    return {
      id: player.id,
      name: player.name,
      rank: tied ? `${place}=` : String(index + 1),
      score: player.score.toLocaleString("en-US"),
      values: { kills: player.kills, deaths: player.deaths },
      self: player.id === "p1",
      highlight: player.score === topScore,
      status: player.alive ? "Alive" : "Eliminated",
      statusTone: player.alive ? "success" : "danger",
    };
  });

  return (
    <Panel title="Round 3" headingLevel={3} variant="raised">
      <Scoreboard
        caption="Final scores, ranked by the game"
        columns={[
          { id: "kills", header: "K" },
          { id: "deaths", header: "D" },
        ]}
        rows={finished ? rows : []}
        empty="The round has not started."
      />
      <div className="example-row example-stack-top">
        <Button variant="secondary" onClick={() => setFinished((value) => !value)}>
          {finished ? "Show pre-match state" : "Show results"}
        </Button>
      </div>
    </Panel>
  );
}

export function TeamScoreboards() {
  const red: ScoreboardRow[] = [
    { id: "r1", name: "Nova", score: 1240, self: true },
    { id: "r2", name: "Rook", score: 980 },
  ];
  const blue: ScoreboardRow[] = [
    { id: "b1", name: "Wisp", score: 1510 },
    { id: "b2", name: "Kite", score: 1240 },
  ];

  return (
    <div className="example-side-by-side">
      <Panel title="Red — 2,220" headingLevel={3} variant="inset">
        <Scoreboard caption="Red team" hideCaption nameHeader="Player" rows={red} size="sm" />
      </Panel>
      <Panel title="Blue — 2,750" headingLevel={3} variant="inset">
        <Scoreboard caption="Blue team" hideCaption nameHeader="Player" rows={blue} size="sm" />
      </Panel>
    </div>
  );
}
