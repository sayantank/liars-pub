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
				<div className="mt-4 rounded-md border-2 border-primary shadow-md p-4 flex flex-col items-center">
					<small className="text-base">Bar ID</small>
					<h1 className="text-3xl font-semibold">{bar.id}</h1>
				</div>
			) : null}

			{!bar.isStarted ? (
				<div className="grow mt-8">
					<div className="text-center space-y-2 min-h-48">
						<small className="text-base">Players</small>
						<div className="text-center space-y-1">
							{bar.players.map((player) => (
								<p key={player.id} className="text-xl font-semibold">
									{player.nickname}
								</p>
							))}
						</div>
					</div>
					<div className="w-full flex justify-center">
						<Button type="button" className=" w-2/3">
							Start Game
						</Button>
					</div>
				</div>
			) : null}

			<div className="min-h-0">
				<BarChat />
			</div>
		</>
	);
}
