"use client";

import Navbar from "@/components/layout/Navbar";
import { useEffect, useRef, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createBooking, getBookings } from "@/lib/supabase/db";
/* ---------------- TYPES ---------------- */
type PackageFeature = string;

type ServicePackage = {
  id: string;
  name: string;
  price: number;
  features: PackageFeature[];
  popular?: boolean;
};

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  packages: ServicePackage[];
};

type Booking = {
  id: number;
  service: string;
  package: string;
  price: number;
  name: string;
  phone: string;
  date: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  deposit?: number;
  paymentStatus?: string;
};

type PortfolioCategory = "all" | "wedding" | "traditional" | "corporate" | "podcast" | "documentary" | "studio";

type PortfolioImage = {
  id: number;
  src: string;
  title: string;
  category: PortfolioCategory;
  description: string;
  date: string;
};

/* ---------------- PORTFOLIO DATA WITH LOCAL IMAGES ---------------- */
const PORTFOLIO_IMAGES: PortfolioImage[] = [
  // Wedding Category
  {
    id: 1,
    src: "/images/portfolio/wedding/1.jpg",
    title: "Wedding Ceremony",
    category: "wedding",
    description: "Beautiful outdoor wedding ceremony capture",
    date: "2024",
  },
  {
    id: 2,
    src: "/images/portfolio/wedding/2.jpg",
    title: "Bridal Portraits",
    category: "wedding",
    description: "Elegant bridal photography session",
    date: "2024",
  },
  {
    id: 3,
    src: "/images/portfolio/wedding/3.jpg",
    title: "Wedding Reception",
    category: "wedding",
    description: "Candid moments at the reception",
    date: "2024",
  },
  {
    id: 4,
    src: "/images/portfolio/wedding/4.jpg",
    title: "First Dance",
    category: "wedding",
    description: "Magical first dance moments",
    date: "2023",
  },
  
  // Traditional Ceremony
  {
    id: 5,
    src: "/images/portfolio/traditional/1.jpg",
    title: "Traditional Wedding",
    category: "traditional",
    description: "Colorful traditional ceremony",
    date: "2024",
  },
  {
    id: 6,
    src: "/images/portfolio/traditional/2.jpg",
    title: "Cultural Dance",
    category: "traditional",
    description: "Traditional dance performances",
    date: "2024",
  },
  
  // Corporate Events
  {
    id: 7,
    src: "/images/portfolio/corporate/1.jpg",
    title: "Corporate Conference",
    category: "corporate",
    description: "Professional conference coverage",
    date: "2024",
  },
  {
    id: 8,
    src: "/images/portfolio/corporate/2.jpg",
    title: "Product Launch",
    category: "corporate",
    description: "Product launch event photography",
    date: "2023",
  },
  {
    id: 9,
    src: "/images/portfolio/corporate/3.jpg",
    title: "Team Building",
    category: "corporate",
    description: "Corporate team building events",
    date: "2024",
  },
  
  // Podcast
  {
    id: 10,
    src: "/images/portfolio/podcast/1.jpg",
    title: "Podcast Recording",
    category: "podcast",
    description: "Professional podcast setup",
    date: "2024",
  },
  {
    id: 11,
    src: "/images/portfolio/podcast/2.jpg",
    title: "Interview Session",
    category: "podcast",
    description: "Studio interview recording",
    date: "2024",
  },
  
  // Documentary
  {
    id: 12,
    src: "/images/portfolio/documentary/1.jpg",
    title: "Documentary Shoot",
    category: "documentary",
    description: "Documentary film production",
    date: "2024",
  },
  {
    id: 13,
    src: "/images/portfolio/documentary/2.jpg",
    title: "Behind the Scenes",
    category: "documentary",
    description: "Documentary production BTS",
    date: "2024",
  },
  
  // Studio
  {
    id: 14,
    src: "/images/portfolio/studio/1.jpg",
    title: "Studio Portrait",
    category: "studio",
    description: "Professional studio photography",
    date: "2024",
  },
  {
    id: 15,
    src: "/images/portfolio/studio/2.jpg",
    title: "Fashion Shoot",
    category: "studio",
    description: "Fashion photography session",
    date: "2023",
  },
  {
    id: 16,
    src: "/images/portfolio/studio/3.jpg",
    title: "Creative Portraits",
    category: "studio",
    description: "Creative portrait photography",
    date: "2024",
  },
];

