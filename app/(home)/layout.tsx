export default function HomeLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="h-full flex flex-col items-center justify-center space-y-4">
			{children}
		</div>
	);
}
