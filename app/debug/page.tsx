"use client";

import { useState } from 'react';

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initResult, setInitResult] = useState<any>(null);

  async function testConnection() {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Failed to test connection', details: error });
    } finally {
      setLoading(false);
    }
  }

  async function initializeDatabase() {
    setLoading(true);
    try {
      const response = await fetch('/api/test', { method: 'POST' });
      const data = await response.json();
      setInitResult(data);
    } catch (error) {
      setInitResult({ error: 'Failed to initialize database', details: error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Database Connection Test</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Initialize Database</h2>
          <button
            onClick={initializeDatabase}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Initialize Database'}
          </button>
          
          {initResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(initResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold mb-4 text-yellow-800">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Make sure you have created a <code>.env.local</code> file with your <code>DATABASE_URL</code></li>
            <li>Ensure your Neon database is active and accessible</li>
            <li>Check that your connection string is correct</li>
            <li>Run the database setup script: <code>node scripts/setup-database.js</code></li>
            <li>Check the browser console and server logs for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 