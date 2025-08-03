"use client";

import { useEffect, useState } from 'react';

type DueItem = {
  id: string;
  name: string;
  room: string;
  amount: number;
  dueDate: string;
  paid: boolean;
};

type DuesListProps = {
  title?: string;
  emptyText?: string;
  hostelId?: string;
};

export default function DuesList({ title = "Dues", emptyText = "No dues.", hostelId }: DuesListProps) {
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDues() {
      if (!hostelId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/dues?hostelId=${hostelId}`);
        if (!response.ok) throw new Error('Failed to fetch dues');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dues');
        console.error('Error fetching dues:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDues();
  }, [hostelId]);

  const handleMarkAsPaid = async (dueId: string) => {
    setUpdating(dueId);
    try {
      const response = await fetch('/api/dues', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dueId,
          paid: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as paid');
      }

      // Refresh the dues list
      const updatedResponse = await fetch(`/api/dues?hostelId=${hostelId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setItems(updatedData);
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Failed to mark as paid');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateDueDate = async (dueId: string, newDueDate: string) => {
    setUpdating(dueId);
    try {
      const response = await fetch('/api/dues', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dueId,
          dueDate: newDueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update due date');
      }

      // Refresh the dues list
      const updatedResponse = await fetch(`/api/dues?hostelId=${hostelId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setItems(updatedData);
      }
    } catch (err) {
      console.error('Error updating due date:', err);
      alert('Failed to update due date');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-4 shadow-sm dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-300">Loading dues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 p-4 shadow-sm dark:border-red-800">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="card section-pad">
      {title && (
        <div className="border-b border-gray-300 p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Dues Due</p>
            <p className="text-gray-600 dark:text-gray-400">{emptyText}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className={`bg-white dark:bg-gray-800 border rounded-lg p-4 transition-all duration-200 ${
              item.paid 
                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
                      {item.name}
                      {item.paid && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                          PAID
                        </span>
                      )}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">Room: {item.room}</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">₹{item.amount}</div>
                    <div className="text-gray-600 dark:text-gray-400">Due: {item.dueDate}</div>
                  </div>
                </div>
                
                {!item.paid && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleMarkAsPaid(item.id)}
                      disabled={updating === item.id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {updating === item.id ? 'Updating...' : 'Mark Paid'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const newDate = prompt('Enter new due date (YYYY-MM-DD):', item.dueDate);
                        if (newDate && newDate !== item.dueDate) {
                          handleUpdateDueDate(item.id, newDate);
                        }
                      }}
                      disabled={updating === item.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {updating === item.id ? 'Updating...' : 'Update Date'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
