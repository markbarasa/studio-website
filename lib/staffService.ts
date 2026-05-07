import { Staff, StaffAssignment } from '@/types/staff';

// Storage keys
const STAFF_STORAGE_KEY = 'alakara_staff';
const STAFF_ASSIGNMENTS_KEY = 'alakara_staff_assignments';

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STAFF_STORAGE_KEY)) {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(STAFF_ASSIGNMENTS_KEY)) {
    localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify([]));
  }
};

// Get all staff
export const getStaff = (): Staff[] => {
  initializeStorage();
  const data = localStorage.getItem(STAFF_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get active staff only
export const getActiveStaff = (): Staff[] => {
  return getStaff().filter(s => s.is_active);
};

// Get staff by ID
export const getStaffById = (id: number): Staff | null => {
  const staff = getStaff();
  return staff.find(s => s.id === id) || null;
};

// Create new staff member
export const createStaff = (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Staff => {
  const staff = getStaff();
  const newStaff: Staff = {
    ...staffData,
    id: Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify([...staff, newStaff]));
  return newStaff;
};

// Update staff member
export const updateStaff = (id: number, updates: Partial<Staff>): Staff | null => {
  const staff = getStaff();
  const index = staff.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const updatedStaff = {
    ...staff[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  staff[index] = updatedStaff;
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  return updatedStaff;
};

// Delete staff member
export const deleteStaff = (id: number): boolean => {
  const staff = getStaff();
  const filtered = staff.filter(s => s.id !== id);
  
  // Also remove all assignments for this staff
  const assignments = getStaffAssignments();
  const filteredAssignments = assignments.filter(a => a.staff_id !== id);
  localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify(filteredAssignments));
  
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get staff assignments for a booking
export const getStaffAssignmentsForBooking = (bookingId: number): StaffAssignment[] => {
  initializeStorage();
  const assignments = localStorage.getItem(STAFF_ASSIGNMENTS_KEY);
  const allAssignments = assignments ? JSON.parse(assignments) : [];
  return allAssignments.filter((a: StaffAssignment) => a.booking_id === bookingId);
};

// Get all staff assignments
export const getStaffAssignments = (): StaffAssignment[] => {
  initializeStorage();
  const assignments = localStorage.getItem(STAFF_ASSIGNMENTS_KEY);
  return assignments ? JSON.parse(assignments) : [];
};

// Assign staff to a booking
export const assignStaffToBooking = (
  bookingId: number,
  staffId: number,
  roleAtEvent: string,
  notes?: string
): StaffAssignment => {
  const assignments = getStaffAssignments();
  const newAssignment: StaffAssignment = {
    id: Date.now(),
    booking_id: bookingId,
    staff_id: staffId,
    role_at_event: roleAtEvent,
    notes: notes || '',
    assigned_at: new Date().toISOString(),
  };
  localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify([...assignments, newAssignment]));
  return newAssignment;
};

// Remove staff from booking
export const removeStaffAssignment = (assignmentId: number): boolean => {
  const assignments = getStaffAssignments();
  const filtered = assignments.filter(a => a.id !== assignmentId);
  localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify(filtered));
  return true;
};

// Get staff schedule for a specific date range
export const getStaffSchedule = (staffId: number, startDate: string, endDate: string): StaffAssignment[] => {
  const assignments = getStaffAssignments();
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  
  return assignments
    .filter(a => a.staff_id === staffId)
    .map(assignment => {
      const booking = bookings.find((b: any) => b.id === assignment.booking_id);
      return {
        ...assignment,
        booking_details: booking,
      };
    })
    .filter((item: any) => {
      const bookingDate = item.booking_details?.date;
      return bookingDate >= startDate && bookingDate <= endDate;
    });
};