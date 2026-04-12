"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Shield, Sliders, DollarSign, ArrowRight, ChevronDown, Menu, X } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Create Your Profile",
    desc: "Sign up as Talent, Agency, or Brand. Create your digital likeness profile.",
    caption: "Sign up as Talent, Agency, or Brand",
    image: "https://images.unsplash.com/photo-1759932021109-ffbec9251f9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    num: 2,
    title: "Verify Yourself",
    desc: "Confirm ownership of your face using photos, video and social accounts.",
    caption: "Confirm ownership of your face",
    image: "https://images.unsplash.com/photo-1603899122361-e99b4f6fecf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    num: 3,
    title: "Upload Your Digits",
    desc: "Upload face photos, body photos, and a short video.",
    caption: "Protected dataset for digital likeness",
    image: "https://images.unsplash.com/photo-1674027215032-f0c4292318ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    num: 4,
    title: "Set Permissions",
    desc: "Choose where and how your likeness can be used.",
    caption: "Control industries, duration, and usage",
    image: "https://images.unsplash.com/photo-1702468292651-fd16394e4ddd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    num: 5,
    title: "Approve & Get Paid",
    desc: "Brands request to use your likeness. Approve requests and receive payment.",
    caption: "Approve usage & get paid",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

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
            <Link href="/talent/library" className="text-gray-700 hover:text-black transition-colors">Face Library</Link>
            <div className="relative">
              <button onClick={() => setIsForYouOpen(!isForYouOpen)} className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors">
                For You <ChevronDown className={`w-4 h-4 transition-transform ${isForYouOpen ? "rotate-180" : ""}`} />
              </button>
              {isForYouOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsForYouOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <Link href="/for-talent" onClick={() => setIsForYouOpen(false)} className="block px-4 py-3 hover:bg-gray-50">For Talents</Link>
                    <Link href="/for-agents" onClick={() => setIsForYouOpen(false)} className="block px-4 py-3 hover:bg-gray-50">For Agencies</Link>
                    <Link href="/for-brands" onClick={() => setIsForYouOpen(false)} className="block px-4 py-3 hover:bg-gray-50">For Brands</Link>
                  </div>
                </>
              )}
            </div>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-700 hover:text-black transition-colors font-medium">Login</Link>
            <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">Sign Up</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700 hover:text-black">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
            <span className="block text-black font-medium py-2">How it Works</span>
            <Link href="/talent/library" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>Face Library</Link>
            <Link href="/for-talent" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Talents</Link>
            <Link href="/for-agents" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Agencies</Link>
            <Link href="/for-brands" className="block text-gray-700 hover:text-black py-2" onClick={() => setMobileMenuOpen(false)}>For Brands</Link>
            <div className="border-t border-gray-200 pt-3 flex gap-3">
              <Link href="/login" className="flex-1 text-center py-2 text-gray-700 border border-gray-300 rounded-md" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="flex-1 text-center py-2 bg-black text-white rounded-md" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      <section className="py-20 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Protect, License, and Monetize
              <br />
              Your Digital Likeness
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Verify your identity, upload your protected digits, control usage, and get paid for licensed campaigns.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-16 md:mb-20 flex-wrap">
            <div className="bg-white rounded-full px-5 md:px-8 py-3 md:py-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-0.5">1</div>
                <div className="font-semibold text-sm">Verified Identity</div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hidden sm:block" />

            <div className="bg-white rounded-full px-5 md:px-8 py-3 md:py-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sliders className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-0.5">2</div>
                <div className="font-semibold text-sm">Full Control</div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hidden sm:block" />

            <div className="bg-white rounded-full px-5 md:px-8 py-3 md:py-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-0.5">3</div>
                <div className="font-semibold text-sm">Earn From Your Face</div>
              </div>
            </div>
          </div>

          {/* 5 Step Cards - Desktop: flex with inline arrows (matches Figma) */}
          <div className="hidden lg:flex items-start gap-4 xl:gap-6">
            {steps.map((step, idx) => (
              <Fragment key={step.num}>
                <div className="flex-1">
                  <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.num}
                      </div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{step.desc}</p>
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-gray-500 text-center">{step.caption}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="pt-40 flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Mobile/tablet: stacked grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
            {steps.map((step) => (
              <div key={step.num} className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{step.desc}</p>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 text-center">{step.caption}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
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
            <span className="text-xs text-gray-500">&copy; 2026 Face Library</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/talent/library" className="text-gray-500 hover:text-black transition-colors">Face Library</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
