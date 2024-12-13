import { useCallback } from "react";
import { useBar } from "./provider";
import { CardType } from "@/app/types";
import { cn, getCardTypeLabel } from "@/lib/utils";

export default function BarBanner({ className }: { className?: string }) {
	const { bar, socket, socketState } = useBar();

	if (bar == null) {
		return null;
	}

	const lastTurnPlayer = bar.players[(bar.turn - 1) % bar.players.length];

	const TableType = useCallback(() => {
		if (bar.tableType == null) {
			return null;
		}

		switch (bar.tableType) {
			case CardType.Ace:
				return;
			case CardType.King:
				return <h1 className="text-3xl font-semibold">King's table</h1>;
			case CardType.Queen:
				return <h1 className="text-3xl font-semibold">Queen's table</h1>;
			default:
				throw new Error("Invalid table type");
		}
	}, [bar.tableType]);

	return (
		<div
			className={cn(
				"mt-4 rounded-md border-2 border-primary shadow-md p-4 flex flex-col items-center justify-center min-h-24",
				className,
			)}
		>
			{!bar.isStarted ? (
				<>
					<small className="text-base">Bar ID</small>
					<h1 className="text-3xl font-semibold">{bar.id}</h1>
				</>
			) : bar.lastClaimCount == null ? (
				<h1 className="text-3xl font-semibold">
					{getCardTypeLabel(bar.tableType!)}'s table
				</h1>
			) : lastTurnPlayer != null ? (
				<>
					<small className="text-base">
						{lastTurnPlayer.nickname} has claimed
					</small>
					<h1 className="text-3xl font-semibold">
						{bar.lastClaimCount} {getCardTypeLabel(bar.tableType!)}
						{bar.lastClaimCount > 1 ? "s" : ""}
					</h1>
				</>
			) : null}
		</div>
	);
}
