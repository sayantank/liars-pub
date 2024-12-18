import BarUIV2 from "@/components/bar-v2";
import { PARTYKIT_URL } from "@/app/env";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { MAX_PLAYERS } from "@/app/consts";
import BarProviderV2 from "@/components/bar-v2/provider";
import { barSchema } from "@/lib/zod";

export default async function BarPage({
	params,
}: {
	params: Promise<{ bar_id: string }>;
}) {
	const barId = (await params).bar_id;

	const req = await fetch(`${PARTYKIT_URL}/party/${barId}`, {
		method: "GET",
		next: {
			revalidate: 0,
		},
	});

	if (!req.ok) {
		if (req.status === 404) {
			notFound();
		} else {
			throw new Error("Something went wrong.");
		}
	}

	try {
		const json = await req.json();
		const bar = barSchema.parse(json);

		const isBarFull = bar.players.length >= MAX_PLAYERS;

		// TODO: make this ui better
		if (isBarFull) {
			return (
				<div className="space-y-4 flex flex-col items-center">
					<h1 className="text-lg">Bar is full!</h1>
					<Link href="/" className="block">
						<Button type="button">Go home</Button>
					</Link>
				</div>
			);
		}

		return (
			<BarProviderV2 initialBar={bar}>
				<BarUIV2 />
			</BarProviderV2>
		);
	} catch (err) {
		console.error(err);
		redirect("/");
	}
}
