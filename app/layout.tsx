import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Liar's Pub",
	description: "A browser-based card game for friends.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<link rel="icon" href="/favicon.ico" sizes="any" />
			<link
				rel="apple-touch-icon"
				href="/apple-icon?<generated>"
				type="image/<generated>"
				sizes="<generated>"
			/>
			<link
				rel="icon"
				href="/icon?<generated>"
				type="image/<generated>"
				sizes="<generated>"
			/>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased font-mono`}
			>
				<main className="relative h-screen w-full max-w-xl sm:border-x-2 shadow-lg border-x-primary mx-auto p-4 flex flex-col">
					{children}
				</main>
				<SpeedInsights />
				<Toaster position="top-center" />
			</body>
		</html>
	);
}
