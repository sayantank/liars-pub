"use client";

import PixelCard from "@/components/card";
import { CardType } from "../types";
import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";

export default function RulesPage() {
	const isMobile = useIsMobile();
	const router = useRouter();
	return (
		<div className="h-full flex flex-col space-y-8 px-4 sm:px-6 py-10 sm:py-8 overflow-y-auto no-scrollbar">
			<div className="flex flex-col sm:flex-row-reverse w-full sm:items-center sm:justify-between space-y-2 sm:space-y-0">
				<button
					type="button"
					className="hover:underline text-gray-500 max-w-fit"
					onClick={() => router.back()}
				>
					Go back
				</button>
				<h1 className="text-xl font-bold">Welcome to Liar's Pub 🍺</h1>
			</div>
			<p>
				Ready to test your poker face? In Liar's Pub, deception is your best
				friend! Bluff your way to victory by playing cards face down and
				outsmarting your opponents. Will they call your bluff, or will you fool
				them all?
			</p>
			<div className="space-y-6">
				<h2 className="text-lg font-medium underline">The Setup</h2>
				<div>
					<p>Your deck consists of:</p>
					<div className="flex items-center space-x-4 justify-center my-6">
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Ace} />
							<p className="text-lg font-bold">x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.King} />
							<p className="text-lg font-bold">x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Queen} />
							<p className="text-lg font-bold">x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Joker} />
							<p className="text-lg font-bold">x 2</p>
						</div>
					</div>
					<p className="mt-4">
						You'll start with <span className="font-semibold">5 cards</span> in
						your hand. Remember: <span className="font-semibold">Jokers</span>{" "}
						are wild cards - they can be played as any card.
					</p>
				</div>
			</div>
			<div className="space-y-6">
				<h2 className="text-lg font-medium underline">How to Play</h2>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">1.</span> Each round begins with a
						"liar's card" - this is what everyone must claim to play.
					</p>
					<div className="h-8 sm:h-10 border-2 border-primary flex items-center justify-between px-4">
						<h1 className="text-sm sm:text-lg">
							<span className="font-bold">Ace's</span> Table
						</h1>
					</div>
				</div>

				<p>
					<span className="font-semibold">2.</span> On your turn, play 1-3 cards
					face down. When you declare{" "}
					<span className="font-semibold">"2 Aces"</span>, the other players
					must decide whether to trust you.
				</p>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">3.</span> After someone plays, you
						have two options:
					</p>
					<ul className="list-disc pl-8 space-y-2">
						<li>Trust them (or atleast pretend to) and take your turn</li>
						<div className="w-full flex items-center font-bold">OR</div>
						<li>
							Call "LIAR!" and call their bluff
							<ul className="list-disc pl-8 space-y-2 mt-2">
								<li>If they lied: They face the death roulette</li>
								<li>If they were honest: You face the roulette</li>
							</ul>
						</li>
					</ul>
				</div>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">4.</span> The{" "}
						<span className="font-bold">Death Roulette</span> - Pick a number
						and pray for luck! Choose wisely, because your life depends on it...
					</p>
					<div className="border-2 border-primary flex items-center justify-evenly p-4">
						{Array.from({ length: 6 }).map((_, index) => (
							<Button
								key={`guess-${index}`}
								type="button"
								size={isMobile ? "sm" : "default"}
								variant="outline"
								className=""
							>
								{index + 1}
							</Button>
						))}
					</div>
				</div>

				<p>
					<span className="font-semibold">5.</span> The last player standing
					claims the crown 👑 and becomes the winner of the Liar's Pub.
				</p>
			</div>
		</div>
	);
}
