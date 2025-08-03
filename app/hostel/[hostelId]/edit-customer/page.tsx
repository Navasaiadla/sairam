"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EditForm from "@/components/editForm";

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

export default function EditCustomerPage({ params }: { params: Promise<{ hostelId: string }> }) {
  const [hostelId, setHostelId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  useEffect(() => {
    params.then(({ hostelId }) => setHostelId(hostelId));
  }, [params]);

  const title =
    hostelId
      .split("-")
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(" ") || "Hostel";

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/customers?hostelId=${hostelId}&search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomers([]); // Clear search results
    setSearchQuery(""); // Clear search input
  };

  const handleSaved = async (updated: Customer) => {
    setSelectedCustomer(updated);
    alert("Customer updated successfully!");
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
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

      <header className="mb-6">
        <h1 className="section-title" style={{ fontSize: 28 }}>
          {title} — Customer Profile Edit
        </h1>
        <p className="mt-1 muted">
          Search for customers and edit their profiles.
        </p>
      </header>

      {/* Search Section */}
      <div className="card section-pad mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Customers</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Enter customer name or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 sm:col-span-2"
          />
          <button 
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="button text-center py-2 text-sm font-medium disabled:opacity-60"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search Results */}
        {customers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Search Results:</h3>
            <div className="space-y-2">
              {customers.map((customer) => (
                <div 
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Room {customer.room}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Click to edit</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Customer Profile */}
      {selectedCustomer && (
        <div className="card section-pad">
          <h2 className="text-lg font-semibold mb-4">Edit Customer Profile</h2>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Room</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.room}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Check-in Date</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.checkinDate || 'Not set'}</div>
              </div>
            </div>
          </div>
          <EditForm initial={selectedCustomer} onSaved={handleSaved} />
        </div>
      )}

      {/* No customer selected */}
      {!selectedCustomer && customers.length === 0 && (
        <div className="card section-pad text-center">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-semibold mb-2">No Customer Selected</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Use the search bar above to find and select a customer to edit.
          </p>
        </div>
      )}
    </main>
  );
}
