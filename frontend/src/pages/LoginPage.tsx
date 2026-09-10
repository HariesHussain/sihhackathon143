import React, { useState } from 'react';
import { ChefHat, HeartHandshake, Shield, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('chef@abckitchen.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (ok) {
      onSuccess();
    } else {
      setError('Invalid email or password (password must be at least 6 characters).');
    }
  };

  const handleQuick = (role: UserRole) => {
    quickLogin(role);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center max-w-md mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEADB] border border-[#FFDEC4] text-[#FA8128] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FoodResQ Authentication Portal</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FA8128] to-[#FF9F45] flex items-center justify-center shadow-lg">
            <span className="text-2xl">🍱</span>
          </div>
          <h1 className="text-3xl font-black text-[#133830] tracking-tight">
            Food<span className="text-[#FA8128]">ResQ</span>
          </h1>
        </div>
        <p className="text-xs text-[#64748B] mt-2 font-medium">
          Rescue Food. Reduce Waste. Connect institutional kitchens directly with community shelters.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Fast 1-Click Demo Login Cards (For Judges & Presenters) */}
        <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#133830]">
              Fast 1-Click Demo Sign-In
            </span>
            <span className="text-[10px] font-bold text-[#FA8128] bg-orange-100 px-2 py-0.5 rounded-full">
              For Judges
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleQuick('kitchen_operator')}
              className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF3E8] border border-[#F0EAE1] hover:border-[#FA8128] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFEADB] text-[#FA8128] flex items-center justify-center font-bold">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#133830] group-hover:text-[#FA8128] transition-colors">
                    Kitchen Operator View
                  </p>
                  <p className="text-[11px] text-[#64748B]">Chef Rajesh Sharma • ABC College Kitchen</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FA8128] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => handleQuick('ngo')}
              className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#E1F7E8] border border-[#F0EAE1] hover:border-[#16A34A] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#133830] group-hover:text-[#16A34A] transition-colors">
                    NGO / Community Shelter View
                  </p>
                  <p className="text-[11px] text-[#64748B]">Aman Verma • Robin Hood Army Shelter</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => handleQuick('admin')}
              className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#E1F1FD] border border-[#F0EAE1] hover:border-[#0284C7] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#133830] group-hover:text-[#0284C7] transition-colors">
                    System Administrator View
                  </p>
                  <p className="text-[11px] text-[#64748B]">Dr. Sunita Mehra • Overall Network Oversight</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#133830] mb-4">
            Or Sign In With Email
          </h3>

          <form onSubmit={handleManualLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@abckitchen.edu"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium text-[#133830] focus:outline-none focus:border-[#FA8128]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium text-[#133830] focus:outline-none focus:border-[#FA8128]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to FoodResQ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
