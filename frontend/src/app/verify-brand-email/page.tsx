"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Redirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const email = searchParams.get("email") || "";
    router.replace(`/verify-email?role=brand&email=${encodeURIComponent(email)}`);
  }, [router, searchParams]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
    </div>
  );
}

export default function VerifyBrandEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Redirect />
    </Suspense>
  );
}
