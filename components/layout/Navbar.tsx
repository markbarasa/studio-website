"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black/40 backdrop-blur-sm z-50 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            Alakara <span className="text-gold-400">Studios</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-gold-400 transition">Home</Link>
            <Link href="/#portfolio" className="hover:text-gold-400 transition">Portfolio</Link>
            <Link href="/#services" className="hover:text-gold-400 transition">Services</Link>
            <Link href="/#bookings" className="hover:text-gold-400 transition">Book Now</Link>
            <Link href="/portal" className="hover:text-gold-400 transition">Portal</Link>
            <Link href="/contact" className="hover:text-gold-400 transition">Contact</Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Home</Link>
            <Link href="/#portfolio" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Portfolio</Link>
            <Link href="/#services" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Services</Link>
            <Link href="/#bookings" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Book Now</Link>
            <Link href="/portal" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Portal</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-gold-400 transition">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  );
}