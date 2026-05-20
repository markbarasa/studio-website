"use client";

import Navbar from "@/components/layout/Navbar";
import { MapPin, CheckCircle, Clock, Camera, Users, Award, Phone, MessageCircle } from "lucide-react";
import PriceListPDF from "@/components/PriceListPDF";
import ServiceAreaMap from "@/components/ServiceAreaMap";

// Add somewhere in the CTA section or footer

const serviceAreas = [
  {
    region: "West Pokot County",
    description: "Full photography and videography coverage across West Pokot County. From the county headquarters to remote villages, we bring professional services to your doorstep.",
    icon: "🏔️",
    areas: [
      "Kapenguria (Headquarters)",
      "Chepareria",
      "Kacheliba",
      "Kodich",
      "Sigor",
      "Lodwar",
      "Masol",
      "Alale",
      "Kasei",
      "Suam",
      "Konyao",
      "Kiwawa",
      "Keringet",
      "Lelan",
      "Kosipe",
      "Tapach",
      "Lomut",
      "Chepkopegh",
      "Kakapel",
      "Kishaunet",
      "Kapsait",
      "Makutano",
      "Sekerr",
      "Kamasia",
      "Nakorotwo",
      "Nakwamoru",
      "Nasol",
      "Kiwawa",
      "Lokichar",
      "Lorugum",
    ],
  },
  {
    region: "Trans-Nzoia County",
    description: "Professional coverage throughout Trans-Nzoia County, the breadbasket of Kenya. We serve both urban centers and rural farming communities.",
    icon: "🌾",
    areas: [
      "Kitale (Headquarters)",
      "Kiminini",
      "Endebess",
      "Saboti",
      "Kachibora",
      "Sikhendu",
      "Matunda",
      "Kipsaina",
      "Kipsombe",
      "Sirende",
      "Suwerwa",
      "Waitaluk",
      "Kakamega",
      "Kaptagat",
      "Kinyoro",
      "Makutano",
      "Naitiri",
      "Kapsara",
      "Chepchoina",
      "Kwanza",
      "Kiboroa",
      "Keringet",
      "Tuwani",
      "Murgusi",
      "Kisiwa",
      "Lugari",
      "Moi's Bridge",
      "Turbo",
      "Lessos",
      "Kapkoi",
      "Sinyerere",
      "Kapsitwet",
      "Kapsokwony",
    ],
  },
  {
    region: "Turkana County",
    description: "Extensive coverage across Turkana County, from Lodwar to remote pastoral communities. We travel far to capture your moments.",
    icon: "🐪",
    areas: [
      "Lodwar (Headquarters)",
      "Kakuma (Refugee Camp & Town)",
      "Lokichoggio",
      "Lokitaung",
      "Lorugum",
      "Katilu",
      "Kalokol",
      "Ferguson's Gulf",
      "Eliye Springs",
      "Lokwamosing",
      "Kakuma",
      "Lopiding",
      "Nakwamoru",
      "Lokori",
      "Lorienetom",
      "Kapedo",
      "Lomelo",
      "Lotikipi",
      "Lokori",
      "Kangirisae",
      "Nakurio",
      "Kokwa",
      "Lobei",
      "Napeikar",
      "Lokwamosing",
      "Kalemngorok",
      "Kataboi",
      "Nakalale",
      "Lorengippi",
      "Kakimat",
      "Lopur",
      "Natira",
      "Lokitaung",
      "Kakuma",
      "Lokwii",
    ],
  },
];

const services = [
  {
    title: "Wedding Photography",
    description: "Capturing every precious moment of your special day across West Pokot, Trans-Nzoia, and Turkana",
    icon: "💒",
  },
  {
    title: "Corporate Events",
    description: "Professional coverage for conferences and corporate functions in Kitale, Kapenguria, Lodwar and beyond",
    icon: "🏢",
  },
  {
    title: "Music Videos",
    description: "High-quality music video production for artists in the region",
    icon: "🎵",
  },
  {
    title: "Documentaries",
    description: "Cinematic storytelling for your brand, community, or cause",
    icon: "🎬",
  },
  {
    title: "Studio Portraits",
    description: "Professional indoor photography sessions at our Kapenguria studio",
    icon: "📸",
  },
  {
    title: "Traditional Ceremonies",
    description: "Pokot, Turkana, and other cultural event coverage with respect and excellence",
    icon: "🏮",
  },
  {
    title: "Graduation Photos",
    description: "Capture your academic achievements in style",
    icon: "🎓",
  },
  {
    title: "Birthday & Events",
    description: "Birthday parties, anniversaries, and family celebrations",
    icon: "🎂",
  },
  {
    title: "Aerial Photography",
    description: "Drone coverage for stunning aerial shots of the scenic landscape",
    icon: "🚁",
  },
];

