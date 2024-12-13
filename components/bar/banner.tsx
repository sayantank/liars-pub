import { useBar } from "./provider";

export default function BarBanner() {
	const { bar, socket, socketState } = useBar();

	if (bar == null) {
		return null;
	}

	return (
		<div className="mt-4 rounded-md border-2 border-primary shadow-md p-4 flex flex-col items-center">
			{!bar.isStarted ? (
				<>
					<small className="text-base">Bar ID</small>
					<h1 className="text-3xl font-semibold">{bar.id}</h1>
				</>
			) : null}
		</div>
	);
}
