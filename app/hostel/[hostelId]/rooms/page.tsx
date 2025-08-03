import Link from "next/link";
import RoomGuests from "@/components/roomGuests";

export default async function RoomsPage({ params }: { params: Promise<{ hostelId: string }> }) {
  const { hostelId } = await params;
  const title =
    hostelId
      .split("-")
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(" ") || "Hostel";

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/"
            className="button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            <span>←</span>
            Back to Hostels
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🏠</div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <p className="text-blue-100 text-lg">Room-wise Guests Overview</p>
          <p className="text-blue-200 text-sm mt-1">Manage and view all rooms and their current occupants</p>
        </div>
      </header>

      <RoomGuests rooms={[]} hostelId={hostelId} />
    </main>
  );
}
