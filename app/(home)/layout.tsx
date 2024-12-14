export default function HomeLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="relative h-full flex flex-col items-center justify-center">
			{children}
		</div>
	);
}
