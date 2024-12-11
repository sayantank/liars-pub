export default async function BarPage({
	params,
}: {
	params: Promise<{ bar_id: string }>;
}) {
	const barId = (await params).bar_id;

	return <div>Bar {barId}</div>;
}
