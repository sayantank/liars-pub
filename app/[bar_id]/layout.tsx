export default function BarLayout({ children }: { children: React.ReactNode }) {
	return <div className="grow flex flex-col space-y-10">{children}</div>;
}
