"use client";

import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/app/consts";
import CardHand from "./hand";
import BarBanner from "./banner";
import BarHeader from "./header";
import PixelHeart from "../heart";
import { CrownIcon } from "lucide-react";

export default function BarUI() {
	const { bar, player, socket, socketState, startGame } = useBar();

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
							<div className="flex flex-col items-center space-y-1">
								{bar.players.map((player) => {
									const isWinner = bar.winner?.id === player.id;
									return (
										<div
											key={player.id}
											className="flex items-center space-x-2"
										>
											<p className="text-xl font-semibold">{player.nickname}</p>
											{isWinner && (
												<CrownIcon className="w-5 h-5 text-orange-400" />
											)}
										</div>
									);
								})}
							</div>
						</div>
						{bar.players.length >= MIN_PLAYERS &&
							bar.players.length <= MAX_PLAYERS && (
								<div className="w-full flex justify-center mt-12">
									<Button
										type="button"
										className="sm:w-1/2 w-2/3"
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
