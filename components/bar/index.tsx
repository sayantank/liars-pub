"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";

export default function BarUI() {
	const { bar, socket, socketState } = useBar();

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	if (bar == null) {
		return null;
	}

	return (
		<>
			<div
				className={cn(
					"h-14 flex items-center",
					!bar.isStarted ? "justify-center" : "justify-between",
				)}
			>
				{!bar.isStarted ? (
					<small className="text-center text-base">
						Welcome to the Liar's Bar!
					</small>
				) : null}
			</div>

			{!bar.isStarted ? (
				<div className="rounded-md border-2 border-primary shadow-md p-4 flex flex-col items-center">
					<small className="text-base">Bar ID</small>
					<h1 className="text-3xl font-semibold">{bar.id}</h1>
				</div>
			) : null}

			{!bar.isStarted ? (
				<div className="text-center space-y-2 min-h-52">
					<small className="text-base">Players</small>
					<div className="text-center space-y-1">
						{bar.players.map((player) => (
							<p key={player.id} className="text-xl font-semibold">
								{player.id.slice(0, 5)}
							</p>
						))}
					</div>
				</div>
			) : null}

			{!bar.isStarted ? (
				<Button type="button" className="w-2/3 mx-auto">
					Start Game
				</Button>
			) : null}

			<BarChat />
		</>
	);
}
