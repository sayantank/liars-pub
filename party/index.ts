import { MAX_PLAYERS } from "@/app/consts";
import type { Bar } from "@/app/types";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const bar = (await req.json()) as Bar;
			this.bar = bar;
			this.saveBar();
		}

		if (this.bar) {
			return new Response(JSON.stringify(this.bar), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Not found", { status: 404 });
	}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		const playerId = conn.id;

		// If the player is not already in the bar, add them
		if (
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === playerId) == null
		) {
			this.bar.players.push({
				id: playerId,
			});
			this.room.broadcast(JSON.stringify({ bar: this.bar }));
			this.saveBar();

			// A websocket just connected!
			console.log("Player joined", {
				playerId,
				room: this.room.id,
			});
		}
	}

	onClose(connection: Party.Connection): void | Promise<void> {
		if (this.bar == null) {
			return;
		}

		const playerId = connection.id;
		const index = this.bar.players.findIndex((p) => p.id === playerId);

		if (index === -1) {
			return;
		}

		this.bar.players.splice(index, 1);
		this.room.broadcast(JSON.stringify({ bar: this.bar }));
		this.saveBar();

		console.log("Player left", {
			playerId,
			room: this.room.id,
		});
	}

	async onMessage(message: string) {
		if (!this.bar) return;

		const event = JSON.parse(message);
		if (event.type === "message") {
			const message = event.message;

			this.room.broadcast(JSON.stringify({ bar: this.bar }));
			this.saveBar();
		}
	}

	async saveBar() {
		if (this.bar) {
			await this.room.storage.put<Bar>("bar", this.bar);
		}
	}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
	}
}

Server satisfies Party.Worker;
