import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
};

const GameView = ({ game }) => {
  const [state, setState] = useState({
    players: [],
    turns: [],
    start: false,
    end: false,
  });
  game.setter = setState;

  useEffect(() => {
    game.nextTurn();
  }, [state]);

  let cards = [];
  if (state.start && !state.end && state.turns.length > 0) {
    cards = state.turns[state.turns.length - 1].cards.map((card) =>
      shuffle(
        Array(5)
          .fill()
          .map((value, index) => index < card.value)
          .map((green, index) => (
            <span
              className={green ? "circle bg-green-600" : "circle bg-red-600"}
            ></span>
          ))
      )
    );
  }
  const drawTurns = game.getLastDrawTurns();
  return (
    <div className="container mx-auto">
      <h2>
        {state.start && !state.end ? "game running." : "game not running."}
      </h2>
      <div>
        <button
          className="btn btn-blue mr-8"
          onClick={() => game.readyPlayer()}
        >
          Ready
        </button>
        <button className="btn btn-blue mr-8" onClick={() => game.start()}>
          Start
        </button>
        <button className="btn btn-blue mr-8" onClick={() => game.end()}>
          End
        </button>
      </div>
      <div className="flex">
        {state.players.map((player) => (
          <div className="flex-1 text-center items-center">
            <span
              className="circle bg-red-600 leading-p4"
              onClick={() => game.readyPlayer(player.id)}
            >
              {player.ready ? "Ready" : "Not Ready"}
            </span>
            <span
              className="circle bg-green-600 leading-p4"
              onClick={() => game.ring(player.id)}
            >
              Ring
            </span>
            <div>
              Player {player.id} (cards:{player.deck.length}) <br />
              {player.win ? "Winner!" : player.lose ? "Loser!" : ""}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3>Board ({drawTurns.length})</h3>
        <div className="flex">
          {cards.map((card) => (
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
  );
};

const App = () => {
  const game = new Game(2);

  return <GameView game={game} />;
};

export default App;
