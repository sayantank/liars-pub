import { useBar } from "./provider";

export default function BarTable() {
	const { bar } = useBar();

	if (bar == null) {
		return null;
	}

	return <div>Player: {bar.players.length}</div>;
}
