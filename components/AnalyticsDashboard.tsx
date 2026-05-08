"use client";

import { useMemo, useState } from "react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  package: string;
  price: number;
  deposit: number;
  status: string;
  paymentStatus: string;
  date: string;
  message?: string;
  venue?: string;
  notes?: string;
  createdAt: string;
  payments?: any[];
};

type AnalyticsProps = {
  bookings: Booking[];
};

export default function AnalyticsDashboard({ bookings }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "all">("all");

  // Filter bookings by time range
  const filteredBookings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    switch (timeRange) {
      case "week":
        return bookings.filter(b => new Date(b.date) >= weekAgo);
      case "month":
        return bookings.filter(b => new Date(b.date) >= monthAgo);
      case "year":
        return bookings.filter(b => new Date(b.date) >= yearAgo);
      default:
        return bookings;
    }
  }, [bookings, timeRange]);

  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const completed = filteredBookings.filter(b => b.status === "completed").length;
    const pending = filteredBookings.filter(b => b.status === "pending").length;
    const confirmed = filteredBookings.filter(b => b.status === "confirmed").length;
    const cancelled = filteredBookings.filter(b => b.status === "cancelled").length;
    
    const totalRevenue = filteredBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.price, 0);
    
    const collectedAmount = filteredBookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
    const pendingBalance = filteredBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + ((b.price || 0) - (b.deposit || 0)), 0);
    
    // Service breakdown
    const serviceBreakdown: Record<string, number> = {};
    filteredBookings.forEach(b => {
      serviceBreakdown[b.service] = (serviceBreakdown[b.service] || 0) + 1;
    });
    
    // Monthly revenue trend
    const monthlyTrend: Record<string, { revenue: number; bookings: number }> = {};
    filteredBookings.forEach(b => {
      const month = new Date(b.date).toLocaleDateString("en-KE", { year: "numeric", month: "short" });
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { revenue: 0, bookings: 0 };
      }
      monthlyTrend[month].revenue += b.status === "completed" ? b.price : 0;
      monthlyTrend[month].bookings += 1;
    });
    
    const conversionRate = total > 0 ? (confirmed / total) * 100 : 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const avgBookingValue = total > 0 ? totalRevenue / total : 0;
    
    return {
      total,
      completed,
      pending,
      confirmed,
      cancelled,
      totalRevenue,
      collectedAmount,
      pendingBalance,
      serviceBreakdown,
      monthlyTrend: Object.entries(monthlyTrend).reverse(),
      conversionRate,
      completionRate,
      avgBookingValue,
    };
  }, [filteredBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400";
      case "confirmed": return "text-blue-400";
      case "cancelled": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-zinc-400 text-sm mt-1">Track your business performance and insights</p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2 bg-zinc-900 rounded-lg p-1 w-fit">
        {[
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
          { key: "year", label: "This Year" },
          { key: "all", label: "All Time" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTimeRange(key as any)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              timeRange === key
                ? "bg-gold-400 text-black font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gold-400/20 to-gold-500/10 border border-gold-400/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold">{stats.total}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-green-400">✓ {stats.completed}</span>
            <span className="text-blue-400">📋 {stats.confirmed}</span>
            <span className="text-yellow-400">⏳ {stats.pending}</span>
            <span className="text-red-400">✗ {stats.cancelled}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">KSh {stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">From completed bookings</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Amount Collected</p>
          <p className="text-3xl font-bold text-blue-400">KSh {stats.collectedAmount.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">Pending: KSh {stats.pendingBalance.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Conversion Rate</p>
          <p className="text-3xl font-bold text-purple-400">{stats.conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-zinc-500 mt-1">Completion: {stats.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">🎬 Bookings by Service</h3>
          <div className="space-y-3">
            {Object.entries(stats.serviceBreakdown).map(([service, count]) => (
              <div key={service}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{service}</span>
                  <span className="text-gold-400">{count} bookings</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold-400 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">📊 Booking Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400">Completed</span>
                <span>{stats.completed}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400">Confirmed</span>
                <span>{stats.confirmed}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.confirmed / stats.total) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-400">Pending</span>
                <span>{stats.pending}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-400">Cancelled</span>
                <span>{stats.cancelled}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.cancelled / stats.total) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4">📈 Monthly Revenue Trend</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {stats.monthlyTrend.map(([month, data]) => (
            <div key={month}>
              <div className="flex justify-between text-sm mb-1">
                <span>{month}</span>
                <div className="flex gap-4">
                  <span className="text-green-400">KSh {data.revenue.toLocaleString()}</span>
                  <span className="text-zinc-500">{data.bookings} bookings</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(100, (data.revenue / stats.totalRevenue) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-400">Avg. Booking Value</p>
          <p className="text-lg font-bold">KSh {Math.round(stats.avgBookingValue).toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-400">Unique Services</p>
          <p className="text-lg font-bold">{Object.keys(stats.serviceBreakdown).length}</p>
        </div>
        <div className="bg-zinc-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-400">Collection Rate</p>
          <p className="text-lg font-bold">{stats.totalRevenue > 0 ? ((stats.collectedAmount / stats.totalRevenue) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-zinc-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-400">Avg. per Booking</p>
          <p className="text-lg font-bold">KSh {stats.total > 0 ? Math.round(stats.collectedAmount / stats.total).toLocaleString() : 0}</p>
        </div>
      </div>
    </div>
  );
}