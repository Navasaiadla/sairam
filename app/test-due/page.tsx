'use client';

import { useState } from 'react';

export default function TestDuePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createDue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: '619739da-455d-46cd-87d2-c5dedf1ab86c', // shive's customer ID
          amount: 5000.00,
          dueDate: '2025-01-15' // Set a due date for testing
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create due', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Test Due Creation
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This will create a due for customer "shive" (ID: 619739da-455d-46cd-87d2-c5dedf1ab86c)
          </p>
          
          <button
            onClick={createDue}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating Due...' : 'Create Test Due'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 