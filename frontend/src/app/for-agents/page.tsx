"use client";

import Link from "next/link";

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
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
        <Link
          href="/agent/register"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg inline-block"
        >
          Register as Agent
        </Link>
      </div>
    </div>
  );
}
