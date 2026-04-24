"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Loader2, Inbox, CheckCircle, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  listTalents,
  getTalentRequests,
  approveLicense,
  createConversation,
} from "@/lib/api";

const NAV_TABS = [
  { label: "Dashboard", href: "/talent/dashboard" },
  { label: "My Face", href: "/talent/my-face" },
  { label: "Licenses", href: "/talent/licenses" },
  { label: "Usage", href: "/talent/usage" },
  { label: "Billing", href: "/talent/earnings" },
  { label: "Messages", href: "/messages" },
];

interface LicenseRow {
  id: number;
  brand_name?: string;
  client_user_id?: number;
  license_type?: string;
  content_type?: string;
  desired_duration_days?: number;
  desired_regions?: string;
  use_case?: string;
  proposed_price?: number | string | null;
  status: string;
  created_at: string;
}

function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() || "").join("") || "?";
}

function brandColor(name: string): string {
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-emerald-600",
    "bg-amber-600", "bg-rose-600", "bg-indigo-600",
    "bg-teal-600", "bg-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}

function formatDuration(days: number | undefined): string {
  if (!days) return "—";
  const months = Math.floor(days / 30);
  const rem = days % 30;
  if (months === 0) return `${days} days`;
  if (rem === 0) return `${months} month${months === 1 ? "" : "s"}`;
  return `${months} month${months === 1 ? "" : "s"} ${rem} days`;
}

function formatTimeRemaining(createdAt: string, durationDays: number | undefined): string {
  if (!durationDays) return "—";
  const end = new Date(new Date(createdAt).getTime() + durationDays * 86400_000);
  const now = new Date();
  if (end <= now) return "Expired";
  const msRemaining = end.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / 86400_000);
  const months = Math.floor(daysRemaining / 30);
  const rem = daysRemaining % 30;
  if (months === 0) return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
  if (rem === 0) return `${months} month${months === 1 ? "" : "s"}`;
  return `${months} month${months === 1 ? "" : "s"} ${rem} day${rem === 1 ? "" : "s"}`;
}

export default function TalentLicensesPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "talent")) {
      router.push("/login");
      return;
    }
    if (!user) return;
    loadLicenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function loadLicenses() {
    setLoading(true);
    try {
      let profileId = user?.profile_id;
      if (!profileId && user) {
        const talents = await listTalents();
        const mine = (talents as Array<{ id: number; user_id: number }>).find(
          (t) => t.user_id === user.user_id
        );
        profileId = mine?.id;
      }
      if (!profileId) {
        setLicenses([]);
        return;
      }
      const rows = await getTalentRequests(profileId);
      setLicenses(rows as LicenseRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load licenses");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(id: number, approved: boolean) {
    setActingId(id);
    setError(null);
    try {
      await approveLicense(id, approved);
      await loadLicenses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActingId(null);
    }
  }

  async function handleNegotiate(row: LicenseRow) {
    if (!row.client_user_id) {
      setError("Brand contact unavailable for negotiation");
      return;
    }
    setActingId(row.id);
    try {
      const { conversation_id } = await createConversation({
        other_user_id: row.client_user_id,
        subject: `Re: ${row.use_case || "License request"} (#${row.id})`,
        initial_message:
          `Hi — I'd like to discuss the terms of license request #${row.id}` +
          (row.proposed_price ? ` (proposed £${row.proposed_price})` : "") +
          ". Happy to talk through duration, regions, and price.",
      });
      router.push(`/messages?conversation=${conversation_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open negotiation");
    } finally {
      setActingId(null);
    }
  }

  const pending = licenses.filter(
    (l) => l.status === "pending" || l.status === "awaiting_approval" || l.status === "under_review"
  );
  const active = licenses.filter(
    (l) => l.status === "active" || l.status === "approved"
  );
  const historical = licenses.filter(
    (l) => !pending.includes(l) && !active.includes(l)
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">FL</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = tab.label === "Licenses";
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`px-3 py-4 text-sm transition-colors relative ${
                      isActive ? "text-black font-medium" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {tab.label}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">{user?.name || "—"}</span>
            <button onClick={() => { logout(); router.push("/login"); }} className="text-gray-400 hover:text-gray-700 ml-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">Licenses</h1>
          <p className="text-gray-600 text-base mt-1">Review license requests and manage active licenses.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex items-center justify-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading licenses…
          </div>
        ) : (
          <div className="space-y-10">
            {/* License Requests */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Inbox className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-semibold">License Requests</h2>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              </div>
              {pending.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                  No pending requests. Brands will appear here when they request to license your avatar.
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map((row) => {
                    const brand = row.brand_name || "Unknown brand";
                    return (
                      <div key={row.id} className="bg-[#F7F7F7] rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-16 h-16 ${brandColor(brand)} rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                              {brandInitials(brand)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-lg truncate">{brand}</h3>
                              <p className="text-gray-600 truncate">
                                {row.use_case || `${(row.license_type || "standard").replace(/_/g, " ")} campaign`}
                              </p>
                              {row.proposed_price != null && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  Proposed £{typeof row.proposed_price === "string" ? parseFloat(row.proposed_price).toLocaleString() : row.proposed_price.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold">{formatDuration(row.desired_duration_days)}</p>
                            <p className="text-sm text-gray-600 capitalize">{row.desired_regions || "Global"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(row.id, true)}
                            disabled={actingId === row.id}
                            className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {actingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(row.id, false)}
                            disabled={actingId === row.id}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:border-gray-900 hover:text-black transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleNegotiate(row)}
                            disabled={actingId === row.id || !row.client_user_id}
                            title={row.client_user_id ? "Open a message thread with the brand" : "Brand contact not available"}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:border-gray-900 hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Negotiate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Active Licenses */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Active Licenses</h2>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {active.length}
                </span>
              </div>
              {active.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                  No active licenses. Approved requests will appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.map((row) => (
                    <Link
                      key={row.id}
                      href={`/license/${row.id}`}
                      className="block bg-[#F7F7F7] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-base mb-2 truncate">{row.brand_name || "Brand"}</h3>
                      <p className="text-sm text-gray-600 mb-3 truncate">
                        {row.use_case || `${(row.license_type || "standard").replace(/_/g, " ")}`}
                      </p>
                      <div className="text-sm mb-2">
                        <p className="text-gray-600">Time remaining:</p>
                        <p className="font-semibold">{formatTimeRemaining(row.created_at, row.desired_duration_days)}</p>
                      </div>
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Active
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Historical (rejected / expired / cancelled) */}
            {historical.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">History</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Brand</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Campaign</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Requested</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historical.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 font-medium">{row.brand_name || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{row.use_case || "—"}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(row.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                              {row.status.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
