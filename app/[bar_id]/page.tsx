import { notFound, redirect } from "next/navigation";
import { PARTYKIT_URL } from "../env";
import type { Bar } from "../types";
import { auth } from "@/auth";
import { MAX_PLAYERS } from "../consts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BarUI from "@/components/bar";
import BarProvider from "@/components/bar/provider";

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

	const bar = (await req.json()) as Bar;

	const isBarFull = bar.players.length >= MAX_PLAYERS;

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
		<BarProvider barId={barId}>
			<BarUI />
		</BarProvider>
	);
}
