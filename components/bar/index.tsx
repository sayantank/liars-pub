"use client";

import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/app/consts";
import CardHand from "./hand";
import BarBanner from "./banner";
import BarHeader from "./header";
import BarPlayers from "./players";

export default function BarUI() {
	const { bar, socket, socketState, startGame } = useBar();

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	return (
		<>
			<BarHeader />
			<BarBanner className="mb-16" />

			<div className="grow">
				{!bar.isStarted ? (
					<>
						<BarPlayers />
						{bar.players.length >= MIN_PLAYERS &&
							bar.players.length <= MAX_PLAYERS && (
								<div className="w-full flex justify-center mt-12">
									<Button
										type="button"
										className="w-1/3"
										size="sm"
										onClick={startGame}
									>
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
