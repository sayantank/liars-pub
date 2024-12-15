import { cn } from "@/lib/utils";
import { useBar } from "./provider";

export default function BarHeader() {
	const { bar } = useBar();

	if (bar.isStarted) {
		return null;
	}

	return (
		<div className={cn("h-14 flex items-center justify-between")}>
			<small className="text-center text-base">
				Welcome to the Liar's Pub!
			</small>
		</div>
	);
}
