"use client";

import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [showLogin, setShowLogin] = useState(true);

  // Check if already logged in on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setShowLogin(false);
      loadBookings();
    }
  }, []);

  const loadBookings = () => {
    try {
      const stored = localStorage.getItem("bookings");
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "admin123") {
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminLoginTime", Date.now().toString());
      setIsLoggedIn(true);
      setShowLogin(false);
      loadBookings();
      setError("");
    } else {
      setError("Incorrect password. Use: admin123");
      setPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminLoginTime");
    setIsLoggedIn(false);
    setShowLogin(true);
    setPassword("");
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  // Update booking status
  const updateStatus = (id: number, newStatus: string) => {
    const updated = bookings.map((b: any) => 
      b.id === id ? { ...b, status: newStatus } : b
    );
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  // Update deposit
  const updateDeposit = (id: number, newDeposit: number) => {
    const booking = bookings.find((b: any) => b.id === id);
    if (!booking) return;
    
    const updated = bookings.map((b: any) =>
      b.id === id 
        ? { 
            ...b, 
            deposit: newDeposit,
            paymentStatus: newDeposit >= b.price ? "paid" : newDeposit > 0 ? "partial" : "unpaid"
          } 
        : b
    );
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  // If showing login form
  if (showLogin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎬</div>
            <h1 className="text-4xl font-bold text-white">Admin Login</h1>
            <p className="text-zinc-400 mt-2">Alakara Studios</p>
            <div className="w-20 h-1 bg-gold-400 mx-auto mt-4 rounded-full" />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-4 bg-black border border-zinc-800 rounded-xl focus:border-gold-400 focus:outline-none text-white"
                  autoFocus
                  required
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Password: <span className="text-gold-400 font-mono">admin123</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gold-400 text-black py-4 rounded-xl font-semibold hover:bg-gold-500 transition"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
    completed: bookings.filter((b: any) => b.status === "completed").length,
    totalCollected: bookings.reduce((sum: number, b: any) => sum + (b.deposit || 0), 0),
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Alakara Studios Admin</h1>
            <p className="text-zinc-400 mt-1">Manage bookings, payments & clients</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-400 text-sm">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-400 text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-400 text-sm">Collected</p>
            <p className="text-2xl font-bold text-green-400">KSh {stats.totalCollected.toLocaleString()}</p>
          </div>
        </div>

        {/* Bookings Table */}
        {bookings.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-xl text-zinc-500">No bookings yet</p>
            <p className="text-zinc-600 mt-2">Bookings will appear here when customers make reservations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 border border-zinc-800">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Service</th>
                  <th className="p-3 text-left">Package</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Deposit</th>
                  <th className="p-3 text-left">Balance</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => {
                  const balance = (booking.price || 0) - (booking.deposit || 0);
                  return (
                    <tr key={booking.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-3">#{booking.id}</td>
                      <td className="p-3">{formatDate(booking.date)}</td>
                      <td className="p-3 font-medium">{booking.name}</td>
                      <td className="p-3">{booking.phone}</td>
                      <td className="p-3">{booking.service}</td>
                      <td className="p-3">{booking.package}</td>
                      <td className="p-3">KSh {(booking.price || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={booking.deposit || 0}
                          onChange={(e) => updateDeposit(booking.id, Number(e.target.value))}
                          className="w-24 bg-zinc-800 border border-zinc-700 p-1 rounded text-sm"
                          min="0"
                          max={booking.price || 0}
                          step="1000"
                        />
                      </td>
                      <td className="p-3">
                        <span className={balance > 0 ? "text-red-400" : "text-green-400"}>
                          KSh {balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={booking.status || "pending"}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className={`p-1 rounded text-xs font-medium ${
                            booking.status === "completed" ? "bg-green-900/50 text-green-400" :
                            booking.status === "confirmed" ? "bg-blue-900/50 text-blue-400" :
                            booking.status === "cancelled" ? "bg-red-900/50 text-red-400" :
                            "bg-yellow-900/50 text-yellow-400"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}