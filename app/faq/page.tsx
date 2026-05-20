"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqs: FAQItem[] = [
  // Booking & Process
  {
    question: "How do I book a session with Alakara Studios?",
    answer: "You can book a session by clicking the 'Book Now' button on our homepage, calling us directly, or sending a message on WhatsApp. You'll receive a booking ID and confirmation message after booking.",
    category: "Booking",
  },
  {
    question: "Do I need to pay a deposit to confirm my booking?",
    answer: "Yes, a 50% deposit is required to confirm your booking. The remaining 50% is due on or before the event day.",
    category: "Booking",
  },
  {
    question: "Can I reschedule or cancel my booking?",
    answer: "Yes, you can reschedule up to 7 days before your event at no extra cost. Cancellations within 14 days of the event incur a 50% cancellation fee. The deposit is non-refundable.",
    category: "Booking",
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-4 weeks in advance, especially for weddings and large events. For passport and studio portraits, walk-ins are welcome!",
    category: "Booking",
  },

  // Services
  {
    question: "What services do you offer?",
    answer: "We offer wedding photography, traditional ceremonies, corporate events, podcast production, documentaries, music videos, choir recordings, funeral coverage, and studio portraits.",
    category: "Services",
  },
  {
    question: "Do you offer drone photography?",
    answer: "Yes, drone coverage is available for select packages including Standard and Premium wedding packages, premium music videos, and choir recordings.",
    category: "Services",
  },
  {
    question: "Do you travel outside Kapenguria?",
    answer: "Absolutely! We serve West Pokot, Trans-Nzoia, Turkana counties and beyond. Travel fees may apply for locations outside Kapenguria. Contact us for a quote.",
    category: "Services",
  },
  {
    question: "Do you offer video editing services?",
    answer: "Yes, all our video packages include professional editing. We also offer standalone editing services - contact us for pricing.",
    category: "Services",
  },

  // Payment
  {
    question: "What payment methods do you accept?",
    answer: "We accept M-Pesa (Paybill number provided during booking), bank transfer, and cash payments at our studio.",
    category: "Payment",
  },
  {
    question: "Do you offer installment payments?",
    answer: "Yes, we allow partial payments. The 50% deposit is required to confirm your booking, and the remaining balance can be paid in installments before the event date.",
    category: "Payment",
  },
  {
    question: "Do you provide receipts?",
    answer: "Yes, we send a WhatsApp receipt immediately after payment. You can also download receipts from your customer portal.",
    category: "Payment",
  },

  // Delivery
  {
    question: "When will I receive my photos?",
    answer: "Digital photos are delivered via WhatsApp within 2-4 weeks after your event, depending on the package. Express delivery (48 hours) is available for premium packages.",
    category: "Delivery",
  },
  {
    question: "How will I receive my photos?",
    answer: "Digital photos are sent via WhatsApp. Printed photos can be picked up from our studio in Kapenguria. We can also arrange delivery for an additional fee.",
    category: "Delivery",
  },
  {
    question: "Can I request RAW/unedited photos?",
    answer: "We only deliver edited, high-quality photos. RAW files are not provided as they represent unfinished work.",
    category: "Delivery",
  },

  // Studio & Equipment
  {
    question: "Where is your studio located?",
    answer: "We are located at Teachers Plaza, 2nd Floor Room 18, Kapenguria, Kenya. Open Monday-Saturday, 9AM-6PM.",
    category: "Studio",
  },
  {
    question: "What equipment do you use?",
    answer: "We use professional Canon and Sony cameras, DJI drones, professional lighting, and audio equipment for the highest quality results.",
    category: "Studio",
  },
  {
    question: "Can I bring my own props or outfits?",
    answer: "Absolutely! We encourage you to bring props, outfits, and accessories that reflect your personality and style.",
    category: "Studio",
  },

  // Customer Portal
  {
    question: "How do I access my customer portal?",
    answer: "Go to our homepage and click 'Customer Portal'. Login with your Booking ID and phone number received in your confirmation message.",
    category: "Portal",
  },
  {
    question: "What can I do in the customer portal?",
    answer: "You can view your booking status, track deposit progress, download receipts, and view past orders.",
    category: "Portal",
  },
];

const categories = ["All", "Booking", "Services", "Payment", "Delivery", "Studio", "Portal"];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked <span className="text-amber-500">Questions</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Find answers to common questions about our services, booking process, payments, and more.
        </p>
        <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
      </section>

      {/* Category Filter */}
      <section className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-amber-500 text-black font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-zinc-800/50 transition"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96 p-5 pt-0" : "max-h-0 p-0"
                  }`}
                >
                  <p className="text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <p>No FAQs found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions? */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-zinc-400 mb-6">
            Can't find what you're looking for? Contact us directly and we'll be happy to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/254797356421"
              target="_blank"
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
            <a
              href="tel:+254797356421"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <a
              href="/contact"
              className="flex items-center gap-2 border border-amber-500 text-amber-500 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500/10 transition"
            >
              <Mail className="w-5 h-5" />
              Contact Form
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center text-zinc-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Alakara Studios. All rights reserved.</p>
      </footer>
    </main>
  );
}