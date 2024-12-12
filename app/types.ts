export type Bar = {
	id: string;
	players: Player[];
	isStarted: boolean;
};

export type Deck = {
	cards: Card[];
};

export type Hand = {
	playerId: string;
	cards: Card[];
};

export type Player = {
	id: string;
};

export type Card = {
	type: "ace" | "king" | "queen" | "joker";
};
