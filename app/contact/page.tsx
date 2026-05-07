"use client";

import Navbar from "@/components/layout/Navbar";
import { useState, useEffect } from "react";

// app/contact/page.tsx

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (formStatus.show) {
      const timer = setTimeout(() => {
        setFormStatus({ ...formStatus, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");

    // Create WhatsApp message
    const whatsappMessage = `*New Contact Form Message*
    
Name: ${name}
Email: ${email}
Service Needed: ${service}

Message:
${message}`;

    // Open WhatsApp with the message
    window.open(
      `https://wa.me/254797356421?text=${encodeURIComponent(whatsappMessage)}`,
      "_blank"
    );

    setFormStatus({
      show: true,
      message: "Message sent! We'll get back to you shortly.",
      type: "success"
    });

    // Reset form
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setFormStatus({ ...formStatus, show: false });
    }, 5000);
  };

  return (
    <>
      <Navbar />
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254797356421"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-7 h-7"
        >
          <path d="M12.031 2.008c-5.414 0-9.8 4.386-9.8 9.8 0 1.73.45 3.358 1.287 4.777l-1.367 4.994 5.113-1.384c1.405.822 3.003 1.256 4.652 1.256 5.414 0 9.8-4.386 9.8-9.8 0-5.414-4.386-9.8-9.8-9.8zm0 17.854c-1.54 0-3.035-.42-4.325-1.203l-3.066.832.862-3.135c-.854-1.33-1.302-2.857-1.302-4.43 0-4.54 3.678-8.218 8.218-8.218 4.54 0 8.218 3.678 8.218 8.218 0 4.54-3.678 8.218-8.218 8.218zm4.5-6.148c-.246-.124-1.457-.719-1.683-.8-.226-.082-.39-.124-.555.124-.166.248-.643.8-.788.965-.146.165-.291.186-.537.062-.246-.124-1.038-.383-1.978-1.221-.732-.654-1.226-1.46-1.37-1.707-.144-.247-.016-.38.108-.504.11-.11.246-.287.369-.43.123-.144.164-.247.246-.412.082-.165.041-.31-.02-.434-.062-.124-.555-1.338-.76-1.832-.2-.48-.404-.406-.555-.413-.146-.008-.31-.008-.474-.008-.164 0-.43.062-.656.31-.226.247-.862.843-.862 2.055 0 1.212.883 2.383 1.006 2.548.123.165 1.737 2.653 4.208 3.72.588.255 1.047.408 1.405.522.59.19 1.127.163 1.552.099.474-.072 1.457-.596 1.663-1.17.205-.574.205-1.066.144-1.17-.062-.103-.226-.165-.472-.289z"/>
        </svg>
        <span className="absolute right-full mr-3 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
        </span>
      </a>

      <main className="min-h-screen bg-black text-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-[#C6A43F]/10 rounded-full mb-4">
              <span className="text-5xl">📞</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#C6A43F] bg-clip-text text-transparent">
              Let's Connect
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We'd love to hear about your project. Reach out and let's create something amazing together.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#C6A43F] to-transparent mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Info Section */}
            <div className="space-y-8">
              
              {/* Contact Cards */}
              <div className="grid gap-4">
                <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800 hover:border-[#C6A43F]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#C6A43F]/10 p-3 rounded-xl">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#C6A43F] font-semibold mb-1">PHONE</h3>
                      <p className="text-xl font-semibold">+254 797 356 421</p>
                      <p className="text-gray-500 text-sm mt-1">Available 9AM - 6PM, Mon-Sat</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800 hover:border-[#C6A43F]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#C6A43F]/10 p-3 rounded-xl">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#C6A43F] font-semibold mb-1">EMAIL</h3>
                      <p className="text-lg">thekapepodcast@gmail.com</p>
                      <p className="text-gray-500 text-sm mt-1">We reply within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800 hover:border-[#C6A43F]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#C6A43F]/10 p-3 rounded-xl">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#C6A43F] font-semibold mb-1">LOCATION</h3>
                      <p className="text-lg font-semibold">Teachers Plaza, 2nd Floor Room 18</p>
                      <p className="text-gray-400">Kapenguria, Kenya</p>
                      <a 
                        href="https://maps.google.com/?q=Teachers+Plaza+Kapenguria+2nd+Floor+Room+18"
                        target="_blank"
                        className="text-[#C6A43F] text-sm mt-1 inline-block hover:underline"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span>✨</span> Follow Our Journey
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="#" className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition group">
                    <span className="text-2xl">📷</span>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#C6A43F] transition">Instagram</p>
                      <p className="text-xs text-gray-500">@alakara_studios</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition group">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#C6A43F] transition">TikTok</p>
                      <p className="text-xs text-gray-500">@alakara_studios</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition group">
                    <span className="text-2xl">▶️</span>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#C6A43F] transition">YouTube</p>
                      <p className="text-xs text-gray-500">Alakara Studios</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition group">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#C6A43F] transition">Facebook</p>
                      <p className="text-xs text-gray-500">Alakara Studios</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-r from-[#C6A43F]/5 to-transparent p-6 rounded-2xl border border-[#C6A43F]/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>🕐</span> Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saturday</span>
                    <span className="text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#C6A43F]/20">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>💚</span> Emergency/Weekend shoots available upon request
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form & Map */}
            <div className="space-y-8">
              
              {/* Contact Form */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold mb-2">Send a Message</h2>
                <p className="text-gray-400 text-sm mb-6">We'll get back to you within 24 hours</p>

                {formStatus.show && (
                  <div className={`mb-6 p-4 rounded-xl ${
                    formStatus.type === "success" 
                      ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                    {formStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm text-gray-400">
                      Full Name <span className="text-[#C6A43F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your Name"
                      className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-[#C6A43F] transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm text-gray-400">
                      Email Address <span className="text-[#C6A43F]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-[#C6A43F] transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm text-gray-400">
                      Service Needed
                    </label>
                    <select
                      name="service"
                      className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-[#C6A43F] transition text-gray-300"
                    >
                      <option value="">Select a service</option>
                      <option value="Wedding">Wedding Photography/Videography</option>
                      <option value="Traditional">Traditional Ceremony</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Podcast">Podcast Production</option>
                      <option value="Documentary">Documentary</option>
                      <option value="Funeral">Funeral Coverage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm text-gray-400">
                      Message <span className="text-[#C6A43F]">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us about your project..."
                      className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-[#C6A43F] transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-white to-gray-200 text-black py-4 rounded-xl font-semibold hover:from-gray-200 hover:to-white transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>✉️</span> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Google Map */}
              <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span>📍</span> Find Us Here
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Teachers Plaza, 2nd Floor Room 18, Kapenguria
                  </p>
                </div>
                <div className="relative w-full h-[300px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2040.3112904428834!2d35.1027907!3d1.2386109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1780b6c5e8f2c6a1%3A0x8f8e5f2a6f5e8d4!2sKapenguria!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Alakara Studios Location"
                  ></iframe>
                </div>
                <div className="p-4 bg-black/50 text-center">
                  <a 
                    href="https://maps.google.com/?q=Teachers+Plaza+Kapenguria+2nd+Floor+Room+18"
                    target="_blank"
                    className="text-[#C6A43F] text-sm hover:underline inline-flex items-center gap-2"
                  >
                    <span>🗺️</span> Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 pt-8 border-t border-zinc-800">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-400">Quick answers to common questions</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 p-5 rounded-xl">
                <h4 className="font-semibold mb-2 text-[#C6A43F]">How do I book a service?</h4>
                <p className="text-sm text-gray-400">Visit our homepage, select your service and package, choose your date, and submit the booking form. You'll receive a WhatsApp confirmation with your Booking ID.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl">
                <h4 className="font-semibold mb-2 text-[#C6A43F]">What deposit is required?</h4>
                <p className="text-sm text-gray-400">A 50% deposit is required to confirm your booking. The remaining 50% is due on or before the event day.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl">
                <h4 className="font-semibold mb-2 text-[#C6A43F]">Do you offer drone services?</h4>
                <p className="text-sm text-gray-400">Yes, drone coverage is available for select packages. Check our packages page for details.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl">
                <h4 className="font-semibold mb-2 text-[#C6A43F]">Can I reschedule my booking?</h4>
                <p className="text-sm text-gray-400">Yes, contact us at least 7 days before your event to reschedule. Subject to availability.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Prefer to talk? Call us directly at <span className="text-[#C6A43F]">+254 797 356 421</span> or visit our studio
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}