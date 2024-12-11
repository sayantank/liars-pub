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
		const url = new URL(ctx.request.url);
		const playerId = url.searchParams.get("playerId");

		console.log("playerId", { playerId, length: this.bar?.players.length });

		// If the player is not already in the bar, add them
		if (
			playerId != null &&
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === playerId) == null
		) {
			this.bar.players.push({
				id: playerId,
			});
			this.room.broadcast(JSON.stringify({ bar: this.bar }));
			this.saveBar();
		}

		// A websocket just connected!
		console.log("Connected", {
			id: conn.id,
			room: this.room.id,
			url: new URL(ctx.request.url).pathname,
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
