import React, { useState, useEffect } from "react";
import "./GameView.css";
import Players from "./Players";
import Pile from "./Pile";

const GameView = ({ game, start, debug }) => {
  const [state, setState] = useState({
    players: game.players,
    turns: game.turns,
    start: start,
    end: false,
  });
  game.setter = setState;

  const readyPlayer = (id) => game.readyPlayer(id);

  let cards = [];
  const lastTurn = game.getLastTurn();
  if (state.start && !state.end && state.turns.length > 0) {
    cards = lastTurn.cards;
    cards = cards.map((card, i) =>
      card.classes.map((className) => <span className={className}></span>)
    );
  }
  const drawTurns = game.getLastDrawTurns();

  const ring = (player) => {
    if (!player.lose && state.turns.length > 0 && !lastTurn?.penalty)
      game.ring(player.id);
    if (game.getLastTurn().win) {
      alert(`Player ${player.id} Win!`);
    }
    if (game.getLastTurn().penalty) {
      alert(`Player ${player.id} has a penalty!`);
    }
  };

  useEffect(() => {
    game.nextTurn();
    if (debug) console.log({ state });
  }, [state]);

  return (
    <div className="container mx-auto">
      <div>
        <h2 className="text-2xl">
          {state.start && !state.end
            ? "Press the play button to make your self ready, when all player are ready the cards will be revealed, if you can count 5 green balls ring your bell. "
            : "The game is ended."}
        </h2>
      </div>

      <Players
        key="players"
        players={state.players}
        ring={ring}
        ready={readyPlayer}
        lastTurn={lastTurn}
      />

      <Pile key="Pile" cards={cards} inPile={drawTurns.length} />

      {debug && (
        <div key={"debug"}>
          <div>
            <button
              className="btn btn-blue mr-8"
              onClick={() => game.readyPlayer()}
            >
              All Ready
            </button>
            <button
              className="btn btn-blue mr-8"
              onClick={() => window.location.reload()}
            >
              End
            </button>
          </div>
          <div>
            <h3>Game Log:</h3>
            <div className="overflow-scroll log-h">
              <ul>
                {game.log.map((log, i) => (
                  <li key={log + i}>{log}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
