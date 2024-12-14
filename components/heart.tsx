import type React from "react";

interface PixelHeartProps {
	size: number;
	pixelSize?: number;
	color?: string;
}

const PixelHeart: React.FC<PixelHeartProps> = ({
	size,
	pixelSize = 1,
	color = "#FF0000",
}) => {
	const heartShape = [
		[0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
		[0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
		[0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
		[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	];

	const width = heartShape[0].length * pixelSize;
	const height = heartShape.length * pixelSize;
	const scale = size / Math.max(width, height);

	return (
		<svg
			width={width * scale}
			height={height * scale}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Heart</title>
			{heartShape.map((row, y) =>
				row.map((pixel, x) =>
					pixel === 1 ? (
						<rect
							key={`${x}-${y}`}
							x={x * pixelSize}
							y={y * pixelSize}
							width={pixelSize}
							height={pixelSize}
							fill={color}
						/>
					) : null,
				),
			)}
		</svg>
	);
};

export default PixelHeart;
