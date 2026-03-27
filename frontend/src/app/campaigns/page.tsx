"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { listLicenses } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface LicenseItem {
  id: number;
  status: string;
  license_type: string;
  use_case: string;
  proposed_price: number | null;
  payment_status: string;
  created_at: string;
}

const statusColor = (s: string) =>
  s === "active" || s === "approved" ? "bg-green-100 text-green-700 border-green-200"
  : s === "pending" || s === "under_review" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
  : s === "rejected" ? "bg-red-100 text-red-700 border-red-200"
  : "bg-gray-100 text-gray-700 border-gray-200";

export default function CampaignsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      listLicenses()
        .then((data) => setLicenses(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
            <Link href="/discover-talent" className="text-sm text-gray-600 hover:text-black">Discover Talent</Link>
            <span className="text-sm font-medium text-black border-b-2 border-black pb-1">Campaigns</span>
          </nav>
          <Link href="/client/dashboard" className="text-sm text-gray-600 hover:text-black">&larr; Back</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Campaigns</h1>
            <p className="text-gray-600">Your license requests and active campaigns</p>
          </div>
          <button onClick={() => router.push("/discover-talent")} className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No campaigns yet</p>
            <button onClick={() => router.push("/discover-talent")} className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((lic) => (
              <Link key={lic.id} href={`/license/${lic.id}`} className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-200 hover:border-gray-300 block">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 truncate">
                  {lic.use_case || `License #${lic.id}`}
                </h3>
                <div className="space-y-2.5 mb-4">
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-28">Type:</span>
                    <span className="text-sm font-medium capitalize">{(lic.license_type || "standard").replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-28">Price:</span>
                    <span className="text-sm font-medium">{lic.proposed_price ? `£${lic.proposed_price.toLocaleString()}` : "TBD"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-28">Payment:</span>
                    <span className="text-sm font-medium capitalize">{lic.payment_status || "unpaid"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-28">Status:</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColor(lic.status)}`}>
                      {lic.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
