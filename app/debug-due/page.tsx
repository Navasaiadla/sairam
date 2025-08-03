'use client';

import { useState } from 'react';

export default function DebugDuePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hostelId, setHostelId] = useState('');

  const debugCustomer = async () => {
    if (!hostelId) {
      alert('Please enter a hostel ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/debug-customer?hostelId=${encodeURIComponent(hostelId)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to debug customer', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Debug Customer & Dues
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Hostel ID:
            </label>
            <input
              type="text"
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
              placeholder="Enter your hostel ID"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <button
            onClick={debugCustomer}
            disabled={loading || !hostelId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Debugging...' : 'Debug Customer & Dues'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">Debug Results:</h3>
            <pre className="text-sm overflow-auto bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 