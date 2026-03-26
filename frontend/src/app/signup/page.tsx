"use client";

import Link from "next/link";
import { User, Building2, Users } from "lucide-react";

const roles = [
  {
    key: "talent",
    icon: User,
    title: "Register as Talent",
    description: "Protect your likeness, create your digital avatar, and earn from licensing",
    href: "/talent/register",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "brand",
    icon: Building2,
    title: "Register as Brand",
    description: "Find talent, create campaigns, and manage licensing contracts",
    href: "/client/register",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    key: "agency",
    icon: Users,
    title: "Register as Agency",
    description: "Manage talent roster, generate contracts, and review deals",
    href: "/agent/register",
    color: "bg-green-50 border-green-200 hover:border-green-400",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold">
              FL
            </div>
            <span className="font-semibold text-lg tracking-wide">FACE LIBRARY</span>
          </Link>
          <h1 className="text-3xl font-medium mb-2">Choose Your Role</h1>
          <p className="text-gray-600">
            Select how you want to use Face Library
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.key}
                href={role.href}
                className={`w-full border-2 rounded-xl p-6 transition-all ${role.color} text-left flex items-center gap-4 group block`}
              >
                <div className={`w-16 h-16 rounded-xl ${role.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${role.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Tip:</strong> You can switch between roles later from your profile settings.
          </p>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
