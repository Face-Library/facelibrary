"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft } from "lucide-react";

const faceExamples = [
  { label: "Front", image: "https://images.unsplash.com/photo-1657152042392-c1f39e52e7c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Left", image: "https://images.unsplash.com/photo-1769555949533-703d68e62a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Right", image: "https://images.unsplash.com/photo-1769555949533-703d68e62a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Turn Left", image: "https://images.unsplash.com/photo-1701163802894-99fa45f1c83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Turn Right", image: "https://images.unsplash.com/photo-1701163802894-99fa45f1c83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
];

const bodyExamples = [
  { label: "Front", image: "https://images.unsplash.com/photo-1683849117628-a19fb076621b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Left", image: "https://images.unsplash.com/photo-1699787167971-db840f61c3bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Right", image: "https://images.unsplash.com/photo-1699787167971-db840f61c3bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Back", image: "https://images.unsplash.com/photo-1699787167971-db840f61c3bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
  { label: "Three-Quarter", image: "https://images.unsplash.com/photo-1683849117628-a19fb076621b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" },
];

export default function CreateAvatarPage() {
  const router = useRouter();
  const [facePhotos, setFacePhotos] = useState<File[]>([]);
  const [bodyPhotos, setBodyPhotos] = useState<File[]>([]);

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFacePhotos(Array.from(e.target.files));
  };

  const handleBodyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setBodyPhotos(Array.from(e.target.files));
  };

  const handleGenerate = () => {
    router.push("/avatar-generating");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center text-xs font-bold">FL</div>
            <span className="font-semibold text-base tracking-wide">FACE LIBRARY</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-8 py-12">
        <button onClick={() => router.push("/talent/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-3">Create Your Avatar</h1>
          <p className="text-gray-600 mb-2">Upload photos of your face and body so we can generate your digital likeness.</p>
          <p className="text-sm text-gray-500">Follow the examples below to ensure the best avatar quality.</p>
        </div>

        {/* Face Photos */}
        <div className="bg-gray-50 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Upload Face Photos</h2>
          <p className="text-sm text-gray-600 mb-6">Upload 5 photos of your face from different angles.</p>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {faceExamples.map((ex) => (
              <div key={ex.label} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.image} alt={ex.label} className="w-full aspect-[3/4] object-cover rounded-lg mb-2 border border-gray-200" />
                <p className="text-xs text-gray-600 font-medium">{ex.label}</p>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input type="file" id="face-upload" multiple accept="image/jpeg,image/png" onChange={handleFaceUpload} className="hidden" />
            <label htmlFor="face-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-1">Upload 5 face photos</p>
              <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">JPG / PNG &bull; Max 10MB per image</p>
            </label>
            {facePhotos.length > 0 && (
              <p className="text-sm text-green-600 mt-3">{facePhotos.length} file(s) selected</p>
            )}
          </div>
        </div>

        {/* Body Photos */}
        <div className="bg-gray-50 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Upload Full Body Photos</h2>
          <p className="text-sm text-gray-600 mb-6">Upload 5 full-body photos from different angles.</p>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {bodyExamples.map((ex) => (
              <div key={ex.label} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.image} alt={ex.label} className="w-full aspect-[3/4] object-cover rounded-lg mb-2 border border-gray-200" />
                <p className="text-xs text-gray-600 font-medium">{ex.label}</p>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input type="file" id="body-upload" multiple accept="image/jpeg,image/png" onChange={handleBodyUpload} className="hidden" />
            <label htmlFor="body-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-1">Upload 5 full-body photos</p>
              <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">JPG / PNG &bull; Max 10MB per image</p>
            </label>
            {bodyPhotos.length > 0 && (
              <p className="text-sm text-green-600 mt-3">{bodyPhotos.length} file(s) selected</p>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
          <h3 className="font-semibold mb-3 text-sm">Photo Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><span className="text-blue-600">&bull;</span>Use neutral facial expression</li>
            <li className="flex items-start gap-2"><span className="text-blue-600">&bull;</span>Stand in good lighting</li>
            <li className="flex items-start gap-2"><span className="text-blue-600">&bull;</span>Avoid sunglasses or hats</li>
            <li className="flex items-start gap-2"><span className="text-blue-600">&bull;</span>Plain background preferred</li>
            <li className="flex items-start gap-2"><span className="text-blue-600">&bull;</span>Full body must be clearly visible</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/talent/dashboard")} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-black hover:text-black transition-colors">
            Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={facePhotos.length === 0 || bodyPhotos.length === 0}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Generate Avatar
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your avatar will be generated using AI after verification.
        </p>
      </main>
    </div>
  );
}
