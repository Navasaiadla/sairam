import Link from 'next/link';
import sql from '@/lib/db';
import HostelCard from '@/components/hostelCard';

export default async function HomePage() {
  // Get all hostels
  let hostels: any[] = [];
  
  try {
    if (sql) {
      hostels = await sql`
        SELECT id, name
        FROM hostels
        ORDER BY name ASC
      `;
    }
  } catch (error) {
    console.error('Database error:', error);
    // If database is not configured, show empty state
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="card section-pad" style={{ paddingBottom: 0 }}>
        <div className="header-gradient" style={{ borderRadius: 12, padding: "10px 14px" }}>
          <h1 className="section-title" style={{ color: "#fff" }}>
            <span className="mr-2">🏠</span> Hostel Management System
          </h1>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Select a hostel to manage customers, rooms, and dues.
        </p>
      </div>

      {/* Hostels List */}
      <div className="mt-6">
        {hostels.length === 0 ? (
          <div className="card section-pad text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-xl font-semibold mb-2">No Hostels Found</h2>
            <p className="text-gray-600 mb-4">
              No hostels have been created yet. Create your first hostel to get started.
            </p>
            <Link 
              href="/create-hostel"
              className="button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
            >
              <span>➕</span>
              Create First Hostel
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Available Hostels ({hostels.length})
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hostels.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  id={hostel.id}
                  name={hostel.name}
                />
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link 
                href="/create-hostel"
                className="button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
              >
                <span>➕</span>
                Create New Hostel
              </Link>
            </div>
          </>
        )}
      </div>


    </main>
  );
}