/* ---------------- SERVICES ---------------- */
const SERVICES: Service[] = [
  {
    id: "wedding",
    title: "Wedding",
    description: "Capture every precious moment of your special day",
    icon: "💒",
    packages: [
      {
        id: "w1",
        name: "Basic",
        price: 25000,
        features: [
          "1 Photographer",
          "1 Videographer",
          "Full Event Photos + 1 Final Video",
          "No Drone",
          "One A3 Photo Mount",
        ],
      },
      {
        id: "w2",
        name: "Standard",
        price: 35000,
        features: [
          "1 Photographer",
          "1 Videographer",
          "Full Event Photos + 1 Final Video",
          "Drone Available",
          "One A3 Photo Mount",
          "Additional Videographer @Ksh. 10,000",
        ],
        popular: true,
      },
      {
        id: "w3",
        name: "Premium",
        price: 50000,
        features: [
          "2 Photographers",
          "2 Videographers",
          "Full Event Photos + 1 Final Video",
          "Drone Ring Delivery",
          "One A2 Photo Mount",
          "One A3 Photo Book",
        ],
      },
    ],
  },
  {
    id: "traditional",
    title: "Traditional Ceremony",
    description: "Honor your heritage with professional coverage",
    icon: "🏮",
    packages: [
      {
        id: "t1",
        name: "Basic",
        price: 20000,
        features: [
          "1 Photographer",
          "1 Videographer",
          "Ceremony Photos + 1 Final Video",
          "No Drone",
          "One A4 Photo Mount",
        ],
      },
      {
        id: "t2",
        name: "Standard",
        price: 30000,
        features: [
          "1 Photographer",
          "1 Videographer",
          "Full Ceremony Photos + Video",
          "Drone Available",
          "One A3 Photo Mount",
          "Traditional Music Overlay",
        ],
        popular: true,
      },
      {
        id: "t3",
        name: "Premium",
        price: 45000,
        features: [
          "2 Photographers",
          "2 Videographers",
          "Full Ceremony Photos + Highlight Video",
          "Drone Coverage",
          "One A2 Photo Mount",
          "One A4 Photo Book",
          "Cultural Storytelling Edit",
        ],
      },
    ],
  },
  {
    id: "corporate",
    title: "Corporate Event",
    description: "Professional coverage for your business events",
    icon: "🏢",
    packages: [
      {
        id: "c1",
        name: "Basic",
        price: 20000,
        features: [
          "1 Photographer",
          "Event Photos (4 hours)",
          "50 Edited Photos",
          "Digital Gallery",
          "No Video Coverage",
        ],
      },
      {
        id: "c2",
        name: "Standard",
        price: 35000,
        features: [
          "1 Photographer + 1 Videographer",
          "Full Event Coverage (8 hours)",
          "100 Edited Photos",
          "1 Highlight Video (3-5 min)",
          "Digital Gallery + USB Delivery",
          "Company Branding Overlay",
        ],
        popular: true,
      },
      {
        id: "c3",
        name: "Premium",
        price: 50000,
        features: [
          "2 Photographers + 1 Videographer",
          "Full Day Coverage (12 hours)",
          "200+ Edited Photos",
          "Full Event Video + Highlights",
          "Drone Coverage",
          "Live Social Media Updates",
          "Express 48hr Photo Delivery",
        ],
      },
    ],
  },
  {
    id: "podcast",
    title: "Podcast",
    description: "Studio-quality audio and video for your show",
    icon: "🎙️",
    packages: [
      {
        id: "p1",
        name: "Audio Basic",
        price: 10000,
        features: [
          "Professional Audio Recording",
          "1 Hour Session",
          "Noise Reduction",
          "MP3 Delivery",
          "Up to 2 Guests",
        ],
      },
      {
        id: "p2",
        name: "Video Podcast",
        price: 25000,
        features: [
          "Audio + Video Recording",
          "2 Hour Session",
          "2 Camera Angles",
          "Basic Lighting Setup",
          "Edited Video + Audio",
          "Up to 3 Guests",
          "YouTube Ready Export",
        ],
        popular: true,
      },
      {
        id: "p3",
        name: "Studio Production",
        price: 40000,
        features: [
          "Full Studio Setup",
          "4 Hour Session",
          "3 Camera Angles",
          "Professional Lighting",
          "Live Streaming Available",
          "Custom Background",
          "Full Post-Production",
          "Social Media Clips Package",
        ],
      },
    ],
  },
  {
    id: "documentary",
    title: "Documentary",
    description: "Tell your story with cinematic excellence",
    icon: "🎬",
    packages: [
      {
        id: "d1",
        name: "Short Doc",
        price: 25000,
        features: [
          "1 Videographer",
          "5-10 Minute Final Film",
          "2 Interview Sessions",
          "B-Roll Coverage",
          "Basic Color Grading",
          "Background Music",
        ],
      },
      {
        id: "d2",
        name: "Standard Documentary",
        price: 40000,
        features: [
          "2 Videographers",
          "15-20 Minute Film",
          "4 Interview Sessions",
          "Drone Footage",
          "Professional Color Grading",
          "Licensed Music",
          "Voice-over Recording",
        ],
        popular: true,
      },
      {
        id: "d3",
        name: "Premium Documentary",
        price: 50000,
        features: [
          "Full Production Crew",
          "30+ Minute Feature Film",
          "Unlimited Interviews",
          "Drone + Gimbal Footage",
          "Cinematic Color Grading",
          "Custom Soundtrack",
          "Archival Research",
          "Film Festival Ready Export",
        ],
      },
    ],
  },
  {
    id: "funeral",
    title: "Funeral Coverage",
    description: "Dignified coverage to honor your loved ones",
    icon: "🕊️",
    packages: [
      {
        id: "f1",
        name: "Basic",
        price: 15000,
        features: [
          "1 Photographer",
          "Ceremony + Burial Photos",
          "50 Edited Photos",
          "Digital Gallery",
          "Memorial Photo Mount",
        ],
      },
      {
        id: "f2",
        name: "Standard",
        price: 25000,
        features: [
          "1 Photographer + 1 Videographer",
          "Full Service Coverage",
          "100 Edited Photos",
          "Memorial Video (5-8 min)",
          "One A3 Photo Mount",
          "USB + Digital Delivery",
        ],
        popular: true,
      },
      {
        id: "f3",
        name: "Premium",
        price: 35000,
        features: [
          "2 Photographers + 1 Videographer",
          "Full Day Coverage",
          "200+ Photos",
          "Extended Memorial Film",
          "Drone Coverage",
          "One A2 Photo Mount",
          "Memorial Photo Book",
          "Express 24hr Delivery",
        ],
      },
    ],
  },
];

