"use client";

import { useState, FormEvent, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  fatherPhone?: string;
  college?: string;
  course?: string;
  checkinDate?: string;
  room: string;
  dueDate?: string;
};

type EditFormProps = {
  initial?: Customer;
  onSaved?: (customer: Customer) => void;
};

export default function EditForm({ initial, onSaved }: EditFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [fatherPhone, setFatherPhone] = useState(initial?.fatherPhone ?? "");
  const [college, setCollege] = useState(initial?.college ?? "");
  const [course, setCourse] = useState(initial?.course ?? "");
  const [checkinDate, setCheckinDate] = useState(initial?.checkinDate ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setPhone(initial.phone);
      setFatherPhone(initial.fatherPhone ?? "");
      setCollege(initial.college ?? "");
      setCourse(initial.course ?? "");
      setCheckinDate(initial.checkinDate ?? "");
      setRoom(initial.room);
      setDueDate(initial.dueDate ?? "");
    }
  }, [initial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/customers/${initial?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          fatherPhone,
          college,
          course,
          checkinDate,
          room,
          dueDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const updated: Customer = {
        id: initial?.id ?? "temp-id",
        name,
        phone,
        fatherPhone,
        college,
        course,
        checkinDate,
        room,
        dueDate,
      };
      
      onSaved?.(updated);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card section-pad"
    >
      {/* Personal Information */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🧑‍💼</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Personal Information
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone"
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Father's Number
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={fatherPhone}
              onChange={(e) => setFatherPhone(e.target.value)}
              placeholder="Father's phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Check-in Date *
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={checkinDate}
              onChange={(e) => setCheckinDate(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      {/* Academic Information */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Academic Information
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              College *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="College name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course name"
              required
            />
          </div>
        </div>
      </section>

      {/* Accommodation Details */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🏠</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Accommodation Details
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Number *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., A-101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          <span>💾</span>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
