"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your@email.com";
  const role = searchParams.get("role") || "talent";
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setResent(true);
    setCountdown(60);
    setTimeout(() => setResent(false), 3000);
  };

  const dashboardPath = role === "agent" ? "/agent/dashboard" : role === "client" || role === "brand" ? "/client/dashboard" : "/talent/dashboard";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold">
            FL
          </div>
          <span className="font-semibold text-lg tracking-wide">FACE LIBRARY</span>
        </Link>

        {/* Email Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-gray-600" />
        </div>

        <h1 className="text-3xl font-medium mb-3">Check Your Email</h1>
        <p className="text-gray-600 mb-2">
          We&apos;ve sent a verification link to:
        </p>
        <p className="text-black font-semibold text-lg mb-6">{email}</p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold mb-3">What to do next:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-semibold text-black">1.</span>
              Open your email inbox
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-black">2.</span>
              Click the verification link in the email from Face Library
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-black">3.</span>
              You&apos;ll be redirected to your dashboard
            </li>
          </ol>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={countdown > 0}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <RefreshCw className={`w-4 h-4 ${resent ? "animate-spin" : ""}`} />
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend Verification Email"}
        </button>

        {resent && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-4">
            <CheckCircle className="w-4 h-4" />
            Verification email resent!
          </div>
        )}

        {/* Skip for demo */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-2 font-semibold">Demo Mode</p>
          <p className="text-xs text-blue-700 mb-3">Skip email verification and go directly to your dashboard.</p>
          <Link
            href={dashboardPath}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Skip to Dashboard →
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button onClick={handleResend} className="text-black underline hover:no-underline">
            resend it
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
