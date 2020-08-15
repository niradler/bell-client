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
  constructor(numOfPlayers, deckSize, debug) {
    this.debug = debug;
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

  start() {
    this.logger("start");
    this._start = true;
  }

  end() {
    this.logger("end");
    this._end = true;
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
    this.logger("readyPlayer");
    this.players = this.players.map((player) => ({
      ...player,
      ready: id && !player.ready ? player.id === id : true,
    }));
  }

  allNotReady() {
    this.logger("allNotReady");
    this.players = this.players.map((player) => ({ ...player, ready: false }));
  }

  isReady() {
    this.logger("isReady");
    return !this.players.some((player) => !player.ready && !player.lose);
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
    this.turns = newTurns;
    const newPlayers = this.players.map((player) => {
      player.deck = cards
        .filter((card) => card.playerId === player.id)
        .map((card) => card.value);
      player.deck = shuffle(player.deck);
      return player;
    });
    this.players = newPlayers;
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

    this.turns = [
      ...this.turns,
      {
        win: false,
        draw: true,
        cards: this.players.map((player) => ({
          playerId: player.id,
          value: player.deck.length > 0 ? player.deck[0] : 0,
        })),
      },
    ];

    this.players = this.players.map((player) => ({
      ...player,
      deck: player.deck.slice(1),
      ready: false,
    }));
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
          }
        } else if (!otherPlayersHasCards) {
          player.lose = true;
        }

        return player;
      });

      this.players = newPlayers;
      return true;
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
      return false;
    }
  }
}

module.exports = Game;
