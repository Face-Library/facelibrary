"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup, registerAgent } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AgentRegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    agencyName: "",
    phoneNumber: "",
    website: "",
    instagram: "",
    hearAbout: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) { setError("Please accept the Terms of Service and Privacy Policy"); return; }
    if (formData.email !== formData.confirmEmail) { setError("Email addresses do not match"); return; }
    setError("");
    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const res = await signup({
        email: formData.email,
        password: formData.password,
        name: fullName,
        role: "agent",
        company: formData.agencyName,
      });

      setUser({
        user_id: res.user_id || res.id,
        email: formData.email,
        name: fullName,
        role: "agent",
        profile_id: res.profile_id || null,
      });

      await registerAgent({
        user_id: res.id,
        agency_name: formData.agencyName,
        portfolio_url: formData.website || undefined,
        instagram: formData.instagram || undefined,
        industry: "general",
      });

      router.push("/agent/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">&larr; Back to Home</Link>
          <h1 className="text-3xl font-medium mb-2">Agency Registration</h1>
          <p className="text-gray-600">
            Sign up as an agency partner and manage talent, campaigns, and digital likeness licensing through our platform. Please complete the form below to create your agency account.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Information */}
            <div>
              <h2 className="text-xl font-medium mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Confirm Email Address</label>
                  <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Agency Name</label>
                  <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </div>

            {/* Agency Details */}
            <div>
              <h2 className="text-xl font-medium mb-4">Agency Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="+1 (555) 000-0000" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourwebsite.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Instagram Username</label>
                  <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@youragency" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Platform Information */}
            <div>
              <h2 className="text-xl font-medium mb-4">Platform Information</h2>
              <div>
                <label className="block text-sm mb-2">How did you hear about us?</label>
                <select name="hearAbout" value={formData.hearAbout} onChange={handleChange} required className={inputClass}>
                  <option value="">Select an option</option>
                  <option value="google">Google</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-black" />
                <label className="text-sm text-gray-600">
                  I have read and agree to the{" "}
                  <Link href="/privacy" className="text-black underline hover:no-underline">Privacy Policy</Link> and{" "}
                  <Link href="/terms" className="text-black underline hover:no-underline">Terms &amp; Conditions</Link>
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-500 ml-7">You must accept before continuing</p>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-lg disabled:opacity-50">
                {loading ? "Creating..." : "Create Agency Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
