"use client";

import Link from "next/link";

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
              <span className="font-bold text-sm">FL</span>
            </div>
            <span className="font-semibold text-lg">FACE LIBRARY</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-700 hover:text-black transition-colors font-medium text-sm">Login</Link>
            <Link href="/signup" className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-medium mb-8">For Agents</h1>
          <div className="space-y-6 text-lg text-gray-600 mb-12">
            <p className="leading-relaxed">
              Manage and protect the digital rights of the talent you represent.
            </p>
            <p className="leading-relaxed">
              Face Library gives agencies a simple platform to control digital likeness, manage permissions, generate licensing contracts, and approve campaigns.
            </p>
            <p className="leading-relaxed">
              The easiest way to protect, license, and monetize the faces you represent.
            </p>
          </div>
          <Link href="/agent/register" className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg inline-block">
            Register as Agent
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-black flex items-center justify-center"><span className="text-[8px] font-bold">FL</span></div>
            <span className="text-xs text-gray-500">&copy; 2026 Face Library</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/talent/library" className="text-gray-500 hover:text-black">Face Library</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-black">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-black">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
