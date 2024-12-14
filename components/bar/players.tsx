import { ChevronLeft, ChevronRight, CrownIcon } from "lucide-react";
import { useBar } from "./provider";
import { AVATARS } from "@/app/consts";
import type { ChangeAvatarMessage } from "@/game/messages";

export default function BarPlayers() {
	const { bar, player, socket } = useBar();

	function handleChangeAvatar(action: "next" | "prev") {
		if (player == null) {
			return;
		}

		const message: ChangeAvatarMessage = {
			type: "changeAvatar",
			data: {
				player,
				action,
			},
		};

		socket.send(JSON.stringify(message));
	}

	return (
		<div>
			<div className="grid grid-cols-3">
				{bar.players.map((listPlayer) => {
					const isWinner = bar.winner?.id === listPlayer.id;
					const isMyself = listPlayer.id === player.id;
					return (
						<div
							key={listPlayer.id}
							className="flex flex-col items-center space-y-2"
						>
							<div className="flex items-center space-x-2">
								{isMyself && (
									<button
										type="button"
										onClick={() => handleChangeAvatar("prev")}
									>
										<ChevronLeft className="w-4 h-4 hover:cursor-pointer" />
									</button>
								)}
								<p className="text-4xl sm:text-4xl">
									{AVATARS[listPlayer.avatarIndex]}
								</p>
								{isMyself && (
									<button
										type="button"
										onClick={() => handleChangeAvatar("next")}
									>
										<ChevronRight className="w-4 h-4 hover:cursor-pointer" />
									</button>
								)}
							</div>
							<p className="text-xs sm:text-sm font-semibold">
								{listPlayer.nickname}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}
