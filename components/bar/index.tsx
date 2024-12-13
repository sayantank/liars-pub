"use client";

import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";
import { MAX_PLAYERS } from "@/app/consts";
import CardHand from "./hand";
import BarBanner from "./banner";
import BarHeader from "./header";

export default function BarUI() {
	const { bar, socket, socketState, startGame } = useBar();

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	if (bar == null) {
		return null;
	}

	return (
		<>
			<BarHeader />
			<BarBanner className="mb-16" />

			<div className="grow">
				{!bar.isStarted ? (
					<>
						<div className="text-center space-y-2">
							<small className="text-base">Players</small>
							<div className="text-center space-y-1">
								{bar.players.map((player) => (
									<p key={player.id} className="text-xl font-semibold">
										{player.nickname}
									</p>
								))}
							</div>
						</div>
						{bar.players.length === MAX_PLAYERS && (
							<div className="w-full flex justify-center mt-4">
								<Button type="button" className=" w-2/3" onClick={startGame}>
									Start Game
								</Button>
							</div>
						)}
					</>
				) : (
					<CardHand />
				)}
			</div>

			<div className="min-h-0">
				<BarChat />
			</div>
		</>
	);
}
