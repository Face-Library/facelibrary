"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Loader2, Users, CheckCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getAgent, getAgentLinks, getTalent, listTalents } from "@/lib/api";
import AgentTopNav from "@/components/AgentTopNav";

interface TalentRow {
  id: number;
  user_id: number;
  name?: string;
  stage_name?: string;
  photo_url?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
  categories?: string | null;
  geo_scope?: string | null;
  age?: number | null;
  gender?: string | null;
  nationality?: string | null;
}

interface AgentLink {
  id: number;
  talent_id: number;
  agent_id: number;
  approval_type: string;
  created_at: string;
}

function talentCategory(cats: string | null | undefined): string {
  if (!cats) return "Model";
  const first = cats.split(",")[0]?.trim();
  return first || "Model";
}

export default function AgentTalentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "agent")) {
      router.push("/login");
      return;
    }
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        let agentId: number | null = user.profile_id ?? null;
        if (!agentId) {
          // Try resolving via scan
          for (let i = 1; i <= 30; i++) {
            try {
              const a = await getAgent(i);
              if (a && a.user_id === user.user_id) { agentId = i; break; }
            } catch { /* skip */ }
          }
        }
        if (!agentId) {
          setTalents([]); return;
        }
        const links = (await getAgentLinks(agentId).catch(() => [])) as AgentLink[];
        if (!links.length) {
          setTalents([]); return;
        }
        const rows = await Promise.all(
          links.map((l) => getTalent(l.talent_id).catch(() => null))
        );
        setTalents(rows.filter(Boolean) as TalentRow[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load talents");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-white">
      <AgentTopNav active="Talents" />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Talents</h1>
            <p className="text-gray-600 text-sm">Your managed talent roster.</p>
          </div>
          <Link
            href="/add-new-talent"
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            <Users className="w-4 h-4" /> Add Talent
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="py-20 flex items-center justify-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading talents…
          </div>
        ) : talents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 mb-4">No talents linked yet.</p>
            <Link
              href="/add-new-talent"
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Onboard your first talent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((t) => {
              const img = t.photo_url || t.image_url || t.avatar_url;
              return (
                <div key={t.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[4/5] bg-gray-50 relative">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={t.name || t.stage_name || "Talent"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="text-white/20 text-xl font-bold tracking-wider -rotate-12">FACE LIBRARY</div>
                    </div>
                    {t.avatar_url && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        <CheckCircle className="w-3 h-3" /> Avatar Ready
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-base mb-1 truncate">{t.name || t.stage_name || "Unnamed"}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{talentCategory(t.categories)}</span>
                      {t.gender && <span>{t.gender}</span>}
                      {t.age && <span>· {t.age}y</span>}
                      {t.nationality && <span>· {t.nationality}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/talent-profile/${t.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs hover:border-black hover:text-black transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Profile
                      </Link>
                      <Link
                        href={`/talent-profile/${t.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-800 transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback: all registered talents if the agent has no links yet */}
        {!loading && talents.length === 0 && (
          <TalentDiscoverySuggestion />
        )}
      </main>
    </div>
  );
}

function TalentDiscoverySuggestion() {
  const [all, setAll] = useState<TalentRow[]>([]);
  useEffect(() => {
    listTalents().then((rows) => setAll(rows as TalentRow[])).catch(() => setAll([]));
  }, []);
  if (all.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-3">Browse all registered talent</h2>
      <p className="text-sm text-gray-600 mb-4">
        Not showing because no talent-agent links exist yet. These are all registered talents on the platform —
        use <Link href="/discover-talent" className="underline">Discover Talent</Link> to connect or{" "}
        <Link href="/add-new-talent" className="underline">onboard</Link> a new one.
      </p>
    </div>
  );
}
