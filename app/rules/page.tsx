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
			<div className="flex w-full items-center justify-between">
				<h1 className="text-xl font-bold">How to play?</h1>
				<button
					type="button"
					className="hover:underline text-gray-500"
					onClick={() => router.back()}
				>
					Go back
				</button>
			</div>
			<p>
				Liar's Pub is a card game that focuses on playing cards and deception.
				Players can play cards face down and are allowed to make false
				statements about the cards they've played. The core of the game lies in
				the psychological warfare between players and judging whether opponents
				are lying.
			</p>
			<div className="space-y-6">
				<h2 className="text-lg font-medium underline">Game Setting</h2>
				<div>
					<p>
						The game starts with a deck of cards containing{" "}
						<span className="font-semibold">20 cards</span>, consisting of,
					</p>
					<div className="flex items-center space-x-4 justify-center my-6">
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Ace} />
							<p>x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.King} />
							<p>x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Queen} />
							<p>x 6</p>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<PixelCard height={84} width={60} type={CardType.Joker} />
							<p>x 2</p>
						</div>
					</div>
					<p>
						Each player starts with <span className="font-semibold">5</span>{" "}
						randomly selected cards from the deck.
					</p>
				</div>
				<p>
					And <span className="font-semibold">Jokers</span> can substitute for
					any other type of card.
				</p>
			</div>
			<div className="space-y-6">
				<h2 className="text-lg font-medium underline">Gameplay</h2>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">1.</span> At the beginning of each
						round, the game assigns the "liar's card" type for the round.
					</p>
					<div className="h-8 sm:h-10 border-2 border-primary flex items-center justify-between px-4">
						<h1 className="text-xs sm:text-sm">Ace's Table</h1>
					</div>
				</div>

				<p>
					<span className="font-semibold">2.</span> Players take turns playing
					cards, 1-3 cards each time. For example, throw out{" "}
					<span className="font-semibold">2 cards</span> means the player claims
					to have played <span className="font-semibold">2 Aces</span>
				</p>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">3.</span> The next player can choose
						to:
					</p>
					<ul className="list-disc pl-8 space-y-2">
						<li>
							Believe the previous player's statement and play their own cards
						</li>
						<li>
							Challenge the previous player's play (Call Liar!), indicating "I
							don't believe you just played{" "}
							<span className="font-semibold">2 Aces</span>". Then the system
							reveals the pile to verify.
							<ul className="list-disc pl-8 space-y-2 mt-2">
								<li>
									If the previous player didn't play 2 cards (e.g.,{" "}
									<span className="font-semibold">0 Aces</span>), the challenge
									is successful, and the previous player undergoes a death
									roulette judgment;
								</li>
								<li>
									If the previous player indeed played{" "}
									<span className="font-semibold">2 Aces</span> (including
									Jokers), the challenge fails, and the challenging player
									undergoes a death roulette judgment;
								</li>
							</ul>
						</li>
					</ul>
				</div>

				<div className="space-y-2">
					<p>
						<span className="font-semibold">4.</span> Death roulette judgment
						means firing the gun at oneself. We simulate this by making the
						player choose a number from 1 to the number of lives left.
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
					<span className="font-semibold">5.</span> The game continues until
					only one player remains, who becomes the winner.
				</p>
			</div>
		</div>
	);
}
