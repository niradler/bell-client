import React, { useState, useEffect } from "react";

const winState = 5;

const App = () => {
  const [game, setGame] = useState({
    start: false,
  });
  const [turns, setTurns] = useState([]);
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "A",
      deck: [3, 4, 3, 2, 5, 2, 3, 1],
      ready: true,
      lose: false,
      win: false,
    },
    {
      id: 2,
      name: "B",
      deck: [1, 2, 2, 3, 1, 4, 3, 4],
      ready: true,
      lose: false,
      win: false,
    },
  ]);
  const isReady = () => !players.some((player) => !player.ready);
  const makeReady = () =>
    setPlayers(players.map((player) => ({ ...player, ready: true })));
  const makeNotReady = () =>
    setPlayers(players.map((player) => ({ ...player, ready: false })));
  const startGame = () => {
    if (isReady()) {
      setGame({ ...game, start: true });
      console.log("game started", game);
    }
  };

  const stopGame = () => {
    setGame({ ...game, start: false });
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
          if (player.deck.length > 0) player.win = true;
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
    for (let i = newTurns.length - 1; i >= 0; i--) {
      const turn = newTurns[i];
      if (
        turn.win === true ||
        (turn.shuffle === true && i != newTurns.length - 1)
      ) {
        lastWin = i;
        break;
      }
    }

    const cards = newTurns
      .slice(lastWin)
      .map((turn) => turn.cards)
      .flat(1);
    console.log({ cards, lastWin, newTurns });
    debugger;
    newTurns[newTurns.length - 1].draw = true;
    newTurns[newTurns.length - 1].shuffle = true;
    setTurns(newTurns);
    const newPlayers = players.map((player) => {
      player.deck = cards
        .filter((card) => card.playerId === player.id)
        .map((card) => card.value);
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
      console.log("win");
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
      console.log("penalty");
    }
  };

  useEffect(() => {
    if (isReady() && game.start) nextTurn();
    console.log(game, turns, players);
  }, [game, turns, players]);

  return (
    <div>
      <div>
        <button onClick={() => makeReady()}>Ready</button>
        <button onClick={() => startGame()}>Start</button>
        <button onClick={() => stopGame()}>Stop</button>
        <button onClick={() => ring()}>Ring</button>
      </div>
      <div>
        <h3>state</h3>
        <ul>
          {players.map((player) => (
            <li>
              id:{player.id},cards:{JSON.stringify(player.deck)},win:
              {player.win && "You just win"},lose:
              {player.lose && "You just lose"}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Current Turn</h3>
        <ul>
          {turns.length > 0 &&
            turns[turns.length - 1].cards.map((card) => (
              <li key={card.playerId}>{card.value}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
