"use client";

import { useState, useEffect } from "react";

type Staff = {
  id: number;
  name: string;
  role: string;
  is_active: boolean;
  phone?: string;
  email?: string;
};

type StaffAssignment = {
  id: number;
  booking_id: number;
  staff_id: number;
  role_at_event: string;
  notes?: string;
  assigned_at: string;
};

// Storage keys
const STAFF_STORAGE_KEY = 'alakara_staff';
const STAFF_ASSIGNMENTS_KEY = 'alakara_staff_assignments';

// Helper functions
const getStaff = (): Staff[] => {
  const data = localStorage.getItem(STAFF_STORAGE_KEY);
  const allStaff = data ? JSON.parse(data) : [];
  return allStaff.filter((s: Staff) => s.is_active === true);
};

const getStaffAssignments = (): StaffAssignment[] => {
  const data = localStorage.getItem(STAFF_ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStaffAssignments = (assignments: StaffAssignment[]) => {
  localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify(assignments));
};

type StaffAssignmentProps = {
  bookingId: number;
  onAssignmentChange?: () => void;
};

export default function StaffAssignmentManager({ bookingId, onAssignmentChange }: StaffAssignmentProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [roleAtEvent, setRoleAtEvent] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  const loadData = () => {
    const allStaff = getStaff();
    const allAssignments = getStaffAssignments();
    const bookingAssignments = allAssignments.filter(a => a.booking_id === bookingId);
    
    // Enrich assignments with staff details
    const enrichedAssignments = bookingAssignments.map(assignment => ({
      ...assignment,
      staff: allStaff.find(s => s.id === assignment.staff_id)
    }));
    
    setStaff(allStaff);
    setAssignments(enrichedAssignments);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const handleAssign = () => {
    if (!selectedStaff) return;

    const allAssignments = getStaffAssignments();
    const newAssignment: StaffAssignment = {
      id: Date.now(),
      booking_id: bookingId,
      staff_id: selectedStaff,
      role_at_event: roleAtEvent || "Team Member",
      notes: assignmentNotes,
      assigned_at: new Date().toISOString(),
    };
    
    saveStaffAssignments([...allAssignments, newAssignment]);
    loadData();
    setShowAddModal(false);
    setSelectedStaff(null);
    setRoleAtEvent("");
    setAssignmentNotes("");
    onAssignmentChange?.();
  };

  const handleRemove = (assignmentId: number) => {
    if (confirm("Remove this staff member from the booking?")) {
      const allAssignments = getStaffAssignments();
      const filtered = allAssignments.filter(a => a.id !== assignmentId);
      saveStaffAssignments(filtered);
      loadData();
      onAssignmentChange?.();
    }
  };

  const getAssignedStaffIds = () => {
    return assignments.map(a => a.staff_id);
  };

  const availableStaff = staff.filter(s => !getAssignedStaffIds().includes(s.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Assigned Staff List */}
      {assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{assignment.staff?.name || "Unknown Staff"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-400">
                    {assignment.role_at_event}
                  </span>
                </div>
                {assignment.notes && (
                  <p className="text-xs text-zinc-400 mt-1">{assignment.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(assignment.id)}
                className="text-red-400 hover:text-red-300 transition text-sm px-2 py-1"
                title="Remove from booking"
              >
                🗑️ Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg">
          No staff assigned to this booking yet
        </div>
      )}

      {/* Assign Button */}
      {availableStaff.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-gold-400 hover:border-gold-400 transition"
        >
          ➕ Assign Staff Member
        </button>
      )}

      {availableStaff.length === 0 && staff.length > 0 && (
        <div className="text-center py-2 text-xs text-zinc-500">
          All staff members are already assigned to this booking
        </div>
      )}

      {staff.length === 0 && (
        <div className="text-center py-2 text-xs text-zinc-500">
          No staff members available. Add staff in the Staff tab first.
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Assign Staff to Booking</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Select Staff Member *</label>
                <select
                  value={selectedStaff || ""}
                  onChange={(e) => setSelectedStaff(parseInt(e.target.value))}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  required
                >
                  <option value="">Choose a staff member...</option>
                  {availableStaff.map((member) => (
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
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">If empty, will show as "Team Member"</p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notes (Optional)</label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special instructions..."
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none resize-none"
                />
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedStaff}
                className="w-full bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition disabled:opacity-50"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}