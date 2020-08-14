import React, { useState, useEffect } from "react";

const winState = 5;

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
};

const App = () => {
  const [game, setGame] = useState({
    start: false,
    end: false,
  });
  const [turns, setTurns] = useState([]);
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "A",
      deck: [3, 4, 3, 2, 5, 2, 3, 1],
      ready: false,
      lose: false,
      win: false,
    },
    {
      id: 2,
      name: "B",
      deck: [1, 2, 2, 3, 1, 4, 3, 4],
      ready: false,
      lose: false,
      win: false,
    },
  ]);
  const isReady = () =>
    !players.some((player) => !player.ready && !player.lose);

  const makeReady = (id) =>
    setPlayers(
      players.map((player) => ({
        ...player,
        ready: id && !player.ready ? player.id === id : true,
      }))
    );

  const makeNotReady = () =>
    setPlayers(players.map((player) => ({ ...player, ready: false })));

  const startGame = () => {
    setGame({ ...game, start: true });
    console.log("game started", game);
  };

  const stopGame = () => {
    setGame({ ...game, end: true });
    makeNotReady();
    console.log("game stopped", game);
  };

  const nextTurn = () => {
    setTurns([
      ...turns,
      {
        win: false,
        draw: true,
        cards: players.map((player) => ({
          playerId: player.id,
          value: player.deck.length > 0 ? player.deck[0] : 0,
        })),
      },
    ]);

    setPlayers(
      players.map((player) => ({
        ...player,
        lose: player.deck.length < 2 ? true : false,
        deck: player.deck.slice(1),
        ready: false,
      }))
    );

    const activePlayers = players.filter((player) => player.deck.length > 0)
      .length;
    console.log({ activePlayers, players });
    if (activePlayers === 0) {
      returnDeckAndShuffle();
    } else if (activePlayers === 1) {
      setPlayers(
        players.map((player) => {
          if (player.deck.length > 0) {
            player.win = true;
            stopGame();
          }
          return player;
        })
      );
    } else {
      const newPlayers = [...players];
      let hasLosers = false;
      newPlayers.map((player) => {
        if (player.deck.length === 0) {
          hasLosers = true;
          player.lose = true;
        }
        return player;
      });
      if (hasLosers) {
        const allLosers =
          newPlayers.filter((player) => player.lose).length ===
          newPlayers.length;
        if (!allLosers) setPlayers(newPlayers);
      }
    }
  };

  const returnDeckAndShuffle = () => {
    let lastWin = turns.length - 1;
    const newTurns = [...turns];
    let draw = !newTurns.find((turn) => turn.win || turn.shuffle);
    if (draw) {
      lastWin = 0;
    } else {
      for (let i = newTurns.length - 1; i >= 0; i--) {
        const turn = newTurns[i];
        if (
          turn.win === true ||
          (turn.shuffle === true && i !== newTurns.length - 1)
        ) {
          lastWin = i;
          break;
        }
      }
    }

    const cards = newTurns
      .slice(lastWin)
      .map((turn) => turn.cards)
      .flat(1);

    newTurns[newTurns.length - 1].draw = true;
    newTurns[newTurns.length - 1].shuffle = true;
    setTurns(newTurns);
    const newPlayers = players.map((player) => {
      player.deck = cards
        .filter((card) => card.playerId === player.id)
        .map((card) => card.value);
      player.deck = shuffle(player.deck);
      return player;
    });

    setPlayers(newPlayers);
  };

  const ring = (playerId = 1) => {
    const newTurns = [...turns];
    const isWin =
      turns[turns.length - 1].cards.reduce(
        (sum, card) => (sum = sum + card.value),
        0
      ) === winState;
    if (isWin) {
      if (newTurns[newTurns.length - 1].win !== false) return;
      newTurns[newTurns.length - 1].win = playerId;
      newTurns[newTurns.length - 1].draw = false;
      setTurns(newTurns);

      const newPlayers = [...players];
      newPlayers.map((player) => {
        if (player.id === playerId) {
          player.deck = [
            ...player.deck,
            ...newTurns[newTurns.length - 1].cards.map((card) => card.value),
          ];
        }

        return player;
      });
      setPlayers(newPlayers);
      alert(`Player ${playerId} Win!`);
    } else {
      const player = players.find((player) => player.id === playerId);

      const cardsSize = players.length - 2 < 1 ? 1 : players.length - 2;
      let cards = player.deck.slice(0, cardsSize);
      const newDeck = player.deck.slice(cardsSize);
      const newPlayers = players.map((player) => {
        if (player.id === playerId) {
          player.deck = newDeck;
        } else if (cards.length > 0) {
          player.deck = [...player.deck, cards[0]];
          cards = cards.slice(1);
        }
        return player;
      });
      setPlayers(newPlayers);
      newTurns[newTurns.length - 1].draw = true;
      setTurns(newTurns);
      alert("penalty");
    }
  };

  useEffect(() => {
    if (isReady() && game.start && !game.end) nextTurn();
    console.log(game, turns, players);
  }, [game, turns, players]);

  const cards =
    turns.length > 0 &&
    turns[turns.length - 1].cards.map((card) => (
      <div className="flex-1 text-center items-center">
        <div className="flex mb-2">
          {shuffle(
            Array(5)
              .fill()
              .map((value, index) => index < card.value)
              .map((green, index) => (
                <div className="w-1/2">
                  <span
                    className={green ? "circle-green" : "circle-red"}
                  ></span>
                </div>
              ))
          )}
        </div>
      </div>
    ));

  return (
    <div className="container mx-auto">
      <div>
        <button className="btn btn-blue mr-8" onClick={() => makeReady()}>
          Ready
        </button>
        <button className="btn btn-blue mr-8" onClick={() => startGame()}>
          Start
        </button>
        <button className="btn btn-blue mr-8" onClick={() => stopGame()}>
          Stop
        </button>
        <button className="btn btn-blue" onClick={() => ring()}>
          Ring
        </button>
      </div>
      <div className="flex">
        {players.map((player) => (
          <div className="flex-1 text-center items-center">
            <span
              className="circle-red leading-p4"
              onClick={() => makeReady(player.id)}
            >
              {player.ready ? "Ready" : "Not Ready"}
            </span>
            <span
              className="circle-green leading-p4"
              onClick={() => ring(player.id)}
            >
              Ring
            </span>
            <div>Player {player.id}</div>
          </div>
        ))}
      </div>
      <div>
        <h3>state</h3>
        <ul>
          <li>
            {game.start && !game.end ? "game running." : "game not running."}
          </li>
          {players.map((player) => (
            <li>
              id:{player.id}, ready:{player.ready ? "true" : "false"}, cards:
              {JSON.stringify(player.deck)}, win:
              {player.win ? "yes" : "no"}, lose:
              {player.lose ? "yes" : "no"}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Current Turn</h3>
        <div className="flex">
          {cards[0]}
          <br />
          {cards[1]}
        </div>
      </div>
    </div>
  );
};

export default App;
