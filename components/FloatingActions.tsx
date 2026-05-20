"use client";

import { useState, useEffect } from "react";
import { Phone, MessageCircle, Calendar, X } from "lucide-react";

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide buttons when scrolling down, show when scrolling up
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const actions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: "WhatsApp",
      href: "https://wa.me/254797356421",
      color: "bg-green-500 hover:bg-green-600",
      delay: "delay-100",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Call Us",
      href: "tel:+254797356421",
      color: "bg-blue-500 hover:bg-blue-600",
      delay: "delay-200",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: "Book Now",
      href: "/#services",
      color: "bg-amber-500 hover:bg-amber-600",
      delay: "delay-300",
    },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-amber-500 text-black shadow-lg hover:bg-amber-400 transition-all duration-300 flex items-center justify-center group relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          </>
        )}
      </button>

      {/* Action Buttons */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            target={action.label === "Call Us" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className={`${action.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 group relative ${action.delay}`}
          >
            {action.icon}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-zinc-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}