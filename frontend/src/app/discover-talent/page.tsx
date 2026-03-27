"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import { listTalents } from "@/lib/api";

interface TalentItem {
  id: number;
  name: string;
  image_url: string | null;
  avatar_url: string | null;
  gender: string | null;
  categories: string | null;
  geo_scope: string | null;
  min_price_per_use: number | null;
}

const defaultImage = "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

export default function DiscoverTalentPage() {
  const router = useRouter();
  const [talents, setTalents] = useState<TalentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    listTalents()
      .then((data) => setTalents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = talents.filter((t) => {
    const name = t.name || "";
    const cats = t.categories || "";
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || cats.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGender = selectedGender === "all" || (t.gender || "").toLowerCase() === selectedGender.toLowerCase();
    const matchCat = selectedCategory === "all" || cats.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchGender && matchCat;
  });

  const hasFilters = searchQuery || selectedGender !== "all" || selectedCategory !== "all";

  const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center text-xs font-bold">FL</div>
            <span className="font-semibold text-base tracking-wide">FACE LIBRARY</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/client/dashboard" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
            <span className="text-sm font-medium text-black border-b-2 border-black pb-1">Discover Talent</span>
            <Link href="/campaigns" className="text-sm text-gray-600 hover:text-black">Campaigns</Link>
          </nav>
          <Link href="/client/dashboard" className="text-sm text-gray-600 hover:text-black">&larr; Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Discover Talent</h1>
          <p className="text-gray-600">Browse verified digital faces for your campaigns.</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by name or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
        </div>

        <div className="mb-8">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black mb-4">
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">GENDER</label>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className={selectClass}>
                  <option value="all">All</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">CATEGORY</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClass}>
                  <option value="all">All</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Model">Model</option>
                  <option value="Sports">Sports</option>
                  <option value="Influencer">Influencer</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">Showing <span className="font-semibold text-black">{loading ? "..." : filtered.length}</span> talents</p>
          {hasFilters && (
            <button onClick={() => { setSearchQuery(""); setSelectedGender("all"); setSelectedCategory("all"); }} className="text-sm text-blue-600 hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No talents found.</p>
            {hasFilters && (
              <button onClick={() => { setSearchQuery(""); setSelectedGender("all"); setSelectedCategory("all"); }} className="mt-4 text-blue-600 hover:underline font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
            {filtered.map((talent) => (
              <div key={talent.id} className="group cursor-pointer" onClick={() => router.push(`/talent-profile/${talent.id}`)}>
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-lg mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={talent.image_url || talent.avatar_url || defaultImage} alt={talent.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-sm font-light tracking-widest opacity-15 group-hover:opacity-25 transition-opacity duration-300 rotate-[-15deg] select-none uppercase">
                      Face Library — Protected
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm tracking-[0.15em] uppercase font-light">{talent.name}</p>
                {talent.categories && (
                  <p className="text-center text-xs text-gray-500 mt-1">{talent.categories.split(",").slice(0, 3).join(" · ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
