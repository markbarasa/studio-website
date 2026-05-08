"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import CalendarView from "@/components/CalendarView";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PaymentModal from "@/components/PaymentModal";
import StaffManager from "@/components/StaffManager";
import StaffAssignmentManager from "@/components/StaffAssignment";
import { supabase } from "@/lib/supabase/client";

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

type View = "ledger" | "calendar" | "analytics" | "customers" | "staff";

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
  const rows = bookings.map((b) => [
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
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
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
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [view, setView] = useState<View>("ledger");
  const [showPaymentModal, setShowPaymentModal] = useState<Booking | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ---------------- AUTHENTICATION ---------------- */
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
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("event_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookingsWithPayments = await Promise.all(
        (bookingsData || []).map(async (booking: any) => {
          const { data: paymentsData } = await supabase
            .from("payments")
            .select("*")
            .eq("booking_id", booking.booking_id)
            .order("date", { ascending: true });

          return {
            id: booking.booking_id,
            name: booking.name,
            phone: booking.phone,
            email: booking.email,
            service: booking.service,
            package: booking.package,
            price: booking.price,
            deposit: booking.deposit || 0,
            status: booking.status,
            paymentStatus: booking.payment_status,
            date: booking.event_date,
            message: booking.message,
            venue: booking.venue,
            notes: booking.notes,
            createdAt: booking.created_at,
            payments: paymentsData || [],
          };
        })
      );

      setBookings(bookingsWithPayments);
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

  /* ---------------- ACTIONS ---------------- */
  const updateStatus = useCallback(
    async (id: number, status: BookingStatus) => {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) return;

      if (status === "confirmed") {
        const requiredDeposit = Math.ceil(booking.price / 2);
        if ((booking.deposit || 0) < requiredDeposit) {
          addToast(
            `Cannot confirm: Deposit of KSh ${requiredDeposit.toLocaleString()} required.`,
            "error"
          );
          return;
        }
      }

      try {
        const updates: any = { status, updated_at: new Date().toISOString() };
        if (status === "completed") {
          updates.payment_status = "paid";
          updates.deposit = booking.price;
        }

        const { error } = await supabase
          .from("bookings")
          .update(updates)
          .eq("booking_id", id);

        if (error) throw error;
        await loadBookings();
        addToast(`Booking #${id} updated to ${status}`, "success");
      } catch (err) {
        console.error(err);
        addToast("Failed to update status", "error");
      }
    },
    [bookings, loadBookings, addToast]
  );

  const updateDeposit = useCallback(
    async (id: number, value: number) => {
      const booking = bookings.find((b) => b.id === id);
      if (!booking || value < 0 || value > booking.price) return;

      const paymentStatus =
        value >= booking.price ? "paid" : value > 0 ? "partial" : "unpaid";
      let newStatus = booking.status;
      const requiredDeposit = Math.ceil(booking.price / 2);
      if (booking.status === "pending" && value >= requiredDeposit) {
        newStatus = "confirmed";
        addToast(`Deposit complete! Booking #${id} confirmed.`, "success");
      }

      try {
        const { error } = await supabase
          .from("bookings")
          .update({
            deposit: value,
            payment_status: paymentStatus,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", id);

        if (error) throw error;
        await loadBookings();
      } catch (err) {
        console.error(err);
        addToast("Failed to update deposit", "error");
      }
    },
    [bookings, loadBookings, addToast]
  );

  const handlePayment = useCallback(
    async (
      bookingId: number,
      amount: number,
      method: PaymentMethod,
      reference: string
    ) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      try {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert([
            {
              booking_id: bookingId,
              amount,
              method,
              reference,
              status: "completed",
              date: new Date().toISOString(),
            },
          ]);

        if (paymentError) throw paymentError;

        const newDeposit = (booking.deposit || 0) + amount;
        const paymentStatus =
          newDeposit >= booking.price
            ? "paid"
            : newDeposit > 0
            ? "partial"
            : "unpaid";
        let newStatus = booking.status;
        const requiredDeposit = Math.ceil(booking.price / 2);
        if (booking.status === "pending" && newDeposit >= requiredDeposit) {
          newStatus = "confirmed";
          addToast(`Deposit complete! Booking #${bookingId} confirmed.`, "success");
        }

        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            deposit: newDeposit,
            payment_status: paymentStatus,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", bookingId);

        if (updateError) throw updateError;

        await loadBookings();
        addToast(`Payment of KSh ${amount.toLocaleString()} recorded`, "success");
      } catch (err) {
        console.error(err);
        addToast("Failed to record payment", "error");
      }
    },
    [bookings, loadBookings, addToast]
  );

  const deleteBooking = useCallback(
    async (id: number) => {
      try {
        const { error } = await supabase
          .from("bookings")
          .delete()
          .eq("booking_id", id);

        if (error) throw error;
        await loadBookings();
        setShowDeleteConfirm(null);
        addToast(`Booking #${id} deleted`, "success");
      } catch (err) {
        console.error(err);
        addToast("Failed to delete booking", "error");
      }
    },
    [loadBookings, addToast]
  );

  const updateNotes = useCallback(
    async (id: number, notes: string) => {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({ notes, updated_at: new Date().toISOString() })
          .eq("booking_id", id);

        if (error) throw error;
        await loadBookings();
        setEditingNotes(null);
        addToast("Notes updated", "success");
      } catch (err) {
        console.error(err);
        addToast("Failed to update notes", "error");
      }
    },
    [loadBookings, addToast]
  );

  const sendReminder = useCallback(
    (booking: Booking) => {
      const message = `Hi ${booking.name}, your ${booking.service} event is on ${formatDate(
        booking.date
      )}.`;
      window.open(
        `https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
      addToast(`Reminder sent`, "info");
    },
    [addToast]
  );

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setAsc(!asc);
      else {
        setSortKey(key);
        setAsc(true);
      }
    },
    [sortKey, asc]
  );

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const earnings = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + b.price, 0);
    const collected = bookings.reduce(
      (s, b) => s + (b.deposit || 0),
      0
    );
    const pendingBalance = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + ((b.price || 0) - (b.deposit || 0)), 0);
    const today = bookings.filter(
      (b) => normalizeDate(b.date) === normalizeDate(new Date().toISOString())
    ).length;
    return {
      total,
      completed,
      pending,
      confirmed,
      cancelled,
      earnings,
      collected,
      pendingBalance,
      today,
    };
  }, [bookings]);

  const filteredAndGrouped = useMemo(() => {
    let filtered = bookings;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.phone.includes(term) ||
          b.service.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all")
      filtered = filtered.filter((b) => b.status === statusFilter);
    const map: Record<string, Booking[]> = {};
    filtered.forEach((b) => {
      const cleanDate = normalizeDate(b.date);
      if (!cleanDate) return;
      const month = cleanDate.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push({ ...b, date: cleanDate });
    });
    return map;
  }, [bookings, searchTerm, statusFilter]);

  const sortData = useCallback(
    (data: Booking[]) => {
      return [...data].sort((a, b) => {
        let A: any = a[sortKey];
        let B: any = b[sortKey];
        if (sortKey === "price" || sortKey === "deposit") {
          A = Number(A || 0);
          B = Number(B || 0);
        }
        if (sortKey === "date") {
          A = new Date(A).getTime();
          B = new Date(B).getTime();
        }
        if (typeof A === "string") {
          A = A.toLowerCase();
          B = B.toLowerCase();
        }
        if (A < B) return asc ? -1 : 1;
        if (A > B) return asc ? 1 : -1;
        return 0;
      });
    },
    [sortKey, asc]
  );

  if (isLoadingAuth)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Verifying...
      </div>
    );
  if (!isAuthenticated) return null;
  if (isLoading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm animate-slide-in ${
              t.type === "success"
                ? "bg-green-500 text-black"
                : t.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Alakara Studios CRM</h1>
              <p className="text-zinc-400">Manage bookings, payments & clients</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(bookings)}
                className="bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700"
              >
                📥 Export CSV
              </button>
              <a
                href="/portal"
                target="_blank"
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200"
              >
                👤 Portal
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* VIEWS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ledger", "calendar", "analytics", "customers", "staff"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as View)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === v
                  ? "bg-white text-black"
                  : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {v === "ledger" && "📊 Ledger"}
              {v === "calendar" && "📅 Calendar"}
              {v === "analytics" && "📈 Analytics"}
              {v === "customers" && "👥 Customers"}
              {v === "staff" && "👥 Staff"}
            </button>
          ))}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Today</p>
            <p className="text-lg font-bold">{stats.today}</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Pending</p>
            <p className="text-lg font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Confirmed</p>
            <p className="text-lg font-bold text-blue-400">{stats.confirmed}</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Completed</p>
            <p className="text-lg font-bold text-green-400">
              {stats.completed}
            </p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Earnings</p>
            <p className="text-lg font-bold text-green-400">
              KSh {(stats.earnings / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Collected</p>
            <p className="text-lg font-bold text-green-400">
              KSh {(stats.collected / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Pending $</p>
            <p className="text-lg font-bold text-red-400">
              KSh {(stats.pendingBalance / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-xs">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
        </div>

        {/* VIEW CONTENT */}
        {view === "calendar" && (
          <CalendarView
            bookings={bookings}
            onBookingClick={(b) => {
              setSelectedBooking(b);
              setShowBookingDetail(true);
            }}
          />
        )}
        {view === "analytics" && <AnalyticsDashboard bookings={bookings} />}
        {view === "staff" && <StaffManager onStaffChange={() => loadBookings()} />}
        {view === "customers" && <CustomerList bookings={bookings} />}

        {/* LEDGER VIEW */}
        {view === "ledger" && (
          <>
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {Object.keys(filteredAndGrouped).length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                No bookings found
              </div>
            ) : (
              Object.keys(filteredAndGrouped)
                .sort((a, b) => b.localeCompare(a))
                .map((month) => {
                  const data = sortData(filteredAndGrouped[month]);
                  const monthlyCollected = data.reduce(
                    (s, b) => s + (b.deposit || 0),
                    0
                  );
                  return (
                    <div
                      key={month}
                      className="mb-8 border border-zinc-800 rounded-xl overflow-hidden"
                    >
                      <div className="bg-zinc-900 p-4">
                        <h2 className="text-lg font-bold">
                          📅{" "}
                          {new Date(month + "-01").toLocaleDateString("en-KE", {
                            year: "numeric",
                            month: "long",
                          })}
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-zinc-900/60">
                            <tr>
                              {[
                                "date",
                                "name",
                                "phone",
                                "service",
                                "package",
                                "price",
                                "deposit",
                                "balance",
                                "status",
                                "payment",
                              ].map((k) => (
                                <th
                                  key={k}
                                  onClick={() => handleSort(k as SortKey)}
                                  className="p-3 cursor-pointer hover:bg-zinc-800"
                                >
                                  {k.toUpperCase()}{" "}
                                  {sortKey === k && (asc ? "▲" : "▼")}
                                </th>
                              ))}
                              <th>ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((b) => {
                              const balance = b.price - b.deposit;
                              return (
                                <tr
                                  key={b.id}
                                  className="border-t border-zinc-800 hover:bg-zinc-900/50"
                                >
                                  <td className="p-3">{formatDate(b.date)}</td>
                                  <td className="p-3">
                                    <button
                                      onClick={() => {
                                        setSelectedBooking(b);
                                        setShowBookingDetail(true);
                                      }}
                                      className="hover:underline"
                                    >
                                      {b.name}
                                      {b.notes && "📝"}
                                    </button>
                                  </td>
                                  <td className="p-3">{b.phone}</td>
                                  <td className="p-3">{b.service}</td>
                                  <td className="p-3">{b.package}</td>
                                  <td className="p-3">
                                    KSh {b.price.toLocaleString()}
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={b.deposit || 0}
                                      onChange={(e) =>
                                        updateDeposit(
                                          b.id,
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-24 bg-zinc-800 border border-zinc-700 p-2 rounded"
                                      min={0}
                                      max={b.price}
                                      step="1000"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={
                                        balance > 0
                                          ? "text-red-400"
                                          : "text-green-400"
                                      }
                                    >
                                      KSh {balance.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <select
                                      value={b.status}
                                      onChange={(e) =>
                                        updateStatus(
                                          b.id,
                                          e.target.value as BookingStatus
                                        )
                                      }
                                      className={`p-2 rounded text-sm ${
                                        b.status === "completed"
                                          ? "bg-green-900/50 text-green-400"
                                          : b.status === "confirmed"
                                          ? "bg-blue-900/50 text-blue-400"
                                          : "bg-yellow-900/50 text-yellow-400"
                                      }`}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">
                                        Confirmed
                                      </option>
                                      <option value="completed">
                                        Completed
                                      </option>
                                      <option value="cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        b.paymentStatus === "paid"
                                          ? "bg-green-900/50 text-green-400"
                                          : b.paymentStatus === "partial"
                                          ? "bg-yellow-900/50 text-yellow-400"
                                          : "bg-red-900/50 text-red-400"
                                      }`}
                                    >
                                      {b.paymentStatus.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-1">
                                      {balance > 0 && (
                                        <button
                                          onClick={() =>
                                            setShowPaymentModal(b)
                                          }
                                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                                        >
                                          💳
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          window.open(
                                            `https://wa.me/${b.phone.replace(
                                              /\D/g,
                                              ""
                                            )}`,
                                            "_blank"
                                          )
                                        }
                                        className="bg-green-500 text-black px-2 py-1 rounded text-xs"
                                      >
                                        💬
                                      </button>
                                      <button
                                        onClick={() => sendReminder(b)}
                                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        🔔
                                      </button>
                                      {showDeleteConfirm === b.id ? (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => deleteBooking(b.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={() =>
                                              setShowDeleteConfirm(null)
                                            }
                                            className="bg-zinc-600 text-white px-2 py-1 rounded text-xs"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            setShowDeleteConfirm(b.id)
                                          }
                                          className="bg-zinc-700 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                        >
                                          🗑
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-zinc-900/80 font-bold">
                              <td
                                colSpan={7}
                                className="p-3 text-right text-zinc-400"
                              >
                                Monthly Collected
                              </td>
                              <td className="p-3 text-blue-400">
                                KSh {monthlyCollected.toLocaleString()}
                              </td>
                              <td colSpan={3}></td>
                            </tr>
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

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <PaymentModal
          booking={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
          onPaymentComplete={(amt, method, ref) => {
            handlePayment(showPaymentModal.id, amt, method, ref);
            setShowPaymentModal(null);
          }}
        />
      )}

      {/* BOOKING DETAIL MODAL */}
      {showBookingDetail && selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4"
          onClick={() => setShowBookingDetail(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                Booking #{selectedBooking.id}
              </h2>
              <button onClick={() => setShowBookingDetail(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-zinc-400 text-sm">Client</p>
                <p className="font-semibold">{selectedBooking.name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Phone</p>
                <p>{selectedBooking.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Service</p>
                <p>{selectedBooking.service}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Package</p>
                <p>{selectedBooking.package}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Date</p>
                <p>{formatDate(selectedBooking.date)}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Status</p>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => {
                    updateStatus(
                      selectedBooking.id,
                      e.target.value as BookingStatus
                    );
                    setSelectedBooking({
                      ...selectedBooking,
                      status: e.target.value as BookingStatus,
                    });
                  }}
                  className="bg-zinc-800 p-1 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">
                  KSh {selectedBooking.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span className="text-green-400">
                  KSh {(selectedBooking.deposit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Balance</span>
                <span className="text-red-400">
                  KSh{" "}
                  {(
                    selectedBooking.price - (selectedBooking.deposit || 0)
                  ).toLocaleString()}
                </span>
              </div>
              {selectedBooking.price - (selectedBooking.deposit || 0) > 0 && (
                <button
                  onClick={() => {
                    setShowBookingDetail(false);
                    setShowPaymentModal(selectedBooking);
                  }}
                  className="w-full mt-3 bg-green-600 py-2 rounded"
                >
                  Record Payment
                </button>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Team</h4>
              <StaffAssignmentManager
                bookingId={selectedBooking.id}
                onAssignmentChange={() => loadBookings()}
              />
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Notes</h4>
              {editingNotes === selectedBooking.id ? (
                <>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full bg-zinc-800 p-2 rounded"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateNotes(selectedBooking.id, notesText)}
                      className="bg-white text-black px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="bg-zinc-700 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => {
                    setEditingNotes(selectedBooking.id);
                    setNotesText(selectedBooking.notes || "");
                  }}
                  className="bg-zinc-800 p-3 rounded cursor-pointer"
                >
                  {selectedBooking.notes || "Click to add notes..."}
                </div>
              )}
            </div>
            {selectedBooking.message && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-zinc-400">{selectedBooking.message}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${selectedBooking.phone.replace(
                      /\D/g,
                      ""
                    )}`,
                    "_blank"
                  )
                }
                className="flex-1 bg-green-600 py-2 rounded"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => sendReminder(selectedBooking)}
                className="flex-1 bg-blue-600 py-2 rounded"
              >
                🔔 Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ---------------- CUSTOMER LIST ---------------- */
function CustomerList({ bookings }: { bookings: Booking[] }) {
  const customers = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        phone: string;
        totalSpent: number;
        lastBooking: string;
        count: number;
      }
    > = {};
    bookings.forEach((b) => {
      if (!map[b.phone])
        map[b.phone] = {
          name: b.name,
          phone: b.phone,
          totalSpent: 0,
          lastBooking: b.date,
          count: 0,
        };
      map[b.phone].totalSpent += b.deposit || 0;
      map[b.phone].count++;
      if (new Date(b.date) > new Date(map[b.phone].lastBooking))
        map[b.phone].lastBooking = b.date;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [bookings]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Customer List</h2>
      <div className="grid gap-4">
        {customers.map((c) => (
          <div
            key={c.phone}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-zinc-400">{c.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">
                  KSh {c.totalSpent.toLocaleString()}
                </p>
                <p className="text-zinc-400 text-sm">
                  {c.count} booking{c.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                Last: {formatDate(c.lastBooking)}
              </span>
              {c.count > 1 && (
                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 ml-2 rounded">
                  Repeat
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}