"use client";

import { useEffect, useState } from 'react';

type DebugInfo = {
  customers: any[];
  dues: any[];
  hostels: any[];
  rooms: any[];
  error?: string;
};

export default function DebugDuePage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // Fetch all data for debugging
        const [customersRes, duesRes, hostelsRes, roomsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/dues'),
          fetch('/api/hostels'),
          fetch('/api/rooms')
        ]);

        const customers = customersRes.ok ? await customersRes.json() : [];
        const dues = duesRes.ok ? await duesRes.json() : [];
        const hostels = hostelsRes.ok ? await hostelsRes.json() : [];
        const rooms = roomsRes.ok ? await roomsRes.json() : [];

        setDebugInfo({ customers, dues, hostels, rooms });
      } catch (error) {
        setDebugInfo({ 
          customers: [], 
          dues: [], 
          hostels: [], 
          rooms: [], 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  const createTestDue = async () => {
    if (!debugInfo?.customers.length) {
      alert('No customers found to create due for');
      return;
    }

    const customer = debugInfo.customers[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    try {
      const response = await fetch('/api/create-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          amount: 5000,
          dueDate: tomorrow
        })
      });

      if (response.ok) {
        alert('Test due created successfully!');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to create due: ${error.error}`);
      }
    } catch (error) {
      alert(`Error creating due: ${error}`);
    }
  };

  const createTestData = async () => {
    try {
      const response = await fetch('/api/create-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.ok) {
        if (result.existingData) {
          alert('Test data already exists!');
        } else {
          alert(`Test data created successfully!\nHostel: ${result.hostel.name}\nHostel ID: ${result.hostel.id}`);
        }
        window.location.reload();
      } else {
        alert(`Failed to create test data: ${result.error}`);
      }
    } catch (error) {
      alert(`Error creating test data: ${error}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading debug info...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Due Information</h1>
      
      {debugInfo?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {debugInfo.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hostels */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Hostels ({debugInfo?.hostels.length || 0})</h2>
          {debugInfo?.hostels.map((hostel: any) => (
            <div key={hostel.id} className="border-b py-2">
              <div><strong>ID:</strong> {hostel.id}</div>
              <div><strong>Name:</strong> {hostel.name}</div>
            </div>
          ))}
        </div>

        {/* Customers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Customers ({debugInfo?.customers.length || 0})</h2>
          {debugInfo?.customers.map((customer: any) => (
            <div key={customer.id} className="border-b py-2">
              <div><strong>ID:</strong> {customer.id}</div>
              <div><strong>Name:</strong> {customer.name}</div>
              <div><strong>Hostel ID:</strong> {customer.hostel_id}</div>
              <div><strong>Room ID:</strong> {customer.room_id || 'None'}</div>
            </div>
          ))}
        </div>

        {/* Rooms */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Rooms ({debugInfo?.rooms.length || 0})</h2>
          {debugInfo?.rooms.map((room: any) => (
            <div key={room.id} className="border-b py-2">
              <div><strong>ID:</strong> {room.id}</div>
              <div><strong>Room:</strong> {room.room_number}</div>
              <div><strong>Hostel ID:</strong> {room.hostel_id}</div>
            </div>
          ))}
        </div>

        {/* Dues */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Dues ({debugInfo?.dues.length || 0})</h2>
          {debugInfo?.dues.length === 0 ? (
            <div className="text-gray-500">No dues found</div>
          ) : (
            debugInfo?.dues.map((due: any) => (
              <div key={due.id} className="border-b py-2">
                <div><strong>ID:</strong> {due.id}</div>
                <div><strong>Customer:</strong> {due.name}</div>
                <div><strong>Amount:</strong> ₹{due.amount}</div>
                <div><strong>Due Date:</strong> {due.dueDate}</div>
                <div><strong>Paid:</strong> {due.paid ? 'Yes' : 'No'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Actions */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Test Actions</h2>
        <div className="space-y-2">
          <button
            onClick={createTestData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
          >
            Create Complete Test Data
          </button>
          <button
            onClick={createTestDue}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Test Due
          </button>
        </div>
      </div>

      {/* Test API Calls */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Test API Calls</h2>
        <div className="space-y-2">
          <a 
            href="/api/test-dues" 
            target="_blank" 
            className="block text-blue-500 hover:underline"
          >
            Test Dues API (opens in new tab)
          </a>
          <a 
            href="/api/dues" 
            target="_blank" 
            className="block text-blue-500 hover:underline"
          >
            Dues API (opens in new tab)
          </a>
        </div>
      </div>
    </div>
  );
} 