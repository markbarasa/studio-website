// app/portal/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

/* ---------------- TYPES ---------------- */
type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  reference: string;
  date: string;
  status: string;
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  date: string;
  message?: string;
  venue?: string;
  payments: Payment[];
  notes?: string;
  createdAt: string;
  assignedStaff?: number[];
  assignedEquipment?: number[];
};

type ToastType = "success" | "error" | "info";

type StaffMember = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  color: string;
};

/* ---------------- ADDITIONAL FEATURES ---------------- */

// Countdown Timer Component
function CountdownTimer({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const event = new Date(eventDate).getTime();
      const diff = event - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  const isToday = new Date(eventDate).toDateString() === new Date().toDateString();
  const isPast = new Date(eventDate) < new Date();

  if (isPast) return <p className="text-green-400 font-medium">✅ Event completed!</p>;
  if (isToday) return <p className="text-yellow-400 font-medium animate-pulse">🎉 Today is the day!</p>;

  return (
    <div className="flex gap-3 text-center">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Mins" },
      ].map((item, i) => (
        <div key={i} className="bg-zinc-800 rounded-lg px-3 py-2 min-w-[60px]">
          <p className="text-xl font-bold">{item.value}</p>
          <p className="text-xs text-zinc-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// Staff Preview Component
function StaffPreview({ staffIds }: { staffIds: number[] }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("staff");
    if (stored) {
      try {
        const allStaff = JSON.parse(stored);
        setStaff(allStaff.filter((s: StaffMember) => staffIds.includes(s.id)));
      } catch {}
    }
  }, [staffIds]);

  if (staff.length === 0) return null;

  const roleIcons: Record<string, string> = {
    lead_photographer: "📸",
    photographer: "📷",
    lead_videographer: "🎥",
    videographer: "🎬",
    drone_operator: "🛸",
    editor: "✂️",
    assistant: "🤝",
  };

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span>👥</span> Your Team
      </h3>
      <div className="flex flex-wrap gap-2">
        {staff.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: member.color + "30", color: member.color }}
            >
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
              <p className="text-xs text-zinc-400">
                {roleIcons[member.role] || "👤"} {member.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Equipment Preview Component
function EquipmentPreview({ equipmentIds }: { equipmentIds: number[] }) {
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("equipment");
    if (stored) {
      try {
        const allEquipment = JSON.parse(stored);
        setEquipment(allEquipment.filter((e: any) => equipmentIds.includes(e.id)));
      } catch {}
    }
  }, [equipmentIds]);

  if (equipment.length === 0) return null;

  const icons: Record<string, string> = {
    camera: "📸", lens: "🔍", drone: "🛸", lighting: "💡",
    audio: "🎤", stabilizer: "🎥", accessory: "🔧", storage: "💾",
  };

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span>🎬</span> Equipment Prepared
      </h3>
      <div className="flex flex-wrap gap-2">
        {equipment.map(eq => (
          <span key={eq.id} className="bg-green-900/30 text-green-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
            {icons[eq.category] || "📦"} {eq.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Share Booking Component
function ShareBooking({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);

  const shareText = `📸 My Booking with Alakara Studios\n\n📅 Date: ${new Date(booking.date).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n🎬 Service: ${booking.service} - ${booking.package}\n💰 Price: KSh ${booking.price.toLocaleString()}\n\nBook yours at: ${window.location.origin}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Booking - Alakara Studios",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
    >
      {copied ? "✅ Copied!" : "📤"} {copied ? "Copied to clipboard" : "Share Booking"}
    </button>
  );
}

// Quick Actions Component
function QuickActions({ booking }: { booking: Booking }) {
  const actions = [
    {
      label: "Add to Calendar",
      icon: "📅",
      onClick: () => {
        const date = new Date(booking.date);
        const endDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.service + " - Alakara Studios")}&dates=${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z&details=${encodeURIComponent("Booking #" + booking.id)}&location=${encodeURIComponent(booking.venue || "")}`;
        window.open(googleCalUrl, "_blank");
      },
    },
    {
      label: "Get Directions",
      icon: "📍",
      onClick: () => {
        if (booking.venue) {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`, "_blank");
        }
      },
      show: !!booking.venue,
    },
    {
      label: "Download Invoice",
      icon: "📄",
      onClick: () => {
        // Trigger receipt download
        const event = new CustomEvent("downloadReceipt");
        window.dispatchEvent(event);
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.filter(a => a.show !== false).map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
        >
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function CustomerPortal() {
  const [bookingId, setBookingId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "details">("overview");

  // ... (keep all existing functions: getBookings, findBooking, handleLogin, handleLogout, downloadReceipt, generateReceiptHTML, formatDate, getStatusColor, getPaymentStatusColor, getRequiredDeposit)

  // Listen for download receipt event from QuickActions
  useEffect(() => {
    const handler = () => downloadReceipt();
    window.addEventListener("downloadReceipt", handler);
    return () => window.removeEventListener("downloadReceipt", handler);
  }, [booking]);

  const getBookings = (): Booking[] => {
    try {
      const data = localStorage.getItem("bookings");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const findBooking = (id: number, phone: string): Booking | null => {
    const bookings = getBookings();
    const found = bookings.find(b => b.id === id && b.phone === phone);
    if (found) {
      return {
        ...found,
        status: found.status || "pending",
        paymentStatus: found.paymentStatus || "unpaid",
        deposit: found.deposit || 0,
        payments: found.payments || [],
        notes: found.notes || "",
        createdAt: found.createdAt || new Date().toISOString(),
        assignedStaff: found.assignedStaff || [],
        assignedEquipment: found.assignedEquipment || [],
      };
    }
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const id = parseInt(bookingId);
    if (isNaN(id)) { setError("Please enter a valid booking ID"); return; }
    if (!phoneNumber.trim()) { setError("Please enter your phone number"); return; }
    setIsLoading(true);
    setTimeout(() => {
      const found = findBooking(id, phoneNumber);
      if (found) { setBooking(found); setError(""); }
      else { setError("No booking found. Check your Booking ID and phone number."); }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setBooking(null);
    setBookingId("");
    setPhoneNumber("");
    setActiveTab("overview");
  };

  const getRequiredDeposit = (price: number) => Math.ceil(price / 2);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch ((status || "pending").toLowerCase()) {
      case "confirmed": return "text-green-400 bg-green-500/10";
      case "completed": return "text-blue-400 bg-blue-500/10";
      case "cancelled": return "text-red-400 bg-red-500/10";
      default: return "text-yellow-400 bg-yellow-500/10";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch ((status || "unpaid").toLowerCase()) {
      case "paid": return "text-green-400";
      case "partial": return "text-yellow-400";
      default: return "text-red-400";
    }
  };

  const downloadReceipt = () => {
    if (!booking) return;
    const receiptHTML = generateReceiptHTML(booking);
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alakara_Studios_Receipt_${booking.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ message: "Receipt downloaded!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const generateReceiptHTML = (booking: Booking): string => {
    // ... (keep your existing receipt HTML generator)
    const balance = Math.max(0, (booking.price || 0) - (booking.deposit || 0));
    const requiredDeposit = getRequiredDeposit(booking.price);
    const formattedDate = new Date(booking.date).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const formattedCreatedDate = new Date(booking.createdAt || booking.date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
    
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Alakara Studios - Receipt #${booking.id}</title>
    <style>${`*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f5f5f5;padding:40px}.receipt{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.header{background:#1a1a1a;color:#fff;padding:30px;text-align:center}.header h1{font-size:28px;margin-bottom:8px}.receipt-number{background:#C6A43F;color:#000;padding:6px 16px;border-radius:20px;display:inline-block;margin-top:12px;font-weight:700}.content{padding:30px}.section{margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:15px}.section-title{font-size:18px;font-weight:700;margin-bottom:12px}.row{display:flex;justify-content:space-between;padding:8px 0}.label{color:#666}.value{font-weight:500}.payment-summary{background:#f9fafb;border-radius:12px;padding:20px;margin-top:20px}.total-row{font-size:18px;font-weight:700;margin-top:10px;padding-top:10px;border-top:2px solid #e5e7eb}.footer{background:#f9fafb;padding:20px;text-align:center;color:#666;font-size:12px}`}</style>
    </head><body><div class="receipt"><div class="header"><h1>Alakara Studios</h1><p style="color:#C6A43F">Where Moments Become Memories</p><div class="receipt-number">Receipt #: ALA-${booking.id}</div></div><div class="content">
    <div class="section"><div class="section-title">📋 Booking Information</div><div class="row"><span class="label">Booking ID:</span><span class="value">#${booking.id}</span></div><div class="row"><span class="label">Created:</span><span class="value">${formattedCreatedDate}</span></div><div class="row"><span class="label">Status:</span><span class="value">${(booking.status || "pending").toUpperCase()}</span></div></div>
    <div class="section"><div class="section-title">👤 Client</div><div class="row"><span class="label">Name:</span><span class="value">${booking.name}</span></div><div class="row"><span class="label">Phone:</span><span class="value">${booking.phone}</span></div></div>
    <div class="section"><div class="section-title">🎬 Service</div><div class="row"><span class="label">Service:</span><span class="value">${booking.service}</span></div><div class="row"><span class="label">Package:</span><span class="value">${booking.package}</span></div><div class="row"><span class="label">Date:</span><span class="value">${formattedDate}</span></div>${booking.venue ? `<div class="row"><span class="label">Venue:</span><span class="value">${booking.venue}</span></div>` : ""}</div>
    <div class="payment-summary"><div class="section-title">💰 Payment</div><div class="row"><span class="label">Total:</span><span class="value">KSh ${(booking.price || 0).toLocaleString()}</span></div><div class="row"><span class="label">Deposit Required:</span><span class="value">KSh ${requiredDeposit.toLocaleString()}</span></div><div class="row"><span class="label">Paid:</span><span class="value" style="color:#10B981">KSh ${(booking.deposit || 0).toLocaleString()}</span></div>${balance > 0 ? `<div class="row total-row"><span class="label">Balance:</span><span class="value" style="color:#EF4444">KSh ${balance.toLocaleString()}</span></div>` : '<div class="row total-row"><span class="label">Status:</span><span class="value" style="color:#10B981">FULLY PAID ✓</span></div>'}</div>
    </div><div class="footer"><p>Thank you for choosing Alakara Studios!</p><p>WhatsApp: +254 797 356421</p></div></div></body></html>`;
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
          toast.type === "success" ? "bg-green-500 text-black" : toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}
      
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Customer Portal</h1>
          <p className="text-zinc-400">Access your booking, track progress, and download receipts</p>
        </div>
        
        {!booking ? (
          /* LOGIN FORM */
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔐</div>
              <h2 className="text-2xl font-bold">Access Your Booking</h2>
              <p className="text-zinc-400 text-sm mt-2">Enter your Booking ID and phone number</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Booking ID *</label>
                <input type="number" value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="e.g., 1734567890123" className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-[#C6A43F] transition outline-none" required />
                <p className="text-xs text-zinc-500 mt-1">Found in your WhatsApp confirmation message</p>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Phone Number *</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0712345678" className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-[#C6A43F] transition outline-none" required />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-[#C6A43F] text-black py-4 rounded-xl font-semibold hover:bg-[#A8872D] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>Verifying...</> : "Access Booking"}
              </button>
            </form>
          </div>
        ) : (
          /* BOOKING DETAILS */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {booking.status === "confirmed" && "✅"}
                  {booking.status === "pending" && "⏳"}
                  {booking.status === "completed" && "🎉"}
                  {booking.status === "cancelled" && "❌"}
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Welcome back,</p>
                  <p className="text-xl font-semibold">{booking.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShareBooking booking={booking} />
                <button onClick={handleLogout} className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition text-sm">Logout</button>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Event Date: <span className="text-white font-medium">{formatDate(booking.date)}</span></p>
              </div>
              <CountdownTimer eventDate={booking.date} />
            </div>

            {/* Status Banner */}
            <div className={`p-6 rounded-xl border ${getStatusColor(booking.status)}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {booking.status === "confirmed" && "✅"}
                  {booking.status === "pending" && "⏳"}
                  {booking.status === "completed" && "🎉"}
                  {booking.status === "cancelled" && "❌"}
                </span>
                <div>
                  <p className="font-bold text-lg">Booking #{booking.id}</p>
                  <p className="text-sm opacity-90">
                    {booking.status === "confirmed" && "Your booking is confirmed!"}
                    {booking.status === "pending" && "Awaiting deposit payment"}
                    {booking.status === "completed" && "Service completed! Thank you!"}
                    {booking.status === "cancelled" && "Booking cancelled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions booking={booking} />

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
              {[
                { key: "overview", label: "📋 Overview" },
                { key: "payments", label: "💰 Payments" },
                { key: "details", label: "📝 Details" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === tab.key ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Progress Timeline */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-6">Booking Progress</h3>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-700" />
                    <div className="space-y-8 relative">
                      {[
                        { label: "Booking Received", icon: "📝", completed: true, time: formatDate(booking.createdAt || booking.date) },
                        { label: "Deposit Paid", icon: "💰", completed: (booking.deposit || 0) >= getRequiredDeposit(booking.price), time: (booking.deposit || 0) >= getRequiredDeposit(booking.price) ? "Completed" : "Pending" },
                        { label: "Booking Confirmed", icon: "✅", completed: booking.status === "confirmed" || booking.status === "completed", time: booking.status === "confirmed" || booking.status === "completed" ? "Confirmed" : "Pending" },
                        { label: "Service Completed", icon: "🎬", completed: booking.status === "completed", time: booking.status === "completed" ? formatDate(booking.date) : "Pending" },
                      ].map((step, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${step.completed ? "bg-[#C6A43F] text-black" : "bg-zinc-800 text-zinc-500"}`}>
                            <span className="text-xl">{step.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`font-semibold ${step.completed ? "text-white" : "text-zinc-500"}`}>{step.label}</h4>
                              </div>
                              <p className="text-xs text-zinc-500">{step.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team & Equipment */}
                <div className="grid md:grid-cols-2 gap-6">
                  {booking.assignedStaff && booking.assignedStaff.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                      <StaffPreview staffIds={booking.assignedStaff} />
                    </div>
                  )}
                  {booking.assignedEquipment && booking.assignedEquipment.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                      <EquipmentPreview equipmentIds={booking.assignedEquipment} />
                    </div>
                  )}
                </div>

                {/* Deposit Status for Pending */}
                {booking.status === "pending" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h3 className="font-semibold mb-3 text-yellow-400">💰 Deposit Required</h3>
                    <p className="text-sm text-zinc-300 mb-3">
                      50% deposit of <span className="font-bold text-yellow-400">KSh {getRequiredDeposit(booking.price).toLocaleString()}</span> required
                    </p>
                    <div className="bg-zinc-800 rounded-full h-3 overflow-hidden mb-2">
                      <div className="bg-yellow-400 h-full transition-all" style={{ width: `${Math.min(100, ((booking.deposit || 0) / getRequiredDeposit(booking.price)) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {((booking.deposit || 0) / getRequiredDeposit(booking.price) * 100).toFixed(0)}% paid • KSh {(booking.deposit || 0).toLocaleString()} / KSh {getRequiredDeposit(booking.price).toLocaleString()}
                    </p>
                    {(booking.deposit || 0) < getRequiredDeposit(booking.price) && (
                      <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-green-400 mb-2">M-Pesa Paybill</h4>
                        <p className="text-sm text-zinc-300">Paybill: <span className="font-mono font-bold">123456</span></p>
                        <p className="text-sm text-zinc-300">Account: <span className="font-mono font-bold">ALAKARA{booking.id}</span></p>
                        <p className="text-sm text-zinc-300">Amount: <span className="font-bold text-yellow-400">KSh {(getRequiredDeposit(booking.price) - (booking.deposit || 0)).toLocaleString()}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">💰 Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-zinc-400">Total:</span><span className="font-medium">KSh {(booking.price || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Deposit Required:</span><span className="text-yellow-400">KSh {getRequiredDeposit(booking.price).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Paid:</span><span className="text-green-400 font-medium">KSh {(booking.deposit || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between pt-3 border-t border-zinc-800"><span className="text-zinc-400">Balance:</span><span className={`font-bold ${(booking.price || 0) - (booking.deposit || 0) > 0 ? "text-red-400" : "text-green-400"}`}>KSh {((booking.price || 0) - (booking.deposit || 0)).toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">📜 Payment History</h3>
                    {booking.payments && booking.payments.length > 0 ? (
                      <div className="space-y-2">
                        {booking.payments.map(payment => (
                          <div key={payment.id} className="flex justify-between bg-zinc-800 p-3 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                              <p className="text-xs text-zinc-400">{payment.method?.toUpperCase()} • {payment.reference}</p>
                            </div>
                            <p className="text-green-400 font-semibold">+KSh {(payment.amount || 0).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm">No payments recorded yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">📋 Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-zinc-400 text-sm">Service</p><p className="font-medium">{booking.service}</p></div>
                    <div><p className="text-zinc-400 text-sm">Package</p><p className="font-medium">{booking.package}</p></div>
                    <div><p className="text-zinc-400 text-sm">Date</p><p className="font-medium">{formatDate(booking.date)}</p></div>
                    <div><p className="text-zinc-400 text-sm">Venue</p><p className="font-medium">{booking.venue || "Not specified"}</p></div>
                    <div><p className="text-zinc-400 text-sm">Status</p><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>{(booking.status || "pending").toUpperCase()}</span></div>
                    <div><p className="text-zinc-400 text-sm">Payment</p><span className={`font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>{(booking.paymentStatus || "unpaid").toUpperCase()}</span></div>
                  </div>
                </div>
                {booking.message && (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-2">💬 Your Message</h3>
                    <p className="text-zinc-400">{booking.message}</p>
                  </div>
                )}
                {booking.notes && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="font-semibold mb-2">📝 Note from Studio</h3>
                    <p className="text-blue-400">{booking.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={downloadReceipt} className="flex-1 bg-[#C6A43F] text-black py-4 rounded-xl font-semibold hover:bg-[#A8872D] transition">📥 Download Receipt</button>
              <a href={`https://wa.me/254797356421?text=Hi%20Alakara%20Studios,%20question%20about%20booking%20#${booking.id}`} target="_blank" className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition text-center">💬 Contact Support</a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </main>
  );
}