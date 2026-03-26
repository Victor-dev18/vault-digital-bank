"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [flaggedData, setFlaggedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // 1. Fetch the flagged transactions when the page loads
  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/flagged", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If the backend bouncer says "Access Denied" (Not an admin), kick them to the regular dashboard!
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setFlaggedData(data.alerts || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. The function to freeze/unfreeze a user
  const handleToggleFreeze = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/block/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setActionMessage({ type: "success", text: data.message });
        // Hide the message after 3 seconds
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setActionMessage({ type: "error", text: "Server connection failed." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <p className="text-red-500 font-bold tracking-widest animate-pulse">VERIFYING CLEARANCE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white font-sans pb-12">
      
      {/* Admin Top Navigation */}
      <nav className="bg-[#1A1D24] px-6 py-4 flex justify-between items-center border-b border-red-900/30 shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Vault<span className="text-red-500">Security</span>
          </h1>
        </div>
        <Link 
          href="/dashboard" 
          className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Wallet
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Command Center</h2>
          <p className="text-slate-400 font-medium mt-1">Monitor high-value transactions and manage account access.</p>
        </div>

        {/* Action Status Message */}
        {actionMessage && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${actionMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {actionMessage.text}
          </div>
        )}

        {/* Flagged Transactions Grid */}
        <div className="bg-[#1A1D24] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm">
                {flaggedData.length} Alerts
              </span>
              Flagged Transactions
            </h3>
          </div>
          
          {flaggedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-4xl mb-3">✓</div>
              <p className="text-slate-400 font-medium">All clear. No suspicious activity detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedData.map((tx) => (
                <div key={tx._id} className="bg-[#0F1115] p-5 rounded-2xl border border-red-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red-500/50 transition-colors">
                  
                  {/* Transaction Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        High Value
                      </span>
                      <p className="text-sm text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-white text-lg">
                      {tx.sender.name} <span className="text-slate-500 mx-2">→</span> {tx.receiver.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{tx.sender.email}</p>
                  </div>

                  {/* Amount and Action Button */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <div className="font-black text-2xl text-red-400 tracking-tight">
                      ₹{tx.amount.toLocaleString()}
                    </div>
                    
                    {/* The Freeze Toggle Button! */}
                    <button 
                      onClick={() => handleToggleFreeze(tx.sender._id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 font-bold text-sm px-4 py-2 rounded-lg transition-all"
                    >
                      Toggle Account Freeze
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}