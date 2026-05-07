"use client";

import { useEffect, useState } from "react";

type Staff = {
  id: number;
  name: string;
  role: string;
  phone: string;
  is_active: boolean;
};

type Equipment = {
  id: number;
  name: string;
  type: string;
  serialNumber: string;
  status: string;
};

type StaffAssignment = {
  id: number;
  staffId: number;
  staffName: string;
  staffRole: string;
  roleAtEvent: string;
  equipment: Equipment[];
  notes: string;
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
};

export default function BookingAssignments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignments, setAssignments] = useState<Record<number, StaffAssignment[]>>({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [roleAtEvent, setRoleAtEvent] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load bookings
    const storedBookings = localStorage.getItem("bookings");
    if (storedBookings) {
      const allBookings = JSON.parse(storedBookings);
      const pendingConfirmed = allBookings.filter(
        (b: any) => b.status === "pending" || b.status === "confirmed"
      );
      setBookings(pendingConfirmed);
    }

    // Load staff
    const storedStaff = localStorage.getItem("alakara_staff");
    if (storedStaff) {
      const allStaff = JSON.parse(storedStaff);
      setStaff(allStaff.filter((s: Staff) => s.is_active === true));
    }

    // Load equipment
    const storedEquipment = localStorage.getItem("alakara_equipment");
    if (storedEquipment) {
      setEquipment(JSON.parse(storedEquipment));
    } else {
      // Initialize default equipment
      const defaultEquipment = [
        { id: 1, name: "Sony A7III Camera", type: "Camera", serialNumber: "SN001", status: "available" },
        { id: 2, name: "Canon 5D Mark IV", type: "Camera", serialNumber: "SN002", status: "available" },
        { id: 3, name: "DJI Ronin Gimbal", type: "Gimbal", serialNumber: "SN003", status: "available" },
        { id: 4, name: "Sennheiser Mic", type: "Audio", serialNumber: "SN004", status: "available" },
        { id: 5, name: "LED Light Panel", type: "Lighting", serialNumber: "SN005", status: "available" },
        { id: 6, name: "DJI Mavic Drone", type: "Drone", serialNumber: "SN006", status: "available" },
      ];
      localStorage.setItem("alakara_equipment", JSON.stringify(defaultEquipment));
      setEquipment(defaultEquipment);
    }

    // Load assignments
    const storedAssignments = localStorage.getItem("alakara_booking_assignments");
    if (storedAssignments) {
      setAssignments(JSON.parse(storedAssignments));
    }
  };

  const saveAssignments = (newAssignments: Record<number, StaffAssignment[]>) => {
    localStorage.setItem("alakara_booking_assignments", JSON.stringify(newAssignments));
    setAssignments(newAssignments);
  };

  const handleAssignStaff = () => {
    if (!selectedBooking || !selectedStaffId) return;

    const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
    if (!selectedStaffMember) return;

    const newAssignment: StaffAssignment = {
      id: Date.now(),
      staffId: selectedStaffId,
      staffName: selectedStaffMember.name,
      staffRole: selectedStaffMember.role,
      roleAtEvent: roleAtEvent || "Team Member",
      equipment: equipment.filter(e => selectedEquipment.includes(e.id)),
      notes: assignmentNotes,
    };

    const currentAssignments = assignments[selectedBooking.id] || [];
    const updatedAssignments = {
      ...assignments,
      [selectedBooking.id]: [...currentAssignments, newAssignment],
    };

    saveAssignments(updatedAssignments);
    
    // Reset form
    setSelectedStaffId(null);
    setRoleAtEvent("");
    setSelectedEquipment([]);
    setAssignmentNotes("");
    setShowAssignModal(false);
  };

  const handleRemoveAssignment = (bookingId: number, assignmentId: number) => {
    const currentAssignments = assignments[bookingId] || [];
    const updatedAssignments = {
      ...assignments,
      [bookingId]: currentAssignments.filter(a => a.id !== assignmentId),
    };
    saveAssignments(updatedAssignments);
  };

  const handleUpdateEquipment = (bookingId: number, assignment: StaffAssignment) => {
    setEditingAssignment(assignment);
    setSelectedBooking(bookings.find(b => b.id === bookingId) || null);
    setSelectedEquipment(assignment.equipment.map(e => e.id));
    setShowEquipmentModal(true);
  };

  const saveEquipmentAssignment = () => {
    if (!selectedBooking || !editingAssignment) return;

    const currentAssignments = assignments[selectedBooking.id] || [];
    const updatedAssignmentsList = currentAssignments.map(a =>
      a.id === editingAssignment.id
        ? { ...a, equipment: equipment.filter(e => selectedEquipment.includes(e.id)) }
        : a
    );

    const updatedAssignments = {
      ...assignments,
      [selectedBooking.id]: updatedAssignmentsList,
    };

    saveAssignments(updatedAssignments);
    setShowEquipmentModal(false);
    setEditingAssignment(null);
    setSelectedEquipment([]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Booking Assignments</h1>
          <p className="text-zinc-400 mt-1">Assign staff members and equipment to bookings</p>
          <div className="w-20 h-1 bg-gold-400 mt-4 rounded-full" />
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
              <p className="text-xl text-zinc-500">No pending or confirmed bookings</p>
              <p className="text-zinc-600 mt-2">Bookings will appear here when customers book services</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Booking Header */}
                <div className="bg-zinc-800/50 p-5 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">#{booking.id}</h2>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === "confirmed" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{booking.name}</p>
                    <p className="text-sm text-zinc-400">{booking.service} - {booking.package}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Event Date</p>
                    <p className="font-semibold">{formatDate(booking.date)}</p>
                    {booking.venue && <p className="text-xs text-zinc-500 mt-1">📍 {booking.venue}</p>}
                  </div>
                </div>

                {/* Assigned Staff List */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gold-400">Assigned Team</h3>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowAssignModal(true);
                      }}
                      className="px-3 py-1.5 bg-gold-400 text-black rounded-lg text-sm font-semibold hover:bg-gold-500 transition"
                    >
                      + Assign Staff
                    </button>
                  </div>

                  {(assignments[booking.id] || []).length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg">
                      No staff assigned yet. Click "Assign Staff" to add team members.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(assignments[booking.id] || []).map((assignment) => (
                        <div key={assignment.id} className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-start flex-wrap gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-lg">{assignment.staffName}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-400">
                                  {assignment.roleAtEvent}
                                </span>
                                <span className="text-xs text-zinc-500">({assignment.staffRole})</span>
                              </div>
                              
                              {/* Equipment List */}
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm text-zinc-400">Equipment:</span>
                                  <button
                                    onClick={() => handleUpdateEquipment(booking.id, assignment)}
                                    className="text-xs text-gold-400 hover:underline"
                                  >
                                    + Add/Edit
                                  </button>
                                </div>
                                {assignment.equipment.length === 0 ? (
                                  <p className="text-xs text-zinc-500">No equipment assigned</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {assignment.equipment.map((item) => (
                                      <span
                                        key={item.id}
                                        className="text-xs px-2 py-1 bg-zinc-700 rounded-full"
                                      >
                                        {item.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {assignment.notes && (
                                <p className="text-xs text-zinc-400 mt-2">📝 {assignment.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveAssignment(booking.id, assignment.id)}
                              className="text-red-400 hover:text-red-300 transition text-sm px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Assign Staff</h2>
                  <p className="text-zinc-400 text-sm">Booking #{selectedBooking.id} - {selectedBooking.name}</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="text-zinc-400 hover:text-white">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Select Staff Member *</label>
                <select
                  value={selectedStaffId || ""}
                  onChange={(e) => setSelectedStaffId(parseInt(e.target.value))}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 outline-none"
                >
                  <option value="">Choose staff...</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Role at Event</label>
                <input
                  type="text"
                  value={roleAtEvent}
                  onChange={(e) => setRoleAtEvent(e.target.value)}
                  placeholder="e.g., Lead Photographer, Camera Operator"
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Assign Equipment</label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-black border border-zinc-700 rounded-lg p-3">
                  {equipment.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipment([...selectedEquipment, item.id]);
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(id => id !== item.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-zinc-500">({item.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notes (Optional)</label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special instructions..."
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleAssignStaff}
                disabled={!selectedStaffId}
                className="w-full bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition disabled:opacity-50"
              >
                Assign Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Assignment Modal */}
      {showEquipmentModal && selectedBooking && editingAssignment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Manage Equipment</h2>
                  <p className="text-zinc-400 text-sm">{editingAssignment.staffName} - {editingAssignment.roleAtEvent}</p>
                </div>
                <button onClick={() => setShowEquipmentModal(false)} className="text-zinc-400 hover:text-white">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Assign Equipment to Staff</label>
                <div className="space-y-2 max-h-60 overflow-y-auto bg-black border border-zinc-700 rounded-lg p-3">
                  {equipment.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-zinc-800 rounded">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipment([...selectedEquipment, item.id]);
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(id => id !== item.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-zinc-500 ml-2">({item.type})</span>
                        <p className="text-xs text-zinc-600">SN: {item.serialNumber}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={saveEquipmentAssignment}
                className="w-full bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition"
              >
                Save Equipment Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}