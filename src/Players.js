import React from "react";

const Players = ({ players, ring, ready, lastTurn }) => {
  return (
    <div className="flex">
      {players.map((player) => (
        <div className="flex-1 items-center" key={`card-${player.id}`}>
          <div className="">
            <span
              className={
                player.ready
                  ? "text-6xl text-gray-500"
                  : "text-6xl text-black cursor-pointer"
              }
              onClick={() => ready(player.id)}
            >
              <i className="fa fa-play-circle"></i>
            </span>
            <span
              className={
                player.lose || lastTurn?.penalty
                  ? "text-6xl text-gray-500"
                  : "text-6xl text-black cursor-pointer"
              }
              onClick={() => ring(player)}
            >
              <i className="fa fa-bell"></i>
            </span>
          </div>

          <div>
            Player {player.id} (cards:{player.deck.length}) <br />
            {player.win ? "Winner!" : player.lose ? "Loser!" : ""}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Players;
