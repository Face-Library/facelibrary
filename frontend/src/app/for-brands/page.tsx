"use client";

import Link from "next/link";

export default function ForBrandsPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-medium mb-8">For Brands</h1>
        <div className="space-y-6 text-lg text-gray-600 mb-12">
          <p className="leading-relaxed">
            Generative AI advertising is transforming creative production.
          </p>
          <p className="leading-relaxed">
            AI makes campaigns faster, cheaper, and more scalable than traditional production. What&apos;s missing are real, verified human faces.
          </p>
          <p className="leading-relaxed">
            Face Library connects brands with licensed digital likeness from real models, actors, influencers, and athletes, enabling authentic AI campaigns with full rights and approvals.
          </p>
        </div>
        <Link
          href="/client/register"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg inline-block"
        >
          Register as Brand
        </Link>
      </div>
    </div>
  );
}
