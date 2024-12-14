import { cn, getPlayerForTurn } from "@/lib/utils";
import { useBar } from "./provider";
import PixelHeart from "../heart";
import { DoorClosedIcon, DoorOpenIcon } from "lucide-react";
import Link from "next/link";

export default function BarHeader() {
	const { bar, player } = useBar();

	if (bar == null) {
		return null;
	}

	const currentTurnPlayer = getPlayerForTurn(bar, bar.turn);

	return (
		<div className={cn("h-14 flex items-center justify-between")}>
			{!bar.isStarted ? (
				<small className="text-center text-base">
					Welcome to the Liar's Bar!
				</small>
			) : currentTurnPlayer != null ? (
				currentTurnPlayer.id === player.id ? (
					<small className="text-base">It's your turn!</small>
				) : (
					<small className="text-center text-base">
						It's {currentTurnPlayer.nickname}'s turn!
					</small>
				)
			) : null}
			{bar.isStarted ? (
				<div className="flex items-center justify-center space-x-2">
					<h3 className="text-xl font-semibold">{player.lives}</h3>
					<PixelHeart size={30} />
				</div>
			) : (
				<Link href="/" className="group">
					<DoorClosedIcon className="h-7 w-7 group-hover:hidden transition-all" />
					<DoorOpenIcon className="h-7 w-7 hidden group-hover:block transition-all" />
				</Link>
			)}
		</div>
	);
}
