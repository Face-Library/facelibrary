"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/lib/auth";

const steps = [
  { name: "Profile Information", completed: true },
  { name: "Verification", completed: false },
  { name: "Face Digits", completed: false },
  { name: "Body Digits", completed: false },
  { name: "Identity Video", completed: false },
  { name: "Permissions", completed: false },
];

const faceDigits = [
  "Front", "Left Profile", "Right Profile", "3/4 Left",
  "3/4 Right", "Head Up", "Head Down", "Neutral",
  "Smile", "Eyes Closed", "Eyes Open", "Back Head",
];

const faceVideos = ["Neutral Talking", "Smile", "Turn Head"];

const bodyDigits = [
  "Full Body Front", "Left", "Right", "Back",
  "3/4 Left", "3/4 Right", "Walking", "Turn 360",
];

export default function AddTalentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [talentName] = useState("New Talent");
  const agency = user?.name || "Your Agency";
  const [status] = useState("In Progress");

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/agent/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-start justify-between flex-wrap gap-6">
            {/* Left: Talent Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{talentName}</h1>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-gray-600">
                  Agency: <span className="font-medium text-black">{agency}</span>
                </span>
                <span className="text-gray-600">
                  Status: <span className="font-medium text-orange-600">{status}</span>
                </span>
              </div>
            </div>

            {/* Right: Progress */}
            <div className="w-full md:w-80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-gray-700">
                  {completedCount}/{steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {steps.map((step) => (
                  <div key={step.name} className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={`text-xs ${step.completed ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Section 1 - Face Digits */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1">Face Digits</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload 12 face photos covering different angles and expressions
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {faceDigits.map((label) => (
              <div
                key={label}
                className="aspect-square bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 shadow-sm"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 text-center px-3 leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 - Face Video */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1">Face Video</h2>
          <p className="text-sm text-gray-600 mb-6">Short face video clips</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {faceVideos.map((label) => (
              <div
                key={label}
                className="aspect-square bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 shadow-sm"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 text-center px-3 leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 - Body Digits */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1">Body Digits</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload 8 body photos covering different angles and poses
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bodyDigits.map((label) => (
              <div
                key={label}
                className="aspect-square bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 shadow-sm"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 text-center px-3 leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 - Identity Video */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1">Identity Video</h2>
          <p className="text-sm text-gray-600 mb-6">Record a video confirming identity</p>

          <div className="max-w-2xl">
            <div className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 shadow-sm p-8">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-3">Record Video</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Example script:</p>
                  <p className="italic">&ldquo;Hello, my name is...&rdquo;</p>
                  <p className="italic">&ldquo;I am from...&rdquo;</p>
                  <p className="italic">&ldquo;This video confirms my identity.&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-900 hover:text-black transition-colors">
            Save Draft
          </button>
          <button
            onClick={() => router.push("/agent/dashboard")}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Submit Talent
          </button>
        </div>
      </div>
    </div>
  );
}
