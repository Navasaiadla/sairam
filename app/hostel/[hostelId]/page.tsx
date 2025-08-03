import Link from "next/link";

const tabs = [
  { slug: "add-customer", label: "Add New Customer" },
  { slug: "dues", label: "View Dues (Today & Tomorrow)" },
  { slug: "rooms", label: "View Room-wise Guests" },
  { slug: "edit-customer", label: "Edit Customer Profile" },
];

export default async function HostelDashboard({
  params,
}: {
  params: Promise<{ hostelId: string }>;
}) {
  const { hostelId } = await params;
  const prettyName =
    hostelId
      .split("-")
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(" ") || "Hostel";

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="section-title" style={{ fontSize: 28 }}>{prettyName} — Dashboard</h1>
        <p className="mt-1 muted">Choose an action for {hostelId}.</p>
      </header>

      {/* Reworked four action tiles with bright-on-white design */}
      <nav className="grid gap-6 sm:grid-cols-2">
        <Link
          href={`/hostel/${hostelId}/add-customer`}
          className="card card-green section-pad"
          style={{ minHeight: 88, display: "flex", alignItems: "center" }}
        >
          <span className="section-title">Add New Customer</span>
        </Link>

        <Link
          href={`/hostel/${hostelId}/dues`}
          className="card card-orange section-pad"
          style={{ minHeight: 88, display: "flex", alignItems: "center" }}
        >
          <span className="section-title">View Dues</span>
        </Link>

        <Link
          href={`/hostel/${hostelId}/rooms`}
          className="card card-blue section-pad"
          style={{ minHeight: 88, display: "flex", alignItems: "center" }}
        >
          <span className="section-title">View Room-wise Guests</span>
        </Link>

        <Link
          href={`/hostel/${hostelId}/edit-customer`}
          className="card card-purple section-pad"
          style={{ minHeight: 88, display: "flex", alignItems: "center" }}
        >
          <span className="section-title">Edit Customer Profile</span>
        </Link>
      </nav>

      {/* Subtle info strip */}
      <section className="mt-8 info-row section-pad rounded-xl">
        Tip: Use the tiles above to navigate to each feature. You can use the browser back button to return to this dashboard.
      </section>
    </main>
  );
}
