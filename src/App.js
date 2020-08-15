import React, { useState, useEffect } from "react";
import Game from "./Game";
import Bell from "./assets/bell.png";
import GameView from "./GameView";

const debug = process.env.NODE_ENV !== "production";
let game;

const App = () => {
  const [numOfPlayers, setNumOfPlayers] = useState(0);
  const [start, setStart] = useState(false);

  const startGame = () => {
    if (numOfPlayers > 0) {
      if (!game) {
        game = new Game(numOfPlayers);
        game.start();
      }
      setStart(true);
    } else alert("Please fill number of players.");
  };

  return (
    <div className="container mx-auto">
      {start && game ? (
        <GameView game={game} start={start} debug={debug} />
      ) : (
        <div className="flex items-center justify-center">
          <div>
            <img src={Bell} />
            <br />
            <h3 className="text-2xl">How many players?</h3>
            <br />
            <input
              className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block appearance-none leading-normal"
              type="number"
              onChange={(e) => setNumOfPlayers(Number(e.target.value))}
            />
            <br />
            <button className="btn btn-blue mr-8" onClick={() => startGame()}>
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
