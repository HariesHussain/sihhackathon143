import React from 'react';
import { Menu, ChevronDown, RefreshCw, Database, Sparkles, UserCheck } from 'lucide-react';
import { AppView, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

interface TopbarProps {
  currentView: AppView;
  onOpenMobileSidebar: () => void;
  onDataMutated: () => void;
}

const VIEW_TITLES: Record<AppView, { section: string; title: string }> = {
  landing: { section: 'Project Story', title: 'Why FoodResQ Exists (5-Year-Old Explanation)' },
  dashboard: { section: 'Overview', title: 'Operational Activity Dashboard' },
  kitchen: { section: 'Production', title: 'Demand Prediction & Food Batches' },
  batches: { section: 'Production', title: 'Food Preparation Batches' },
  quality: { section: 'Safety Inspection', title: '3-Photo Food Safety Check' },
  rescue: { section: 'Redistribution', title: 'Surplus Declarations & NGO Matching' },
  logistics: { section: 'Deliveries', title: 'Active Deliveries & OTP Handover' },
  telemetry: { section: 'IoT Sentinel', title: 'Cold-Chain Telemetry (Simulated Sensor)' },
  impact: { section: 'Sustainability', title: 'Environmental & Monetary Impact' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onOpenMobileSidebar,
  onDataMutated,
}) => {
  const { user, role, switchRole } = useAuth();
  const currentInfo = VIEW_TITLES[currentView] || { section: 'FoodResQ', title: 'Food Rescue Platform' };

  const handleLoadDemo = () => {
    db.loadDemoData();
    onDataMutated();
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean empty state? (All counts will return to 0)')) {
      db.resetData();
      onDataMutated();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#F0EAE1] px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white border border-[#F0EAE1] text-[#133830] hover:bg-[#F0EAE1] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
            <span className="text-[#FA8128]">FoodResQ</span>
            <span>&gt;</span>
            <span className="text-[#133830] font-bold">{currentInfo.section}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#133830] tracking-tight">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Demo Persona Switcher & Demo Data Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Quick Persona Switcher for Hackathon Judges */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#F0EAE1] rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 hidden md:inline">
            Role:
          </span>
          <button
            onClick={() => switchRole('kitchen_operator')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              role === 'kitchen_operator'
                ? 'bg-[#FA8128] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#133830]'
            }`}
          >
            Kitchen
          </button>
          <button
            onClick={() => switchRole('ngo')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              role === 'ngo'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#133830]'
            }`}
          >
            NGO Shelter
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              role === 'admin'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#133830]'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Load Demo / Reset Data Buttons for Testing */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleLoadDemo}
            title="Populate realistic demo records to demonstrate the complete workflow"
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-bold text-[#133830] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#FA8128]" />
            <span className="hidden sm:inline">Load Demo Data</span>
          </button>

          <button
            onClick={handleResetData}
            title="Reset to 0 activity so you can demo from scratch"
            className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-[#F0EAE1] text-[#64748B] hover:text-rose-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
