"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";

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
};

export default function CustomerPortal() {
  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const savedBookingId = localStorage.getItem("portal_bookingId");
    const savedPhone = localStorage.getItem("portal_phone");
    if (savedBookingId && savedPhone) {
      setBookingId(savedBookingId);
      setPhone(savedPhone);
      fetchBooking(parseInt(savedBookingId), savedPhone);
    }
  }, []);

  // Set up realtime subscription when booking is loaded
  useEffect(() => {
    if (!booking) return;

    const bookingSubscription = supabase
      .channel(`booking-${booking.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `booking_id=eq.${booking.id}`,
        },
        (payload) => {
          console.log("Booking updated:", payload);
          setBooking((prev) => {
            if (!prev) return prev;
            const updated = payload.new;
            return {
              ...prev,
              deposit: updated.deposit || 0,
              status: updated.status,
              paymentStatus: updated.payment_status,
              notes: updated.notes,
            };
          });
        }
      )
      .subscribe();

    const paymentSubscription = supabase
      .channel(`payments-${booking.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payments",
          filter: `booking_id=eq.${booking.id}`,
        },
        async () => {
          const { data: paymentsData } = await supabase
            .from("payments")
            .select("*")
            .eq("booking_id", booking.id)
            .order("date", { ascending: true });
          setBooking((prev) => {
            if (!prev) return prev;
            return { ...prev, payments: paymentsData || [] };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingSubscription);
      supabase.removeChannel(paymentSubscription);
    };
  }, [booking?.id]);

  const fetchBooking = async (id: number, phoneNum: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", id)
        .eq("phone", phoneNum)
        .single();

      if (bookingError || !bookingData) {
        setError("No booking found. Check your Booking ID and Phone number.");
        localStorage.removeItem("portal_bookingId");
        localStorage.removeItem("portal_phone");
        setIsLoading(false);
        return;
      }

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingData.booking_id)
        .order("date", { ascending: true });

      const formattedBooking: Booking = {
        id: bookingData.booking_id,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        service: bookingData.service,
        package: bookingData.package,
        price: bookingData.price,
        deposit: bookingData.deposit || 0,
        status: bookingData.status,
        paymentStatus: bookingData.payment_status,
        date: bookingData.event_date,
        message: bookingData.message,
        venue: bookingData.venue,
        payments: paymentsData || [],
        notes: bookingData.notes,
        createdAt: bookingData.created_at,
      };

      setBooking(formattedBooking);
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const findBooking = async () => {
    if (!bookingId || !phone) {
      setError("Please enter both Booking ID and Phone number.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const idNum = parseInt(bookingId);
      if (isNaN(idNum)) {
        setError("Booking ID must be a number.");
        setIsLoading(false);
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", idNum)
        .eq("phone", phone)
        .single();

      if (bookingError || !bookingData) {
        setError("No booking found. Check your Booking ID and Phone number.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("portal_bookingId", bookingId);
      localStorage.setItem("portal_phone", phone);

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingData.booking_id)
        .order("date", { ascending: true });

      const formattedBooking: Booking = {
        id: bookingData.booking_id,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        service: bookingData.service,
        package: bookingData.package,
        price: bookingData.price,
        deposit: bookingData.deposit || 0,
        status: bookingData.status,
        paymentStatus: bookingData.payment_status,
        date: bookingData.event_date,
        message: bookingData.message,
        venue: bookingData.venue,
        payments: paymentsData || [],
        notes: bookingData.notes,
        createdAt: bookingData.created_at,
      };

      setBooking(formattedBooking);
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portal_bookingId");
    localStorage.removeItem("portal_phone");
    setBooking(null);
    setBookingId("");
    setPhone("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (booking) {
    const requiredDeposit = Math.ceil(booking.price / 2);
    const remainingDeposit = Math.max(0, requiredDeposit - booking.deposit);
    const totalBalance = booking.price - booking.deposit;
    const isDepositSufficient = booking.deposit >= requiredDeposit;
    const isConfirmedOrCompleted = booking.status === "confirmed" || booking.status === "completed";

    const paymentWhatsAppMessage = `Hello Alakara Studios, I need help with payment for my booking #${booking.id}. My remaining deposit is KSh ${remainingDeposit.toLocaleString()}. Please assist.`;

    return (
      <main className="bg-black text-white min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-white text-sm bg-zinc-800 px-3 py-1 rounded-lg"
              >
                Logout
              </button>
            </div>

            {/* Booking Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-zinc-400 text-sm">Client Name</p>
                <p className="font-semibold text-lg">{booking.name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Phone</p>
                <p className="font-semibold text-lg">{booking.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Service</p>
                <p className="font-semibold text-lg">{booking.service}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Package</p>
                <p className="font-semibold text-lg">{booking.package}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Event Date</p>
                <p className="font-semibold text-lg">{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === "confirmed" ? "bg-blue-500/20 text-blue-400" :
                  booking.status === "completed" ? "bg-green-500/20 text-green-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {booking.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            </div>

            {/* Payment Status & Reminders - Hide progress bar if confirmed/completed */}
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3">Payment Status</h3>
              
              {!isConfirmedOrCompleted ? (
                <>
                  {/* Deposit Progress Bar - only shown for pending */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Deposit Progress (50% required)</span>
                      <span className="text-gold-400">KSh {booking.deposit.toLocaleString()} / {requiredDeposit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, (booking.deposit / requiredDeposit) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining deposit warning */}
                  {remainingDeposit > 0 && !isDepositSufficient && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>Additional deposit required:</strong> KSh {remainingDeposit.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Your booking will NOT be confirmed until the full 50% deposit (KSh {requiredDeposit.toLocaleString()}) is paid.
                      </p>
                    </div>
                  )}

                  {/* Zero deposit warning */}
                  {booking.deposit === 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                      <p className="text-red-400 text-sm">
                        ❌ <strong>No deposit paid yet.</strong>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Your booking is not confirmed. Please pay the 50% deposit (KSh {requiredDeposit.toLocaleString()}) to secure your event date.
                      </p>
                    </div>
                  )}

                  {/* Deposit sufficient but pending confirmation */}
                  {isDepositSufficient && booking.status === "pending" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                      <p className="text-green-400 text-sm">
                        ✅ <strong>Deposit requirement met!</strong>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Your booking will be confirmed shortly. You will receive a WhatsApp notification once confirmed.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Show a simple summary when confirmed/completed – no deposit warnings */
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${booking.status === "confirmed" ? "bg-blue-500/10 border border-blue-500/30" : "bg-green-500/10 border border-green-500/30"}`}>
                    <p className={`text-sm ${booking.status === "confirmed" ? "text-blue-400" : "text-green-400"}`}>
                      {booking.status === "confirmed" ? "✅ Booking Confirmed" : "🎉 Service Completed"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {booking.status === "confirmed" 
                        ? "Thank you for completing your deposit. We look forward to serving you." 
                        : "Thank you for choosing Alakara Studios. We hope you loved our service."}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment summary table – always shown */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Contract Value</span>
                  <span className="font-bold">KSh {booking.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Deposit Paid</span>
                  <span className="text-green-400">KSh {booking.deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-700">
                  <span className="text-zinc-400">Remaining Balance</span>
                  <span className={totalBalance > 0 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                    KSh {totalBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Payment History</h3>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="bg-zinc-800 p-3 rounded-lg flex justify-between text-sm">
                      <div>
                        <p>{new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-xs text-zinc-400">{payment.method.toUpperCase()} • Ref: {payment.reference}</p>
                      </div>
                      <span className="text-green-400 font-semibold">+KSh {payment.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.message && (
              <div className="bg-zinc-800 p-4 rounded-xl mb-6">
                <h4 className="font-semibold mb-1">Your Message</h4>
                <p className="text-zinc-400 text-sm">{booking.message}</p>
              </div>
            )}

            {booking.notes && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-6">
                <h4 className="font-semibold text-blue-400 mb-1">Note from Studio</h4>
                <p className="text-blue-300 text-sm">{booking.notes}</p>
              </div>
            )}

            {/* WhatsApp Payment Support Button – only show if not completed and deposit remains */}
            <div className="flex gap-3">
              {!isConfirmedOrCompleted && remainingDeposit > 0 && (
                <a
                  href={`https://wa.me/254797356421?text=${encodeURIComponent(paymentWhatsAppMessage)}`}
                  target="_blank"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold text-center transition flex items-center justify-center gap-2"
                >
                  💰 Need help with payment? Chat with us
                </a>
              )}
              <a
                href={`https://wa.me/254797356421?text=Hi%20Alakara%20Studios,%20I%20have%20a%20question%20about%20my%20booking%20#${booking.id}`}
                target="_blank"
                className={`${!isConfirmedOrCompleted && remainingDeposit > 0 ? "flex-1" : "w-full"} bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-center transition flex items-center justify-center gap-2`}
              >
                💬 General Inquiry / Support
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <p className="text-zinc-400 mt-2">Access your booking details</p>
          <div className="w-20 h-1 bg-gold-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Booking ID</label>
              <input
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter your booking ID"
                className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-gold-400 focus:outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={findBooking}
              disabled={isLoading}
              className="w-full bg-gold-400 text-black py-4 rounded-xl font-semibold hover:bg-gold-500 transition disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Access Booking"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}