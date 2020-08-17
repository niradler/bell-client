import React from "react";

const Pile = ({ cards, inPile }) => {
  return (
    <div>
      <h3>Pile ({inPile})</h3>
      <div className="flex">
        {cards.length > 0 &&
          cards.map((card, i) => (
            <div className="flex-1 text-center items-center" key={`card-${i}`}>
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
  );
};

export default Pile;
