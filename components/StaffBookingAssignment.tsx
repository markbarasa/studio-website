// components/StaffBookingAssignment.tsx
"use client";

import { useState, useEffect, useMemo } from "react";

type StaffMember = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  color: string;
  status: string;
  skills: string[];
};

type Booking = {
  id: number;
  name: string;
  phone: string;
  service: string;
  package: string;
  date: string;
  status: string;
  venue?: string;
  assignedStaff?: number[];
};

type StaffBookingAssignmentProps = {
  staff: StaffMember[];
  onAssign: (staffId: number, bookingIds: number[]) => void;
};

export default function StaffBookingAssignment({ staff, onAssign }: StaffBookingAssignmentProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Role icons
  const roleIcons: Record<string, string> = {
    lead_photographer: "📸",
    photographer: "📷",
    lead_videographer: "🎥",
    videographer: "🎬",
    drone_operator: "🛸",
    editor: "✂️",
    assistant: "🤝",
    lighting_tech: "💡",
    audio_tech: "🎤",
    director: "🎯",
    other: "👤",
  };

  // Load bookings
  useEffect(() => {
    const stored = localStorage.getItem("bookings");
    if (stored) {
      try {
        const allBookings = JSON.parse(stored);
        setBookings(allBookings.filter((b: Booking) => b.status !== "cancelled"));
      } catch {}
    }
  }, []);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.service.toLowerCase().includes(term) ||
        b.phone.includes(term)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(b => b.date === dateFilter);
    }

    // Sort by date (upcoming first)
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings, searchTerm, dateFilter]);

  // Get staff assignments for a booking
  const getAssignedStaff = (booking: Booking) => {
    if (!booking.assignedStaff) return [];
    return staff.filter(s => booking.assignedStaff!.includes(s.id));
  };

  // Toggle staff assignment
  const toggleAssignment = (bookingId: number) => {
    if (!selectedStaff) return;

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        const currentStaff = b.assignedStaff || [];
        const newAssignedStaff = currentStaff.includes(selectedStaff.id)
          ? currentStaff.filter(id => id !== selectedStaff.id)
          : [...currentStaff, selectedStaff.id];
        return { ...b, assignedStaff: newAssignedStaff };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    // Call parent callback
    const booking = updatedBookings.find(b => b.id === bookingId);
    if (booking) {
      onAssign(selectedStaff.id, booking.assignedStaff || []);
    }
  };

  // Get unique dates for filter
  const upcomingDates = useMemo(() => {
    const dates = [...new Set(bookings.map(b => b.date))];
    return dates.sort().slice(0, 30); // Next 30 dates
  }, [bookings]);

  // Staff workload stats
  const staffWorkload = useMemo(() => {
    return staff.map(s => ({
      ...s,
      assignedBookings: bookings.filter(b => (b.assignedStaff || []).includes(s.id)).length,
      upcomingBookings: bookings.filter(b => 
        (b.assignedStaff || []).includes(s.id) && new Date(b.date) >= new Date()
      ).length,
    }));
  }, [staff, bookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-900/50 text-blue-400";
      case "completed": return "bg-green-900/50 text-green-400";
      case "pending": return "bg-yellow-900/50 text-yellow-400";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  const isDatePast = (date: string) => new Date(date) < new Date(new Date().toDateString());

  return (
    <div className="space-y-6">
      {/* Staff Selection */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          👤 Select Staff Member to Assign
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {staff.filter(s => s.status !== "off").map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedStaff(selectedStaff?.id === member.id ? null : member)}
              className={`flex items-center gap-2 p-3 rounded-lg text-left text-sm transition ${
                selectedStaff?.id === member.id
                  ? "bg-white text-black"
                  : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: member.color + "30", color: member.color }}
              >
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{member.firstName}</p>
                <p className="text-xs truncate opacity-70">{roleIcons[member.role] || "👤"} {member.role.replace("_", " ")}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Workload Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          📊 Staff Workload
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {staffWorkload.map(s => (
            <div key={s.id} className="bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: s.color + "30", color: s.color }}
                >
                  {s.firstName[0]}
                </div>
                <p className="text-sm font-medium truncate">{s.firstName}</p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Total:</span>
                <span className="font-bold">{s.assignedBookings}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Upcoming:</span>
                <span className="font-bold text-blue-400">{s.upcomingBookings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      {selectedStaff && (
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="🔍 Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-zinc-600"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Dates</option>
            {upcomingDates.map(date => (
              <option key={date} value={date}>{formatDate(date)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Bookings List */}
      {selectedStaff ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            📋 {filteredBookings.length} Bookings Found
          </h3>
          <p className="text-xs text-zinc-500 mb-2">
            Click bookings to assign/remove <span className="font-semibold" style={{ color: selectedStaff.color }}>{selectedStaff.firstName} {selectedStaff.lastName}</span>
          </p>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {filteredBookings.map(booking => {
                const isAssigned = (booking.assignedStaff || []).includes(selectedStaff.id);
                const assignedToThis = getAssignedStaff(booking);
                const isPast = isDatePast(booking.date);

                return (
                  <button
                    key={booking.id}
                    onClick={() => toggleAssignment(booking.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${
                      isAssigned
                        ? "bg-green-900/20 border border-green-700"
                        : isPast
                        ? "bg-zinc-800/50 border border-zinc-800 opacity-60"
                        : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                    }`}
                    disabled={isPast && !isAssigned}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs shrink-0 ${
                      isAssigned
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-zinc-600"
                    }`}>
                      {isAssigned ? "✓" : ""}
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{booking.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>📅 {formatDate(booking.date)}</span>
                        <span>🎬 {booking.service}</span>
                        {booking.venue && <span>📍 {booking.venue}</span>}
                      </div>
                      
                      {/* Other assigned staff */}
                      {assignedToThis.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-zinc-500">Also assigned:</span>
                          {assignedToThis.filter(s => s.id !== selectedStaff.id).map(s => (
                            <span
                              key={s.id}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: s.color + "20", color: s.color }}
                            >
                              {s.firstName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assignment Status */}
                    {isAssigned ? (
                      <span className="text-xs text-green-400 font-medium shrink-0">ASSIGNED ✓</span>
                    ) : !isPast ? (
                      <span className="text-xs text-zinc-500 shrink-0">Click to assign</span>
                    ) : (
                      <span className="text-xs text-zinc-600 shrink-0">Past event</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-4xl mb-4">👆</p>
          <p className="text-lg text-zinc-400">Select a staff member above</p>
          <p className="text-sm text-zinc-500 mt-2">Then assign them to bookings</p>
        </div>
      )}

      {/* Quick Actions */}
      {selectedStaff && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Assign to all upcoming bookings
              const upcoming = bookings.filter(b => 
                new Date(b.date) >= new Date() && 
                b.status !== "completed" && 
                b.status !== "cancelled"
              );
              const updated = bookings.map(b => {
                if (upcoming.find(u => u.id === b.id)) {
                  const current = b.assignedStaff || [];
                  if (!current.includes(selectedStaff.id)) {
                    return { ...b, assignedStaff: [...current, selectedStaff.id] };
                  }
                }
                return b;
              });
              setBookings(updated);
              localStorage.setItem("bookings", JSON.stringify(updated));
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
          >
            🚀 Assign to All Upcoming
          </button>
          <button
            onClick={() => {
              // Remove from all bookings
              const updated = bookings.map(b => ({
                ...b,
                assignedStaff: (b.assignedStaff || []).filter(id => id !== selectedStaff.id),
              }));
              setBookings(updated);
              localStorage.setItem("bookings", JSON.stringify(updated));
            }}
            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg text-sm transition"
          >
            ✕ Remove from All
          </button>
        </div>
      )}
    </div>
  );
}