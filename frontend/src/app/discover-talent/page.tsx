"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import { listTalents } from "@/lib/api";
import BrandTopNav from "@/components/BrandTopNav";

interface TalentItem {
  id: number;
  name: string;
  image_url: string | null;
  avatar_url: string | null;
  gender: string | null;
  age: number | null;
  categories: string | null;
  skin_color: string | null;
  hair_color: string | null;
  usage_allowed: string | null;
  geo_scope: string | null;
  min_price_per_use: number | null;
}

const defaultImage =
  "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

export default function DiscoverTalentPage() {
  const router = useRouter();
  const [talents, setTalents] = useState<TalentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSkinColor, setSelectedSkinColor] = useState("all");
  const [selectedHairColor, setSelectedHairColor] = useState("all");
  const [selectedUsage, setSelectedUsage] = useState("all");

  useEffect(() => {
    listTalents()
      .then((data) => setTalents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = talents.filter((t) => {
    const name = t.name || "";
    const cats = t.categories || "";
    const usage = t.usage_allowed || "";

    const matchSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cats.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGender =
      selectedGender === "all" ||
      (t.gender || "").toLowerCase() === selectedGender.toLowerCase();

    const age = t.age || 0;
    const matchAge =
      selectedAgeRange === "all" ||
      (selectedAgeRange === "18-25" && age >= 18 && age <= 25) ||
      (selectedAgeRange === "26-35" && age >= 26 && age <= 35) ||
      (selectedAgeRange === "36-45" && age >= 36 && age <= 45) ||
      (selectedAgeRange === "45+" && age >= 45);

    const matchCat =
      selectedCategory === "all" ||
      cats.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchSkin =
      selectedSkinColor === "all" ||
      (t.skin_color || "").toLowerCase() === selectedSkinColor.toLowerCase();

    const matchHair =
      selectedHairColor === "all" ||
      (t.hair_color || "").toLowerCase() === selectedHairColor.toLowerCase();

    const matchUsage =
      selectedUsage === "all" ||
      usage.toLowerCase().includes(selectedUsage.toLowerCase());

    return matchSearch && matchGender && matchAge && matchCat && matchSkin && matchHair && matchUsage;
  });

  const hasFilters =
    searchQuery ||
    selectedGender !== "all" ||
    selectedAgeRange !== "all" ||
    selectedCategory !== "all" ||
    selectedSkinColor !== "all" ||
    selectedHairColor !== "all" ||
    selectedUsage !== "all";

  const clearAll = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedAgeRange("all");
    setSelectedCategory("all");
    setSelectedSkinColor("all");
    setSelectedHairColor("all");
    setSelectedUsage("all");
  };

  const selectClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div className="min-h-screen bg-white">
      <BrandTopNav active="Discover Talent" />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Discover Talent</h1>
          <p className="text-gray-600">Browse our curated collection of verified digital faces for your campaigns.</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by look, style, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black mb-4"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">GENDER</label>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Gender Fluid">Gender Fluid</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">AGE RANGE</label>
                <select value={selectedAgeRange} onChange={(e) => setSelectedAgeRange(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="45+">45+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">CATEGORY</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Model">Model</option>
                  <option value="Influencer">Influencer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">SKIN COLOR</label>
                <select value={selectedSkinColor} onChange={(e) => setSelectedSkinColor(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Fair">Fair</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Olive">Olive</option>
                  <option value="Tan">Tan</option>
                  <option value="Brown">Brown</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">HAIR COLOR</label>
                <select value={selectedHairColor} onChange={(e) => setSelectedHairColor(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Blonde">Blonde</option>
                  <option value="Brown">Brown</option>
                  <option value="Black">Black</option>
                  <option value="Red">Red</option>
                  <option value="Auburn">Auburn</option>
                  <option value="Gray">Gray</option>
                  <option value="White">White</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">USAGE ALLOWED</label>
                <select value={selectedUsage} onChange={(e) => setSelectedUsage(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Website">Website</option>
                  <option value="Print">Print</option>
                  <option value="TV">TV</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-black">{loading ? "..." : filtered.length}</span> talents
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="text-sm text-blue-600 hover:underline font-medium">
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
            <p className="text-gray-500 text-lg">No talents found matching your criteria.</p>
            {hasFilters && (
              <button onClick={clearAll} className="mt-4 text-blue-600 hover:underline font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
            {filtered.map((talent) => (
              <div
                key={talent.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/talent-profile/${talent.id}`)}
              >
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-lg mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={talent.image_url || talent.avatar_url || defaultImage}
                    alt={talent.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-sm font-light tracking-widest opacity-15 group-hover:opacity-25 transition-opacity duration-300 rotate-[-15deg] select-none uppercase">
                      Face Library — Protected
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm tracking-[0.15em] uppercase font-light">{talent.name}</p>
                {talent.categories && (
                  <p className="text-center text-xs text-gray-500 mt-1">
                    {talent.categories.split(",").slice(0, 3).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
