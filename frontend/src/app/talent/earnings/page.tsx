"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut, User, Loader2, DollarSign, FileText, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getEarnings, listPayouts, requestPayout,
  getBankDetails, updateBankDetails,
  listTaxDocuments, requestTaxDocument,
  type BankDetails, type TaxDocument,
} from "@/lib/api";

const NAV_TABS = [
  { label: "Dashboard", href: "/talent/dashboard" },
  { label: "My Face", href: "/talent/my-face" },
  { label: "Licenses", href: "/talent/licenses" },
  { label: "Usage", href: "/talent/usage" },
  { label: "Billing", href: "/talent/earnings" },
  { label: "Messages", href: "/messages" },
];

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

function gbp(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : (n || 0);
  return `£${v.toLocaleString()}`;
}

function formatMonthDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  } catch { return iso; }
}

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

export default function TalentBillingPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [taxDocs, setTaxDocs] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    sort_code: "",
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear() - 1);
  const [taxSubmitting, setTaxSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "talent")) {
      router.push("/login");
      return;
    }
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function loadData() {
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
    } catch {
      // Some endpoints 404 until there's data; swallow silently.
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawError("Enter a valid amount");
      return;
    }
    if (earnings && amt > earnings.available_balance) {
      setWithdrawError(`Amount exceeds available balance (${gbp(earnings.available_balance)})`);
      return;
    }
    setWithdrawError(null);
    setWithdrawing(true);
    try {
      await requestPayout({ amount: amt });
      setWithdrawAmount("");
      await loadData();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleBankSave(e: React.FormEvent) {
    e.preventDefault();
    if (!bankForm.account_holder_name.trim()) {
      setBankError("Account holder name is required");
      return;
    }
    setBankError(null);
    setBankSaving(true);
    try {
      await updateBankDetails(bankForm);
      setBank(await getBankDetails());
      setEditingBank(false);
      setBankForm((f) => ({ ...f, account_number: "" }));
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "Failed to save bank details");
    } finally {
      setBankSaving(false);
    }
  }

  async function handleTaxRequest(docType: string, year: number) {
    setTaxSubmitting(true);
    try {
      await requestTaxDocument({ document_type: docType, tax_year: year });
      setTaxDocs(await listTaxDocuments());
    } catch {
      // swallow
    } finally {
      setTaxSubmitting(false);
    }
  }

  if (authLoading || loading || !user || user.role !== "talent") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const available = earnings?.available_balance ?? 0;
  const totalEarned = earnings?.total_earned ?? 0;
  const pending = earnings?.pending_payout ?? 0;

  // Derive "This Month" from payouts that landed this month (paid) plus
  // earnings from this month's licenses. In MVP we compute from payouts.
  const now = new Date();
  const thisMonthPayouts = payouts.filter((p) => {
    try {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch { return false; }
  });
  const thisMonth = thisMonthPayouts.reduce((acc, p) => {
    const v = typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
    return acc + (p.status === "paid" ? v : 0);
  }, 0);

  // Build transaction list from payouts (most recent 5).
  const transactions = [...payouts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Next expected payout: end of current month
  const nextPayout = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
                const isActive = tab.label === "Billing";
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
          <h1 className="text-3xl font-semibold">Billing &amp; Payments</h1>
          <p className="text-gray-600 text-base mt-1">
            Manage your payouts, invoices, and payment methods.
          </p>
        </div>

        <div className="space-y-8">
          {/* Payment Overview — 4 tiles (Figma spec) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Available Balance</p>
              <p className="text-3xl font-bold mb-1">{gbp(available)}</p>
              {pending > 0 && (
                <p className="text-xs text-green-600">+{gbp(pending)} pending</p>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Earned</p>
              <p className="text-3xl font-bold mb-1">{gbp(totalEarned)}</p>
              <p className="text-xs text-gray-600">Lifetime</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">This Month</p>
              <p className="text-3xl font-bold mb-1">{gbp(thisMonth)}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {thisMonthPayouts.length} payout{thisMonthPayouts.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Next Payout</p>
              <p className="text-3xl font-bold mb-1">
                {nextPayout.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-gray-600">Estimated {gbp(available)}</p>
            </div>
          </div>

          {/* Two-column: Payment Method + Withdraw (left) / Transactions (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Payment Method card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                  {bank && !editingBank && (
                    <button
                      onClick={() => setEditingBank(true)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {!editingBank && bank ? (
                  <>
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white mb-4">
                      <div className="mb-8">
                        <p className="text-xs text-gray-300 mb-1">Bank Transfer</p>
                        <p className="text-sm font-medium">{bank.bank_name || "—"}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-300">Account Number</p>
                          <p className="text-sm">•••• {bank.account_number_last4 || "----"}</p>
                        </div>
                        {bank.sort_code && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-300">Sort Code</p>
                            <p className="text-sm">{bank.sort_code}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-300">Account Name</p>
                          <p className="text-sm">{bank.account_holder_name}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingBank(true)}
                      className="w-full bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Update Payment Method
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleBankSave} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Account Holder Name *</label>
                      <input
                        required
                        value={bankForm.account_holder_name}
                        onChange={(e) => setBankForm((f) => ({ ...f, account_holder_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Bank Name</label>
                      <input
                        value={bankForm.bank_name}
                        onChange={(e) => setBankForm((f) => ({ ...f, bank_name: e.target.value }))}
                        placeholder="e.g. Barclays Bank UK"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Account Number</label>
                        <input
                          value={bankForm.account_number}
                          onChange={(e) => setBankForm((f) => ({ ...f, account_number: e.target.value }))}
                          placeholder="Stored as last 4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Sort Code</label>
                        <input
                          value={bankForm.sort_code}
                          onChange={(e) => setBankForm((f) => ({ ...f, sort_code: e.target.value }))}
                          placeholder="00-00-00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                    {bankError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{bankError}</div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={bankSaving}
                        className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                      >
                        {bankSaving ? "Saving…" : "Save Payment Method"}
                      </button>
                      {bank && (
                        <button
                          type="button"
                          onClick={() => setEditingBank(false)}
                          className="px-4 border border-gray-300 text-gray-700 rounded-lg text-sm hover:border-black hover:text-black"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Withdraw Funds card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Withdraw Funds</h2>
                <form onSubmit={handleWithdraw}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">£</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={available}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Available: {gbp(available)}</p>
                  </div>
                  {withdrawError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      {withdrawError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={withdrawing || available <= 0}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawing ? "Requesting…" : "Withdraw Now"}
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Funds will arrive in 3-5 business days
                  </p>
                </form>
              </div>
            </div>

            {/* Transaction History card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Transaction History</h2>
                <span className="text-sm text-gray-500">{payouts.length} total</span>
              </div>
              {transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No transactions yet. Payouts will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((p) => {
                    const isPaid = p.status === "paid";
                    const isPending = p.status === "requested" || p.status === "processing";
                    const iconBg = isPaid ? "bg-blue-100" : isPending ? "bg-yellow-100" : "bg-gray-100";
                    const iconColor = isPaid ? "text-blue-600" : isPending ? "text-yellow-600" : "text-gray-600";
                    const amountColor = isPending ? "text-yellow-600" : "text-gray-700";
                    const label = isPaid ? "Payout Completed" : isPending ? "Payout Pending" : p.status;
                    return (
                      <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                            <DollarSign className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">{label}</p>
                            <p className="text-xs text-gray-600">
                              {p.bank_account_ref || "Bank account"} • {formatMonthDay(p.created_at)}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold ${amountColor}`}>
                          {isPaid ? "-" : ""}{gbp(p.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Invoices (derived from payouts) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Invoices</h2>
              <span className="text-xs text-gray-500">
                Invoices are auto-generated for each cleared payout.
              </span>
            </div>
            {payouts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No invoices yet. They appear once a payout is processed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Invoice ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => {
                      const isPaid = p.status === "paid";
                      const statusStyle = isPaid
                        ? "bg-green-100 text-green-700"
                        : p.status === "requested"
                        ? "bg-yellow-100 text-yellow-700"
                        : p.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700";
                      return (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-mono">#INV-{String(p.id).padStart(4, "0")}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{formatFullDate(p.created_at)}</td>
                          <td className="py-3 px-4 text-sm font-semibold">{gbp(p.amount)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block ${statusStyle} text-xs px-2 py-1 rounded-full font-medium capitalize`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tax Documents */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tax Documents</h2>
              <button
                onClick={() => handleTaxRequest("annual_statement", taxYear)}
                disabled={taxSubmitting}
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {taxSubmitting ? "Requesting…" : "Request Tax Document"}
              </button>
            </div>
            {taxDocs.length === 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[taxYear, taxYear - 1].map((y) => (
                    <button
                      key={y}
                      onClick={() => handleTaxRequest("annual_statement", y)}
                      className="border border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{y} Tax Summary</p>
                          <p className="text-xs text-gray-600">Click to request</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => handleTaxRequest("W-9", new Date().getFullYear())}
                    className="border border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">W-9 Form</p>
                        <p className="text-xs text-gray-600">Click to request</p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500">Year: </label>
                  <input
                    type="number"
                    min={2020}
                    max={new Date().getFullYear()}
                    value={taxYear}
                    onChange={(e) => setTaxYear(parseInt(e.target.value) || taxYear)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs w-20"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {taxDocs.map((d) => (
                  <div key={d.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{d.document_type} · {d.tax_year}</p>
                        <p className="text-xs text-gray-600 capitalize">{d.status}</p>
                      </div>
                    </div>
                    {d.file_url ? (
                      <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
