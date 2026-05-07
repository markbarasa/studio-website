import Link from "next/link"

import Navbar from "@/components/layout/Navbar"
// app/pricing/page.tsx

export default function PricingPage() {
  return (

    <>
<Navbar />

    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-5xl font-bold mb-4">
          Wedding/Pre Wedding  Packages
        </h1>

        <p className="text-gray-400 mb-16">
          This pricing is for weddings and pre weddings(Traditional ceremonies like ruracio, koita e.t.c) only. 
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Basic */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-bold mb-4">
              Basic
            </h2>

            <p className="text-5xl font-bold mb-6">
              KSh 25,000
            </p>

            <ul className="space-y-4 text-gray-300 mb-8">
              <li>1 Photographer</li>
              <li> 1 Videographer</li>
              <li>Full Event Photos + 1 Final Video</li>
              <li>No Drone</li>
              <li>One A3 Photo Mount</li>
            </ul>

             <Link href="/#bookings">
        <button className="bg-white text-black px-6 py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition inline-block">
          Book Now
        </button>
        </Link>


          </div>

          {/* Standard */}
          <div className="bg-white text-black rounded-3xl p-8 scale-105 shadow-2xl hover:scale-110 transition duration-300">
            <h2 className="text-2xl font-bold mb-4">
              Standard
            </h2>

            <p className="text-5xl font-bold mb-6">
              KSh 35,000
            </p>

            <ul className="space-y-4 text-black-300 mb-8">
              <li>1 Photographer</li>
              <li> 1 Videographer</li>
              <li>Full Event Photos + 1 Final Video</li>
              <li>Drone Available </li>
              <li>One A3 Photo Mount</li>
              <li>Additional Videographer @Ksh. 10,000</li>
            </ul>


            <Link href="/#bookings">
        <button className="bg-white text-black px-6 py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition inline-block">
          Book Now
        </button>
        </Link>

          </div>

          {/* Premium */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-bold mb-4">
              Premium
            </h2>

            <p className="text-5xl font-bold mb-6">
              KSh 50,000
            </p>

             <ul className="space-y-4 text-gray-300 mb-8">
              <li>2 Photographers</li>
              <li> 2 Videographers</li>
              <li>Full Event Photos + 1 Final Video</li>
              <li>Drone Ring Delivery</li>
              <li>One A2 Photo Mount</li>
              <li>One A3 Photo Book</li>
            </ul>
            <Link href="/#bookings">
        <button className="bg-white text-black px-6 py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition inline-block">
          Book Now
        </button>
        </Link>

          </div>

        </div>
      </div>
    </main>

    </>
  )
}

