"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";

export default function AddCustomerPage({ params }: { params: Promise<{ hostelId: string }> }) {
  const [hostelId, setHostelId] = useState<string>("");
  
  useEffect(() => {
    params.then(({ hostelId }) => setHostelId(hostelId));
  }, [params]);
  const pretty =
    (hostelId &&
      hostelId
        .split("-")
        .map((s) => s[0]?.toUpperCase() + s.slice(1))
        .join(" ")) ||
    "Hostel";

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [checkinDate, setCheckinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    // Set default due date to 30 days from today
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  });
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  function clearForm() {
    setFullName("");
    setPhone("");
    setFatherPhone("");
    setCollege("");
    setCourse("");
    setRoom("");
    setCheckinDate(new Date().toISOString().slice(0, 10));
    setDueDate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString().slice(0, 10);
    });
  }

  async function testConnection() {
    try {
      const response = await fetch(`/api/test-customer?hostelId=${hostelId}`);
      const data = await response.json();
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (error) {
      setDebugInfo('Error testing connection: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting customer data:', {
        name: fullName,
        phone,
        fatherPhone,
        college,
        course,
        checkinDate,
        dueDate,
        roomNo: room,
        hostelId,
      });

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          fatherPhone,
          college,
          course,
          checkinDate,
          dueDate,
          checkoutDate: null,
          roomNo: room,
          hostelId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to create customer');
      }

      console.log('Customer created successfully:', responseData);
      alert('Customer created successfully!');
      clearForm();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Back button */}
      <div className="mb-4">
        <Link 
          href="/"
          className="button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
        >
          <span>←</span>
          Back to Hostels
        </Link>
      </div>

      {/* Clean white header and colored box only inside title strip */}
      <div className="card section-pad" style={{ paddingBottom: 0 }}>
        <div className="header-gradient" style={{ borderRadius: 12, padding: "10px 14px" }}>
          <h1 className="section-title" style={{ color: "#fff" }}>
            <span className="mr-2">👤</span> Add New Customer
          </h1>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Fill the form below to add a customer to <span className="font-semibold">{pretty}</span>.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="card section-pad mt-4"
      >
        {/* Personal Information */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🧑‍💼</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">
                Full Name *
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Phone Number *
              </label>
              <input
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Father's Number
              </label>
              <input
                value={fatherPhone}
                onChange={(e) => setFatherPhone(e.target.value)}
                placeholder="Enter father's number"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Academic Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">
                College *
              </label>
              <input
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Enter college name"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Course *
              </label>
              <input
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Enter course name"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
          </div>
        </section>

                 {/* Accommodation Details */}
         <section className="mb-8">
           <div className="mb-3 flex items-center gap-2">
             <span className="text-lg">🏠</span>
             <h2 className="text-lg font-semibold">
               Accommodation Details
             </h2>
           </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Room Number *
              </label>
              <input
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room number"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500/20 focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
          </div>
        </section>

        {/* Footer actions like screenshot */}
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hostel: <span className="font-medium">{pretty}</span> ({hostelId})
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={testConnection}
              className="btn-secondary px-4 py-2 text-sm font-medium"
            >
              Test Connection
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="btn-secondary px-4 py-2 text-sm font-medium"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              <span>👤</span>
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <pre className="text-xs overflow-auto">{debugInfo}</pre>
          </div>
        )}
      </form>
    </main>
  );
}
