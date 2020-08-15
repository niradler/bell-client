const defaultOptions = {
  deckSize: 20,
  deckOptions: [0, 1, 2, 3, 4, 5],
  demoDeck: [0, 5, 5, 0],
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
};

class Game {
  constructor(numOfPlayers, deckSize, { debug, setter } = {}) {
    this.debug = debug;
    this.setter = setter;
    this.deckOptions = defaultOptions.deckOptions;
    this.log = [];
    this.turns = [];
    this.logger = (log) => this.log.push(log);
    this.logger("constructor");
    this._start = false;
    this._end = false;
    this.numOfPlayers = numOfPlayers;
    this.deckSize = deckSize || defaultOptions.deckSize;
    this.deck = this.debug
      ? defaultOptions.demoDeck
      : this.genDeck(this.deckSize);
    this.playerDeckSize = Math.floor(this.deckSize / this.numOfPlayers);
    this.players = Array(numOfPlayers)
      .fill(0)
      .map((v, i) => this.createPlayer(i + 1));
  }

  genDeck(deckSize) {
    this.logger("genDeck");
    return shuffle(
      Array(deckSize)
        .fill(0)
        .map(
          () =>
            this.deckOptions[
              Math.round(Math.random() * this.deckOptions.length - 1)
            ]
        )
    );
  }

  sync() {
    const state = {
      start: this._start,
      end: this._end,
      players: this.players,
      turns: this.turns,
    };

    if (this.debug) {
      console.log("state", state);
      console.log("game log:", this.log);
    }

    if (this.setter) this.setter(state);
  }

  start() {
    this.logger("start");
    this._start = true;
    this.sync();
  }

  end() {
    this.logger("end");
    this._end = true;
    this.sync();
  }

  createPlayer(id) {
    this.logger("createPlayer");
    return {
      id,
      deck: this.deck.slice(
        this.playerDeckSize * (id - 1),
        this.playerDeckSize * id
      ),
      ready: false,
      lose: false,
      win: false,
    };
  }

  readyPlayer(id) {
    this.logger("readyPlayer:" + id);
    this.players = this.players.map((player) => ({
      ...player,
      ready: id && !player.ready ? player.id === id : true,
    }));
    this.sync();
  }

  allNotReady() {
    this.logger("allNotReady");
    this.players = this.players.map((player) => ({ ...player, ready: false }));
    this.sync();
  }

  isReady() {
    const ready = !this.players.some((player) => !player.ready && !player.lose);
    this.logger("isReady:" + ready);
    return ready;
  }

  returnDeckAndShuffle() {
    this.logger("returnDeckAndShuffle");
    let lastWin = this.turns.length - 1;
    const newTurns = [...this.turns];
    let draw = !newTurns.find((turn) => turn.win || turn.shuffle);
    if (draw) {
      lastWin = 0;
    } else {
      for (let i = newTurns.length - 1; i >= 0; i--) {
        const turn = newTurns[i];
        if (turn.win === true) {
          lastWin = i;
          break;
        }
        if (turn.shuffle === true && i < newTurns.length - 1) {
          lastWin = i + 1;
          break;
        }
      }
    }
    const cards = newTurns
      .slice(lastWin)
      .map((turn) => turn.cards)
      .flat(1);
    console.log({ cards, lastWin });
    newTurns[newTurns.length - 1].draw = true;
    newTurns[newTurns.length - 1].shuffle = true;
    this.turns = newTurns;
    const newPlayers = this.players.map((player) => {
      const cardsToAdd = cards
        .filter((card) => card.playerId === player.id)
        .map((card) => card.value);
      player.deck = [...player.deck, ...cardsToAdd];
      player.deck = shuffle(player.deck);
      return player;
    });
    this.players = newPlayers;
    this.sync();
  }

  getLastDrawTurns() {
    this.logger("getLastDrawTurns");
    let drawTurns = this.turns.reduce((drawTurns, turn, i) => {
      if (turn.win || (turn.shuffle && i < this.turns.length - 1))
        drawTurns = [];
      else if (turn.draw) drawTurns = [...drawTurns, turn];

      return drawTurns;
    }, []);

    return drawTurns;
  }

  nextTurn() {
    if (!this.isReady() || !this._start || this._end) return;

    this.logger("nextTurn");
    if (this.turns.length > 0) {
      const lastTurnWin = this.turns[this.turns.length - 1].win;
      if (
        this.getLastDrawTurns().length > 0 &&
        !lastTurnWin &&
        this.players.find((player) => player.deck.length === 0 && !player.lose)
      ) {
        this.returnDeckAndShuffle();
      }
    }

    const cards = this.players.map((player) => ({
      playerId: player.id,
      value: player.deck.length > 0 ? player.deck[0] : 0,
      classes: shuffle(
        Array(5)
          .fill()
          .map((value, index) => index < (player.deck[0] ? player.deck[0] : 0))
          .map((green, index) =>
            green ? "circle bg-green-600" : "circle bg-red-600"
          )
      ),
    }));

    this.turns = [
      ...this.turns,
      {
        win: false,
        draw: true,
        cards,
      },
    ];

    this.players = this.players.map((player) => ({
      ...player,
      deck: player.deck.slice(1),
      ready: false,
    }));
    this.sync();
  }

  ring(playerId) {
    this.logger("ring");
    const newTurns = [...this.turns];
    const newPlayers = [...this.players];
    const isWin =
      newTurns[newTurns.length - 1].cards.reduce(
        (sum, card) => (sum = sum + card.value),
        0
      ) === 5;
    if (isWin) {
      if (newTurns[newTurns.length - 1].win !== false) return;
      newTurns[newTurns.length - 1].win = playerId;
      newTurns[newTurns.length - 1].draw = false;
      this.logger(`player ${playerId} win this turn.`);
      this.turns = newTurns;

      const otherPlayersHasCards = newPlayers.some(
        (player) => player.deck.length > 0 && player.id !== playerId
      );
      if (!otherPlayersHasCards) this.end();

      newPlayers.map((player) => {
        if (player.id === playerId) {
          player.deck = [
            ...player.deck,
            ...newTurns[newTurns.length - 1].cards.map((card) => card.value),
          ];
          if (!otherPlayersHasCards) {
            player.win = true;
            this.logger(`player ${player.id} win.`);
          }
        } else if (!otherPlayersHasCards) {
          player.lose = true;
          this.logger(`player ${player.id} lose.`);
        }

        return player;
      });

      this.players = newPlayers;
    } else {
      const player = newPlayers.find((player) => player.id === playerId);

      const cardsSize = newPlayers.length - 2 < 1 ? 1 : newPlayers.length - 2;
      let cards = player.deck.slice(0, cardsSize);
      const newDeck = player.deck.slice(cardsSize);
      this.players = newPlayers.map((player) => {
        if (player.id === playerId) {
          player.deck = newDeck;
        } else if (cards.length > 0) {
          player.deck = [...player.deck, cards[0]];
          cards = cards.slice(1);
        }
        return player;
      });

      this.turns[this.turns.length - 1].draw = true;
      this.turns[this.turns.length - 1].penalty = true;
      this.logger(`this turn is a draw.`);
    }

    this.sync();
  }
}

export default Game;
