"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ClientRegisterPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    companyName: "",
    companyEmail: "",
    confirmEmail: "",
    password: "",
    industry: "",
    phoneNumber: "",
    zipCode: "",
    companyAddress: "",
    linkedIn: "",
    instagram: "",
    role: "",
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
    if (formData.companyEmail !== formData.confirmEmail) { setError("Email addresses do not match"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await registerClient({
        user_id: user?.user_id,
        company_name: formData.companyName,
        industry: formData.industry,
        website: formData.linkedIn || undefined,
        phone: formData.phoneNumber,
        role_title: formData.role,
        referral_source: formData.hearAbout,
      });
      setUser({
        user_id: res.user_id || res.id,
        email: formData.companyEmail,
        name: formData.companyName,
        role: "client",
        profile_id: res.id,
      });
      router.push("/client/dashboard");
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
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">&larr; Back to Home</Link>
          <h1 className="text-3xl font-medium mb-2">Join now</h1>
          <p className="text-gray-600">Create your brand account to explore and license talent from our Face Library.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">First name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Surname</label>
                <input type="text" name="surname" value={formData.surname} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Company name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Company email</label>
                <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Confirm email</label>
                <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange} required className={inputClass}>
                  <option value="">Select industry</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="tech">Tech</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Phone number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Zip / Post code</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Company address</label>
                <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">LinkedIn link</label>
                <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/company/..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-2">Instagram link</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@company" className={inputClass} />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Your role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className={inputClass}>
                  <option value="">Select your role</option>
                  <option value="ceo">CEO / Founder</option>
                  <option value="creative-director">Creative Director</option>
                  <option value="creative-producer">Creative Producer</option>
                </select>
              </div>
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
                  I have read and accepted the{" "}
                  <Link href="/privacy" className="text-black underline hover:no-underline">Privacy Policy</Link> and the{" "}
                  <Link href="/terms" className="text-black underline hover:no-underline">License Agreement</Link>
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-500 ml-7">You must accept before continuing</p>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-lg disabled:opacity-50">
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
