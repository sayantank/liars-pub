"use client";

import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/app/consts";
import CardHand from "./hand";
import BarBanner from "./banner";
import BarPlayers from "./players";
import { cn } from "@/lib/utils";
import BarInvite from "./invite";
import { useRouter } from "next/navigation";

export default function BarUI() {
	const { bar, player, socket, socketState, startGame } = useBar();
	const router = useRouter();

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	return (
		<>
			<BarBanner className="mb-12 sm:mb-16" />

			<div
				className={cn(
					"grow flex flex-col",
					bar.isStarted ? "justify-between" : "justify-end",
				)}
			>
				{bar.isStarted ? (
					<div className="">
						<CardHand />
					</div>
				) : (
					<div className="flex flex-col w-2/3 mx-auto items-stretch justify-center gap-4">
						{bar.players.length >= MIN_PLAYERS &&
							bar.players.length <= MAX_PLAYERS && (
								<Button
									type="button"
									className="flex-1"
									size="sm"
									onClick={startGame}
								>
									Start Game
								</Button>
							)}
						<BarInvite barId={bar.id} />
						<Button
							type="button"
							variant="ghost"
							className=" flex-1"
							size="sm"
							onClick={() => router.replace("/")}
						>
							Leave Pub
						</Button>
					</div>
				)}

				<BarPlayers className="mb-6 min-h-36" />
			</div>

			<div className="min-h-0">
				<BarChat />
			</div>
		</>
	);
}
