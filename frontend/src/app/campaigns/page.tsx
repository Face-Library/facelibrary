"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { listLicenses } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import BrandTopNav from "@/components/BrandTopNav";

interface LicenseItem {
  id: number;
  status: string;
  license_type: string;
  use_case: string;
  proposed_price: number | null;
  payment_status: string;
  created_at: string;
  talent_name?: string;
  desired_duration_days?: number;
  content_type?: string;
}

function durationLabel(days?: number): string {
  if (!days) return "—";
  if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 30) return `${Math.round(days / 30)} months`;
  return `${days} days`;
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
      <BrandTopNav active="Campaigns" />

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
              <Link key={lic.id} href={`/campaign/${lic.id}`} className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-200 hover:border-gray-300 block">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 truncate">
                  {lic.use_case || `Campaign #${lic.id}`}
                </h3>
                <div className="space-y-2.5 mb-4">
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0">Selected Talent:</span>
                    <span className="text-sm font-medium truncate">{lic.talent_name || "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0">Usage:</span>
                    <span className="text-sm font-medium capitalize">
                      {(lic.content_type || lic.license_type || "standard").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0">Duration:</span>
                    <span className="text-sm font-medium">{durationLabel(lic.desired_duration_days)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0">Status:</span>
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
