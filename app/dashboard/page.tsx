"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import CalendarView from "@/components/CalendarView";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PaymentModal from "@/components/PaymentModal";
import StaffManager from "@/components/StaffManager";
import StaffAssignmentManager from "@/components/StaffAssignment";
import PaymentsDashboard from "@/components/PaymentsDashboard";
import FinancialReport from "@/components/FinancialReport";
import ContractGenerator from "@/components/ContractGenerator";
import EquipmentManager from "@/components/EquipmentManager";
import EquipmentQuickAssign from "@/components/EquipmentQuickAssign";
import { 
  getBookings, 
  updateBooking, 
  deleteBooking, 
  createPayment, 
  getPaymentsByBooking,
} from "@/lib/supabase/db";

/* ---------------- TYPES ---------------- */
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type PaymentStatus = "unpaid" | "partial" | "paid";
type PaymentMethod = "mpesa" | "cash" | "bank" | "card";

type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
  status: "pending" | "completed" | "failed";
};

type Booking = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  package: string;
  price: number;
  deposit: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  date: string;
  message?: string;
  venue?: string;
  payments: Payment[];
  notes?: string;
  createdAt: string;
  assignedEquipment?: number[];
  assignedStaff?: number[];
};

type SortKey =
  | "date"
  | "name"
  | "phone"
  | "service"
  | "package"
  | "price"
  | "deposit"
  | "status"
  | "paymentStatus";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type View =
  | "ledger"
  | "calendar"
  | "analytics"
  | "customers"
  | "payments"
  | "reports"
  | "staff"
  | "equipment";

