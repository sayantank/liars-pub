import { Card, CardType } from "@/app/types";
import type React from "react";

interface PixelCardProps {
	width?: number;
	height?: number;
	backgroundColor?: string;
	foregroundColor?: string;
	type: CardType | "back";
}

const foregrounColorMap = {
	[CardType.Ace]: "#ff0000",
	[CardType.King]: "#ff0000",
	[CardType.Queen]: "#ff0000",
	[CardType.Joker]: "black",
	back: "black",
};

const PixelCard: React.FC<PixelCardProps> = ({
	width = 100,
	height = 140,
	backgroundColor = "#FAFAFA",
	type,
}) => {
	const pixelSize = width / 30;
	const foregroundColor = foregrounColorMap[type];
	const borderColor = "black";

	const smallLetter = {
		[CardType.Ace]: [
			[0, 1, 1, 0, 0],
			[1, 0, 0, 1, 0],
			[1, 1, 1, 1, 0],
			[1, 0, 0, 1, 0],
			[1, 0, 0, 1, 0],
		],
		[CardType.King]: [
			[1, 0, 0, 1, 0],
			[1, 0, 1, 0, 0],
			[1, 1, 0, 0, 0],
			[1, 0, 1, 0, 0],
			[1, 0, 0, 1, 0],
		],
		[CardType.Queen]: [
			[0, 1, 1, 0, 0],
			[1, 0, 0, 1, 0],
			[1, 0, 0, 1, 0],
			[1, 0, 1, 1, 0],
			[0, 1, 1, 1, 0],
		],
		[CardType.Joker]: [
			[0, 1, 1, 1, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[1, 0, 1, 0, 0],
			[0, 1, 0, 0, 0],
		],
	};

	const bigLetter = {
		[CardType.Ace]: [
			[0, 0, 1, 1, 1, 0, 0],
			[0, 1, 0, 0, 0, 1, 0],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 1],
		],
		[CardType.King]: [
			[1, 0, 0, 0, 0, 1, 0],
			[1, 0, 0, 0, 1, 0, 0],
			[1, 0, 0, 1, 0, 0, 0],
			[1, 1, 1, 0, 0, 0, 0],
			[1, 0, 0, 1, 0, 0, 0],
			[1, 0, 0, 0, 1, 0, 0],
			[1, 0, 0, 0, 0, 1, 0],
		],
		[CardType.Queen]: [
			[0, 0, 1, 1, 1, 0, 0],
			[0, 1, 0, 0, 0, 1, 0],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 1, 0, 1],
			[0, 1, 0, 0, 0, 1, 0],
			[0, 0, 1, 1, 1, 0, 1],
		],
		[CardType.Joker]: [
			[0, 1, 1, 1, 1, 1, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[1, 0, 0, 1, 0, 0, 0],
			[1, 0, 0, 1, 0, 0, 0],
			[0, 1, 1, 0, 0, 0, 0],
		],
	};

	const renderPixels = (
		matrix: number[][],
		x: number,
		y: number,
		size: number,
	) => {
		return matrix.flatMap((row, i) =>
			row.map((pixel, j) =>
				pixel ? (
					<rect
						key={`${i}-${j}`}
						x={x + j * size}
						y={y + i * size}
						width={size}
						height={size}
						fill={foregroundColor}
					/>
				) : null,
			),
		);
	};

	const renderBorder = () => {
		const borderPixels = [];
		const horizontalPixels = Math.floor(width / pixelSize);
		const verticalPixels = Math.floor(height / pixelSize);

		// Update fill color to use actualBorderColor
		for (let i = 0; i < horizontalPixels; i++) {
			borderPixels.push(
				<rect
					key={`top-${i}`}
					x={i * pixelSize}
					y={0}
					width={pixelSize}
					height={pixelSize}
					fill={borderColor}
				/>,
			);
			borderPixels.push(
				<rect
					key={`bottom-${i}`}
					x={i * pixelSize}
					y={height - pixelSize}
					width={pixelSize}
					height={pixelSize}
					fill={borderColor}
				/>,
			);
		}

		for (let i = 1; i < verticalPixels - 1; i++) {
			borderPixels.push(
				<rect
					key={`left-${i}`}
					x={0}
					y={i * pixelSize}
					width={pixelSize}
					height={pixelSize}
					fill={borderColor}
				/>,
			);
			borderPixels.push(
				<rect
					key={`right-${i}`}
					x={width - pixelSize}
					y={i * pixelSize}
					width={pixelSize}
					height={pixelSize}
					fill={borderColor}
				/>,
			);
		}

		return borderPixels;
	};

	const renderBackPattern = () => {
		const pattern = [];
		const padding = 3; // Number of pixels padding from border
		const checkerSize = pixelSize * 1; // Increased from pixelSize to pixelSize * 1.5
		const horizontalPixels = Math.floor(
			(width - padding * 2 * pixelSize) / checkerSize,
		);
		const verticalPixels = Math.floor(
			(height - padding * 2 * pixelSize) / checkerSize,
		);

		for (let i = 0; i < verticalPixels; i++) {
			for (let j = 0; j < horizontalPixels; j++) {
				if ((i + j) % 2 === 0) {
					pattern.push(
						<rect
							key={`checker-${i}-${j}`}
							x={padding * pixelSize + j * checkerSize}
							y={padding * pixelSize + i * checkerSize}
							width={checkerSize}
							height={checkerSize}
							fill={foregroundColor}
						/>,
					);
				}
			}
		}
		return pattern;
	};

	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
			<rect
				width={width}
				height={height}
				fill={backgroundColor}
				rx={10}
				ry={10}
			/>

			{/* Add border */}
			{renderBorder()}

			{/* Render either the letters or the back pattern */}
			{type === "back" ? (
				renderBackPattern()
			) : (
				<>
					{/* Top left letter */}
					{renderPixels(
						smallLetter[type],
						pixelSize * 2,
						pixelSize * 2,
						pixelSize,
					)}

					{/* Bottom right letter */}
					{renderPixels(
						smallLetter[type],
						width - pixelSize * 7,
						height - pixelSize * 7,
						pixelSize,
					)}

					{/* Center big letter */}
					{renderPixels(
						bigLetter[type],
						(width - bigLetter[type][0].length * pixelSize * 2) / 2,
						(height - bigLetter[type].length * pixelSize * 2) / 2,
						pixelSize * 2,
					)}
				</>
			)}
		</svg>
	);
};

export default PixelCard;