const stats = [
  { number: "50+", label: "Towns Covered", icon: "🏙️" },
  { number: "1000+", label: "Happy Clients", icon: "😊" },
  { number: "24/7", label: "Customer Support", icon: "📞" },
  { number: "Same Day", label: "Photo Delivery", icon: "⚡" },
];

export default function ServiceAreas() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our Service <span className="text-amber-500">Areas</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Alakara Studios proudly serves West Pokot, Trans-Nzoia, and Turkana counties. 
          From major towns to remote villages, we bring professional photography and 
          videography to your doorstep.
        </p>
        <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
      </section>


      {/* Interactive Map Section */}
<section className="px-6 py-12">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold mb-2">🗺️ Interactive Service Map</h2>
      <p className="text-zinc-400">Click on any county to see covered areas</p>
    </div>
    <ServiceAreaMap />
  </div>
</section>


      {/* Stats Section */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-amber-500">{stat.number}</div>
                <div className="text-xs text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Notice */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl p-8 text-center border border-amber-500/20">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-semibold mb-2">Complete Coverage</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              We travel to all towns, trading centers, villages, and remote areas across 
              West Pokot, Trans-Nzoia, and Turkana counties. No location is too far!
            </p>
          </div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceAreas.map((area, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-4">{area.icon}</div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  {area.region}
                </h3>
                <p className="text-zinc-400 text-sm mb-4">{area.description}</p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {area.areas.map((subarea, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400"
                    >
                      {subarea}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <p className="text-xs text-amber-500">✓ Mobile studio available in this region</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services We Offer */}
      <section className="px-6 py-12 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Services We Offer</h2>
            <p className="text-zinc-400">
              Professional photography and videography for any occasion
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900 transition"
              >
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="font-semibold mb-1">{service.title}</h3>
                <p className="text-sm text-zinc-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Why Choose Alakara Studios</h2>
            <p className="text-zinc-400">Excellence in every frame, delivered to your location</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-zinc-900/30 rounded-xl">
              <Camera className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Professional Equipment</h3>
              <p className="text-sm text-zinc-400">
                State-of-the-art cameras, lighting, and drones for stunning results anywhere
              </p>
            </div>
            <div className="text-center p-6 bg-zinc-900/30 rounded-xl">
              <Users className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Experienced Team</h3>
              <p className="text-sm text-zinc-400">
                Local photographers who understand Pokot, Turkana, and Trans-Nzoia communities
              </p>
            </div>
            <div className="text-center p-6 bg-zinc-900/30 rounded-xl">
              <Award className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Nationwide Reach</h3>
              <p className="text-sm text-zinc-400">
                We travel anywhere in West Pokot, Trans-Nzoia, Turkana, and beyond
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Studio Notice */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl p-6 border border-amber-500/20">
          <h3 className="text-xl font-semibold mb-2">📱 Mobile Studio Service</h3>
          <p className="text-zinc-400 text-sm mb-3">
            Can't come to our Kapenguria studio? We bring professional photography to your location!
          </p>
          <p className="text-xs text-amber-500">*Travel fees may apply for remote areas</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Capture Your Moments?
          </h2>
          <p className="text-zinc-400 mb-6">
            Contact us today to book your session anywhere in West Pokot, Trans-Nzoia, or Turkana
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/#services"
              className="bg-amber-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-amber-400 transition"
            >
              Book Now
            </a>
            <a
              href="https://wa.me/254797356421"
              target="_blank"
              className="border border-amber-500 text-amber-500 px-8 py-3 rounded-full font-semibold hover:bg-amber-500/10 transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
            <a
              href="tel:+254797356421"
              className="border border-zinc-600 text-zinc-400 px-8 py-3 rounded-full font-semibold hover:bg-zinc-800 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
            <a href="/" className="text-zinc-500 hover:text-white transition">Home</a>
            <a href="/#portfolio" className="text-zinc-500 hover:text-white transition">Portfolio</a>
            <a href="/#services" className="text-zinc-500 hover:text-white transition">Services</a>
            <a href="/service-areas" className="text-amber-500 hover:text-amber-400 transition">Service Areas</a>
            <a href="/contact" className="text-zinc-500 hover:text-white transition">Contact</a>
          </div>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Alakara Studios. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Serving West Pokot • Trans-Nzoia • Turkana Counties
          </p>
        </div>
      </footer>

      <style jsx>{`
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
      `}</style>
    </main>
  );
}