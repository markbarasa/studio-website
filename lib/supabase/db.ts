import { supabase } from './client';

// Types
export type Booking = {
  id?: number;
  booking_id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  package: string;
  price: number;
  deposit: number;
  status: string;
  payment_status: string;
  event_date: string;
  message?: string;
  venue?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Payment = {
  id?: number;
  booking_id: number;
  amount: number;
  method: string;
  reference?: string;
  status: string;
  date?: string;
};

// Bookings
export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getBookingByPhoneAndId = async (bookingId: number, phone: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_id', bookingId)
    .eq('phone', phone)
    .single();
  if (error) return null;
  return data;
};

export const createBooking = async (booking: any) => {
  console.log("createBooking called with:", booking);
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
  console.log("Supabase insert success:", data);
  return data;
};


export const updateBooking = async (bookingId: number, updates: Partial<Booking>) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBooking = async (bookingId: number) => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('booking_id', bookingId);
  if (error) throw error;
};

// Payments
export const getPaymentsByBooking = async (bookingId: number) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'date'>) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Staff (for later)
export const getStaff = async () => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
};

export const createStaff = async (staff: any) => {
  const { data, error } = await supabase
    .from('staff')
    .insert([staff])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateStaff = async (id: number, updates: any) => {
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteStaff = async (id: number) => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Staff Assignments
export const getStaffAssignmentsForBooking = async (bookingId: number) => {
  const { data, error } = await supabase
    .from('staff_assignments')
    .select('*, staff:staff_id(*)')
    .eq('booking_id', bookingId);
  if (error) throw error;
  return data || [];
};

export const assignStaffToBooking = async (assignment: any) => {
  const { data, error } = await supabase
    .from('staff_assignments')
    .insert([assignment])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeStaffAssignment = async (assignmentId: number) => {
  const { error } = await supabase
    .from('staff_assignments')
    .delete()
    .eq('id', assignmentId);
  if (error) throw error;
};