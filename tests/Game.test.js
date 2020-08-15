const Game = require("../src/Game");
const numOfPlayers = 2;
const deckSize = 4;
const game = new Game(numOfPlayers, deckSize, { debug: true });
describe("Game Test", () => {
  beforeAll(() => {
    game.start();
    game.readyPlayer();
  });
  test("start game", () => {
    expect(game._start).toEqual(true);
  });

  test("setup", () => {
    expect(game.deckSize).toEqual(deckSize);
    expect(game.deck.length).toEqual(deckSize);
    expect(game.turns.length).toEqual(0);
    expect(game.players.length).toEqual(numOfPlayers);
    const totalCards = game.players.reduce(
      (sum, player) => (sum = sum + player.deck.length),
      0
    );
    expect(totalCards).toEqual(game.deckSize);
  });

  test("turn", () => {
    game.nextTurn();
    expect(game.turns.length).toEqual(1);
  });

  test("cards shuffle", () => {
    game.nextTurn();
    game.readyPlayer();
    game.nextTurn();
    game.readyPlayer();
    game.nextTurn();
    console.log("shuffle", game.players);
  });

  test("game win", () => {
    game.nextTurn();
    const getCards = () =>
      game.players.find((player) => player.id === 1).deck.length;
    expect(getCards()).toEqual(1);
    game.ring(1);
    expect(game.turns[game.turns.length - 1].win).toEqual(1);
    expect(getCards()).toEqual(3);
    game.readyPlayer();
    game.nextTurn();
    game.ring(1);
    expect(getCards()).toEqual(4);
    expect(game._end).toEqual(true);
    expect(game.players.find((player) => player.id === 1).win).toEqual(true);
  });

  test("logger", () => {
    game.nextTurn();
    expect(game.log[0]).toEqual("constructor");
  });
  test("players setup", () => {
    expect(game.players.length).toEqual(numOfPlayers);
  });

  test("end game", () => {
    game.end();
    expect(game._end).toEqual(true);
  });
});
