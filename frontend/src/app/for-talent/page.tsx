"use client";

import Link from "next/link";

export default function ForTalentPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-medium mb-8">
          Your face is unique — and it should stay yours.
        </h1>
        <div className="space-y-6 text-lg text-gray-600 mb-12">
          <p className="leading-relaxed">
            In the age of AI, your likeness can be recreated and used without permission. Face Library helps you verify your identity, create your digital avatar, and control how your likeness is used.
          </p>
          <p className="leading-relaxed">
            You can license your face for campaigns, protect your identity, and earn from your digital likeness.
          </p>
        </div>
        <Link
          href="/talent/register"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg inline-block"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}