/* ---------------- CUSTOM COLOR SCHEME ---------------- */
const COLORS = {
  primary: "#C6A43F",
  primaryDark: "#A8872D",
  primaryLight: "#D4B96A",
  secondary: "#1A1A1A",
  secondaryLight: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textMuted: "#737373",
  bgPrimary: "#000000",
  bgSecondary: "#0A0A0A",
  bgCard: "#111111",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
};

/* ---------------- TOAST COMPONENT ---------------- */
type ToastType = "success" | "error" | "info";

const Toast = ({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? COLORS.success : type === "error" ? COLORS.error : COLORS.primary;
  
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-sm font-medium animate-slide-in`}
      style={{ backgroundColor: bgColor, color: type === "success" ? "#000" : "#fff" }}
    >
      {message}
    </div>
  );
};

/* ---------------- LIGHTBOX COMPONENT ---------------- */
const Lightbox = ({ image, onClose }: { image: PortfolioImage | null; onClose: () => void }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-[#C6A43F] transition"
        >
          ✕ Close
        </button>
        <img
          src={image.src}
          alt={image.title}
          className="w-full h-auto rounded-xl"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/800x600/1a1a1a/ffffff?text=Image+Coming+Soon";
          }}
        />
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-white">{image.title}</h3>
          <p className="text-zinc-400 mt-1">{image.description}</p>
          <p className="text-sm mt-2" style={{ color: COLORS.primary }}>{image.date}</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const packagesRef = useRef<HTMLDivElement | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioCategory, setPortfolioCategory] = useState<PortfolioCategory>("all");
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    message: "",
  });

  /* ---------------- LOAD BOOKINGS FROM SUPABASE ---------------- */
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getBookings();
        const formatted = data.map((b: any) => ({
          id: b.booking_id,
          service: b.service,
          package: b.package,
          price: b.price,
          name: b.name,
          phone: b.phone,
          date: b.event_date,
          message: b.message,
          status: b.status,
          deposit: b.deposit,
        }));
        setBookings(formatted);
      } catch (error) {
        console.error("Failed to load bookings from Supabase:", error);
      }
    };
    loadBookings();
  }, []);

  /* ---------------- FILTERED PORTFOLIO ---------------- */
  const filteredPortfolio = useMemo(() => {
    if (portfolioCategory === "all") return PORTFOLIO_IMAGES;
    return PORTFOLIO_IMAGES.filter(img => img.category === portfolioCategory);
  }, [portfolioCategory]);

  /* ---------------- CATEGORY COUNTS ---------------- */
  const categoryCounts = useMemo(() => {
    const counts: Record<PortfolioCategory, number> = {
      all: PORTFOLIO_IMAGES.length,
      wedding: PORTFOLIO_IMAGES.filter(img => img.category === "wedding").length,
      traditional: PORTFOLIO_IMAGES.filter(img => img.category === "traditional").length,
      corporate: PORTFOLIO_IMAGES.filter(img => img.category === "corporate").length,
      podcast: PORTFOLIO_IMAGES.filter(img => img.category === "podcast").length,
      documentary: PORTFOLIO_IMAGES.filter(img => img.category === "documentary").length,
      studio: PORTFOLIO_IMAGES.filter(img => img.category === "studio").length,
    };
    return counts;
  }, []);

  /* ---------------- DATE FORMATTER ---------------- */
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* ---------------- DAILY LIMIT (using Supabase data) ---------------- */
const getBookingsForDate = (date: string) => {
  return bookings.filter((b) => b.date === date);
};

const isDateFullyBooked = (date: string) => {
  return getBookingsForDate(date).length >= 2;
};


  /* ---------------- FILTER AVAILABLE DATES ---------------- */
  const filterAvailableDates = (date: Date) => {
    const formatted = formatLocalDate(date);
    return !isDateFullyBooked(formatted);
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = (): string | null => {
    if (!form.name.trim()) return "Please enter your name";
    if (form.name.trim().length < 2) return "Name must be at least 2 characters";
    
    if (!form.phone.trim()) return "Please enter your phone number";
    const phoneRegex = /^(\+?254|0)?[71]\d{8}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      return "Please enter a valid Kenyan phone number";
    }
    
    if (!form.date) return "Please select an event date";
    
    if (!selectedService || !selectedPackage) {
      return "Please select a service and package";
    }

    if (isDateFullyBooked(form.date)) {
      return "Sorry, this date is now fully booked. Please select another date.";
    }

    return null;
  };

  /* ---------------- INPUT CHANGE ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- SERVICE CLICK ---------------- */
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setSelectedPackage(null);
    
    setTimeout(() => {
      packagesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  /* ---------------- SEND BOOKING TO SUPABASE ---------------- */
  const sendBooking = async () => {
    const error = validate();
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingId = Date.now();
      const bookingData = {
        booking_id: bookingId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: "",
        service: selectedService!.title,
        package: selectedPackage!.name,
        price: selectedPackage!.price,
        deposit: 0,
        status: "pending",
        payment_status: "unpaid",
        event_date: form.date,
        message: form.message.trim(),
        venue: "",
        notes: "",
      };

      await createBooking(bookingData);

      // Update local state for date availability
      const newBooking: Booking = {
        id: bookingId,
        service: bookingData.service,
        package: bookingData.package,
        price: bookingData.price,
        name: bookingData.name,
        phone: bookingData.phone,
        date: bookingData.event_date,
        message: bookingData.message,
        status: "pending",
        deposit: 0,
      };
      setBookings(prev => [...prev, newBooking]);

      // WhatsApp message
      const msg = `🎬 *NEW BOOKING REQUEST - Alakara Studios*

*Service:* ${bookingData.service}
*Package:* ${bookingData.package}
*Price:* KES ${bookingData.price.toLocaleString()}

*Client Details:*
👤 Name: ${bookingData.name}
📞 Phone: ${bookingData.phone}
📅 Date: ${formatDisplayDate(bookingData.event_date)}
${bookingData.message ? `📝 Notes: ${bookingData.message}` : ""}

*Portal Access:*
🔗 View & manage your booking: ${window.location.origin}/portal
🔑 Login with Booking ID: ${bookingId} and Phone: ${bookingData.phone}

_Keep this message for your records_`;

      window.open(`https://wa.me/254797356421?text=${encodeURIComponent(msg)}`, "_blank");

      setForm({
        name: "",
        phone: "",
        date: "",
        message: "",
      });
      setSelectedService(null);
      setSelectedPackage(null);

      setToast({ 
        message: `Booking successful! Booking ID: ${bookingId}. Check WhatsApp for details.`, 
        type: "success" 
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Supabase error:", err);
      setToast({ message: `Failed to save booking: ${err?.message || "Unknown error"}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<PortfolioCategory, string> = {
    all: "All Work",
    wedding: "Weddings 💒",
    traditional: "Traditional 🏮",
    corporate: "Corporate 🏢",
    podcast: "Podcast 🎙️",
    documentary: "Documentary 🎬",
    studio: "Studio 📸",
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.bgPrimary, color: COLORS.textPrimary }}>
      <Navbar />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* LIGHTBOX */}
      <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* HERO SECTION */}
      <section
        id="home"
        className="h-screen flex items-center justify-center text-center relative px-6"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/portfolio/hero/bg.jpg')",
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.75)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-7xl md:text-8xl block mb-4">🎬</span>
            <h1 className="text-5xl md:text-7xl font-bold mb-2">
              Alakara <span style={{ color: COLORS.primary }}>Studios</span>
            </h1>
            <p className="text-xl" style={{ color: COLORS.primary }}>Where Moments Become Memories</p>
          </div>
          <p className="text-xl md:text-2xl text-zinc-300 mb-8">
            Professional Photography & Videography Services
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() =>
                document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
              }
              className="backdrop-blur-sm border px-8 py-4 rounded-full text-lg font-semibold transition"
              style={{ 
                backgroundColor: `${COLORS.primary}20`, 
                borderColor: COLORS.primary,
                color: COLORS.textPrimary
              }}
            >
              View Portfolio
            </button>
            <button
              onClick={() =>
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-full text-lg font-semibold transition"
              style={{ backgroundColor: COLORS.primary, color: "#000" }}
            >
              Book Now
            </button>
            <a
              href="/portal"
              className="px-8 py-4 rounded-full text-lg font-semibold transition border"
              style={{ borderColor: COLORS.primary, color: COLORS.textPrimary }}
            >
              Customer Portal →
            </a>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Portfolio</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore our recent work across different events and productions
            </p>
            <div 
              className="w-20 h-1 mx-auto mt-4 rounded-full"
              style={{ background: `linear-gradient(to right, ${COLORS.primary}, transparent)` }}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {(Object.keys(categoryLabels) as PortfolioCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setPortfolioCategory(category)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  portfolioCategory === category
                    ? "font-semibold shadow-lg scale-105"
                    : "border text-zinc-400 hover:text-white"
                }`}
                style={{
                  backgroundColor: portfolioCategory === category ? COLORS.primary : "transparent",
                  color: portfolioCategory === category ? "#000" : COLORS.textSecondary,
                  borderColor: portfolioCategory === category ? COLORS.primary : COLORS.secondaryLight,
                }}
              >
                {categoryLabels[category]}
                <span className="ml-2 text-xs opacity-60">
                  ({categoryCounts[category]})
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolio.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-[4/3] overflow-hidden" style={{ backgroundColor: COLORS.secondary }}>
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/800x600/1a1a1a/ffffff?text=Image+Coming+Soon";
                    }}
                  />
                </div>
                
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                    hoveredImage === image.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                    <h3 className="text-xl font-bold text-white mb-1">{image.title}</h3>
                    <p className="text-sm text-zinc-300 mb-2">{image.description}</p>
                    <p className="text-xs" style={{ color: COLORS.primary }}>{image.date}</p>
                    <div 
                      className="mt-3 inline-block backdrop-blur-sm px-3 py-1 rounded-full text-xs"
                      style={{ backgroundColor: `${COLORS.primary}20` }}
                    >
                      {categoryLabels[image.category].split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPortfolio.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 px-6" style={{ backgroundColor: COLORS.bgSecondary }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Choose from our range of professional services tailored to your needs
            </p>
            <div 
              className="w-20 h-1 mx-auto mt-4 rounded-full"
              style={{ background: `linear-gradient(to right, ${COLORS.primary}, transparent)` }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`p-8 border rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedService?.id === service.id
                    ? "scale-105 shadow-xl"
                    : "hover:scale-105"
                }`}
                style={{
                  borderColor: selectedService?.id === service.id ? COLORS.primary : COLORS.secondaryLight,
                  backgroundColor: selectedService?.id === service.id ? COLORS.bgCard : "transparent",
                }}
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-zinc-400 text-sm mb-3">{service.description}</p>
                <p className="text-sm" style={{ color: COLORS.primary }}>
                  {service.packages.length} packages from KES {Math.min(...service.packages.map(p => p.price)).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKINGS SECTION */}
      <section id="bookings" ref={packagesRef} className="py-24 px-6" style={{ backgroundColor: COLORS.bgSecondary }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-center font-bold mb-4">
            {selectedService ? selectedService.title : "Select a Service"}
          </h2>
          <p className="text-zinc-400 text-center mb-12">
            {selectedService
              ? "Choose your preferred package and book your date"
              : "Click on a service above to view available packages"}
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT - PACKAGES */}
            <div className="flex-1 space-y-6">
              {selectedService && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-300 mb-4">
                    Available Packages
                  </h3>
                  {selectedService.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-6 border rounded-2xl cursor-pointer transition duration-300 ${
                        selectedPackage?.id === pkg.id
                          ? "scale-105"
                          : "hover:scale-105"
                      }`}
                      style={{
                        borderColor: selectedPackage?.id === pkg.id ? COLORS.primary : COLORS.secondaryLight,
                        backgroundColor: selectedPackage?.id === pkg.id ? COLORS.bgCard : "transparent",
                      }}
                    >
                      {pkg.popular && (
                        <div 
                          className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: COLORS.primary, color: "#000" }}
                        >
                          MOST POPULAR
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-xl">{pkg.name}</h3>
                        <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                          KSh {pkg.price.toLocaleString()}
                        </p>
                      </div>
                      <button className="text-sm text-zinc-400 hover:text-white transition">
                        {selectedPackage?.id === pkg.id ? "Selected ✓" : "Click to select"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* BOOKING FORM */}
              {selectedPackage && (
                <div className="space-y-4 mt-6 p-8 rounded-2xl" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.secondaryLight}` }}>
                  <h3 className="text-2xl font-bold mb-6">
                    Complete Your Booking
                  </h3>

                  <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: COLORS.secondary }}>
                    <p className="text-sm text-zinc-400">Selected Package</p>
                    <p className="font-semibold">
                      {selectedService?.title} - {selectedPackage.name}
                    </p>
                    <p className="font-bold mt-1" style={{ color: COLORS.primary }}>
                      KSh {selectedPackage.price.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Event Date *
                    </label>
                    <DatePicker
  selected={form.date ? new Date(form.date) : null}
  onChange={(date: Date | null) => {
    if (!date) return;
    setForm({
      ...form,
      date: formatLocalDate(date),
    });
  }}

                      filterDate={filterAvailableDates}
                      dayClassName={(date) => {
                        const formatted = formatLocalDate(date);
                        const count = getBookingsForDate(formatted).length;
                        if (count >= 2) {
                          return "bg-red-500/50 text-white rounded-full cursor-not-allowed";
                        }
                        if (count === 1) {
                          return "bg-yellow-500/50 text-black rounded-full";
                        }
                        return "hover:bg-zinc-700 rounded-full";
                      }}
                      minDate={new Date()}
                      placeholderText="Select Event Date"
                      className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white focus:border-white transition"
                      dateFormat="yyyy-MM-dd"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      🟡 1 slot booked &nbsp;&nbsp; 🔴 Fully booked (2 slots max per day)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      placeholder="e.g., 0712345678"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      name="message"
                      placeholder="Any special requirements or notes..."
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-white transition resize-none"
                    />
                  </div>

                  <button
                    onClick={sendBooking}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: COLORS.primary, color: "#000" }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Processing...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>

                  <p className="text-xs text-zinc-500 text-center mt-4">
                    By confirming, you agree to our terms and conditions. We'll contact you via WhatsApp to finalize the details.
                    <br />
                    You'll receive a Booking ID to access your customer portal.
                  </p>
                </div>
              )}

              {!selectedService && (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-6xl mb-4">📸</p>
                  <p className="text-xl">Select a service to begin</p>
                  <p className="mt-2">
                    Choose from our professional photography & videography services
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT - PACKAGE DETAILS PANEL */}
            <div className="lg:w-96">
              <div className="sticky top-24">
                {selectedPackage ? (
                  <div className="p-6 rounded-2xl" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.secondaryLight}` }}>
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{selectedService?.icon}</div>
                      <h3 className="text-xl font-bold">{selectedService?.title}</h3>
                      <p className="text-zinc-400 text-sm mt-1">{selectedService?.description}</p>
                    </div>

                    <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: COLORS.secondary }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400">Package</span>
                        <span className="font-semibold">{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Price</span>
                        <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                          KSh {selectedPackage.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4 text-lg">What's Included:</h4>
                      <ul className="space-y-3">
                        {selectedPackage.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="mt-1" style={{ color: COLORS.primary }}>✓</span>
                            <span className="text-zinc-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedPackage.popular && (
                      <div className="mt-6 rounded-xl p-4 text-center" style={{ backgroundColor: `${COLORS.primary}20` }}>
                        <p className="text-sm font-semibold" style={{ color: COLORS.primary }}>⭐ Most Popular Choice</p>
                        <p className="text-xs text-zinc-400 mt-1">Best value for your money</p>
                      </div>
                    )}
                  </div>
                ) : selectedService ? (
                  <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.secondaryLight}` }}>
                    <div className="text-5xl mb-4">{selectedService.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{selectedService.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4">{selectedService.description}</p>
                    <p className="text-zinc-500 text-sm">
                      Select a package to see what's included
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.secondaryLight}` }}>
                    <p className="text-4xl mb-3">💡</p>
                    <p className="text-zinc-400 text-sm">
                      Select a service and package to see detailed information here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6" style={{ backgroundColor: COLORS.bgSecondary, borderColor: COLORS.secondaryLight }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Alakara Studios</h3>
              <p className="text-zinc-500 text-sm">Where Moments Become Memories</p>
              <p className="text-zinc-500 text-sm mt-2">Professional Photography & Videography</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#home" className="text-zinc-500 hover:text-white transition">Home</a></li>
                <li><a href="#portfolio" className="text-zinc-500 hover:text-white transition">Portfolio</a></li>
                <li><a href="#services" className="text-zinc-500 hover:text-white transition">Services</a></li>
                <li><a href="#bookings" className="text-zinc-500 hover:text-white transition">Book Now</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Customer</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/portal" className="text-zinc-500 hover:text-white transition">Customer Portal</a></li>
                <li><a href="/dashboard" className="text-zinc-500 hover:text-white transition">Admin Login</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-zinc-500">📞 +254 797 356421</li>
                <li className="text-zinc-500">💬 WhatsApp Available</li>
                <li className="text-zinc-500">📧 info@alakara.studio</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} Alakara Studios. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}