/* ---------------- UTILITIES ---------------- */
const normalizeDate = (date: string): string | null => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-KE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const exportToCSV = (bookings: Booking[]) => {
  const headers = ["Date", "Name", "Phone", "Service", "Package", "Price", "Deposit", "Balance", "Status", "Payment"];
  const rows = bookings.map(b => [
    b.date,
    b.name,
    b.phone,
    b.service,
    b.package,
    b.price,
    b.deposit || 0,
    (b.price || 0) - (b.deposit || 0),
    b.status,
    b.paymentStatus,
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `studio-bookings-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [view, setView] = useState<View>("ledger");
  const [showPaymentModal, setShowPaymentModal] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");

  /* ---------------- TOAST SYSTEM ---------------- */
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* ---------------- AUTHENTICATION CHECK ---------------- */
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") setIsAuthenticated(true);
    else window.location.href = "/dashboard/login";
    setIsLoadingAuth(false);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminLoginTime");
    window.location.href = "/dashboard/login";
  }, []);

  /* ---------------- LOAD BOOKINGS FROM SUPABASE ---------------- */
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBookings();
      const withPayments = await Promise.all(
        data.map(async (booking: any) => {
          const payments = await getPaymentsByBooking(booking.booking_id);
          return {
            ...booking,
            id: booking.booking_id,
            date: booking.event_date,
            paymentStatus: booking.payment_status,
            payments,
            assignedEquipment: [], // can be added later
            assignedStaff: [],
          };
        })
      );
      setBookings(withPayments);
    } catch (error) {
      console.error(error);
      addToast("Failed to load bookings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isAuthenticated) loadBookings();
  }, [isAuthenticated, loadBookings]);

  /* ---------------- ACTIONS (Supabase) ---------------- */
  const updateStatus = useCallback(async (id: number, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    if (status === "confirmed") {
      const requiredDeposit = Math.ceil(booking.price / 2);
      if ((booking.deposit || 0) < requiredDeposit) {
        addToast(`Cannot confirm: Deposit of KSh ${requiredDeposit.toLocaleString()} required.`, "error");
        return;
      }
    }
    try {
      await updateBooking(id, { status });
      await loadBookings();
      addToast(`Booking #${id} status updated to ${status}`, "success");
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  }, [bookings, loadBookings, addToast]);

  const updateDeposit = useCallback(async (id: number, value: number) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    if (value < 0 || value > booking.price) return;
    const paymentStatus = value >= booking.price ? "paid" : value > 0 ? "partial" : "unpaid";
    let newStatus = booking.status;
    const requiredDeposit = Math.ceil(booking.price / 2);
    if (booking.status === "pending" && value >= requiredDeposit) {
      newStatus = "confirmed";
      addToast(`Deposit complete! Booking #${id} automatically confirmed.`, "success");
    }
    try {
      await updateBooking(id, { deposit: value, payment_status: paymentStatus, status: newStatus });
      await loadBookings();
    } catch (err) {
      addToast("Failed to update deposit", "error");
    }
  }, [bookings, loadBookings, addToast]);

  const handlePayment = useCallback(async (bookingId: number, amount: number, method: PaymentMethod, reference: string) => {
    try {
      await createPayment({ booking_id: bookingId, amount, method, reference, status: "completed" });
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const newDeposit = (booking.deposit || 0) + amount;
        const paymentStatus = newDeposit >= booking.price ? "paid" : newDeposit > 0 ? "partial" : "unpaid";
        let newStatus = booking.status;
        const requiredDeposit = Math.ceil(booking.price / 2);
        if (booking.status === "pending" && newDeposit >= requiredDeposit) {
          newStatus = "confirmed";
          addToast(`Deposit complete! Booking #${bookingId} automatically confirmed.`, "success");
        }
        await updateBooking(bookingId, { deposit: newDeposit, payment_status: paymentStatus, status: newStatus });
      }
      await loadBookings();
      addToast(`Payment of KSh ${amount.toLocaleString()} recorded`, "success");
    } catch (err) {
      addToast("Failed to record payment", "error");
    }
  }, [bookings, loadBookings, addToast]);

  const deleteBookingHandler = useCallback(async (id: number) => {
    try {
      await deleteBooking(id);
      await loadBookings();
      setShowDeleteConfirm(null);
      addToast(`Booking #${id} deleted`, "success");
    } catch (err) {
      addToast("Failed to delete booking", "error");
    }
  }, [loadBookings, addToast]);

  const updateNotes = useCallback(async (id: number, notes: string) => {
    try {
      await updateBooking(id, { notes });
      await loadBookings();
      setEditingNotes(null);
      addToast("Notes updated", "success");
    } catch (err) {
      addToast("Failed to update notes", "error");
    }
  }, [loadBookings, addToast]);

  const sendReminder = useCallback((booking: Booking) => {
    const message = `Hi ${booking.name}, this is a reminder that your ${booking.service} event is on ${formatDate(booking.date)}.`;
    window.open(`https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    addToast(`WhatsApp reminder opened for ${booking.name}`, "info");
  }, [addToast]);

  const handleEquipmentAssignment = useCallback((bookingId: number, equipmentIds: number[]) => {
    // For now, keep equipment assignment in localStorage (you can later move to Supabase)
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, assignedEquipment: equipmentIds } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    // Also update equipment status in localStorage
    try {
      const storedEquipment = JSON.parse(localStorage.getItem("equipment") || "[]");
      const booking = bookings.find(b => b.id === bookingId);
      const updatedEquipment = storedEquipment.map((eq: any) => {
        if (equipmentIds.includes(eq.id)) {
          return { ...eq, status: "in-use", assignedTo: bookingId, assignedToName: booking?.name || "" };
        } else if (eq.assignedTo === bookingId) {
          return { ...eq, status: "available", assignedTo: undefined, assignedToName: undefined };
        }
        return eq;
      });
      localStorage.setItem("equipment", JSON.stringify(updatedEquipment));
    } catch (error) {
      console.error("Failed to update equipment:", error);
    }
  }, [bookings]);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(true); }
  }, [sortKey, asc]);

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;
    const totalEarnings = bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + b.price, 0);
    const collectedAmount = bookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
    const pendingBalance = bookings.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + ((b.price || 0) - (b.deposit || 0)), 0);
    const todayBookings = bookings.filter(b => normalizeDate(b.date) === normalizeDate(new Date().toISOString())).length;
    return { total, completed, pending, confirmed, cancelled, totalEarnings, collectedAmount, pendingBalance, todayBookings };
  }, [bookings]);

  const filteredAndGrouped = useMemo(() => {
    let filtered = bookings;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.phone.includes(term) ||
        b.service.toLowerCase().includes(term) ||
        b.package.toLowerCase().includes(term) ||
        (b.venue && b.venue.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(b => b.status === statusFilter);
    const map: Record<string, Booking[]> = {};
    filtered.forEach(b => {
      const cleanDate = normalizeDate(b.date);
      if (!cleanDate) return;
      const month = cleanDate.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push({ ...b, date: cleanDate });
    });
    return map;
  }, [bookings, searchTerm, statusFilter]);

  const sortData = useCallback((data: Booking[]) => {
    return [...data].sort((a, b) => {
      let A: any = a[sortKey];
      let B: any = b[sortKey];
      if (sortKey === "price" || sortKey === "deposit") { A = Number(A || 0); B = Number(B || 0); }
      if (sortKey === "date") { A = new Date(A).getTime(); B = new Date(B).getTime(); }
      if (typeof A === "string") { A = A.toLowerCase(); B = B.toLowerCase(); }
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
  }, [sortKey, asc]);

  /* ---------------- LOADING STATES ---------------- */
  if (isLoadingAuth) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying access...</div>;
  if (!isAuthenticated) return null;
  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading bookings...</div>;

  /* ---------------- RENDER ---------------------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm animate-slide-in ${
            toast.type === "success" ? "bg-green-500 text-black" :
            toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          }`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Alakara Studios CRM</h1>
              <p className="text-zinc-400 mt-1">Manage bookings, payments, staff & clients</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => exportToCSV(bookings)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition">📥 Export CSV</button>
              <a href="/portal" target="_blank" className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition">👤 Customer Portal</a>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">🚪 Logout</button>
            </div>
          </div>
        </div>

        {/* VIEW SWITCHER */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "ledger", label: "📊 Ledger" },
            { key: "calendar", label: "📅 Calendar" },
            { key: "analytics", label: "📈 Analytics" },
            { key: "customers", label: "👥 Customers" },
            { key: "payments", label: "💰 Payments" },
            { key: "reports", label: "📊 Reports" },
            { key: "staff", label: "👥 Staff" },
            { key: "equipment", label: "🎬 Equipment" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key as View)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                view === key ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ASSIGNMENTS QUICK LINK */}
        <a href="/dashboard/assignments" className="inline-block mb-6 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/30">
          📋 Assign Staff & Equipment
        </a>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Today</p><p className="text-lg font-bold">{stats.todayBookings}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Pending</p><p className="text-lg font-bold text-yellow-400">{stats.pending}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Confirmed</p><p className="text-lg font-bold text-blue-400">{stats.confirmed}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Completed</p><p className="text-lg font-bold text-green-400">{stats.completed}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Earnings</p><p className="text-lg font-bold text-green-400">KSh {(stats.totalEarnings / 1000).toFixed(0)}K</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Collected</p><p className="text-lg font-bold text-green-400">KSh {(stats.collectedAmount / 1000).toFixed(0)}K</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Pending</p><p className="text-lg font-bold text-red-400">KSh {(stats.pendingBalance / 1000).toFixed(0)}K</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"><p className="text-zinc-400 text-xs">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
        </div>

        {/* VIEW RENDERERS */}
        {view === "calendar" && <CalendarView bookings={bookings} onBookingClick={(booking) => { setSelectedBooking(booking); setShowBookingDetail(true); }} />}
        {view === "analytics" && <AnalyticsDashboard bookings={bookings} />}
        {view === "customers" && <CustomerList bookings={bookings} />}
        {view === "payments" && <PaymentsDashboard bookings={bookings} />}
        {view === "reports" && <FinancialReport bookings={bookings} />}
        {view === "staff" && <StaffManager onStaffChange={() => {}} />}
        {view === "equipment" && <EquipmentManager />}

        {/* LEDGER VIEW */}
        {view === "ledger" && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input type="text" placeholder="🔍 Search bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {Object.keys(filteredAndGrouped).length === 0 ? (
              <div className="text-center py-12 text-zinc-500"><p className="text-xl">No bookings found</p><p className="mt-2">Try adjusting your filters</p></div>
            ) : (
              Object.keys(filteredAndGrouped).sort((a, b) => b.localeCompare(a)).map(month => {
                const data = sortData(filteredAndGrouped[month]);
                const monthlyTotal = data.filter(b => b.status === "completed").reduce((sum, b) => sum + b.price, 0);
                const monthlyCollected = data.reduce((sum, b) => sum + (b.deposit || 0), 0);
                const monthlyPending = data.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + ((b.price || 0) - (b.deposit || 0)), 0);
                return (
                  <div key={month} className="mb-8 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-900 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h2 className="text-lg font-bold">📅 {new Date(month + "-01").toLocaleDateString("en-KE", { year: "numeric", month: "long" })}</h2>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-green-400">💰 Earned: KSh {monthlyTotal.toLocaleString()}</span>
                        <span className="text-blue-400">💳 Collected: KSh {monthlyCollected.toLocaleString()}</span>
                        <span className="text-red-400">⚠️ Pending: KSh {monthlyPending.toLocaleString()}</span>
                        <span className="text-zinc-400">📋 {data.length} bookings</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-900/60">
                          <tr>
                            {["date", "name", "phone", "service", "package", "price", "deposit", "balance", "status", "payment"].map(key => (
                              <th key={key} onClick={() => handleSort(key as SortKey)} className="p-3 cursor-pointer hover:bg-zinc-800">
                                {key.toUpperCase()} {sortKey === key && (asc ? "▲" : "▼")}
                              </th>
                            ))}
                            <th className="p-3">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map(b => {
                            const balance = (b.price || 0) - (b.deposit || 0);
                            const isOverdue = (b.status === "pending" || b.status === "confirmed") && new Date(b.date) < new Date();
                            return (
                              <tr key={b.id} className={`border-t border-zinc-800 hover:bg-zinc-900/50 ${isOverdue ? "bg-red-900/10" : ""}`}>
                                <td className="p-3">{formatDate(b.date)}{b.venue && <div className="text-xs text-zinc-500">📍 {b.venue}</div>}</td>
                                <td className="p-3"><button onClick={() => { setSelectedBooking(b); setShowBookingDetail(true); }} className="hover:underline">{b.name}{b.notes && <span className="text-yellow-400 ml-1">📝</span>}</button></td>
                                <td className="p-3">{b.phone}</td>
                                <td className="p-3">{b.service}</td>
                                <td className="p-3">{b.package}</td>
                                <td className="p-3 font-medium">KSh {b.price.toLocaleString()}</td>
                                <td className="p-3"><input type="number" value={b.deposit || ""} onChange={(e) => updateDeposit(b.id, Number(e.target.value))} className="w-24 bg-zinc-800 border border-zinc-700 p-2 rounded" min="0" max={b.price} step="1000" /></td>
                                <td className="p-3"><span className={balance > 0 ? "text-red-400" : "text-green-400"}>KSh {balance.toLocaleString()}</span></td>
                                <td className="p-3">
                                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)} className={`p-2 rounded text-sm font-medium ${b.status === "completed" ? "bg-green-900/50 text-green-400" : b.status === "confirmed" ? "bg-blue-900/50 text-blue-400" : b.status === "cancelled" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                                    <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-medium ${b.paymentStatus === "paid" ? "bg-green-900/50 text-green-400" : b.paymentStatus === "partial" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>{b.paymentStatus.toUpperCase()}</span></td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    {balance > 0 && <button onClick={() => setShowPaymentModal(b)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">💳</button>}
                                    <button onClick={() => window.open(`https://wa.me/${b.phone.replace(/\D/g, "")}`, "_blank")} className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded text-xs">💬</button>
                                    <button onClick={() => sendReminder(b)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">🔔</button>
                                    {showDeleteConfirm === b.id ? (
                                      <div className="flex gap-1"><button onClick={() => deleteBookingHandler(b.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">✓</button><button onClick={() => setShowDeleteConfirm(null)} className="bg-zinc-600 text-white px-2 py-1 rounded text-xs">✕</button></div>
                                    ) : <button onClick={() => setShowDeleteConfirm(b.id)} className="bg-zinc-700 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">🗑</button>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-zinc-900/80 font-bold"><td colSpan={6} className="p-3 text-right text-zinc-400">Monthly Summary</td><td className="p-3 text-blue-400">KSh {monthlyCollected.toLocaleString()}</td><td className="p-3 text-red-400">KSh {monthlyPending.toLocaleString()}</td><td colSpan={3}></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showPaymentModal && <PaymentModal booking={showPaymentModal} onClose={() => setShowPaymentModal(null)} onPaymentComplete={(amount, method, ref) => { handlePayment(showPaymentModal.id, amount, method, ref); setShowPaymentModal(null); }} />}
      
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4" onClick={() => setShowBookingDetail(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6"><div><h2 className="text-xl font-bold">Booking Details</h2><p className="text-zinc-400 text-sm">Booking #{selectedBooking.id}</p></div><button onClick={() => setShowBookingDetail(false)} className="text-zinc-400 hover:text-white text-xl">✕</button></div>
            <div className="space-y-6">
              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">📋 Client & Event Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-zinc-800/50 rounded-xl p-4">
                  <div><p className="text-zinc-400 text-xs">Client Name</p><p className="font-semibold">{selectedBooking.name}</p></div>
                  <div><p className="text-zinc-400 text-xs">Phone</p><p className="font-semibold">{selectedBooking.phone}</p></div>
                  {selectedBooking.email && <div className="col-span-2"><p className="text-zinc-400 text-xs">Email</p><p className="font-semibold">{selectedBooking.email}</p></div>}
                  <div><p className="text-zinc-400 text-xs">Service</p><p className="font-semibold">{selectedBooking.service}</p></div>
                  <div><p className="text-zinc-400 text-xs">Package</p><p className="font-semibold">{selectedBooking.package}</p></div>
                  <div><p className="text-zinc-400 text-xs">Event Date</p><p className="font-semibold">{formatDate(selectedBooking.date)}</p></div>
                  <div><p className="text-zinc-400 text-xs">Venue</p><p className="font-semibold">{selectedBooking.venue || "Not specified"}</p></div>
                  <div><p className="text-zinc-400 text-xs">Status</p><select value={selectedBooking.status} onChange={e => { updateStatus(selectedBooking.id, e.target.value as BookingStatus); setSelectedBooking({...selectedBooking, status: e.target.value as BookingStatus}); }} className={`p-1.5 rounded text-sm font-medium ${selectedBooking.status === "completed" ? "bg-green-900/50 text-green-400 border border-green-800" : selectedBooking.status === "confirmed" ? "bg-blue-900/50 text-blue-400 border border-blue-800" : selectedBooking.status === "cancelled" ? "bg-red-900/50 text-red-400 border border-red-800" : "bg-yellow-900/50 text-yellow-400 border border-yellow-800"}`}>
                    <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select></div>
                  <div><p className="text-zinc-400 text-xs">Payment Status</p><span className={`px-2 py-1 rounded text-xs font-medium ${selectedBooking.paymentStatus === "paid" ? "bg-green-900/50 text-green-400" : selectedBooking.paymentStatus === "partial" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>{selectedBooking.paymentStatus?.toUpperCase() || "UNPAID"}</span></div>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">💰 Financial Summary</h3>
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex justify-between mb-3"><span className="text-zinc-400">Total Price</span><span className="text-lg font-bold">KSh {selectedBooking.price.toLocaleString()}</span></div>
                  <div className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-zinc-400">Paid</span><span className="text-green-400">KSh {(selectedBooking.deposit || 0).toLocaleString()}</span></div><div className="h-3 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min(((selectedBooking.deposit || 0) / selectedBooking.price) * 100, 100)}%` }} /></div></div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-700"><span className="text-zinc-400 font-semibold">Balance Due</span><span className={`text-lg font-bold ${(selectedBooking.price - (selectedBooking.deposit || 0)) > 0 ? "text-red-400" : "text-green-400"}`}>KSh {(selectedBooking.price - (selectedBooking.deposit || 0)).toLocaleString()}</span></div>
                  {(selectedBooking.price - (selectedBooking.deposit || 0)) > 0 && <button onClick={() => { setShowBookingDetail(false); setTimeout(() => setShowPaymentModal(selectedBooking), 100); }} className="w-full mt-4 bg-green-600 hover:bg-green-700 py-2.5 rounded-lg font-medium flex justify-center gap-2">💳 Record Payment</button>}
                </div>
              </div>

              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">🎬 Equipment Assignment</h3><div className="bg-zinc-800/50 rounded-xl p-4"><EquipmentQuickAssign bookingId={selectedBooking.id} bookingDate={selectedBooking.date} currentAssigned={selectedBooking.assignedEquipment || []} onAssign={(eqIds) => { handleEquipmentAssignment(selectedBooking.id, eqIds); setSelectedBooking({...selectedBooking, assignedEquipment: eqIds}); }} /></div></div>

              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">👥 Team Assignment</h3><div className="bg-zinc-800/50 rounded-xl p-4"><StaffAssignmentManager bookingId={selectedBooking.id} onAssignmentChange={() => {}} /></div></div>

              {selectedBooking.payments?.length > 0 && (<div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">💳 Payment History</h3><div className="space-y-2">{selectedBooking.payments.map(p => (<div key={p.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between"><div><p className="text-sm font-medium">{new Date(p.date).toLocaleDateString("en-KE", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</p><p className="text-xs text-zinc-400">{p.method.toUpperCase()} • Ref: {p.reference}</p></div><span className="text-green-400 font-semibold">+KSh {p.amount.toLocaleString()}</span></div>))}</div></div>)}

              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">📝 Notes</h3>{editingNotes === selectedBooking.id ? (<div className="space-y-2"><textarea value={notesText} onChange={e => setNotesText(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" rows={4} placeholder="Add notes..." /><div className="flex gap-2"><button onClick={() => updateNotes(selectedBooking.id, notesText)} className="bg-white text-black px-4 py-2 rounded-lg text-sm">💾 Save</button><button onClick={() => setEditingNotes(null)} className="bg-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button></div></div>) : (<div onClick={() => { setEditingNotes(selectedBooking.id); setNotesText(selectedBooking.notes || ""); }} className="bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-700">{selectedBooking.notes || <p className="text-zinc-500 text-sm italic">Click to add notes...</p>}</div>)}</div>

              {selectedBooking.message && (<div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">💬 Client Message</h3><div className="bg-zinc-800 rounded-lg p-4"><p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedBooking.message}</p></div></div>)}

              {selectedBooking.assignedEquipment?.length > 0 && (<div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">📦 Currently Assigned Equipment</h3><div className="flex flex-wrap gap-2">{selectedBooking.assignedEquipment.map(eqId => { const eq = JSON.parse(localStorage.getItem("equipment") || "[]").find((e:any)=>e.id===eqId); return eq ? <span key={eqId} className="bg-green-900/30 text-green-400 px-3 py-1.5 rounded-full text-sm">📦 {eq.name}</span> : null; })}</div></div>)}

              <div><h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3">⚡ Quick Actions</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => window.open(`https://wa.me/${selectedBooking.phone.replace(/\D/g,"")}`,"_blank")} className="bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium">💬 WhatsApp</button><button onClick={() => setShowContractModal(true)} className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-medium">📄 Generate Contract</button><button onClick={() => sendReminder(selectedBooking)} className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium">🔔 Send Reminder</button><button onClick={() => { setShowDeleteConfirm(selectedBooking.id); setShowBookingDetail(false); }} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-3 rounded-lg font-medium">🗑 Delete Booking</button></div></div>
            </div>
          </div>
        </div>
      )}

      {showContractModal && selectedBooking && <ContractGenerator booking={selectedBooking} onClose={() => setShowContractModal(false)} />}

      <style jsx>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

/* ---------------- CUSTOMER LIST COMPONENT ---------------- */
function CustomerList({ bookings }: { bookings: Booking[] }) {
  const customers = useMemo(() => {
    const map: Record<string, { name: string; phone: string; bookings: Booking[]; totalSpent: number; lastBooking: string }> = {};
    bookings.forEach(b => {
      if (!map[b.phone]) map[b.phone] = { name: b.name, phone: b.phone, bookings: [], totalSpent: 0, lastBooking: b.date };
      map[b.phone].bookings.push(b);
      map[b.phone].totalSpent += b.deposit || 0;
      if (new Date(b.date) > new Date(map[b.phone].lastBooking)) map[b.phone].lastBooking = b.date;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [bookings]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Customer List</h2>
      <div className="grid gap-4">
        {customers.map(customer => (
          <div key={customer.phone} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div><h3 className="text-lg font-semibold">{customer.name}</h3><p className="text-zinc-400">{customer.phone}</p></div>
              <div className="text-right"><p className="text-green-400 font-bold">KSh {customer.totalSpent.toLocaleString()}</p><p className="text-zinc-400 text-sm">{customer.bookings.length} booking{customer.bookings.length !== 1 ? "s" : ""}</p></div>
            </div>
            <div className="mt-3 flex gap-2"><span className="text-xs bg-zinc-800 px-2 py-1 rounded">Last: {formatDate(customer.lastBooking)}</span>{customer.bookings.length > 1 && <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">Repeat Client</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}