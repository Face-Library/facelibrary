/**
 * Face Library -- Browse verified digital likeness profiles.
 *
 * Layout (Figma):
 * - Header: same as landing page (FL logo + nav)
 * - "Face Library" heading + subtitle
 * - 4-column grid of talent portraits (aspect-[4/5])
 * - Each card: image, hover scale effect, watermark overlay, name below
 * - Click opens "Access Restricted" modal for non-clients
 * - Uses Unsplash URLs for demo faces
 *
 * Accessible at: /talent/library (public)
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Lock, LogOut, User } from "lucide-react";
import { listTalents } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/* ---------- Types ---------- */

interface Talent {
  id: number;
  name: string;
  bio: string;
  categories: string;
  min_price_per_use: number;
  allow_video_generation: boolean;
  allow_image_generation: boolean;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  avatar_url: string | null;
  photo_url?: string | null;
}

/* ---------- Demo data ---------- */

const DEMO_FACES = [
  {
    name: "Amara Chen",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Kai Williams",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Sofia Martinez",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Liam Foster",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Zara Okafor",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Marcus Lee",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop&crop=face",
  },
  {
    name: "James Wright",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=750&fit=crop&crop=face",
  },
];

/* ---------- Component ---------- */

export default function TalentLibraryPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);

  useEffect(() => {
    listTalents()
      .then(setTalents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (name: string) => {
    if (user?.role === "client") {
      // Clients can view profiles
      return;
    }
    setSelectedFace(name);
    setModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Merge real talents with demo faces for display
  const displayFaces = talents.length > 0
    ? talents.map((t, i) => ({
        id: t.id,
        name: t.name,
        image: t.avatar_url || t.photo_url || DEMO_FACES[i % DEMO_FACES.length].image,
      }))
    : DEMO_FACES.map((f, i) => ({ id: i, name: f.name, image: f.image }));

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Header (landing page style) ===== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">FL</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-gray-900 uppercase">
              Face Library
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href={
                    user.role === "talent"
                      ? "/talent/dashboard"
                      : user.role === "client"
                      ? "/client/dashboard"
                      : user.role === "agent"
                      ? "/agent/dashboard"
                      : "/"
                  }
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Content ===== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Face Library
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Verified digital likeness profiles available for licensed campaigns.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        )}

        {/* 4-column grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayFaces.map((face) => (
              <div
                key={face.id}
                className="group cursor-pointer"
                onClick={() => handleCardClick(face.name)}
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={face.image}
                    alt={face.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Watermark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rotate-[-30deg] opacity-20 select-none">
                      <p className="text-white text-lg font-bold tracking-widest whitespace-nowrap">
                        Face Library — Protected
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {face.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayFaces.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No talent profiles available yet.</p>
          </div>
        )}
      </div>

      {/* ===== Access Restricted Modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-8 text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedFace
                ? `To view ${selectedFace}'s full profile and request licensing, you need to register as a brand.`
                : "Register as a brand to access talent profiles and licensing."}
            </p>
            <Link
              href="/signup"
              className="inline-block w-full bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Register as Brand
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
