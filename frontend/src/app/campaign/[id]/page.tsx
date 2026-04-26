"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, FileText, Globe, Loader2, User, Download } from "lucide-react";
import { getLicense, generateContract, getTalent } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import BrandTopNav from "@/components/BrandTopNav";

interface License {
  id: number;
  status: string;
  use_case?: string;
  content_type?: string;
  license_type?: string;
  desired_duration_days?: number;
  desired_regions?: string;
  proposed_price?: number | string | null;
  created_at: string;
  talent_id?: number;
  talent_name?: string;
  brand_name?: string;
  contract_generated?: boolean;
}

interface TalentLite {
  id: number;
  name?: string;
  photo_url?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  awaiting_approval: "bg-yellow-100 text-yellow-700 border-yellow-200",
  under_review: "bg-blue-100 text-blue-700 border-blue-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
};

function platformsFor(contentType?: string): string[] {
  if (!contentType) return ["Social Media", "Website"];
  const t = contentType.toLowerCase();
  if (t.includes("social")) return ["Instagram", "Facebook", "TikTok"];
  if (t.includes("print")) return ["Print Magazines", "Outdoor"];
  if (t.includes("tv")) return ["TV Commercials", "YouTube"];
  if (t.includes("web")) return ["Website", "Digital Ads"];
  return ["Social Media", "Website"];
}

function deliverablesFor(contentType?: string): string[] {
  if (!contentType) return ["Campaign assets per agreement"];
  const t = contentType.toLowerCase();
  if (t.includes("social")) return ["Instagram Posts", "Story Reels", "TikTok Videos"];
  if (t.includes("print")) return ["Magazine Spread", "Outdoor Billboard", "Catalog Photography"];
  if (t.includes("tv")) return ["30-second Commercial", "YouTube Pre-roll", "Behind-the-scenes Cuts"];
  return ["Hero Imagery", "Banner Creative"];
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const licenseId = Number(id);

  const [license, setLicense] = useState<License | null>(null);
  const [talent, setTalent] = useState<TalentLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;
    (async () => {
      try {
        const data: License = await getLicense(licenseId);
        setLicense(data);
        if (data.talent_id) {
          const t = await getTalent(data.talent_id).catch(() => null);
          if (t) setTalent(t as TalentLite);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, licenseId]);

  const handleDownloadContract = async () => {
    if (!license) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateContract(license.id);
      const text =
        (result as { contract_text?: string; text?: string }).contract_text ||
        (result as { contract_text?: string; text?: string }).text ||
        "";
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${license.id}-contract.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download contract");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="min-h-screen bg-white">
        <BrandTopNav active="Campaigns" />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-gray-500 text-lg mb-4">Campaign not found.</p>
          <Link href="/campaigns" className="text-blue-600 hover:underline">
            Back to Campaigns
          </Link>
        </main>
      </div>
    );
  }

  const startDate = new Date(license.created_at);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (license.desired_duration_days ?? 90));

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const status = license.status || "pending";
  const badge = STATUS_BADGE[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const platforms = platformsFor(license.content_type);
  const deliverables = deliverablesFor(license.content_type);
  const talentImage =
    talent?.photo_url || talent?.image_url || talent?.avatar_url || null;

  const priceNum =
    typeof license.proposed_price === "string"
      ? parseFloat(license.proposed_price)
      : license.proposed_price ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <BrandTopNav active="Campaigns" />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/campaigns"
          className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1 mb-6"
        >
          ← Back to Campaigns
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-semibold">
              {license.use_case || `Campaign #${license.id}`}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${badge}`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-gray-600 text-base">
            {license.use_case || "Campaign details"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Selected Talent</h3>
            </div>
            <div className="flex items-center gap-4">
              {talentImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={talentImage}
                  alt={talent?.name || license.talent_name || "Talent"}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {talent?.name || license.talent_name || "Unknown Talent"}
                </p>
                {license.talent_id && (
                  <Link
                    href={`/talent-profile/${license.talent_id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Campaign Duration</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">{fmt(startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">{fmt(endDate)}</p>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {license.desired_duration_days ?? 90} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Campaign Budget</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {"£"}
                  {priceNum.toLocaleString()}
                </p>
              </div>
              <Link
                href={`/license/${license.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Breakdown
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Usage Rights</h3>
            </div>
            <p className="text-base font-medium text-gray-900 mb-3">
              {(license.content_type || "social").replace(/_/g, " ")}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Region: {license.desired_regions || "Global"}
            </p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Deliverables</h3>
            </div>
            <ul className="space-y-2">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">&bull;</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleDownloadContract}
            disabled={generating}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Contract
          </button>
          <Link
            href={`/license/${license.id}`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-black hover:text-black transition-colors font-medium text-sm"
          >
            View License Details
          </Link>
          {user?.role === "client" && (
            <Link
              href="/messages"
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-black hover:text-black transition-colors font-medium text-sm"
            >
              Message Talent
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
