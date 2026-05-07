"use client";

import { useState, useMemo } from "react";

type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  reference: string;
  date: string;
  status: string;
  customerName: string;
  service: string;
  phone: string;
};

type PaymentsDashboardProps = {
  bookings: any[];
};

export default function PaymentsDashboard({ bookings }: PaymentsDashboardProps) {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  // Extract all payments from bookings
  const allPayments = useMemo(() => {
    const payments: Payment[] = [];
    bookings.forEach((booking) => {
      if (booking.payments && booking.payments.length > 0) {
        booking.payments.forEach((payment: any) => {
          payments.push({
            id: payment.id,
            bookingId: booking.id,
            amount: payment.amount,
            method: payment.method,
            reference: payment.reference,
            date: payment.date,
            status: payment.status,
            customerName: booking.name,
            service: booking.service,
            phone: booking.phone,
          });
        });
      }
    });
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);

  // Filter payments by date range
  const filterByDate = (payments: Payment[]) => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    switch (dateRange) {
      case "week":
        return payments.filter((p) => new Date(p.date) >= weekAgo);
      case "month":
        return payments.filter((p) => new Date(p.date) >= monthAgo);
      case "year":
        return payments.filter((p) => new Date(p.date) >= yearAgo);
      default:
        return payments;
    }
  };

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let filtered = filterByDate(allPayments);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.customerName.toLowerCase().includes(term) ||
          p.reference.toLowerCase().includes(term) ||
          p.bookingId.toString().includes(term)
      );
    }
    
    if (selectedMethod !== "all") {
      filtered = filtered.filter((p) => p.method === selectedMethod);
    }
    
    return filtered;
  }, [allPayments, dateRange, searchTerm, selectedMethod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const methodBreakdown = {
      mpesa: filteredPayments.filter((p) => p.method === "mpesa").reduce((sum, p) => sum + p.amount, 0),
      cash: filteredPayments.filter((p) => p.method === "cash").reduce((sum, p) => sum + p.amount, 0),
      bank: filteredPayments.filter((p) => p.method === "bank").reduce((sum, p) => sum + p.amount, 0),
      card: filteredPayments.filter((p) => p.method === "card").reduce((sum, p) => sum + p.amount, 0),
    };
    const uniqueCustomers = new Set(filteredPayments.map((p) => p.bookingId)).size;
    
    return {
      totalPayments,
      averagePayment: filteredPayments.length ? totalPayments / filteredPayments.length : 0,
      paymentCount: filteredPayments.length,
      uniqueCustomers,
      methodBreakdown,
    };
  }, [filteredPayments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return "📱";
      case "cash":
        return "💵";
      case "bank":
        return "🏦";
      case "card":
        return "💳";
      default:
        return "💰";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Payments Dashboard</h2>
        <p className="text-zinc-400 text-sm mt-1">Track and manage all customer payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            KSh {stats.totalPayments.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">from {stats.paymentCount} payments</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Average Payment</p>
          <p className="text-2xl font-bold text-blue-400">
            KSh {Math.round(stats.averagePayment).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Unique Customers</p>
          <p className="text-2xl font-bold text-purple-400">{stats.uniqueCustomers}</p>
        </div>
        <div className="bg-gradient-to-br from-gold-400/20 to-gold-500/10 border border-gold-400/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Payment Methods</p>
          <div className="flex gap-3 text-sm mt-1">
            {Object.entries(stats.methodBreakdown).map(([method, amount]) => (
              amount > 0 && (
                <div key={method} className="text-center">
                  <p className="text-gold-400 font-semibold">{getMethodIcon(method)}</p>
                  <p className="text-xs text-zinc-400">KSh {(amount / 1000).toFixed(0)}K</p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 bg-zinc-900 rounded-lg p-1">
          {[
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "year", label: "This Year" },
            { key: "all", label: "All Time" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key as any)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                dateRange === key
                  ? "bg-gold-400 text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search by customer, booking ID, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold-400"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-gold-400"
        >
          <option value="all">All Methods</option>
          <option value="mpesa">📱 M-Pesa</option>
          <option value="cash">💵 Cash</option>
          <option value="bank">🏦 Bank Transfer</option>
          <option value="card">💳 Card</option>
        </select>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-xl text-zinc-500">No payments found</p>
          <p className="text-zinc-600 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 border border-zinc-800">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Booking ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition">
                    <td className="p-3 text-zinc-300">{formatDate(payment.date)}</td>
                    <td className="p-3">
                      <span className="text-gold-400">#{payment.bookingId}</span>
                    </td>
                    <td className="p-3 font-medium">{payment.customerName}</td>
                    <td className="p-3 text-zinc-400">{payment.service}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        {getMethodIcon(payment.method)} {payment.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-zinc-500 font-mono">{payment.reference || "N/A"}</td>
                    <td className="p-3 text-right font-bold text-green-400">
                      +KSh {payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-900 border-t border-zinc-800">
                <tr>
                  <td colSpan={6} className="p-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="p-3 text-right font-bold text-green-400 text-lg">
                    KSh {stats.totalPayments.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  }