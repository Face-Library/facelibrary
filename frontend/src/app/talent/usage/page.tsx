"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ExternalLink, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listTalents, getTalentRequests, getWatermarkByTalent, getTalent } from "@/lib/api";
import TalentTopNav from "@/components/TalentTopNav";

interface LicenseRow {
  id: number;
  brand_name?: string;
  content_type?: string;
  license_type?: string;
  desired_duration_days?: number;
  desired_regions?: string;
  use_case?: string;
  status: string;
  created_at: string;
}

interface WatermarkRow {
  id: number;
  license_id: number | null;
  talent_id: number | null;
  watermark_id: string | null;
  platform_detected: string | null;
  detection_url: string | null;
  is_authorized: boolean;
  status: string;
  created_at: string;
  detected_at: string | null;
  notes: string | null;
}

function platformLabel(contentType?: string, licenseType?: string): string {
  const t = (contentType || "").toLowerCase();
  const l = (licenseType || "").toLowerCase();
  if (t === "video" || l.includes("tv")) return "TV, Online Ads";
  if (l.includes("print")) return "Print, Website";
  if (l.includes("social") || t === "image") return "Instagram, Website";
  return "Digital, Social Media";
}

function timeRemainingBadge(createdAt: string, durationDays?: number):
  | { label: string; color: string }
  | null {
  if (!durationDays) return null;
  const end = new Date(new Date(createdAt).getTime() + durationDays * 86400_000);
  const diffMs = end.getTime() - Date.now();
  if (diffMs <= 0) return { label: "Expired", color: "bg-red-100 text-red-700" };
  const daysRemaining = Math.ceil(diffMs / 86400_000);
  if (daysRemaining <= 60) return { label: "Ending Soon", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Active", color: "bg-green-100 text-green-700" };
}

function formatDurationRemaining(createdAt: string, durationDays?: number): string {
  if (!durationDays) return "—";
  const end = new Date(new Date(createdAt).getTime() + durationDays * 86400_000);
  const diffMs = end.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const days = Math.ceil(diffMs / 86400_000);
  const months = Math.floor(days / 30);
  if (months === 0) return `${days} day${days === 1 ? "" : "s"} left`;
  return `${months} month${months === 1 ? "" : "s"} left`;
}

export default function TalentUsagePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState<LicenseRow[]>([]);
  const [watermarks, setWatermarks] = useState<WatermarkRow[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "talent")) {
      router.push("/login");
      return;
    }
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        let profileId: number | null = user.profile_id ?? null;
        if (!profileId) {
          const ts = await listTalents();
          const mine = (ts as Array<{ id: number; user_id: number }>).find((t) => t.user_id === user.user_id);
          profileId = mine?.id ?? null;
        }
        if (!profileId) {
          setActive([]); setWatermarks([]);
          return;
        }
        const [licRes, wmRes, prof] = await Promise.all([
          getTalentRequests(profileId),
          getWatermarkByTalent(profileId).catch(() => []),
          getTalent(profileId).catch(() => null),
        ]);
        const licRows = (licRes as LicenseRow[]).filter(
          (l) => l.status === "active" || l.status === "approved"
        );
        setActive(licRows);
        setWatermarks(Array.isArray(wmRes) ? (wmRes as WatermarkRow[]) : []);
        if (prof) {
          const p = prof as { photo_url?: string; image_url?: string; avatar_url?: string };
          setPreviewImage(p.photo_url || p.image_url || p.avatar_url || null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load usage");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

  const unauthorized = watermarks.filter((w) => !w.is_authorized);

  if (authLoading || !user || user.role !== "talent") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TalentTopNav active="Usage" />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">Usage</h1>
          <p className="text-gray-600 text-base mt-1">Track where your face is being used across campaigns.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Unauthorized-detection banner */}
        {unauthorized.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-red-700">
                {unauthorized.length} unauthorized detection{unauthorized.length === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                We&apos;ve detected your avatar being used outside of an approved license.
                See the detection log below for details and takedown actions.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex items-center justify-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading usage…
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active campaign usage */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Campaigns using your avatar</h2>
              {active.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                  No active campaigns yet. Approved licenses will show here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {active.map((row) => {
                    const badge = timeRemainingBadge(row.created_at, row.desired_duration_days);
                    return (
                      <div key={row.id} className="bg-[#F7F7F7] rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{row.brand_name || "Brand"}</h3>
                            <p className="text-sm text-gray-600">
                              {row.use_case || `${(row.license_type || "standard").replace(/_/g, " ")} campaign`}
                            </p>
                          </div>
                          {badge && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <div className="mb-4 bg-gray-200 rounded-lg h-32 overflow-hidden relative">
                          {previewImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={previewImage}
                              alt="Campaign preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                              Campaign preview
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white/30 text-xs font-bold tracking-widest -rotate-12 select-none">
                              FACE LIBRARY
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Platform:</span>
                            <span className="font-medium text-right">{platformLabel(row.content_type, row.license_type)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Region:</span>
                            <span className="font-medium capitalize">{row.desired_regions || "Global"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{formatDurationRemaining(row.created_at, row.desired_duration_days)}</span>
                          </div>
                        </div>
                        <Link
                          href={`/license/${row.id}`}
                          className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Full Details
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Watermark detection log */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Detection log</h2>
              <p className="text-sm text-gray-600 mb-4">
                Every time your avatar is seen in the wild (via watermark detection),
                it&apos;s recorded here. Authorized detections match an approved license;
                unauthorized ones need takedown action.
              </p>
              {watermarks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                  No watermark detections yet. This log updates automatically as
                  the crawler indexes new platforms.
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Detected</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Platform</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">License</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-700">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watermarks.map((w) => (
                        <tr key={w.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(w.detected_at || w.created_at).toLocaleString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">{w.platform_detected || "—"}</td>
                          <td className="px-4 py-3">
                            {w.license_id ? (
                              <Link href={`/license/${w.license_id}`} className="text-black underline text-xs">
                                #{w.license_id}
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400">Unlicensed</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {w.is_authorized ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Authorized
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Unauthorized
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {w.detection_url ? (
                              <a href={w.detection_url} target="_blank" rel="noreferrer" className="text-black underline inline-flex items-center gap-1 text-xs">
                                Visit <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
