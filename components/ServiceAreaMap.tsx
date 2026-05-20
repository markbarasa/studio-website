"use client";

import { useState } from "react";
import { MapPin, Navigation, Phone, MessageCircle } from "lucide-react";

export default function ServiceAreaMap() {
  const [selectedCounty, setSelectedCounty] = useState<string>("West Pokot");

  const counties = [
    {
      name: "West Pokot",
      capital: "Kapenguria",
      description: "Our home base. Full studio services available.",
      towns: [
        "Kapenguria (Headquarters)",
        "Chepareria",
        "Kacheliba",
        "Kodich",
        "Sigor",
        "Masol",
        "Alale",
        "Kasei",
        "Suam",
        "Konyao",
      ],
    },
    {
      name: "Trans-Nzoia",
      capital: "Kitale",
      description: "Full coverage including Kitale and surrounding areas.",
      towns: [
        "Kitale (Headquarters)",
        "Kiminini",
        "Endebess",
        "Saboti",
        "Kachibora",
        "Sikhendu",
        "Matunda",
        "Kipsaina",
        "Kipsombe",
        "Moi's Bridge",
        "Turbo",
      ],
    },
    {
      name: "Turkana",
      capital: "Lodwar",
      description: "Extensive coverage including remote pastoral areas.",
      towns: [
        "Lodwar (Headquarters)",
        "Kakuma",
        "Lokichoggio",
        "Lokitaung",
        "Lorugum",
        "Katilu",
        "Kalokol",
        "Ferguson's Gulf",
        "Eliye Springs",
      ],
    },
  ];

  const selectedCountyData = counties.find(c => c.name === selectedCounty);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          Our Service Areas
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          We provide professional photography and videography services across Western Kenya
        </p>
      </div>

      {/* County Selector */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-wrap gap-3">
          {counties.map((county) => (
            <button
              key={county.name}
              onClick={() => setSelectedCounty(county.name)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCounty === county.name
                  ? "bg-amber-500 text-black font-semibold"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {county.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Visualization */}
      <div className="p-4 bg-black/50">
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
          {/* Simple SVG Map Representation */}
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            {/* West Pokot region */}
            <path
              d="M100,100 L250,80 L300,150 L200,250 L80,200 Z"
              fill={selectedCounty === "West Pokot" ? "rgba(198, 164, 63, 0.3)" : "rgba(100, 100, 100, 0.2)"}
              stroke={selectedCounty === "West Pokot" ? "#C6A43F" : "#4a4a4a"}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onClick={() => setSelectedCounty("West Pokot")}
            />
            <text x="150" y="170" fill={selectedCounty === "West Pokot" ? "#C6A43F" : "#888"} fontSize="12" textAnchor="middle">
              West Pokot
            </text>

            {/* Trans-Nzoia region */}
            <path
              d="M280,120 L450,100 L500,180 L400,250 L300,200 Z"
              fill={selectedCounty === "Trans-Nzoia" ? "rgba(198, 164, 63, 0.3)" : "rgba(100, 100, 100, 0.2)"}
              stroke={selectedCounty === "Trans-Nzoia" ? "#C6A43F" : "#4a4a4a"}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onClick={() => setSelectedCounty("Trans-Nzoia")}
            />
            <text x="390" y="170" fill={selectedCounty === "Trans-Nzoia" ? "#C6A43F" : "#888"} fontSize="12" textAnchor="middle">
              Trans-Nzoia
            </text>

            {/* Turkana region */}
            <path
              d="M50,280 L200,260 L300,350 L150,400 L30,350 Z"
              fill={selectedCounty === "Turkana" ? "rgba(198, 164, 63, 0.3)" : "rgba(100, 100, 100, 0.2)"}
              stroke={selectedCounty === "Turkana" ? "#C6A43F" : "#4a4a4a"}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onClick={() => setSelectedCounty("Turkana")}
            />
            <text x="150" y="340" fill={selectedCounty === "Turkana" ? "#C6A43F" : "#888"} fontSize="12" textAnchor="middle">
              Turkana
            </text>

            {/* Marker for Kapenguria */}
            <circle cx="180" cy="150" r="6" fill="#C6A43F" />
            <text x="180" y="140" fill="#C6A43F" fontSize="10" textAnchor="middle">
              Kapenguria 📍
            </text>

            {/* Marker for Kitale */}
            <circle cx="380" cy="155" r="6" fill="#C6A43F" />
            <text x="380" y="145" fill="#C6A43F" fontSize="10" textAnchor="middle">
              Kitale 📍
            </text>

            {/* Marker for Lodwar */}
            <circle cx="150" cy="320" r="6" fill="#C6A43F" />
            <text x="150" y="310" fill="#C6A43F" fontSize="10" textAnchor="middle">
              Lodwar 📍
            </text>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-black/70 p-2 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-zinc-400">Studio Location</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-amber-500/30 border border-amber-500"></div>
              <span className="text-zinc-400">Selected County</span>
            </div>
          </div>
        </div>
      </div>

      {/* County Details */}
      {selectedCountyData && (
        <div className="p-5 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-lg">{selectedCountyData.name} County</h4>
          </div>
          <p className="text-sm text-zinc-400 mb-3">{selectedCountyData.description}</p>
          <p className="text-sm text-zinc-400 mb-2">
            <span className="text-amber-500">HQ:</span> {selectedCountyData.capital}
          </p>
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Towns & Centers Served:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCountyData.towns.map((town, idx) => (
                <span key={idx} className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                  {town}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-zinc-800">
            <a
              href={`https://www.google.com/maps/search/${selectedCountyData.capital}+Kenya`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
            <a
              href={`https://wa.me/254797356421?text=I'm%20interested%20in%20services%20in%20${selectedCountyData.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              Inquire for {selectedCountyData.name}
            </a>
          </div>
        </div>
      )}

      {/* Travel Notice */}
      <div className="p-4 bg-amber-500/10 border-t border-amber-500/30 text-center">
        <p className="text-sm text-amber-400">
          🚗 Travel fees may apply for locations outside Kapenguria. Contact us for a quote.
        </p>
      </div>
    </div>
  );
}