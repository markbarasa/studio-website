import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white"> Alakara Media</h1>

        <div className="hidden md:flex gap-8 text-sm text-white">
          <a href="/#home">Home</a>
          <a href="/#services">Services</a>
          <a href="/#portfolio">Portfolio</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
          {/* // Add to your navbar links */}
          <Link href="/portal" className="hover:text-[#C6A43F] transition">
            Client Portal
          </Link>
        </div>

        <Link href="/#services">
          <button className="bg-white text-black px-6 py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition inline-block">
            Book Now
          </button>
        </Link>
      </div>
    </nav>
  );
}
