import {
	AVATARS,
	MAX_CLAIM_SIZE,
	MAX_HAND_SIZE,
	MAX_LIVES,
	MAX_PLAYERS,
	MIN_PLAYERS,
} from "@/app/consts";
import {
	CardType,
	RouletteStatus,
	type Bar,
	type Card,
	type ChatMessage,
	type Hand,
} from "@/app/types";
import {
	type CallOutMessage,
	type ChangeAvatarMessage,
	type ClaimCardsMessage,
	clientMessageSchema,
	type GuessRouletteMessage,
	type SendChatMessage,
} from "@/game/messages";
import {
	getPlayerForTurn,
	getRandomAvatar,
	getRandomNumber,
} from "@/lib/utils";
import { barSchema } from "@/lib/zod";
import type * as Party from "partykit/server";
import { animals, uniqueNamesGenerator } from "unique-names-generator";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;
	rouletteGuess: number | undefined;
	hands: Hand[] = [];
	stack: Card[] = [];

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const requestData = await req.json();

			try {
				this.bar = barSchema.parse(requestData);
				this.broadcastAndSave();
			} catch (e) {
				console.error(e);
			}
		}

		if (this.bar) {
			return new Response(JSON.stringify(this.bar), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Not found", { status: 404 });
	}

	async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		const connectionId = conn.id;

		// If the player is not already in the bar, add them
		if (
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === connectionId) == null
		) {
			const player = {
				id: connectionId,
				nickname: uniqueNamesGenerator({
					dictionaries: [animals],
				}),
				avatarIndex: getRandomAvatar().index,
			};

			this.bar.players.push(player);

			// A websocket just connected!
			console.log("Player joined", {
				player,
				room: this.room.id,
			});
		}

		this.broadcastAndSave();
	}

	async onMessage(rawMessage: string) {
		if (!this.bar) return;

		try {
			const message = clientMessageSchema.parse(JSON.parse(rawMessage));
			switch (message.type) {
				case "startGame": {
					this.startGame();
					break;
				}
				case "chat": {
					this.chat(message);
					break;
				}
				case "claimCards": {
					this.claimCards(message);
					break;
				}
				case "callOut": {
					this.callOut(message);
					break;
				}
				case "guessRoulette": {
					this.guessRoulette(message);
					break;
				}
				case "newRound": {
					this.newRound();
					break;
				}
				case "changeAvatar": {
					this.changeAvatar(message);
					break;
				}
			}

			this.broadcastAndSave();
		} catch (e) {
			console.error(e);
		}
	}

	onClose(connection: Party.Connection): void | Promise<void> {
		if (this.bar == null) {
			return;
		}

		const connectionId = connection.id;
		const index = this.bar.players.findIndex((p) => p.id === connectionId);

		if (index === -1) {
			return;
		}

		const player = this.bar.players[index];

		this.bar.players.splice(index, 1);
		this.broadcastAndSave();

		console.log("Player left", {
			player,
			room: this.room.id,
		});
	}

	claimCards(message: ClaimCardsMessage) {
		if (this.bar == null) {
			return;
		}

		if (message.data.cards.length > MAX_CLAIM_SIZE) {
			return;
		}

		const playerId = message.data.playerId;
		const currentTurnPlayer = getPlayerForTurn(this.bar, this.bar.turn);

		if (currentTurnPlayer == null || playerId !== currentTurnPlayer.id) {
			return;
		}

		// remove cards from the hand
		const playerHandIndex = this.hands.findIndex(
			(hand) => hand.playerId === playerId,
		);
		if (playerHandIndex === -1) {
			console.error("Player hand not found", {
				playerId,
				room: this.room.id,
			});
		}

		// Remove and return the hand of the player
		const playerHand = this.hands[playerHandIndex];
		this.hands.splice(playerHandIndex, 1);

		// Empty the stack so that we can save the next set of cards
		this.stack = [];

		// Add the cards to the stack
		this.stack = message.data.cards.map(
			(cardIndex) => playerHand.cards[cardIndex],
		);

		const indicesToRemove = new Set(message.data.cards);
		playerHand.cards = playerHand.cards.filter(
			(_, index) => !indicesToRemove.has(index),
		);

		this.hands.push(playerHand);
		this.bar.lastClaimCount = message.data.cards.length;

		const numPlayersWithCards = this.bar.activePlayers.reduce((acc, player) => {
			return acc + (this._getPlayerHand(player.id).cards.length > 0 ? 1 : 0);
		}, 0);

		// If there is only one player with cards left, force call out
		if (playerHand.cards.length === 0 && numPlayersWithCards <= 1) {
			this.bar.forceCallOut = true;
		}

		// Finding whose turn it is next
		let turnIncrement = 1;
		let nextPlayer = null;
		do {
			nextPlayer = getPlayerForTurn(this.bar, this.bar.turn + turnIncrement);
			if (nextPlayer == null) {
				throw new Error("Next player not found");
			}

			const nextPlayerHand = this._getPlayerHand(nextPlayer.id);

			// If next player with cards found, stop loop
			if (nextPlayerHand.cards.length > 0) {
				break;
			}

			turnIncrement += 1;
		} while (nextPlayer != null);

		this.bar.turn += turnIncrement;
	}

	callOut(message: CallOutMessage) {
		if (this.bar == null) {
			return;
		}

		if (this.bar.turn === 0) {
			console.error("Cannot call out in the first turn", {
				playerId: message.data.by.id,
				room: this.room.id,
			});
			return;
		}

		const playerCallingOut = this._getActivePlayer(message.data.by.id);
		const playerBeingCalledOut = getPlayerForTurn(this.bar, this.bar.turn - 1);

		if (playerBeingCalledOut == null) {
			return;
		}

		this.bar.messages[playerCallingOut.id] = {
			type: "text",
			player: playerCallingOut,
			message: `I'm calling out ${playerBeingCalledOut.nickname}! 👀`,
			timestamp: Date.now(),
		};
		let wasLying = false;
		for (const card of this.stack) {
			if (card.type !== this.bar.tableType && card.type !== CardType.Joker) {
				wasLying = true;
				break;
			}
		}

		this.bar.messages[playerBeingCalledOut.id] = {
			type: "showClaim",
			player: playerBeingCalledOut,
			cards: this.stack,
			timestamp: Date.now(),
		};
		const roulettePlayer = wasLying ? playerBeingCalledOut : playerCallingOut;

		this.rouletteGuess = getRandomNumber(1, roulettePlayer.lives);

		this.bar.roulette = {
			player: roulettePlayer,
			status: RouletteStatus.Guessing,
		};
	}

	guessRoulette(message: GuessRouletteMessage) {
		if (
			this.bar == null ||
			this.rouletteGuess == null ||
			this.bar.roulette == null
		) {
			return;
		}

		if (this.bar.roulette.player.id !== message.data.player.id) {
			console.error("Invalid player in roulette message", {
				playerId: message.data.player.id,
				roulettePlayer: this.bar.roulette.player.id,
				room: this.room.id,
			});

			return;
		}

		// If the guess is not the same as the server number, the player is still alive
		if (this.rouletteGuess !== message.data.guess) {
			this.bar.roulette.status = RouletteStatus.Alive;

			// reduce the player's lives
			const playerIndex = this.bar.activePlayers.findIndex(
				(p) => p.id === message.data.player.id,
			);
			if (playerIndex === -1) {
				console.error("Player not found in active players", {
					playerId: message.data.player.id,
					room: this.room.id,
				});
				throw new Error("Player not found");
			}

			this.bar.activePlayers[playerIndex].lives -= 1;

			return;
		}

		// remove player from active players
		const playerIndex = this.bar.activePlayers.findIndex(
			(p) => p.id === message.data.player.id,
		);
		if (playerIndex === -1) {
			console.error("Player not found in active players", {
				playerId: message.data.player.id,
				room: this.room.id,
			});
			return;
		}
		this.bar.activePlayers.splice(playerIndex, 1);
		this.bar.roulette.status = RouletteStatus.Dead;
	}

	newRound() {
		if (this.bar == null || this.rouletteGuess == null) {
			return;
		}

		// If only one player is remaining, he/she is the winner
		if (this.bar.activePlayers.length === 1) {
			this.rouletteGuess = undefined;
			this.bar = {
				id: this.bar.id,
				isStarted: false,
				roulette: null,
				forceCallOut: false,
				turn: 0,
				tableType: null,
				lastClaimCount: null,
				messages: this.bar.messages,
				players: this.bar.players,
				activePlayers: [],
				// Set the winner
				winner: this.bar.activePlayers[0],
			};
			return;
		}

		// Reset the roulette
		this.rouletteGuess = undefined;
		this.bar.roulette = null;

		// Reset the table type
		this.bar.tableType = this._getRandomCardType();

		// Distribute a new deck
		const deck = this._getNewDeck();
		this.hands = this._distributeDeck(deck);

		// Shuffle the active players
		this._shuffle(this.bar.activePlayers);

		// Reset the bar configs
		this.bar.turn = 0;
		this.bar.lastClaimCount = null;
		this.bar.forceCallOut = false;

		// Clear the stack
		this.stack = [];
	}

	changeAvatar(message: ChangeAvatarMessage) {
		if (this.bar == null) {
			return;
		}

		const action = message.data.action;

		// loop through every player looking for the one to update
		for (const player of this.bar.players) {
			// find the index for the active player
			const activePlayerIndex = this.bar.activePlayers.findIndex(
				(p) => p.id === player.id,
			);

			if (player.id === message.data.player.id) {
				if (action === "next") {
					player.avatarIndex = (player.avatarIndex + 1) % AVATARS.length;
					// if the player is the active player, update the active player's avatar
					if (activePlayerIndex !== -1) {
						this.bar.activePlayers[activePlayerIndex].avatarIndex =
							player.avatarIndex;
					}
				} else if (action === "prev") {
					player.avatarIndex =
						(player.avatarIndex - 1 + AVATARS.length) % AVATARS.length;
					if (activePlayerIndex !== -1) {
						this.bar.activePlayers[activePlayerIndex].avatarIndex =
							player.avatarIndex;
					}
				}
			}
		}
	}

	startGame() {
		console.log("startGame");
		if (this.bar == null) {
			return;
		}

		if (
			this.bar.players.length < MIN_PLAYERS ||
			this.bar.players.length > MAX_PLAYERS
		) {
			return;
		}

		// Reset the winner
		this.bar.winner = null;

		// Set the table type
		this.bar.tableType = this._getRandomCardType();

		// Shuffle the players and set it to activePlayers
		this.bar.activePlayers = this._shuffle([
			...this.bar.players.map((p) => ({ ...p, lives: MAX_LIVES })),
		]);

		const deck = this._getNewDeck();
		this.hands = this._distributeDeck(deck);

		this.bar.isStarted = true;
		this.bar.turn = 0;
	}

	chat(message: SendChatMessage) {
		if (this.bar == null) {
			return;
		}

		this.bar.messages[message.data.player.id] = {
			type: "text",
			player: message.data.player,
			message: message.data.message,
			timestamp: Date.now(),
		};
	}

	resetHands() {}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
		this.hands = (await this.room.storage.get<Hand[]>("hands")) ?? [];
		this.stack = (await this.room.storage.get<Card[]>("stack")) ?? [];
		this.rouletteGuess = await this.room.storage.get<number>("rouletteGuess");
	}

	async broadcastAndSave() {
		this._broadcast();

		if (this.bar != null) {
			await this.room.storage.put<Bar>("bar", this.bar);
		}
		if (this.rouletteGuess != null) {
			await this.room.storage.put<number>("rouletteGuess", this.rouletteGuess);
		}
		await this.room.storage.put<Card[]>("stack", this.stack);
		await this.room.storage.put<Hand[]>("hands", this.hands);
	}

	_broadcast() {
		this.room.broadcast(JSON.stringify({ type: "bar", data: this.bar }));
		if (this.bar) {
			for (const hand of this.hands) {
				this.room.broadcast(
					JSON.stringify({ type: "hand", data: hand }),
					// don't broadcast the hand to other players
					this.bar.players
						.filter((p) => p.id !== hand.playerId)
						.map((p) => p.id),
				);
			}
		}
	}

	_getRandomCardType() {
		// Set the table type
		const cardTypes = [CardType.Ace, CardType.King, CardType.Queen];
		const randomNumber = Math.floor(Math.random() * cardTypes.length);

		return cardTypes[randomNumber];
	}

	_getNewDeck() {
		const cardCounts: Array<{ count: number; type: Card["type"] }> = [
			{ count: 6, type: CardType.Ace },
			{ count: 6, type: CardType.King },
			{ count: 6, type: CardType.Queen },
			{ count: 2, type: CardType.Joker },
		];

		const deck: Card[] = [];
		for (const { count, type } of cardCounts) {
			for (let i = 0; i < count; i++) {
				deck.push({ type });
			}
		}

		// Shuffle the deck
		this._shuffle(deck);

		return deck;
	}

	_distributeDeck(deck: Card[]) {
		if (this.bar == null) {
			throw new Error("Bar is null");
		}

		const handsMap = new Map<string, Hand>();

		for (let i = 0; i < MAX_HAND_SIZE; i++) {
			for (const player of this.bar.activePlayers) {
				const nextCard = deck.pop();
				if (nextCard == null) {
					throw new Error("Deck is empty");
				}

				const hand = handsMap.get(player.id);
				if (hand == null) {
					handsMap.set(player.id, {
						playerId: player.id,
						cards: [nextCard],
					});
				} else {
					hand.cards.push(nextCard);
				}
			}
		}

		return Array.from(handsMap.values());
	}

	_getPlayerHand(playerId: string) {
		const playerHandIndex = this.hands.findIndex(
			(hand) => hand.playerId === playerId,
		);
		if (playerHandIndex === -1) {
			console.error("Player hand not found", {
				playerId,
				room: this.room.id,
			});
			throw new Error("Player hand not found");
		}

		return this.hands[playerHandIndex];
	}

	_getActivePlayer(id: string) {
		if (this.bar == null) {
			throw new Error("Bar is null");
		}

		const playerIndex = this.bar.activePlayers.findIndex((p) => p.id === id);
		if (playerIndex === -1) {
			console.error("Player not found in active players", {
				playerId: id,
				room: this.room.id,
			});
			throw new Error("Player not found");
		}

		return this.bar.activePlayers[playerIndex];
	}

	_shuffle<T>(array: Array<T>) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
}

Server satisfies Party.Worker;
