"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, Loader2, FileText, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getEarnings,
  listPayouts,
  requestPayout,
  getBankDetails,
  updateBankDetails,
  listTaxDocuments,
  requestTaxDocument,
  type BankDetails,
  type TaxDocument,
} from "@/lib/api";

interface Payout {
  id: number;
  amount: number | string;
  currency: string;
  status: string;
  bank_account_ref: string | null;
  notes: string | null;
  created_at: string;
  completed_at?: string | null;
}

interface Earnings {
  gross_revenue: number;
  total_earned: number;
  paid_out: number;
  pending_payout: number;
  available_balance: number;
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:  { label: "Pending review",  color: "bg-yellow-50 text-yellow-700",  icon: <Clock className="w-3 h-3" /> },
  processing: { label: "Processing",      color: "bg-blue-50 text-blue-700",      icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  paid:       { label: "Paid",            color: "bg-green-50 text-green-700",    icon: <CheckCircle className="w-3 h-3" /> },
  rejected:   { label: "Rejected",        color: "bg-red-50 text-red-700",        icon: <XCircle className="w-3 h-3" /> },
  cancelled:  { label: "Cancelled",       color: "bg-gray-100 text-gray-600",     icon: <XCircle className="w-3 h-3" /> },
};

export default function TalentEarningsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [bank, setBank] = useState<BankDetails | null>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    sort_code: "",
    iban: "",
    country: "GB",
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  const [taxDocs, setTaxDocs] = useState<TaxDocument[]>([]);
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear() - 1);
  const [taxType, setTaxType] = useState("1099-NEC");
  const [taxSubmitting, setTaxSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "talent")) {
      router.push("/login");
      return;
    }
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [e, p, b, t] = await Promise.all([
        getEarnings(),
        listPayouts(),
        getBankDetails().catch(() => null),
        listTaxDocuments().catch(() => [] as TaxDocument[]),
      ]);
      setEarnings(e);
      setPayouts(p as Payout[]);
      setBank(b);
      setTaxDocs(t || []);
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.account_holder_name.trim()) {
      setBankError("Account holder name is required");
      return;
    }
    setBankError(null);
    setBankSaving(true);
    try {
      await updateBankDetails(bankForm);
      const refreshed = await getBankDetails();
      setBank(refreshed);
      setEditingBank(false);
      setBankForm((f) => ({ ...f, account_number: "" }));
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "Failed to save bank details");
    } finally {
      setBankSaving(false);
    }
  };

  const handleTaxRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxSubmitting(true);
    try {
      await requestTaxDocument({ document_type: taxType, tax_year: taxYear });
      const refreshed = await listTaxDocuments();
      setTaxDocs(refreshed || []);
    } catch {
      // swallow; UI shows empty list if request failed
    } finally {
      setTaxSubmitting(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setFormError("Enter a valid amount");
      return;
    }
    if (earnings && amt > earnings.available_balance) {
      setFormError(`Amount exceeds available balance (£${earnings.available_balance.toLocaleString()})`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await requestPayout({
        amount: amt,
        bank_account_ref: bankRef || undefined,
        notes: notes || undefined,
      });
      setAmount("");
      setBankRef("");
      setNotes("");
      setShowRequest(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Payout request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const balance = earnings?.available_balance ?? 0;
  const canRequest = balance > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center text-xs font-bold">FL</div>
            <span className="font-semibold text-base tracking-wide">FACE LIBRARY</span>
          </Link>
          <Link
            href="/talent/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Earnings &amp; Payouts</h1>
          <p className="text-gray-600">
            Track your licensed-campaign earnings and request payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Earned</p>
            <p className="text-2xl font-bold">£{(earnings?.total_earned ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">90% of gross £{(earnings?.gross_revenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paid out</p>
            <p className="text-2xl font-bold">£{(earnings?.paid_out ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold">£{(earnings?.pending_payout ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-bold text-green-700">£{balance.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-10">
          <button
            onClick={() => setShowRequest((s) => !s)}
            disabled={!canRequest}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {showRequest ? "Cancel" : "Request Payout"}
          </button>
          {!canRequest && (
            <p className="text-xs text-gray-500 mt-2">
              No balance available. Earnings appear here after brand payments clear.
            </p>
          )}
        </div>

        {showRequest && (
          <form
            onSubmit={handleRequest}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-10 max-w-2xl"
          >
            <h2 className="text-lg font-semibold mb-4">New Payout Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (GBP)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max available: £{balance.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank account reference <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="e.g. HSBC **** 1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {formError}
                </div>
              )}
              <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
                Stripe Connect integration for automated transfers is not yet
                enabled. Requests are reviewed by platform operators and paid
                manually — typical turnaround is 3-5 business days.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Payout Request"}
              </button>
            </div>
          </form>
        )}

        {/* ===== Bank Account for Payouts ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold">Bank Account for Payouts</h2>
            </div>
            {bank && !editingBank && (
              <button
                onClick={() => setEditingBank(true)}
                className="text-xs text-gray-600 hover:text-black underline"
              >
                Edit
              </button>
            )}
          </div>
          {!editingBank && bank ? (
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="text-gray-500">Account holder:</span>{" "}
                <span className="font-medium">{bank.account_holder_name}</span>
              </div>
              {bank.bank_name && (
                <div>
                  <span className="text-gray-500">Bank:</span> {bank.bank_name}
                </div>
              )}
              {bank.account_number_last4 && (
                <div>
                  <span className="text-gray-500">Account ending:</span>{" "}
                  ••••{bank.account_number_last4}
                </div>
              )}
              {bank.sort_code && (
                <div>
                  <span className="text-gray-500">Sort code:</span> {bank.sort_code}
                </div>
              )}
              {bank.iban_last4 && (
                <div>
                  <span className="text-gray-500">IBAN ending:</span> ••••{bank.iban_last4}
                </div>
              )}
            </div>
          ) : editingBank || !bank ? (
            <form onSubmit={handleBankSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Account holder name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={bankForm.account_holder_name}
                  onChange={(e) =>
                    setBankForm((f) => ({ ...f, account_holder_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Bank name</label>
                <input
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm((f) => ({ ...f, bank_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Account number
                  <span className="text-gray-400 font-normal"> (stored as last 4)</span>
                </label>
                <input
                  value={bankForm.account_number}
                  onChange={(e) =>
                    setBankForm((f) => ({ ...f, account_number: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Sort code</label>
                <input
                  value={bankForm.sort_code}
                  onChange={(e) => setBankForm((f) => ({ ...f, sort_code: e.target.value }))}
                  placeholder="00-00-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  IBAN <span className="text-gray-400 font-normal">(for non-UK accounts)</span>
                </label>
                <input
                  value={bankForm.iban}
                  onChange={(e) => setBankForm((f) => ({ ...f, iban: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {bankError && (
                <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {bankError}
                </div>
              )}
              <div className="md:col-span-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Only the last 4 digits are stored. Full account numbers should be
                tokenized via Stripe Connect before production use.
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={bankSaving}
                  className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {bankSaving ? "Saving…" : "Save Bank Details"}
                </button>
                {bank && (
                  <button
                    type="button"
                    onClick={() => setEditingBank(false)}
                    className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : null}
        </div>

        {/* ===== Tax Documents ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold">Tax Documents</h2>
          </div>
          <form onSubmit={handleTaxRequest} className="flex flex-col sm:flex-row gap-3 mb-5">
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="1099-NEC">1099-NEC</option>
              <option value="1099-MISC">1099-MISC</option>
              <option value="W-9">W-9</option>
              <option value="annual_statement">Annual Statement</option>
            </select>
            <input
              type="number"
              min={2020}
              max={new Date().getFullYear()}
              value={taxYear}
              onChange={(e) => setTaxYear(parseInt(e.target.value) || taxYear)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={taxSubmitting}
              className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {taxSubmitting ? "Requesting…" : "Request Document"}
            </button>
          </form>
          {taxDocs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tax documents yet. Request one above; generation takes 24-48 hours.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-2">Document</th>
                  <th className="pb-2">Year</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Requested</th>
                  <th className="pb-2 text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {taxDocs.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-medium">{d.document_type}</td>
                    <td className="py-3 text-gray-600">{d.tax_year}</td>
                    <td className="py-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(d.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right">
                      {d.file_url ? (
                        <a
                          href={d.file_url}
                          className="text-black underline text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold">Payout History</h2>
          </div>
          {payouts.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No payout requests yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left font-semibold text-gray-700 px-6 py-3">Date</th>
                  <th className="text-right font-semibold text-gray-700 px-6 py-3">Amount</th>
                  <th className="text-left font-semibold text-gray-700 px-6 py-3">Bank</th>
                  <th className="text-left font-semibold text-gray-700 px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.requested;
                  const amt = typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(p.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        £{amt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.bank_account_ref || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
