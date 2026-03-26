"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerTalent, uploadTalentImage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TalentRegisterPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    surname: "",
    nickname: "",
    email: "",
    confirmEmail: "",
    password: "",
    gender: "",
    day: "",
    month: "",
    year: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }
    if (formData.email !== formData.confirmEmail) {
      setError("Email addresses do not match");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await registerTalent({
        user_id: user?.user_id,
        name: `${formData.firstName} ${formData.surname}`,
        email: formData.email,
        gender: formData.gender,
        categories: formData.role,
        social_media: {
          ...(formData.instagram && { instagram: formData.instagram }),
          ...(formData.tiktok && { tiktok: formData.tiktok }),
          ...(formData.youtube && { youtube: formData.youtube }),
        },
        min_price_per_use: 100,
        max_license_duration_days: 365,
        allow_ai_training: false,
        allow_video_generation: true,
        allow_image_generation: true,
      });

      setUser({
        user_id: res.user_id || res.id,
        email: formData.email,
        name: `${formData.firstName} ${formData.surname}`,
        role: "talent",
        profile_id: res.id,
      });

      router.push("/talent/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-medium mb-2">Register as Talent</h1>
          <p className="text-gray-600">
            Create your profile to start protecting and licensing your digital likeness.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* I am a */}
            <div>
              <label htmlFor="role" className="block text-sm mb-2">I am a</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClass}>
                <option value="">Select your role</option>
                <option value="influencer">Influencer</option>
                <option value="model">Model</option>
                <option value="actor">Actor</option>
                <option value="sports">Sports Professional</option>
              </select>
            </div>

            {/* First Name & Surname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm mb-2">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="surname" className="block text-sm mb-2">Surname</label>
                <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm mb-2">Nickname</label>
              <input type="text" id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} className={inputClass} />
            </div>

            {/* Email & Confirm Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm mb-2">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="confirmEmail" className="block text-sm mb-2">Confirm Email</label>
                <input type="email" id="confirmEmail" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} placeholder="Minimum 8 characters" className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">Use at least 8 characters</p>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm mb-2">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className={inputClass}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm mb-2">Date of Birth</label>
              <div className="grid grid-cols-3 gap-4">
                <select name="day" value={formData.day} onChange={handleChange} required className={inputClass}>
                  <option value="">Day</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="month" value={formData.month} onChange={handleChange} required className={inputClass}>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select name="year" value={formData.year} onChange={handleChange} required className={inputClass}>
                  <option value="">Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <div>
                <label htmlFor="instagram" className="block text-sm mb-2">Instagram Account</label>
                <input type="text" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" className={inputClass} />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-sm mb-2">TikTok Account</label>
                <input type="text" id="tiktok" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="@username" className={inputClass} />
              </div>
              <div>
                <label htmlFor="youtube" className="block text-sm mb-2">YouTube Channel</label>
                <input type="text" id="youtube" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="channel link" className={inputClass} />
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-black" />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-black underline hover:no-underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-black underline hover:no-underline">Privacy Policy</Link>
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-500 ml-7">You must accept before continuing</p>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-lg disabled:opacity-50">
                {loading ? "Creating Profile..." : "Create Profile"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Profile photos and videos will be uploaded in the next step
        </p>
      </div>
    </div>
  );
}
