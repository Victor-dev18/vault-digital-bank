"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Next.js tool for fast page loading

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // Holds success or error messages

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Show a green message and send them to the login page after 2 seconds
        setStatus({ type: "success", text: "Account created! Redirecting to login..." });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setStatus({ type: "error", text: data.message });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Cannot connect to server." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-slate-200">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Vault<span className="text-blue-900">Digital</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Open your secure account today.
          </p>
        </div>

        {status && (
          <div className={`p-3 rounded-lg mb-6 text-sm font-bold text-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-900/30 transition-all shadow-md mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/" className="font-bold text-blue-900 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}