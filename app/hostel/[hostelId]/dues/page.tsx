import Link from "next/link";
import DuesList from "@/components/duesList";

export default async function DuesPage({ params }: { params: Promise<{ hostelId: string }> }) {
  const { hostelId } = await params;
  const title =
    hostelId
      .split("-")
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(" ") || "Hostel";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/"
            className="button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            <span>←</span>
            Back to Hostels
          </Link>
        </div>
        <h1 className="section-title" style={{ fontSize: 28 }}>{title} — Dues</h1>
        <p className="mt-1 muted">View and manage all dues (temporarily showing all dues for debugging).</p>
      </header>

      {/* Single dues list that fetches today's and tomorrow's dues */}
      <section className="card section-pad">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">All Dues (Debug Mode)</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">💡</span> Click "Mark Paid" to update payment status or "Update Date" to change due date
          </div>
        </div>
        <div className="hr" />
        <DuesList title="" emptyText="No dues found in the database." hostelId={hostelId} />
      </section>
    </main>
  );
}
