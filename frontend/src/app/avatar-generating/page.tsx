"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";

const steps = [
  "Analyzing face photos...",
  "Extracting facial features...",
  "Processing body proportions...",
  "Building 3D mesh...",
  "Generating textures...",
  "Applying likeness mapping...",
  "Finalizing avatar...",
];

export default function AvatarGeneratingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.min(Math.floor(progress / (100 / steps.length)), steps.length - 1);
    setCurrentStep(stepIndex);
  }, [progress]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold">
            FL
          </div>
          <span className="font-semibold text-lg tracking-wide">FACE LIBRARY</span>
        </Link>

        {!complete ? (
          <>
            {/* Spinner */}
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div
                className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"
                style={{ animationDuration: "1.5s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold mb-3">Generating Your Avatar</h1>
            <p className="text-gray-600 mb-8">This may take a few minutes. Please don&apos;t close this page.</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-6">{progress}% complete</p>

            {/* Steps */}
            <div className="bg-gray-50 rounded-xl p-6 text-left">
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    {i < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : i === currentStep ? (
                      <Loader2 className="w-5 h-5 text-black animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${i <= currentStep ? "text-black font-medium" : "text-gray-400"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Complete */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-2xl font-semibold mb-3">Avatar Created!</h1>
            <p className="text-gray-600 mb-8">
              Your digital likeness has been generated successfully. You can view and manage it from your dashboard.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Avatar previews will appear here</p>
            </div>

            <button
              onClick={() => router.push("/talent/dashboard")}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
