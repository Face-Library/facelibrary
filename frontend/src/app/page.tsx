"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const faceCards = [
  {
    id: 1,
    images: [
      "https://images.unsplash.com/photo-1647969539749-edae0467472b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1514626585111-9aa86183ac98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    ],
  },
  {
    id: 2,
    images: [
      "https://images.unsplash.com/photo-1656339907799-bef84de61ef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1705830337569-47a1a24b0ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    ],
  },
  {
    id: 3,
    images: [
      "https://images.unsplash.com/photo-1676229266507-3e58c27af8a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1636228934956-8f8e0b32d0ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    ],
  },
  {
    id: 4,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    ],
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isForYouOpen, setIsForYouOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === "talent"
      ? "/talent/dashboard"
      : user?.role === "client" || user?.role === "brand"
      ? "/client/dashboard"
      : user?.role === "agent"
      ? "/agent/dashboard"
      : "/";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
              <span className="font-bold text-sm">FL</span>
            </div>
            <span className="font-semibold text-lg">FACE LIBRARY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-gray-700 hover:text-black transition-colors">
              How it Works
            </Link>
            <Link href="/talent/library" className="text-gray-700 hover:text-black transition-colors">
              Face Library
            </Link>

            {/* For You Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsForYouOpen(!isForYouOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors font-semibold"
              >
                For You
                <ChevronDown className={`w-4 h-4 transition-transform ${isForYouOpen ? "rotate-180" : ""}`} />
              </button>
              {isForYouOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsForYouOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <Link href="/for-talent" onClick={() => setIsForYouOpen(false)} className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      For Talents
                    </Link>
                    <Link href="/for-agents" onClick={() => setIsForYouOpen(false)} className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      For Agencies
                    </Link>
                    <Link href="/for-brands" onClick={() => setIsForYouOpen(false)} className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      For Brands
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
                <button
                  onClick={() => router.push(dashboardPath)}
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-black transition-colors font-medium">
                  Login
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsSignUpOpen(!isSignUpOpen)}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 text-sm"
                  >
                    Sign Up
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSignUpOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isSignUpOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsSignUpOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <Link href="/talent/register" onClick={() => setIsSignUpOpen(false)} className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="font-medium text-sm">As Talent</div>
                          <div className="text-xs text-gray-500 mt-0.5">Protect your likeness</div>
                        </Link>
                        <Link href="/agent/register" onClick={() => setIsSignUpOpen(false)} className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="font-medium text-sm">As Agency</div>
                          <div className="text-xs text-gray-500 mt-0.5">Manage talent roster</div>
                        </Link>
                        <Link href="/client/register" onClick={() => setIsSignUpOpen(false)} className="block px-4 py-3 hover:bg-gray-50">
                          <div className="font-medium text-sm">As Brand</div>
                          <div className="text-xs text-gray-500 mt-0.5">License talent</div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
            <Link href="/how-it-works" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
            <Link href="/talent/library" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>Face Library</Link>
            <Link href="/for-talent" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Talents</Link>
            <Link href="/for-agents" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Agencies</Link>
            <Link href="/for-brands" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Brands</Link>
            <div className="border-t border-gray-200 pt-3 flex gap-3">
              <Link href="/login" className="flex-1 text-center py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="flex-1 text-center py-2 bg-black text-white rounded-md hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-medium mb-6">
              Protect and License Faces
              <br />
              in the Age of AI
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Verify identity, license digital likeness,
              <br />
              and track where faces appear online.
            </p>
            <div className="flex gap-4">
              <Link
                href="/talent/register"
                className="bg-white text-black px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors font-medium"
              >
                Register as Talent
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/talent/library"
                className="border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-black transition-colors font-medium"
              >
                Explore Face Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Face Library Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-medium mb-2">Face Library</h2>
              <p className="text-xl text-gray-600">Verified Faces Available for Licensing</p>
            </div>
            <Link
              href="/talent/library"
              className="bg-black text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors font-medium"
            >
              Explore All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faceCards.map((card) => (
              <Link key={card.id} href="/talent/library" className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  <div className="grid grid-cols-2 h-full">
                    {card.images.map((image, idx) => (
                      <div key={idx} className="relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`Face ${card.id}-${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-medium mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 mb-8">
            From sign-up to payout in 6 simple steps
          </p>
          <Link
            href="/how-it-works"
            className="bg-black text-white px-8 py-3 rounded-md inline-flex items-center gap-2 hover:bg-gray-800 transition-colors font-medium"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-black flex items-center justify-center">
                <span className="text-[8px] font-bold">FL</span>
              </div>
              <span className="text-xs text-gray-500">&copy; 2026 Face Library</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/talent/library" className="text-gray-500 hover:text-black transition-colors">Face Library</Link>
              <Link href="#" className="text-gray-500 hover:text-black transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-500 hover:text-black transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
