// components/AnalyticsDashboard.tsx
"use client";

import { useMemo } from "react";
import { Booking } from "@/types";

type AnalyticsProps = {
  bookings: Booking[];
};

export default function AnalyticsDashboard({ bookings }: AnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Basic stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === "completed");
    const pendingBookings = bookings.filter(b => b.status === "pending");
    const confirmedBookings = bookings.filter(b => b.status === "confirmed");
    
    // Revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
    const collectedRevenue = bookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
    const pendingRevenue = totalRevenue - collectedRevenue;
    
    // This month
    const thisMonthBookings = bookings.filter(b => {
      const date = new Date(b.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + b.price, 0);
    
    // Service breakdown
    const serviceBreakdown = bookings.reduce((acc: Record<string, { count: number; revenue: number }>, b) => {
      if (!acc[b.service]) {
        acc[b.service] = { count: 0, revenue: 0 };
      }
      acc[b.service].count++;
      acc[b.service].revenue += b.price;
      return acc;
    }, {});
    
    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(thisYear, thisMonth - i, 1);
      const monthBookings = bookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrends.push({
        month: date.toLocaleString("default", { month: "short" }),
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + b.price, 0),
      });
    }
    
    // Conversion rate
    const conversionRate = bookings.length > 0 
      ? (completedBookings.length / bookings.length) * 100 
      : 0;
    
    // Average booking value
    const avgBookingValue = bookings.length > 0 
      ? totalRevenue / bookings.length 
      : 0;
    
    // Peak booking days
    const dayBreakdown = bookings.reduce((acc: Record<string, number>, b) => {
      const day = new Date(b.date).toLocaleString("default", { weekday: "long" });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    
    // Customer retention
    const customerBookingCounts = bookings.reduce((acc: Record<string, number>, b) => {
      acc[b.phone] = (acc[b.phone] || 0) + 1;
      return acc;
    }, {});
    
    const repeatCustomers = Object.values(customerBookingCounts).filter(count => count > 1).length;
    const uniqueCustomers = Object.keys(customerBookingCounts).length;
    const retentionRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    return {
      totalBookings,
      completedBookings: completedBookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      thisMonthBookings: thisMonthBookings.length,
      thisMonthRevenue,
      serviceBreakdown,
      monthlyTrends,
      conversionRate,
      avgBookingValue,
      dayBreakdown,
      retentionRate,
      repeatCustomers,
      uniqueCustomers,
    };
  }, [bookings]);

  const maxMonthlyRevenue = Math.max(...analytics.monthlyTrends.map(t => t.revenue));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            KSh {analytics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Collected: KSh {analytics.collectedRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Pending Revenue</p>
          <p className="text-2xl font-bold text-red-400">
            KSh {analytics.pendingRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            From {analytics.pendingBookings} pending bookings
          </p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-zinc-500 mt-1">
            {analytics.completedBookings} completed / {analytics.totalBookings} total
          </p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Avg Booking Value</p>
          <p className="text-2xl font-bold">
            KSh {analytics.avgBookingValue.toFixed(0)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            This month: KSh {analytics.thisMonthRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trends</h3>
          <div className="space-y-3">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">{trend.month}</span>
                  <span>KSh {trend.revenue.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${maxMonthlyRevenue > 0 ? (trend.revenue / maxMonthlyRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Service</h3>
          <div className="space-y-4">
            {Object.entries(analytics.serviceBreakdown)
              .sort(([, a], [, b]) => b.revenue - a.revenue)
              .map(([service, data]) => (
                <div key={service}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{service}</span>
                    <span className="text-zinc-400">
                      {data.count} bookings • KSh {data.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(data.revenue / analytics.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Pending</span>
              </div>
              <span className="font-bold">{analytics.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Confirmed</span>
              </div>
              <span className="font-bold">{analytics.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Completed</span>
              </div>
              <span className="font-bold">{analytics.completedBookings}</span>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-400 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold">{analytics.uniqueCustomers}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Repeat Customers</p>
              <p className="text-2xl font-bold">{analytics.repeatCustomers}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Retention Rate</p>
              <p className="text-2xl font-bold">{analytics.retentionRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Avg per Customer</p>
              <p className="text-2xl font-bold">
                KSh {(analytics.totalRevenue / Math.max(analytics.uniqueCustomers, 1)).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}