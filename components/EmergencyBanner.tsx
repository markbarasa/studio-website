"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, MessageCircle, Phone } from "lucide-react";

export default function EmergencyBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check if banner was dismissed in this session
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("emergencyBannerDismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error("Error reading sessionStorage:", error);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("emergencyBannerDismissed", "true");
    } catch (error) {
      console.error("Error writing to sessionStorage:", error);
    }
  };

  // Don't render if dismissed
  if (isDismissed) return null;

  // Don't render until after mount to avoid hydration issues
  if (!isVisible) return null;

  return (
    <div className="relative z-50">
      <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  🔥 Emergency / Last-Minute Booking?
                </p>
                <p className="text-xs opacity-90 hidden sm:block">
                  Need photos urgently? Contact us immediately for same-day service
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://wa.me/254797356421?text=🚨%20URGENT%20BOOKING%20REQUEST%0A%0AHello%20Alakara%20Studios,%20I%20need%20photography/videography%20services%20URGENTLY.%0A%0APlease%20contact%20me%20as%20soon%20as%20possible.%0A%0AThank%20you!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm font-semibold whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Now
              </a>
              <a
                href="tel:+254797356421"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm font-semibold whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Mobile message */}
          <p className="text-xs opacity-90 mt-2 sm:hidden">
            Need photos urgently? Contact us immediately for same-day service
          </p>
        </div>
      </div>
    </div>
  );
}