"use client";

import { useEffect, useState } from 'react';

type Guest = {
  id?: string;
  name: string;
  phone: string;
  checkIn?: string;
};

type RoomGuestsProps = {
  rooms: {
    roomNo: string;
    guests: Guest[];
  }[];
  title?: string;
  hostelId?: string;
};

export default function RoomGuests({ rooms: initialRooms, title = "Room-wise Guests", hostelId }: RoomGuestsProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [deletingGuest, setDeletingGuest] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      if (!hostelId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/rooms?hostelId=${hostelId}`);
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, [hostelId]);

  const toggleRoomSelection = (roomNo: string) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomNo)) {
      newSelected.delete(roomNo);
    } else {
      newSelected.add(roomNo);
    }
    setSelectedRooms(newSelected);
  };

  const deleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`Are you sure you want to remove ${guestName} from this room?`)) {
      return;
    }

    setDeletingGuest(guestId);
    try {
      const response = await fetch(`/api/customers/${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      // Refresh rooms data
      const roomsResponse = await fetch(`/api/rooms?hostelId=${hostelId}`);
      if (roomsResponse.ok) {
        const updatedRooms = await roomsResponse.json();
        setRooms(updatedRooms);
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingGuest(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="rounded-xl border border-gray-200 p-4 shadow-sm dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-300">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="rounded-xl border border-red-200 p-4 shadow-sm dark:border-red-800">
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Rooms: {rooms.length}
          </div>
          {selectedRooms.size > 0 && (
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {selectedRooms.size} room{selectedRooms.size === 1 ? '' : 's'} selected
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRooms.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">{selectedRooms.size}</span> room{selectedRooms.size === 1 ? '' : 's'} selected
            </div>
            <button
              onClick={() => setSelectedRooms(new Set())}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className="card section-pad text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Rooms Found</h3>
          <p className="text-gray-600 dark:text-gray-400">No rooms have been created for this hostel yet.</p>
        </div>
             ) : (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {rooms.map((r) => (
             <div
               key={r.roomNo}
               className={`room-card rounded-xl shadow-lg border overflow-hidden cursor-pointer transition-all duration-200 ${
                 selectedRooms.has(r.roomNo)
                   ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-blue-200 dark:shadow-blue-900/30'
                   : 'border-gray-200 dark:border-gray-700 bg-transparent dark:bg-transparent'
               }`}
               onClick={() => toggleRoomSelection(r.roomNo)}
             >
              {/* Room Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="font-bold text-lg">Room {r.roomNo}</div>
                    <div className="text-blue-100 text-sm">Hostel Room</div>
                  </div>
                                     <div className="flex items-center gap-2">
                     <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                       <span className="text-white font-semibold text-sm">
                         {r.guests.length} guest{r.guests.length === 1 ? "" : "s"}
                       </span>
                     </div>
                     {selectedRooms.has(r.roomNo) && (
                       <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                         <span className="text-white text-sm">✓</span>
                       </div>
                     )}
                   </div>
                </div>
              </div>
              
              {/* Room Content */}
              <div className="p-4">
                {r.guests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🛏️</div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Empty Room</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">No guests currently</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {r.guests.map((g, idx) => (
                                             <div 
                         key={idx} 
                         className="guest-card bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700"
                         onClick={(e) => e.stopPropagation()}
                       >
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="font-bold text-black dark:text-black text-base">
                                 {g.name || 'Unknown Guest'}
                               </div>
                             </div>
                             <div className="space-y-1">
                               <div className="flex items-center gap-2 text-sm">
                                 <span className="text-gray-500 dark:text-gray-400">📞</span>
                                 <span className="text-gray-700 dark:text-gray-300 font-medium">{g.phone || 'No phone'}</span>
                               </div>
                               {g.checkIn && (
                                 <div className="flex items-center gap-2 text-sm">
                                   <span className="text-gray-500 dark:text-gray-400">📅</span>
                                   <span className="text-gray-600 dark:text-gray-400">
                                     Check-in: {g.checkIn}
                                   </span>
                                 </div>
                               )}
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                               Active
                             </div>
                             {g.id && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   deleteGuest(g.id!, g.name);
                                 }}
                                 disabled={deletingGuest === g.id}
                                 className="delete-btn bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 p-1 rounded-full transition-colors"
                                 title="Remove guest from room"
                               >
                                 {deletingGuest === g.id ? (
                                   <span className="text-xs">⋯</span>
                                 ) : (
                                   <span className="text-xs">×</span>
                                 )}
                               </button>
                             )}
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Room Footer */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Room Status</span>
                  <span className={`font-medium ${r.guests.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {r.guests.length > 0 ? 'Occupied' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
