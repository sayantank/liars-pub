import PixelCard from "@/components/card";
import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/,
	);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status === 200) {
			return await response.arrayBuffer();
		}
	}

	throw new Error("failed to load font data");
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ bar_id: string }> },
) {
	try {
		const { bar_id } = await params;
		const { searchParams } = new URL(request.url);

		// ?title=<title>
		const hasFrom = searchParams.has("from");
		const fromNickname = hasFrom
			? searchParams.get("from")?.slice(0, 100)
			: null;

		const liarsPub = "Liar's Pub";

		const joinMessage = hasFrom
			? `${fromNickname} is inviting you to join their pub`
			: "";

		return new ImageResponse(
			<div tw="flex flex-col w-full h-full items-center justify-center bg-white">
				<div tw="flex">
					<div tw="flex">
						<PixelCard type={"back"} height={175} width={125} />
					</div>
					<div tw="flex -ml-10 top-0">
						<PixelCard type={"back"} height={175} width={125} />
					</div>
					<div tw="flex -ml-10 top-0">
						<PixelCard type={"back"} height={175} width={125} />
					</div>
				</div>
				<h1 tw="text-3xl mb-0 mt-6">{liarsPub}</h1>
				<h2 tw="text-9xl mt-4 ">{bar_id}</h2>
				<p tw="text-3xl mt-4">{joinMessage}</p>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Geist Mono",
						data: await loadGoogleFont("Geist Mono", bar_id),
						style: "normal",
					},
					{
						name: "Geist Mono2",
						data: await loadGoogleFont("Geist Mono", liarsPub),
						style: "normal",
					},
					{
						name: "Geist Mono3",
						data: await loadGoogleFont("Geist Mono", joinMessage),
						style: "normal",
					},
				],
			},
		);
	} catch (e) {
		return new Response("Failed to generate the image", {
			status: 500,
		});
	}
}
