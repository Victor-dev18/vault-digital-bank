"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer State
  const [receiverEmail, setReceiverEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState(null); 

  // Top Up State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpStatus, setTopUpStatus] = useState(null);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const balanceRes = await fetch("https://vault-digital-bank.onrender.com/api/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const txRes = await fetch("https://vault-digital-bank.onrender.com/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!balanceRes.ok) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      setUserData(await balanceRes.json());
      setTransactions(await txRes.json());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferStatus(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://vault-digital-bank.onrender.com/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverEmail, amount: Number(transferAmount) }),
      });

      const data = await res.json();

      if (res.ok) {
        setTransferStatus({ type: "success", text: data.message });
        setReceiverEmail("");
        setTransferAmount("");
        fetchDashboardData(); 
      } else {
        setTransferStatus({ type: "error", text: data.message });
      }
    } catch (err) {
      setTransferStatus({ type: "error", text: "Connection error." });
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    setTopUpStatus(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://vault-digital-bank.onrender.com/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(topUpAmount) }),
      });

      const data = await res.json();

      if (res.ok) {
        setTopUpStatus({ type: "success", text: data.message });
        setTopUpAmount("");
        fetchDashboardData(); 
        
        setTimeout(() => {
          setShowTopUpModal(false);
          setTopUpStatus(null);
        }, 2000);
      } else {
        setTopUpStatus({ type: "error", text: data.message });
      }
    } catch (err) {
      setTopUpStatus({ type: "error", text: "Connection error." });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D6FF38] border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans pb-12 relative">
      
      {/* Top Navigation */}
      <nav className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <h1 className="text-2xl font-black tracking-tighter">
          Vault<span className="text-[#c1e630]">Digital</span>
        </h1>
        
        <div className="flex items-center gap-4">
          
          {/* THE SECRET ADMIN BUTTON - Only shows for secure@digitalbank.com */}
          {userData?.email === "secure@digitalbank.com" && (
            <button 
              onClick={() => router.push("/admin")}
              className="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-sm uppercase tracking-wider hidden sm:block"
            >
              Admin Portal
            </button>
          )}

          <div className="w-10 h-10 bg-slate-900 text-[#D6FF38] rounded-full flex items-center justify-center font-bold text-lg shadow-md">
            {userData.name.charAt(0)}
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="mb-6 lg:hidden">
          <h2 className="text-3xl font-extrabold tracking-tight">Hey, {userData.name.split(' ')[0]} <span className="text-2xl">👋</span></h2>
          <p className="text-slate-500 font-medium mt-1">Ready for your next transaction?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="hidden lg:block mb-8">
              <h2 className="text-4xl font-extrabold tracking-tight">Hey, {userData.name.split(' ')[0]} <span className="text-3xl">👋</span></h2>
              <p className="text-slate-500 font-medium mt-2">Ready for your next transaction?</p>
            </div>

            {/* Neon Balance Card */}
            <div className="bg-[#D6FF38] rounded-[2rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-800 font-semibold tracking-wide uppercase text-sm">Your Balance</p>
                  <span className="bg-black text-[#D6FF38] text-xs font-bold px-3 py-1 rounded-full">VISA</span>
                </div>
                <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">
                  ₹{userData.balance.toLocaleString()}
                </h2>
                <div className="mt-12 flex justify-between items-end text-slate-800 font-semibold">
                  <div>
                    <p className="text-xs opacity-60 uppercase tracking-widest">Account Number</p>
                    <p className="tracking-widest mt-1 text-lg">**** 9934</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-60 uppercase tracking-widest">Valid Thru</p>
                    <p className="mt-1 text-lg">05/28</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-900">Recent Transactions</h3>
                <span className="text-sm font-bold text-slate-400 cursor-pointer hover:text-black transition-colors">View All</span>
              </div>
              
              {transactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8 font-medium">No recent activity.</p>
              ) : (
                <div className="space-y-6">
                  {transactions.map((tx) => {
                    const isSender = tx.sender.email === userData.email;
                    return (
                      <div key={tx._id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isSender ? 'bg-slate-100 text-slate-900' : 'bg-[#D6FF38] text-black'}`}>
                            {isSender ? '↗' : '↙'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                              {isSender ? tx.receiver.name : tx.sender.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-sm text-slate-500 font-medium">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </p>
                              {tx.isFlagged && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Review
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`font-black text-xl tracking-tight ${isSender ? 'text-slate-900' : 'text-green-600'}`}>
                          {isSender ? '-' : '+'}₹{tx.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Dark Mode Transfer Card */}
            <div className="bg-[#1A1C22] rounded-[2rem] p-6 sm:p-8 shadow-xl text-white">
              <h3 className="text-2xl font-extrabold mb-2">Transfer Money</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">Send funds securely via Vault Network.</p>
              
              {transferStatus && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${transferStatus.type === 'success' ? 'bg-[#D6FF38]/10 text-[#D6FF38]' : 'bg-red-500/10 text-red-400'}`}>
                  {transferStatus.text}
                </div>
              )}

              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Send to</label>
                  <input
                    type="email"
                    required
                    placeholder="friend@digitalbank.com"
                    className="w-full mt-2 px-5 py-4 bg-[#2A2D35] text-white rounded-2xl border-none focus:ring-2 focus:ring-[#D6FF38] outline-none transition-all placeholder-slate-500 font-medium"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Amount</label>
                  <div className="relative mt-2">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0.00"
                      className="w-full pl-10 pr-5 py-4 bg-[#2A2D35] text-white rounded-2xl border-none focus:ring-2 focus:ring-[#D6FF38] outline-none transition-all font-black text-xl placeholder-slate-500"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#D6FF38] text-black font-black text-lg py-4 rounded-2xl hover:bg-[#c1e630] transition-colors mt-4 shadow-[0_0_20px_rgba(214,255,56,0.2)]">
                  Confirm Transfer
                </button>
              </form>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-2">↓</div>
                  <p className="font-bold text-sm text-slate-900">Request</p>
               </div>
               <div onClick={() => setShowTopUpModal(true)} className="bg-slate-50 p-4 rounded-2xl text-center cursor-pointer hover:bg-[#D6FF38]/20 transition-colors group">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#D6FF38] group-hover:text-black transition-colors">+</div>
                  <p className="font-bold text-sm text-slate-900">Top Up</p>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Top Up Modal Overlay */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowTopUpModal(false); setTopUpStatus(null); }} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 font-bold transition-colors"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-black mb-1 text-slate-900">Add Money</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Deposit funds into your Vault account.</p>

            {topUpStatus && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${topUpStatus.type === 'success' ? 'bg-[#D6FF38]/20 text-slate-900' : 'bg-red-50 text-red-700'}`}>
                {topUpStatus.text}
              </div>
            )}

            <form onSubmit={handleTopUp} className="space-y-4">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 text-slate-900 rounded-2xl border-2 border-slate-100 focus:border-[#D6FF38] focus:ring-0 outline-none transition-all font-black text-2xl"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-[#D6FF38] font-black text-lg py-4 rounded-2xl hover:bg-black transition-colors shadow-xl"
              >
                Deposit Funds
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}