"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  const quickFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      setUser(res);
      if (res.role === "talent") router.push("/talent/dashboard");
      else if (res.role === "client" || res.role === "brand") router.push("/client/dashboard");
      else if (res.role === "agent") router.push("/agent/dashboard");
      else router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold">
              FL
            </div>
            <span className="font-semibold text-lg tracking-wide">FACE LIBRARY</span>
          </Link>
          <h1 className="text-3xl font-medium mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          {/* Demo Credentials Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                i
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Demo Account</p>
                <p className="text-xs text-blue-700">
                  Use these credentials to explore the platform:
                </p>
                <div className="mt-2 text-xs font-mono bg-white border border-blue-200 rounded p-2 text-blue-900">
                  <div>Email: test@gmail.com</div>
                  <div>Password: test</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-right">
              <Link href="#" className="text-sm text-gray-600 hover:text-black">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Log In</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Registration Options */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Register as:</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/talent/register" className="text-gray-600 hover:text-black">Talent</Link>
            <span className="text-gray-300">&bull;</span>
            <Link href="/client/register" className="text-gray-600 hover:text-black">Brand</Link>
            <span className="text-gray-300">&bull;</span>
            <Link href="/agent/register" className="text-gray-600 hover:text-black">Agency</Link>
          </div>
        </div>

        {/* Quick-Fill Demo Buttons */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-3 text-center">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickFill("test@gmail.com", "test")}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:border-black hover:text-black transition-colors"
            >
              Login as Talent
            </button>
            <button
              onClick={() => quickFill("agent@gmail.com", "test")}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:border-black hover:text-black transition-colors"
            >
              Login as Agent
            </button>
            <button
              onClick={() => quickFill("brand@gmail.com", "test")}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:border-black hover:text-black transition-colors"
            >
              Login as Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
