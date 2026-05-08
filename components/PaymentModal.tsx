"use client";

import { useState } from "react";

type PaymentMethod = "mpesa" | "cash" | "bank" | "card";

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

type PaymentModalProps = {
  booking: Booking;
  onClose: () => void;
  onPaymentComplete: (amount: number, method: PaymentMethod, reference: string) => void;
};

export default function PaymentModal({ booking, onClose, onPaymentComplete }: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!reference.trim()) {
      alert("Please enter a transaction reference");
      return;
    }
    
    setIsSubmitting(true);
    onPaymentComplete(amount, method, reference);
    setIsSubmitting(false);
  };

  const getMethodIcon = (m: PaymentMethod) => {
    switch (m) {
      case "mpesa": return "📱";
      case "cash": return "💵";
      case "bank": return "🏦";
      case "card": return "💳";
    }
  };

  const balance = booking.price - (booking.deposit || 0);
  const suggestedAmount = Math.min(balance, Math.ceil(booking.price / 2) - (booking.deposit || 0));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Record Payment</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Booking #{booking.id} - {booking.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Booking Summary */}
          <div className="bg-zinc-800/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Total Amount:</span>
              <span className="font-semibold">KSh {booking.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Already Paid:</span>
              <span className="text-green-400 font-semibold">KSh {(booking.deposit || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700">
              <span className="text-zinc-400">Remaining Balance:</span>
              <span className="text-red-400 font-semibold">KSh {balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Amount (KSh) *
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 focus:outline-none transition"
              autoFocus
            />
            {suggestedAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(suggestedAmount)}
                className="text-xs text-gold-400 mt-1 hover:underline"
              >
                💡 Suggested: KSh {suggestedAmount.toLocaleString()} (remaining deposit)
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["mpesa", "cash", "bank", "card"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`p-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                    method === m
                      ? "border-gold-400 bg-gold-400/10 text-gold-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <span>{getMethodIcon(m)}</span>
                  <span className="capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Transaction Reference *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={method === "mpesa" ? "M-Pesa confirmation code" : "Transaction ID / Reference number"}
              className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 focus:outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || amount <= 0 || !reference.trim()}
              className="flex-1 py-3 bg-gold-400 text-black rounded-lg font-semibold hover:bg-gold-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}