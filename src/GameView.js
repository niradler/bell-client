import React, { useState, useEffect } from "react";
import "./GameView.css";

const GameView = ({ game, start, debug }) => {
  const [state, setState] = useState({
    players: game.players,
    turns: game.turns,
    start: start,
    end: false,
  });
  game.setter = setState;

  useEffect(() => {
    game.nextTurn();
    console.log({ state });
  }, [state]);

  let cards = [];
  const lastTurn = state.turns[state.turns.length - 1];
  if (state.start && !state.end && state.turns.length > 0) {
    cards = lastTurn.cards;
    cards = cards.map((card, i) =>
      card.classes.map((className) => <span className={className}></span>)
    );
  }
  const drawTurns = game.getLastDrawTurns();

  return (
    <div className="container mx-auto">
      <div>
        <h2 className="text-2xl">
          {state.start && !state.end
            ? "Press the play button to make your self ready, when all player are ready the cards will be revealed, if you can count 5 green balls ring your bell. "
            : "The game is ended."}
        </h2>
      </div>

      <div className="flex">
        {state.players.map((player) => (
          <div className="flex-1 text-center items-center">
            <span
              className={
                player.ready
                  ? "text-6xl text-gray-500"
                  : "text-6xl text-black cursor-pointer"
              }
              onClick={() => game.readyPlayer(player.id)}
            >
              <i class="fa fa-play-circle"></i>
            </span>
            <span
              className={
                player.lose || lastTurn?.penalty
                  ? "text-6xl text-gray-500"
                  : "text-6xl text-black cursor-pointer"
              }
              onClick={() => {
                if (
                  !player.lose &&
                  state.turns.length > 0 &&
                  !lastTurn?.penalty
                )
                  game.ring(player.id);
              }}
            >
              <i className="fa fa-bell"></i>
            </span>

            <div>
              Player {player.id} (cards:{player.deck.length}) <br />
              {player.win ? "Winner!" : player.lose ? "Loser!" : ""}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3>Pile ({drawTurns.length})</h3>
        <div className="flex">
          {cards.length > 0 &&
            cards.map((card) => (
              <div className="flex-1 text-center items-center">
                <div className="border border-gray-600 w-1/2">
                  {card.slice(0, 2)}
                  <br />
                  {card[2]}
                  <br />
                  {card.slice(3)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {debug && (
        <div>
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
                {game.log.map((log) => (
                  <li>{log}</li>
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
