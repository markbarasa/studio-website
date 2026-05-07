"use client";

import { useState, useMemo } from "react";
import { Download, Calendar, TrendingUp, TrendingDown, FileText } from "lucide-react";

type FinancialReportProps = {
  bookings: any[];
};

export default function FinancialReport({ bookings }: FinancialReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showDetailed, setShowDetailed] = useState(false);

  // Get all available months with data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    bookings.forEach(booking => {
      if (booking.date) {
        const date = new Date(booking.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [bookings]);

  // Filter bookings for selected month
  const monthBookings = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    return bookings.filter(booking => {
      if (!booking.date) return false;
      const date = new Date(booking.date);
      return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
    });
  }, [bookings, selectedMonth]);

  // Calculate financial data
  const financialData = useMemo(() => {
    // Income
    const totalIncome = monthBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const totalCollected = monthBookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
    const pendingPayments = monthBookings.reduce((sum, b) => sum + ((b.price || 0) - (b.deposit || 0)), 0);
    
    // Payment method breakdown
    const methodBreakdown = {
      mpesa: 0,
      cash: 0,
      bank: 0,
      card: 0,
    };
    
    monthBookings.forEach(booking => {
      if (booking.payments) {
        booking.payments.forEach((payment: any) => {
          if (payment.method === "mpesa") methodBreakdown.mpesa += payment.amount;
          else if (payment.method === "cash") methodBreakdown.cash += payment.amount;
          else if (payment.method === "bank") methodBreakdown.bank += payment.amount;
          else if (payment.method === "card") methodBreakdown.card += payment.amount;
        });
      }
    });
    
    // Service breakdown
    const serviceBreakdown: Record<string, number> = {};
    monthBookings.forEach(booking => {
      const service = booking.service;
      serviceBreakdown[service] = (serviceBreakdown[service] || 0) + (booking.price || 0);
    });
    
    // Status breakdown
    const statusBreakdown = {
      completed: monthBookings.filter(b => b.status === "completed").length,
      confirmed: monthBookings.filter(b => b.status === "confirmed").length,
      pending: monthBookings.filter(b => b.status === "pending").length,
      cancelled: monthBookings.filter(b => b.status === "cancelled").length,
    };
    
    return {
      totalIncome,
      totalCollected,
      pendingPayments,
      methodBreakdown,
      serviceBreakdown,
      statusBreakdown,
      totalBookings: monthBookings.length,
    };
  }, [monthBookings]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
    });
  };

  const generatePDF = () => {
    const reportHTML = generateReportHTML();
    const blob = new Blob([reportHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alakara_Studios_Report_${selectedMonth}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportHTML = () => {
    const monthName = formatMonth(selectedMonth);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Financial Report - ${monthName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: white;
            padding: 40px;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .header {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            border-radius: 16px;
            margin-bottom: 30px;
          }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header .tagline { color: #C6A43F; }
          .section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #1a1a1a;
            border-bottom: 2px solid #C6A43F;
            padding-bottom: 10px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #d1d5db;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Alakara Studios</h1>
            <div class="tagline">Where Moments Become Memories</div>
            <h2 style="margin-top: 20px;">Financial Report</h2>
            <p>${monthName}</p>
          </div>

          <div class="grid-2">
            <div class="stat-card">
              <p style="color: #6b7280;">Total Bookings</p>
              <p style="font-size: 32px; font-weight: bold;">${financialData.totalBookings}</p>
            </div>
            <div class="stat-card">
              <p style="color: #6b7280;">Total Income</p>
              <p style="font-size: 32px; font-weight: bold; color: #10B981;">KSh ${financialData.totalIncome.toLocaleString()}</p>
            </div>
          </div>

          <div class="section">
            <h2>💰 Payment Summary</h2>
            <div class="row">
              <span>Total Contracts Value</span>
              <span><strong>KSh ${financialData.totalIncome.toLocaleString()}</strong></span>
            </div>
            <div class="row">
              <span>Amount Collected</span>
              <span style="color: #10B981;"><strong>KSh ${financialData.totalCollected.toLocaleString()}</strong></span>
            </div>
            <div class="row">
              <span>Pending Payments</span>
              <span style="color: #EF4444;"><strong>KSh ${financialData.pendingPayments.toLocaleString()}</strong></span>
            </div>
            <div class="row total-row">
              <span>Collection Rate</span>
              <span><strong>${financialData.totalIncome > 0 ? ((financialData.totalCollected / financialData.totalIncome) * 100).toFixed(1) : 0}%</strong></span>
            </div>
          </div>

          <div class="section">
            <h2>💳 Payment Methods</h2>
            <div class="row"><span>M-Pesa</span><span>KSh ${financialData.methodBreakdown.mpesa.toLocaleString()}</span></div>
            <div class="row"><span>Cash</span><span>KSh ${financialData.methodBreakdown.cash.toLocaleString()}</span></div>
            <div class="row"><span>Bank Transfer</span><span>KSh ${financialData.methodBreakdown.bank.toLocaleString()}</span></div>
            <div class="row"><span>Card</span><span>KSh ${financialData.methodBreakdown.card.toLocaleString()}</span></div>
          </div>

          <div class="section">
            <h2>🎬 Service Breakdown</h2>
            ${Object.entries(financialData.serviceBreakdown).map(([service, amount]) => `
              <div class="row"><span>${service}</span><span>KSh ${(amount as number).toLocaleString()}</span></div>
            `).join('')}
          </div>

          <div class="section">
            <h2>📋 Booking Status</h2>
            <div class="row"><span>Completed</span><span>${financialData.statusBreakdown.completed}</span></div>
            <div class="row"><span>Confirmed</span><span>${financialData.statusBreakdown.confirmed}</span></div>
            <div class="row"><span>Pending</span><span>${financialData.statusBreakdown.pending}</span></div>
            <div class="row"><span>Cancelled</span><span>${financialData.statusBreakdown.cancelled}</span></div>
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Alakara Studios - Where Moments Become Memories</p>
            <p>For any queries, contact: +254 797 356421</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Report</h2>
          <p className="text-zinc-400 text-sm mt-1">Monthly income, expenses, and payment tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-black rounded-lg font-semibold hover:bg-gold-500 transition"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <label className="block text-sm text-zinc-400 mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold-400"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>{formatMonth(month)}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gold-400/20 to-gold-500/10 border border-gold-400/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold">{financialData.totalBookings}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total Income</p>
          <p className="text-2xl font-bold text-green-400">KSh {financialData.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Amount Collected</p>
          <p className="text-2xl font-bold text-blue-400">KSh {financialData.totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold text-red-400">KSh {financialData.pendingPayments.toLocaleString()}</p>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">💰 Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span>📱 M-Pesa</span>
              <span className="font-bold text-green-400">KSh {financialData.methodBreakdown.mpesa.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span>💵 Cash</span>
              <span className="font-bold text-green-400">KSh {financialData.methodBreakdown.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span>🏦 Bank Transfer</span>
              <span className="font-bold text-green-400">KSh {financialData.methodBreakdown.bank.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span>💳 Card</span>
              <span className="font-bold text-green-400">KSh {financialData.methodBreakdown.card.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">🎬 Service Breakdown</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(financialData.serviceBreakdown).map(([service, amount]) => (
              <div key={service} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>{service}</span>
                <span className="font-bold text-gold-400">KSh {(amount as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4">📋 Booking Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{financialData.statusBreakdown.completed}</p>
            <p className="text-xs text-zinc-400">Completed</p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">{financialData.statusBreakdown.confirmed}</p>
            <p className="text-xs text-zinc-400">Confirmed</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-2xl font-bold text-yellow-400">{financialData.statusBreakdown.pending}</p>
            <p className="text-xs text-zinc-400">Pending</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <p className="text-2xl font-bold text-red-400">{financialData.statusBreakdown.cancelled}</p>
            <p className="text-xs text-zinc-400">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
}