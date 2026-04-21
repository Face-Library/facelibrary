"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

export default function HowItWorksPage() {
  const [isForYouOpen, setIsForYouOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
              <span className="font-bold text-sm">FL</span>
            </div>
            <span className="font-semibold text-lg">FACE LIBRARY</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-black font-semibold">How it Works</span>
            <Link
              href="/talent/library"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Face Library
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsForYouOpen(!isForYouOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors"
              >
                For You{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isForYouOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isForYouOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsForYouOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <Link
                      href="/for-talent"
                      onClick={() => setIsForYouOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      For Talents
                    </Link>
                    <Link
                      href="/for-agents"
                      onClick={() => setIsForYouOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      For Agencies
                    </Link>
                    <Link
                      href="/for-brands"
                      onClick={() => setIsForYouOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      For Brands
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-black transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Sign Up
            </Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
            <span className="block text-black font-medium py-2">
              How it Works
            </span>
            <Link
              href="/talent/library"
              className="block text-gray-700 hover:text-black py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Face Library
            </Link>
            <Link
              href="/for-talent"
              className="block text-gray-700 hover:text-black py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Talents
            </Link>
            <Link
              href="/for-agents"
              className="block text-gray-700 hover:text-black py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Agencies
            </Link>
            <Link
              href="/for-brands"
              className="block text-gray-700 hover:text-black py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Brands
            </Link>
            <div className="border-t border-gray-200 pt-3 flex gap-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2 text-gray-700 border border-gray-300 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center py-2 bg-black text-white rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              How It Works
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The end-to-end flow from sign-up to payout — how Face Library verifies talent, licenses likenesses, and protects rights at every step.
            </p>
          </div>

          {/* Process Diagram */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 md:p-8 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/how-it-works-process.jpeg"
              alt="Face Library process diagram — from sign-up through verification, licensing, and payout"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Short explainer */}
          <div className="max-w-3xl mx-auto space-y-5 text-gray-700 leading-relaxed">
            <p>
              Every profile starts with <strong>identity verification</strong> — photos, video, and social account ownership are cross-checked so that only the real person can license their own likeness.
            </p>
            <p>
              Once verified, talent upload their <strong>protected digits</strong> — a structured dataset of face angles, body poses, and short identity videos that becomes the canonical source for every future licensed asset.
            </p>
            <p>
              Talent then set <strong>permissions</strong> (industries, duration, geography, AI training allowed or not). Brands send license requests; talent approve or reject. On approval, a UK-law compliant contract is generated, the brand pays, and the funds are released to the talent.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link
              href="/talent/register"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-base font-medium"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-black flex items-center justify-center">
              <span className="text-[8px] font-bold">FL</span>
            </div>
            <span className="text-xs text-gray-500">
              &copy; 2026 Face Library
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/talent/library"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Face Library
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
