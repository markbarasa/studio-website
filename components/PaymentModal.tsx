// components/PaymentModal.tsx
"use client";

import { useState } from "react";
import { Booking, PaymentMethod } from "@/types";

type PaymentModalProps = {
  booking: Booking;
  onClose: () => void;
  onPaymentComplete: (amount: number, method: PaymentMethod, reference: string) => void;
};

export default function PaymentModal({ booking, onClose, onPaymentComplete }: PaymentModalProps) {
  const [step, setStep] = useState<"method" | "mpesa" | "card" | "processing" | "success">("method");
  const [amount, setAmount] = useState(booking.price - booking.deposit);
  const [phoneNumber, setPhoneNumber] = useState(booking.phone);
  const [reference, setReference] = useState("");

  const balance = booking.price - booking.deposit;

  const handleMpesaPayment = async () => {
    setStep("processing");
    
    // Simulate M-Pesa STK Push
    setTimeout(() => {
      const mpesaRef = `MPESA${Date.now()}`;
      setReference(mpesaRef);
      setStep("success");
      onPaymentComplete(amount, "mpesa", mpesaRef);
    }, 3000);
  };

  const handleCardPayment = async () => {
    setStep("processing");
    
    // Simulate card payment
    setTimeout(() => {
      const cardRef = `CARD${Date.now()}`;
      setReference(cardRef);
      setStep("success");
      onPaymentComplete(amount, "card", cardRef);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {step === "method" && (
          <>
            {/* Booking Summary */}
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Booking</span>
                <span>{booking.service} - {booking.package}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Total Price</span>
                <span>KSh {booking.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Paid</span>
                <span className="text-green-400">KSh {booking.deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400">Balance</span>
                <span className="text-red-400">KSh {balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">Amount (KSh)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={balance}
                min={1}
                className="w-full p-3 bg-black border border-zinc-700 rounded-xl focus:border-white transition"
              />
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, balance].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(Math.min(preset, balance))}
                    className="px-3 py-1 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition"
                  >
                    KSh {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <button
                onClick={() => setStep("mpesa")}
                className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-xl transition flex items-center gap-3"
              >
                <span className="text-2xl">📱</span>
                <div className="text-left">
                  <div className="font-semibold">M-Pesa</div>
                  <div className="text-sm text-green-200">Pay via STK Push</div>
                </div>
              </button>

              <button
                onClick={() => setStep("card")}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-3"
              >
                <span className="text-2xl">💳</span>
                <div className="text-left">
                  <div className="font-semibold">Card Payment</div>
                  <div className="text-sm text-blue-200">Visa, Mastercard</div>
                </div>
              </button>

              <button
                onClick={() => onPaymentComplete(amount, "cash", `CASH${Date.now()}`)}
                className="w-full p-4 bg-zinc-700 hover:bg-zinc-600 rounded-xl transition flex items-center gap-3"
              >
                <span className="text-2xl">💵</span>
                <div className="text-left">
                  <div className="font-semibold">Cash</div>
                  <div className="text-sm text-zinc-400">Record cash payment</div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "mpesa" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-4xl">📱</span>
              <h3 className="text-lg font-semibold mt-2">M-Pesa Payment</h3>
              <p className="text-zinc-400 text-sm">Enter phone number for STK Push</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0712345678"
                className="w-full p-3 bg-black border border-zinc-700 rounded-xl"
              />
            </div>

            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Amount</span>
                <span className="font-bold">KSh {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Phone</span>
                <span>{phoneNumber}</span>
              </div>
            </div>

            <button
              onClick={handleMpesaPayment}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold transition"
            >
              Send STK Push
            </button>

            <button
              onClick={() => setStep("method")}
              className="w-full text-zinc-400 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {step === "card" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-4xl">💳</span>
              <h3 className="text-lg font-semibold mt-2">Card Payment</h3>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 bg-black border border-zinc-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-3 bg-black border border-zinc-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full p-3 bg-black border border-zinc-700 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={handleCardPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
            >
              Pay KSh {amount.toLocaleString()}
            </button>

            <button
              onClick={() => setStep("method")}
              className="w-full text-zinc-400 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-zinc-400 mt-2">Please wait...</p>
            <p className="text-sm text-zinc-500 mt-1">Check your phone for M-Pesa prompt</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <span className="text-6xl block mb-4">✅</span>
            <h3 className="text-lg font-semibold">Payment Successful!</h3>
            <p className="text-green-400 mt-2">KSh {amount.toLocaleString()} received</p>
            <p className="text-zinc-400 text-sm mt-1">Ref: {reference}</p>
            <button
              onClick={onClose}
              className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}