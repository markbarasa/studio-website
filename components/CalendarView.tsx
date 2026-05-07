"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, Grid, ChevronDown } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
  paymentStatus: "unpaid" | "partial" | "paid";
  date: string;
  message?: string;
  venue?: string;
  payments: any[];
  notes?: string;
  createdAt: string;
};

type CalendarViewProps = {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
};

type ViewMode = "month" | "week" | "day";

export default function CalendarView({ bookings, onBookingClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [animateDirection, setAnimateDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const getStatusTextColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "text-blue-600";
      case "completed": return "text-green-600";
      case "cancelled": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-400";
      case "partial": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-red-500/20 text-red-400";
    }
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatDateDisplay = (date: Date, format: "full" | "short" | "time" = "full") => {
    if (format === "full") {
      return date.toLocaleDateString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (format === "short") {
      return date.toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (isTransitioning) return;
    
    setAnimateDirection(direction === "prev" ? "left" : "right");
    setIsTransitioning(true);
    
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    
    setCurrentDate(newDate);
    
    setTimeout(() => {
      setAnimateDirection(null);
      setIsTransitioning(false);
    }, 300);
  };

  const goToToday = () => {
    if (isTransitioning) return;
    setAnimateDirection(null);
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    const day = currentDate.getDay();
    weekStart.setDate(currentDate.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    const prevMonthDays = startingDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDaysCount = prevMonth.getDate();
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDaysCount - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getDayBookings = (date: Date) => {
    const dateKey = formatDateKey(date);
    return bookings.filter(b => b.date === dateKey);
  };

  const getWeekBookings = () => {
    const weekDays = getWeekDays();
    const bookingsByDay: Record<string, Booking[]> = {};
    weekDays.forEach(day => {
      bookingsByDay[formatDateKey(day)] = getDayBookings(day);
    });
    return bookingsByDay;
  };

  const getMonthBookings = () => {
    const monthDays = getMonthDays();
    const bookingsByDay: Record<string, Booking[]> = {};
    monthDays.forEach(({ date }) => {
      bookingsByDay[formatDateKey(date)] = getDayBookings(date);
    });
    return bookingsByDay;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getBookingStats = (bookings: Booking[]) => {
    const total = bookings.length;
    const totalDeposit = bookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
    const totalValue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    return { total, totalDeposit, totalValue };
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const weekBookings = getWeekBookings();
  const monthBookings = getMonthBookings();
  const selectedDayBookings = selectedDate ? bookings.filter(b => b.date === selectedDate) : [];

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const weekRange = `${formatDateDisplay(weekDays[0], "short")} - ${formatDateDisplay(weekDays[6], "short")}, ${currentDate.getFullYear()}`;
  const dayDisplay = formatDateDisplay(currentDate, "full");

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Navigation */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigateDate("prev")}
              disabled={isTransitioning}
              className="p-2 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate("next")}
              disabled={isTransitioning}
              className="p-2 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Date Display */}
            <div className="ml-4">
              {viewMode === "month" && <h2 className="text-2xl font-bold">{monthName}</h2>}
              {viewMode === "week" && <h2 className="text-2xl font-bold">{weekRange}</h2>}
              {viewMode === "day" && <h2 className="text-2xl font-bold">{dayDisplay}</h2>}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-lg w-full md:w-auto">
            <button
              onClick={() => { setViewMode("month"); setSelectedDate(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === "month" ? "bg-[#C6A43F] text-black" : "hover:bg-zinc-700"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => { setViewMode("week"); setSelectedDate(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === "week" ? "bg-[#C6A43F] text-black" : "hover:bg-zinc-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Week
            </button>
            <button
              onClick={() => { setViewMode("day"); setSelectedDate(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === "day" ? "bg-[#C6A43F] text-black" : "hover:bg-zinc-700"
              }`}
            >
              <List className="w-4 h-4" />
              Day
            </button>
          </div>
        </div>

        {/* Month View */}
        {viewMode === "month" && (
          <div className={`transition-all duration-300 ${animateDirection === "left" ? "animate-slide-left" : animateDirection === "right" ? "animate-slide-right" : ""}`}>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center py-3 text-sm font-semibold text-zinc-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map(({ date, isCurrentMonth }, idx) => {
                const dateKey = formatDateKey(date);
                const dayBookings = monthBookings[dateKey] || [];
                const isTodayDate = isToday(date);
                const stats = getBookingStats(dayBookings);
                const isSelected = selectedDate === dateKey;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`min-h-[120px] p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      !isCurrentMonth ? "bg-zinc-900/30 opacity-50" : "bg-zinc-900/50"
                    } ${isSelected ? "ring-2 ring-[#C6A43F] bg-zinc-800" : "hover:bg-zinc-800"}
                    ${isTodayDate ? "ring-1 ring-white/30" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        isTodayDate ? "bg-[#C6A43F] text-black" : ""
                      }`}>
                        {date.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#C6A43F]/20 text-[#C6A43F]">
                          {dayBookings.length} {dayBookings.length === 1 ? "booking" : "bookings"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                      {dayBookings.slice(0, 3).map(booking => (
                        <div
                          key={booking.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick(booking);
                          }}
                          className={`text-xs p-1.5 rounded cursor-pointer transition hover:opacity-80 ${getStatusColor(booking.status)} text-white truncate`}
                          title={`${booking.name} - ${booking.service}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate flex-1">{booking.name.split(" ")[0]}</span>
                            <span className="text-[10px] opacity-80">
                              KSh {(booking.deposit || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-center text-zinc-500 mt-1">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>

                    {dayBookings.length === 0 && (
                      <div className="text-xs text-center text-zinc-600 mt-6">
                        No bookings
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className={`transition-all duration-300 ${animateDirection === "left" ? "animate-slide-left" : animateDirection === "right" ? "animate-slide-right" : ""}`}>
            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((day, idx) => {
                const dateKey = formatDateKey(day);
                const dayBookings = weekBookings[dateKey] || [];
                const isTodayDate = isToday(day);
                const stats = getBookingStats(dayBookings);
                const isSelected = selectedDate === dateKey;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`min-h-[400px] rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                      isSelected ? "ring-2 ring-[#C6A43F] bg-zinc-800" : "bg-zinc-900/50 hover:bg-zinc-800"
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`p-3 text-center border-b ${isTodayDate ? "bg-[#C6A43F]/10" : "bg-zinc-900"}`}>
                      <div className="text-sm font-medium text-zinc-400">
                        {day.toLocaleDateString("en-KE", { weekday: "short" })}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${isTodayDate ? "text-[#C6A43F]" : ""}`}>
                        {day.getDate()}
                      </div>
                      {dayBookings.length > 0 && (
                        <div className="mt-2 text-xs text-[#C6A43F]">
                          {stats.total} booking{stats.total !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* Bookings List */}
                    <div className="p-2 space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar">
                      {dayBookings.length === 0 ? (
                        <div className="text-center text-xs text-zinc-500 py-8">
                          No bookings
                        </div>
                      ) : (
                        dayBookings.map(booking => (
                          <div
                            key={booking.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookingClick(booking);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition"
                          >
                            <div className="font-medium text-sm truncate">{booking.name}</div>
                            <div className="text-xs text-zinc-400 mt-1">{booking.service}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                                {booking.paymentStatus.toUpperCase()}
                              </span>
                              <span className="text-xs font-medium text-green-400">
                                KSh {(booking.deposit || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === "day" && (
          <div className={`transition-all duration-300 ${animateDirection === "left" ? "animate-slide-left" : animateDirection === "right" ? "animate-slide-right" : ""}`}>
            <div className="grid gap-4">
              {/* Day Header Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#C6A43F]/10 to-transparent p-4 rounded-xl border border-[#C6A43F]/20">
                  <p className="text-sm text-zinc-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">{getDayBookings(currentDate).length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/20">
                  <p className="text-sm text-zinc-400">Total Collected</p>
                  <p className="text-2xl font-bold text-green-400">
                    KSh {getDayBookings(currentDate).reduce((sum, b) => sum + (b.deposit || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-transparent p-4 rounded-xl border border-red-500/20">
                  <p className="text-sm text-zinc-400">Pending Balance</p>
                  <p className="text-2xl font-bold text-red-400">
                    KSh {getDayBookings(currentDate).reduce((sum, b) => sum + ((b.price || 0) - (b.deposit || 0)), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-4 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-zinc-400">Total Value</p>
                  <p className="text-2xl font-bold text-blue-400">
                    KSh {getDayBookings(currentDate).reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Timeline View */}
              <div className="space-y-3">
                {getDayBookings(currentDate).length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-lg">No bookings for this day</p>
                    <p className="text-sm mt-2">Select a different date or add a new booking</p>
                  </div>
                ) : (
                  getDayBookings(currentDate).map((booking, idx) => (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick(booking)}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#C6A43F]/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                      style={{ animationDelay: `${idx * 0.1}s`, animation: "fadeInUp 0.5s ease-out both" }}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`} />
                            <span className="text-sm font-medium text-zinc-400">#{booking.id}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                              {booking.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{booking.name}</h3>
                          <p className="text-zinc-400 text-sm">{booking.service} - {booking.package}</p>
                          {booking.venue && (
                            <p className="text-xs text-zinc-500 mt-1">📍 {booking.venue}</p>
                          )}
                          {booking.message && (
                            <p className="text-xs text-zinc-500 mt-2 italic">"{booking.message.substring(0, 100)}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <p className="text-sm text-zinc-400">Total Price</p>
                            <p className="text-lg font-bold">KSh {booking.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Paid</p>
                            <p className="text-lg font-bold text-green-400">KSh {(booking.deposit || 0).toLocaleString()}</p>
                          </div>
                          {(booking.price - (booking.deposit || 0)) > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-red-400">Balance Due</p>
                              <p className="text-md font-bold text-red-400">
                                KSh {(booking.price - (booking.deposit || 0)).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex gap-3">
                        <a
                          href={`https://wa.me/${booking.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          💬 WhatsApp
                        </a>
                        <span className="text-xs text-zinc-500">
                          📞 {booking.phone}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Details Panel (for month/week view) */}
      {selectedDate && viewMode !== "day" && selectedDayBookings.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              📅 {new Date(selectedDate).toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {selectedDayBookings.map(booking => (
              <div
                key={booking.id}
                onClick={() => onBookingClick(booking)}
                className="bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{booking.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                        {booking.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{booking.service} - {booking.package}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">KSh {(booking.deposit || 0).toLocaleString()} paid</p>
                    {(booking.price - (booking.deposit || 0)) > 0 && (
                      <p className="text-xs text-red-400">Balance: KSh {(booking.price - (booking.deposit || 0)).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3">Status Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-zinc-400">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-zinc-400">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-zinc-400">Cancelled</span>
            </div>
            <div className="w-px h-4 bg-zinc-700 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
              <span className="text-xs text-zinc-400">Has bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#C6A43F] ring-2 ring-white/30" />
              <span className="text-xs text-zinc-400">Today</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-[#C6A43F]">{bookings.length}</p>
              <p className="text-xs text-zinc-400">Total Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#C6A43F]">
                {Object.keys(bookings.reduce((acc, b) => ({ ...acc, [b.date]: true }), {})).length}
              </p>
              <p className="text-xs text-zinc-400">Active Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#C6A43F]">
                {Math.ceil(bookings.reduce((sum, b) => sum + (b.deposit || 0), 0) / 1000)}K
              </p>
              <p className="text-xs text-zinc-400">Total Collected</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideLeft {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideRight {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-left {
          animation: slideLeft 0.3s ease-out;
        }
        
        .animate-slide-right {
          animation: slideRight 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #27272a;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
      `}</style>
    </div>
  );
}