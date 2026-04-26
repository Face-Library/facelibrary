"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, Copy, CheckCircle } from "lucide-react";
import { getLicenseTemplates } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RoleAwareTopNav from "@/components/RoleAwareTopNav";

interface Template {
  type: string;
  name: string;
  description?: string;
  default_duration_days?: number;
  exclusivity?: boolean;
  ai_training_allowed?: boolean;
}

const templateDetails: Record<string, { color: string; accent: string; features: string[] }> = {
  standard: {
    color: "bg-blue-50 border-blue-200",
    accent: "text-blue-700",
    features: [
      "Non-exclusive rights",
      "Up to 90 days",
      "Single campaign use",
      "Social media + web",
      "Standard pricing",
    ],
  },
  exclusive: {
    color: "bg-purple-50 border-purple-200",
    accent: "text-purple-700",
    features: [
      "Full exclusivity in category",
      "Up to 180 days",
      "Multiple campaign use",
      "All channels (TV, print, digital)",
      "Premium pricing",
    ],
  },
  time_limited: {
    color: "bg-amber-50 border-amber-200",
    accent: "text-amber-700",
    features: [
      "Non-exclusive rights",
      "Up to 30 days",
      "Single campaign use",
      "Time-sensitive (launches, events)",
      "Discounted pricing",
    ],
  },
};

export default function ContractTemplatesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    getLicenseTemplates()
      .then((data) => setTemplates(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <RoleAwareTopNav active="Contracts" />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2">Contract Templates</h1>
          <p className="text-gray-600">
            Pre-built UK-law compliant licensing agreements. Choose a template to get started.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => {
              const detail = templateDetails[template.type] || templateDetails.standard;
              return (
                <div
                  key={template.type}
                  className={`rounded-2xl border-2 p-6 transition-all ${detail.color} ${
                    selectedType === template.type ? "ring-2 ring-black" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className={`w-6 h-6 ${detail.accent}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="text-xs text-gray-600 capitalize">{template.type.replace(/_/g, " ")}</p>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">{template.description}</p>
                  )}

                  <div className="space-y-2 mb-6">
                    {detail.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className={`w-3.5 h-3.5 ${detail.accent} flex-shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedType(template.type)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-white border border-gray-300 text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => router.push("/discover-talent")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedType && (
          <div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {selectedType.replace(/_/g, " ")} License — Preview
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap">
{`FACE LIBRARY LIKENESS LICENSING AGREEMENT

1. LICENSE GRANT
The Licensor grants the Licensee a ${
                selectedType === "exclusive" ? "EXCLUSIVE" : "non-exclusive"
              }, non-transferable license to use the Licensed Materials during the License Period within the Permitted Territory for the Permitted Purposes.

2. LICENSE TERM
License Period: ${
                selectedType === "exclusive"
                  ? "180 days"
                  : selectedType === "time_limited"
                  ? "30 days"
                  : "90 days"
              } from the Effective Date.

3. PERMITTED USE
• Digital advertising
• Social media content
• Website and marketing materials
${selectedType === "exclusive" ? "• Print and TV commercials\n• Extended derivative works" : ""}

4. RESTRICTIONS
The Licensee shall NOT:
• Use the Licensed Materials outside the Permitted Territory
• Transfer or sublicense the rights granted
• Use for AI training or model generation
• Create derivative works beyond the Permitted Purposes

5. CONSIDERATION
As consideration for the rights granted, the Licensee shall pay the agreed Fee in accordance with Schedule A.

6. GOVERNING LAW
This Agreement shall be governed by the laws of England and Wales.

[Full contract details generated when you select a talent]`}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
