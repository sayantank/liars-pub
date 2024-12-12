import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import AppProviders from "./providers";
import { auth } from "@/auth";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased font-mono`}
			>
				<AppProviders session={session}>
					<main className="relative h-screen w-full max-w-xl sm:border-x-2 shadow-lg border-x-primary mx-auto p-4 flex flex-col">
						{children}
					</main>
				</AppProviders>
			</body>
		</html>
	);
}
