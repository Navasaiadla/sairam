"use client";

import Link from "next/link";
import { useState } from "react";

type HostelCardProps = {
  id: string;
  name: string;
};

export default function HostelCard({ id, name }: HostelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/hostels?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to show updated list
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to delete hostel: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete hostel. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card section-pad">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {name}
          </h3>
          <div className="text-xs text-gray-500 font-mono mt-1">
            ID: {id.substring(0, 8)}...
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="delete-btn"
          title="Delete hostel"
        >
          {isDeleting ? (
            <span className="text-sm">🗑️</span>
          ) : (
            <span className="text-lg">🗑️</span>
          )}
        </button>
      </div>
      
      <div className="space-y-3">
        <Link 
          href={`/hostel/${id}/add-customer`}
          className="button w-full text-center py-2.5 text-sm font-medium"
        >
          👤 Add Customer
        </Link>
        
        <Link 
          href={`/hostel/${id}/edit-customer`}
          className="profile-edit-btn w-full"
        >
          <span className="text-base">👤</span>
          <span>Customer Profile Edit</span>
          <span className="text-xs">→</span>
        </Link>
        
        <div className="grid grid-cols-2 gap-2">
          <Link 
            href={`/hostel/${id}/rooms`}
            className="btn-secondary text-center py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            🏠 Rooms
          </Link>
          <Link 
            href={`/hostel/${id}/dues`}
            className="btn-secondary text-center py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            💰 Dues
          </Link>
        </div>
      </div>
    </div>
  );
}
