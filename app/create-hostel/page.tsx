"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateHostelPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/hostels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create hostel');
      }

      const result = await response.json();
      console.log('Hostel created successfully:', result);
      
      // Redirect to the new hostel's dashboard
      router.push(`/hostel/${result.hostel.id}`);
    } catch (error) {
      console.error('Error creating hostel:', error);
      alert('Failed to create hostel: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header */}
      <div className="card section-pad" style={{ paddingBottom: 0 }}>
        <div className="header-gradient" style={{ borderRadius: 12, padding: "10px 14px" }}>
          <h1 className="section-title" style={{ color: "#fff" }}>
            <span className="mr-2">🏠</span> Create New Hostel
          </h1>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Create a new hostel to start managing customers, rooms, and dues.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card section-pad mt-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hostel Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter hostel name (e.g., ABC Hostel, Student Residence)"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="btn-secondary px-4 py-2 text-sm font-medium text-center"
          >
            ← Back to Home
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            <span>🏠</span>
            {loading ? "Creating..." : "Create Hostel"}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-6 card section-pad">
        <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✅ A new hostel will be created with a unique ID</p>
          <p>✅ You'll be redirected to the hostel dashboard</p>
          <p>✅ You can start adding customers and managing rooms</p>
          <p>✅ The hostel will appear on the homepage for easy access</p>
        </div>
      </div>
    </main>
  );
} 