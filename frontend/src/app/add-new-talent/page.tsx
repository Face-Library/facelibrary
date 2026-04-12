"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Sun, Image as ImageIcon, Sparkles, Eye, Wind, Glasses, Smile } from "lucide-react";

const faceDigits = [
  "Front", "Left Profile", "Right Profile", "3/4 Left",
  "3/4 Right", "Head Up", "Head Down", "Neutral",
  "Smile", "Eyes Closed", "Eyes Open", "Back Head",
];

const bodyDigits = [
  "Full Body Front", "Full Body Left", "Full Body Right", "Full Body Back",
  "3/4 Body Left", "3/4 Body Right", "Walking", "Turn 360",
];

const guidelines = [
  { icon: Sun, label: "Natural Lighting" },
  { icon: ImageIcon, label: "White Background" },
  { icon: Sparkles, label: "No Filters" },
  { icon: Eye, label: "Face Fully Visible" },
  { icon: Wind, label: "Hair Away from Face" },
  { icon: Glasses, label: "No Sunglasses" },
  { icon: Smile, label: "Neutral Expression" },
];

export default function AddNewTalentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agency: "",
    category: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // TODO: call API when backend supports it
    router.push("/agent/dashboard");
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Talent</h1>
            <p className="text-gray-600">Create a new talent profile for Face Library</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Talent Information Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Talent Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} placeholder="Enter first name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} placeholder="Enter last name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="talent@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
              <input type="text" name="agency" value={formData.agency} onChange={handleInputChange} className={inputClass} placeholder="Agency name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className={inputClass}>
                <option value="">Select category</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="fitness">Fitness</option>
                <option value="commercial">Commercial</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capture Guidelines */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Capture Guidelines</h2>
          <p className="text-sm text-gray-600 mb-6">Follow these guidelines for optimal results</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {guidelines.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-7 h-7 text-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* Face Digits */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Face Digits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {faceDigits.map((label) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body Digits */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Body Digits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bodyDigits.map((label) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity Video */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Identity Video</h2>
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                <div className="aspect-video flex flex-col items-center justify-center bg-gray-50 p-8">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-base font-semibold text-gray-700 mb-2">Upload Identity Video</p>
                  <p className="text-sm text-gray-500 text-center">
                    Record a short video confirming identity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4 pt-8 mt-8 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-900 hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Submit Talent
          </button>
        </div>
      </div>
    </div>
  );
}
