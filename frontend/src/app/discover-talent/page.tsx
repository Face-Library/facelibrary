"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";

const talentData = [
  { id: "1", name: "Sophia", image: "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 28, categories: ["Fashion", "Beauty", "Lifestyle"], skinColor: "Fair", hairColor: "Blonde", usageAllowed: ["Social Media", "Website", "Print"] },
  { id: "2", name: "Alex", image: "https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Male", age: 32, categories: ["Tech", "Lifestyle", "Sports"], skinColor: "Medium", hairColor: "Brown", usageAllowed: ["Social Media", "Website", "TV"] },
  { id: "3", name: "Maya", image: "https://images.unsplash.com/photo-1654028859265-0e8b12a67aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 24, categories: ["Fashion", "Beauty", "Luxury"], skinColor: "Fair", hairColor: "Brown", usageAllowed: ["Social Media", "Website", "Print", "TV"] },
  { id: "4", name: "Liam", image: "https://images.unsplash.com/photo-1628258052805-196af609d397?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Male", age: 26, categories: ["Sports", "Fitness", "Lifestyle"], skinColor: "Fair", hairColor: "Blonde", usageAllowed: ["Social Media", "Website"] },
  { id: "5", name: "Yuki", image: "https://images.unsplash.com/photo-1761243892035-c3e13829115a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 30, categories: ["Tech", "Fashion", "Lifestyle"], skinColor: "Light", hairColor: "Black", usageAllowed: ["Social Media", "Website", "Print"] },
  { id: "6", name: "Zara", image: "https://images.unsplash.com/photo-1633419798503-0b0c628f267c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 27, categories: ["Beauty", "Fashion", "Luxury"], skinColor: "Dark", hairColor: "Black", usageAllowed: ["Social Media", "Website", "Print", "TV"] },
  { id: "7", name: "Carlos", image: "https://images.unsplash.com/photo-1563107197-df8cd4348c5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Male", age: 35, categories: ["Lifestyle", "Automotive", "Travel"], skinColor: "Medium", hairColor: "Black", usageAllowed: ["Social Media", "Website", "Print"] },
  { id: "8", name: "Elena", image: "https://images.unsplash.com/photo-1758685848602-09e52ef9c7d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 42, categories: ["Luxury", "Fashion", "Healthcare"], skinColor: "Fair", hairColor: "Blonde", usageAllowed: ["Social Media", "Website", "Print", "TV"] },
  { id: "9", name: "Sofia", image: "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 29, categories: ["Fashion", "Beauty"], skinColor: "Fair", hairColor: "Blonde", usageAllowed: ["Social Media", "Website"] },
  { id: "10", name: "David", image: "https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Male", age: 31, categories: ["Tech", "Lifestyle"], skinColor: "Medium", hairColor: "Brown", usageAllowed: ["Social Media", "Website", "TV"] },
  { id: "11", name: "Aria", image: "https://images.unsplash.com/photo-1654028859265-0e8b12a67aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Female", age: 25, categories: ["Fashion", "Beauty", "Luxury"], skinColor: "Fair", hairColor: "Brown", usageAllowed: ["Social Media", "Website", "Print"] },
  { id: "12", name: "Noah", image: "https://images.unsplash.com/photo-1628258052805-196af609d397?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", gender: "Male", age: 27, categories: ["Sports", "Fitness"], skinColor: "Fair", hairColor: "Blonde", usageAllowed: ["Social Media", "Website"] },
];

export default function DiscoverTalentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSkinColor, setSelectedSkinColor] = useState("all");
  const [selectedHairColor, setSelectedHairColor] = useState("all");
  const [selectedUsage, setSelectedUsage] = useState("all");

  const filtered = talentData.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchGender = selectedGender === "all" || t.gender === selectedGender;
    const matchAge = selectedAgeRange === "all" || (selectedAgeRange === "18-25" && t.age >= 18 && t.age <= 25) || (selectedAgeRange === "26-35" && t.age >= 26 && t.age <= 35) || (selectedAgeRange === "36-45" && t.age >= 36 && t.age <= 45) || (selectedAgeRange === "45+" && t.age >= 45);
    const matchCat = selectedCategory === "all" || t.categories.includes(selectedCategory);
    const matchSkin = selectedSkinColor === "all" || t.skinColor === selectedSkinColor;
    const matchHair = selectedHairColor === "all" || t.hairColor === selectedHairColor;
    const matchUsage = selectedUsage === "all" || t.usageAllowed.includes(selectedUsage);
    return matchSearch && matchGender && matchAge && matchCat && matchSkin && matchHair && matchUsage;
  });

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
          <p className="text-gray-600">Browse our curated collection of verified digital faces for your campaigns.</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by look, style, category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
        </div>

        <div className="mb-8">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black mb-4">
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <div className="grid grid-cols-6 gap-4 p-6 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">GENDER</label>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
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
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">SKIN COLOR</label>
                <select value={selectedSkinColor} onChange={(e) => setSelectedSkinColor(e.target.value)} className={selectClass}>
                  <option value="all">No Preference</option>
                  <option value="Fair">Fair</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
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
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">USAGE</label>
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
          <p className="text-sm text-gray-600">Showing <span className="font-semibold text-black">{filtered.length}</span> talents</p>
          {(searchQuery || selectedGender !== "all" || selectedAgeRange !== "all" || selectedCategory !== "all" || selectedSkinColor !== "all" || selectedHairColor !== "all" || selectedUsage !== "all") && (
            <button onClick={() => { setSearchQuery(""); setSelectedGender("all"); setSelectedAgeRange("all"); setSelectedCategory("all"); setSelectedSkinColor("all"); setSelectedHairColor("all"); setSelectedUsage("all"); }} className="text-sm text-blue-600 hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-6 pb-20">
          {filtered.map((talent) => (
            <div key={talent.id} className="group cursor-pointer" onClick={() => router.push(`/talent-profile/${talent.id}`)}>
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={talent.image} alt={talent.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-white text-sm font-light tracking-widest opacity-15 group-hover:opacity-25 transition-opacity duration-300 rotate-[-15deg] select-none uppercase">
                    Face Library — Protected
                  </div>
                </div>
              </div>
              <p className="text-center text-sm tracking-[0.2em] uppercase font-light">{talent.name}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No talents found matching your criteria.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedGender("all"); setSelectedAgeRange("all"); setSelectedCategory("all"); setSelectedSkinColor("all"); setSelectedHairColor("all"); setSelectedUsage("all"); }} className="mt-4 text-blue-600 hover:underline font-medium">
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
