"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Sparkles } from "lucide-react";

export default function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (password === "admin123") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminLoginTime", Date.now().toString());
        window.location.href = "/dashboard";
      } else {
        setError("Incorrect password. Use: admin123");
        setPassword("");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920')] bg-cover bg-center opacity-10" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-400 rounded-2xl shadow-2xl mb-6">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-4xl font-bold text-white">
            Alakara Studios
          </h1>
          <p className="text-gold-400 mt-2 text-sm tracking-wider font-semibold">
            ADMIN PORTAL
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-12 h-0.5 bg-gold-400/50 rounded-full" />
            <div className="w-4 h-0.5 bg-gold-400 rounded-full" />
            <div className="w-12 h-0.5 bg-gold-400/50 rounded-full" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-gold-400" />
            <span className="text-sm text-zinc-400">Secure Access</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 text-white placeholder:text-zinc-600"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-gold-400 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Default password: <span className="text-gold-400">admin123</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg shadow-amber-500/25"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Access Dashboard
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                Authorized Personnel Only
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-zinc-600">
            Where Moments Become Memories
          </p>
        </div>
      </div>
    </div>
  );
}