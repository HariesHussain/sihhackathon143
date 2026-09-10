import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AppView, UserRole, UserProfile } from '../../types';
import { setAuthToken } from '../../services/api';

interface TopbarProps {
  currentView: AppView;
  onOpenMobileSidebar: () => void;
  user: UserProfile;
  onChangeUserRole: (role: UserRole) => void;
}

const VIEW_TITLES: Record<AppView, { section: string; title: string }> = {
  landing: { section: 'Project Overview', title: 'FoodResQ Mission & Story' },
  dashboard: { section: 'Analytics', title: 'Executive Operations Dashboard' },
  kitchen: { section: 'Production Planning', title: 'AI Meal Demand Forecasting' },
  quality: { section: 'Safety Inspection', title: 'Computer Vision Freshness Scanner' },
  redistribution: { section: 'Beneficiary Network', title: 'Logistics Dispatcher & NGO Routing' },
  telemetry: { section: 'Industrial Line', title: 'Cold-Chain IoT Sentinel & Anomaly Engine' },
  esg: { section: 'Regulatory Audit', title: 'ESG Carbon Ledger & MoFPI Certification' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onOpenMobileSidebar,
  user,
  onChangeUserRole,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { role: UserRole; title: string; name: string; org: string }[] = [
    {
      role: 'KITCHEN_OPERATOR',
      title: 'Head Chef / Kitchen Operator',
      name: 'Chef Rajesh Sharma',
      org: 'Central Institutional Mess',
    },
    {
      role: 'PLANT_SUPERVISOR',
      title: 'Industrial Plant Supervisor',
      name: 'Vikram Sengupta',
      org: 'Mega Food Processing Unit Beta',
    },
    {
      role: 'NGO_REPRESENTATIVE',
      title: 'NGO Logistics Coordinator',
      name: 'Priya Nair',
      org: 'Feeding India & Robin Hood Army Hub',
    },
    {
      role: 'REGULATOR_AUDITOR',
      title: 'MoFPI Regulatory Auditor',
      name: 'Dr. Sunita Mehra',
      org: 'Ministry of Food Processing Industries',
    },
  ];

  const handleSelectRole = (newRole: UserRole) => {
    onChangeUserRole(newRole);
    setAuthToken(newRole);
    setShowRoleMenu(false);
  };

  const currentInfo = VIEW_TITLES[currentView] || { section: 'Dashboard', title: 'FoodResQ Platform' };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#F0EAE1] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb (Matches Sepetbox top header) */}
      <div className="flex items-center gap-4">
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
          <h2 className="text-lg sm:text-xl font-extrabold text-[#133830] tracking-tight">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Sentinel Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>AI Mesh Synchronized</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl bg-white border border-[#F0EAE1] text-[#1E293B] hover:bg-[#F8F5EE] transition-all shadow-sm relative"
          >
            <Bell className="w-4 h-4 text-[#64748B]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FA8128]" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#F0EAE1] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                <h4 className="text-sm font-bold text-[#133830]">Operational Alerts (3)</h4>
                <span className="text-[11px] font-semibold text-[#FA8128] cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-3 mt-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Cold Silo #3 Temperature Drift</p>
                    <p className="text-[11px] text-amber-700">Door ajar warning: Chamber holding at 7.8°C (setpoint 6.0°C).</p>
                    <span className="text-[10px] text-amber-600/80 mt-1 block font-medium">3 mins ago</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Surplus Batch Verified</p>
                    <p className="text-[11px] text-emerald-700">140 portions Basmati Rice safely handed over to Robin Hood Army.</p>
                    <span className="text-[10px] text-emerald-600/80 mt-1 block font-medium">18 mins ago</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200/60 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-sky-900">MoFPI Carbon Ledger Updated</p>
                    <p className="text-[11px] text-sky-700">+87.5 kg CO₂e offset verified with SHA-256 cryptographic seal.</p>
                    <span className="text-[10px] text-sky-600/80 mt-1 block font-medium">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher (For Hackathon Judges) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-white border border-[#F0EAE1] hover:bg-[#F8F5EE] transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FA8128] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-[#133830] leading-tight flex items-center gap-1">
                {user.name}
              </p>
              <p className="text-[10px] font-semibold text-[#FA8128] uppercase tracking-wider">
                {user.roleTitle}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
          </button>

          {/* Role Switcher Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#F0EAE1] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 border-b border-[#F0EAE1] mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                  Demo Quick Role Switcher
                </span>
                <p className="text-xs text-[#64748B]">Switch persona to test role workflows:</p>
              </div>

              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col ${
                      user.role === r.role
                        ? 'bg-[#FA8128] text-white font-bold shadow-md shadow-orange-500/20'
                        : 'hover:bg-[#FAF7F2] text-[#133830]'
                    }`}
                  >
                    <span className="font-bold">{r.title}</span>
                    <span className={`text-[11px] ${user.role === r.role ? 'text-white/80' : 'text-[#64748B]'}`}>
                      {r.name} • {r.org}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
