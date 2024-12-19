import {
	MAX_CLAIM_SIZE,
	MAX_HAND_SIZE,
	MAX_LIVES,
	MAX_PLAYERS,
	MIN_PLAYERS,
} from "@/app/consts";
import {
	CardType,
	RouletteStatus,
	type RoundState,
	type Bar,
	type Card,
} from "@/app/types";
import {
	type CallOutMessage,
	type ChangeAvatarMessage,
	type ClaimCardsMessage,
	clientMessageSchema,
	type EditNicknameMessage,
	type GuessRouletteMessage,
	type PlayerActionMessage,
	type PlayerStateMessage,
	type SendChatMessage,
	type ServerMessage,
} from "@/game/messages";
import {
	getPlayerNicknameForTurn,
	getRandomAvatar,
	getRandomNumber,
} from "@/lib/utils";
import { avatarSchema, barSchema } from "@/lib/zod";
import type * as Party from "partykit/server";
import { animals, uniqueNamesGenerator } from "unique-names-generator";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;
	roundState: RoundState | undefined;

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const requestData = await req.json();

			try {
				this.bar = barSchema.parse(requestData);
				this.broadcastAndSaveBar();
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

		const url = new URL(ctx.request.url);
		const nicknameParams = url.searchParams.get("nickname");
		const avatarParse = avatarSchema.safeParse(url.searchParams.get("avatar"));

		// If the player is not already in the bar, add them
		if (
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === connectionId) == null
		) {
			const nickname =
				nicknameParams ??
				uniqueNamesGenerator({
					dictionaries: [animals],
				});

			// If round is going on and the player is not in the round state, ignore them
			if (
				this.roundState != null &&
				this.roundState.players[nickname] == null
			) {
				return;
			}

			const player = {
				id: connectionId,
				nickname,
				avatar: avatarParse.success
					? avatarParse.data
					: getRandomAvatar().avatar,
			};

			this.bar.players.push(player);

			// A websocket just connected!
			console.log("Player joined", {
				player,
				room: this.room.id,
			});
		}

		this.broadcastAndSaveBar();
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
				case "editNickname": {
					this.editNickname(message);
					break;
				}
			}

			this.broadcastAndSaveBar();
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
		this.broadcastAndSaveBar();

		console.log("Player left", {
			player,
			room: this.room.id,
		});
	}

	claimCards(message: ClaimCardsMessage) {
		if (
			this.bar == null ||
			this.bar.turn == null ||
			this.bar.turnSequence == null ||
			this.roundState == null
		) {
			return;
		}

		if (message.data.cardIndices.length > MAX_CLAIM_SIZE) {
			return;
		}

		const playerNickname = message.data.playerNickname;
		const currentTurnNickname = this.bar.turn.playerNickname;

		if (currentTurnNickname !== playerNickname) {
			return;
		}

		this._broadcast({
			type: "playerAction",
			actionType: "claimCards",
			playerNickname: playerNickname,
			data: {
				count: message.data.cardIndices.length,
			},
		});

		// Remove and return the hand of the player
		const playerHand = this.roundState.players[playerNickname].hand;
		const cardIndices = message.data.cardIndices;

		// remove the cards from the hand
		const updatedHand = playerHand.filter(
			(_, index) => !cardIndices.includes(index),
		);
		const claimedCards = playerHand.filter((_, index) =>
			cardIndices.includes(index),
		);

		this.roundState.players[playerNickname].hand = updatedHand;
		this.roundState.stack = claimedCards;

		this.bar.lastClaim = {
			count: claimedCards.length,
			playerNickname,
		};

		// If the player ran out of cards, we can remove them from the turnSequence
		const isEmptyHand = updatedHand.length === 0;
		if (isEmptyHand) {
			this.bar.turnSequence = this.bar.turnSequence.filter(
				(nickname) => nickname !== playerNickname,
			);
		}

		// If we remove the current player from the turnSequence, we don't need to increment the turn number
		const newTurnNumber = isEmptyHand
			? this.bar.turn.number
			: this.bar.turn.number + 1;

		const nextPlayerNickname = getPlayerNicknameForTurn(
			this.bar,
			newTurnNumber,
		);
		if (nextPlayerNickname == null) {
			throw new Error("Next player nickname not found");
		}

		this.bar.turn = {
			number: newTurnNumber,
			playerNickname: nextPlayerNickname,
		};
	}

	callOut(message: CallOutMessage) {
		if (
			this.bar == null ||
			this.bar.turn == null ||
			this.bar.lastClaim == null ||
			this.roundState == null
		) {
			console.log({
				bar: this.bar,
				turn: this.bar?.turn,
				lastClaim: this.bar?.lastClaim,
				roundState: this.roundState,
			});
			return;
		}

		if (this.bar.turn.number === 0) {
			console.error("Cannot call out in the first turn", {
				playerId: message.data.by.id,
				room: this.room.id,
			});
			return;
		}

		const playerCallingOut = this.bar.turn.playerNickname;
		const playerBeingCalledOut = this.bar.lastClaim.playerNickname;

		this._broadcast({
			type: "playerAction",
			actionType: "callOut",
			playerNickname: playerCallingOut,
		});

		let wasLying = false;
		for (const card of this.roundState.stack) {
			if (card.type !== this.bar.tableType && card.type !== CardType.Joker) {
				wasLying = true;
				break;
			}
		}

		this._broadcast({
			type: "playerAction",
			actionType: "showClaim",
			playerNickname: playerBeingCalledOut,
			data: [...this.roundState.stack],
		});

		const roulettePlayer = wasLying ? playerBeingCalledOut : playerCallingOut;

		this.roundState.rouletteGuess = getRandomNumber(
			1,
			this.roundState.players[roulettePlayer].lives,
		);

		this.bar.roulette = {
			playerNickname: roulettePlayer,
			status: RouletteStatus.Guessing,
		};
	}

	guessRoulette(message: GuessRouletteMessage) {
		if (
			this.bar == null ||
			this.bar.roulette == null ||
			this.roundState == null ||
			this.bar.turnSequence == null
		) {
			return;
		}

		if (this.bar.roulette.playerNickname !== message.data.playerNickname) {
			console.error("Invalid player in roulette message", {
				playerNickname: message.data.playerNickname,
				roulette: this.bar.roulette,
				room: this.room.id,
			});

			return;
		}

		// If the guess is not the same as the server number, the player is still alive
		if (this.roundState.rouletteGuess !== message.data.guess) {
			this.bar.roulette.status = RouletteStatus.Alive;

			this.roundState.players[message.data.playerNickname].lives -= 1;

			return;
		}

		this.roundState.players[message.data.playerNickname].lives = 0;

		// remove player from active players
		const turnSequenceIndex = this.bar.turnSequence.findIndex(
			(nickname) => nickname === message.data.playerNickname,
		);
		if (turnSequenceIndex === -1) {
			console.error("Player not found in turn sequence", {
				playerNickname: message.data.playerNickname,
				turnSequence: this.bar.turnSequence,
				room: this.room.id,
			});
			return;
		}

		this.bar.turnSequence.splice(turnSequenceIndex, 1);

		this.bar.roulette.status = RouletteStatus.Dead;
	}

	newRound() {
		if (
			this.bar == null ||
			this.bar.turnSequence == null ||
			this.roundState == null
		) {
			console.log({
				bar: this.bar,
				turnSequence: this.bar?.turnSequence,
				roundState: this.roundState,
			});
			return;
		}

		// If only one player is remaining, he/she is the winner
		if (this.bar.turnSequence.length === 1) {
			this.bar = {
				id: this.bar.id,
				isStarted: false,
				roulette: null,
				turn: null,
				turnSequence: null,
				tableType: null,
				lastClaim: null,
				players: this.bar.players,

				// Set the winner
				winner: this.bar.turnSequence[0],
			};
			this.roundState = undefined;
			return;
		}

		// Reset the roulette
		this.roundState.rouletteGuess = null;
		this.bar.roulette = null;

		// Reset the table type
		this.bar.tableType = this._getRandomCardType();

		this.bar.turnSequence = this._shuffle(this.bar.turnSequence);

		// Reset the bar configs
		this.bar.turn = {
			number: 0,
			playerNickname: this.bar.turnSequence[0],
		};
		this.bar.lastClaim = null;
		// this.bar.forceCallOut = false;

		this.roundState.stack = [];
		this.roundState.rouletteGuess = null;

		for (const playerNickname of Object.keys(this.roundState.players)) {
			this.roundState.players[playerNickname].hand = [];
		}

		// Distribute a new deck
		const deck = this._getNewDeck();
		this._distributeDeck(deck);
	}

	changeAvatar(message: ChangeAvatarMessage) {
		if (this.bar == null) {
			return;
		}

		const playerId = message.data.playerId;
		const playerIndex = this.bar.players.findIndex((p) => p.id === playerId);

		this.bar.players[playerIndex].avatar = message.data.avatar;
	}

	editNickname(message: EditNicknameMessage) {
		if (this.bar == null) {
			return;
		}

		const playerIndex = this.bar.players.findIndex(
			(p) => p.id === message.data.playerId,
		);
		if (playerIndex === -1) {
			console.error("Player not found in active players", {
				playerId: message.data.playerId,
				room: this.room.id,
			});
			return;
		}

		this.bar.players[playerIndex].nickname = message.data.nickname;
	}

	startGame() {
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

		this.bar.isStarted = true;

		this.bar.turnSequence = this._shuffle([
			...this.bar.players.map((p) => p.nickname),
		]);
		this.bar.turn = {
			number: 0,
			playerNickname: this.bar.turnSequence[0],
		};

		this.roundState = {
			rouletteGuess: null,
			stack: [],
			players: this.bar.players.reduce<RoundState["players"]>(
				(acc, players) => {
					if (acc[players.nickname] == null) {
						acc[players.nickname] = {
							hand: [],
							lives: MAX_LIVES,
						};
					}
					return acc;
				},
				{},
			),
		};

		const deck = this._getNewDeck();
		this._distributeDeck(deck);
	}

	chat(message: SendChatMessage) {
		if (this.bar == null) {
			return;
		}

		this._broadcast({
			type: "playerAction",
			actionType: "chat",
			playerNickname: message.data.playerNickname,
			data: {
				message: message.data.message,
			},
		});
	}

	resetHands() {}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
		this.roundState = await this.room.storage.get<RoundState>("roundState");
	}

	async broadcastAndSaveBar() {
		if (this.bar != null) {
			this._broadcast({
				type: "bar",
				data: this.bar,
			});
			await this.room.storage.put<Bar>("bar", this.bar);

			if (this.roundState != null) {
				const playerEntries = Object.entries(this.roundState.players);

				for (const [playerNickname, playerData] of playerEntries) {
					this._broadcast(
						{
							type: "hand",
							data: playerData.hand,
						},
						this.bar.players
							.filter((p) => p.nickname !== playerNickname)
							.map((p) => p.id),
					);
				}

				const playerState = playerEntries.reduce<PlayerStateMessage["data"]>(
					(acc, [playerNickname, playerData]) => {
						if (acc[playerNickname] == null) {
							acc[playerNickname] = {
								handCount: playerData.hand.length,
								lives: playerData.lives,
							};
						}
						return acc;
					},
					{},
				);

				this._broadcast({
					type: "players",
					data: playerState,
				});
				await this.room.storage.put<RoundState>("roundState", this.roundState);
			}
		}
	}

	_broadcast(
		message: ServerMessage | PlayerActionMessage,
		without?: string[] | undefined,
	) {
		this.room.broadcast(JSON.stringify(message), without);
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
		if (this.roundState == null || this.bar == null) {
			console.error("roundState is null", {
				room: this.room.id,
				bar: this.bar,
			});
			throw new Error("Bar/roundState is null");
		}

		if (this.bar.turnSequence == null) {
			throw new Error("Turn sequence is null");
		}

		for (let i = 0; i < MAX_HAND_SIZE; i++) {
			for (const playerNickname of this.bar.turnSequence) {
				const nextCard = deck.pop();
				if (nextCard == null) {
					throw new Error("Deck is empty");
				}

				this.roundState.players[playerNickname].hand.push(nextCard);
			}
		}
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
