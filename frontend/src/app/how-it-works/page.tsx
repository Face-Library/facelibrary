"use client";

import Link from "next/link";
import { ArrowRight, UserCheck, ShieldCheck, Sparkles, Settings2, FileCheck, BadgeDollarSign } from "lucide-react";

const steps = [
  { num: "01", icon: UserCheck, title: "Claim Your Profile", desc: "Sign up as talent, submit your details, and create your digital identity." },
  { num: "02", icon: ShieldCheck, title: "Verify Identity", desc: "Complete identity verification so clients know your likeness is authentic." },
  { num: "03", icon: Sparkles, title: "Create Face Avatar", desc: "Upload high-quality photos of your likeness for AI-generated campaigns." },
  { num: "04", icon: Settings2, title: "Set Permissions", desc: "Control how your face is used — categories, regions, durations, exclusivity." },
  { num: "05", icon: FileCheck, title: "License & Approve", desc: "Review requests from clients. AI-generated UK-law contracts protect your rights." },
  { num: "06", icon: BadgeDollarSign, title: "License & Get Paid", desc: "Approve campaigns and receive 90% of licensing fees via Stripe." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
              <span className="font-bold text-sm text-white">FL</span>
            </div>
            <span className="font-semibold text-lg text-white">FACE LIBRARY</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-6">
          How it works
        </p>
        <h1 className="text-4xl md:text-5xl font-medium mb-6">
          From Sign-Up to Payout
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Verify your identity, build your avatar, control usage,
          and get paid for likeness campaigns.
        </p>
      </section>

      {/* Steps Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group border border-gray-800 rounded-xl p-8 hover:border-gray-600 hover:bg-white/[0.02] transition-all"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-3xl font-light text-white/15">{step.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-20 text-center">
        <h2 className="text-3xl font-medium mb-4">Ready to protect your likeness?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Join creators who control how their identity is used in the age of AI.
        </p>
        <Link
          href="/talent/register"
          className="bg-white text-black px-8 py-3 rounded-md inline-flex items-center gap-2 hover:bg-gray-100 transition-colors font-medium"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-gray-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-gray-500">FL</span>
            </div>
            <span className="text-xs text-gray-600">&copy; 2026 Face Library</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/talent/library" className="text-gray-600 hover:text-white transition-colors">Face Library</Link>
            <Link href="#" className="text-gray-600 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-gray-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
