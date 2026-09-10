import React from 'react';
import {
  LayoutDashboard,
  ChefHat,
  ScanEye,
  HeartHandshake,
  Truck,
  Activity,
  Award,
  LogOut,
  Info,
  X,
  Layers,
} from 'lucide-react';
import { AppView, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onCloseMobile,
  onLogout,
}) => {
  const { user, role } = useAuth();

  // Navigation items structured as ONE logical product workflow
  const allNavItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard, roles: ['kitchen_operator', 'ngo', 'admin'] },
    { id: 'kitchen' as AppView, label: 'Kitchen & Demand AI', icon: ChefHat, roles: ['kitchen_operator', 'admin'] },
    { id: 'quality' as AppView, label: 'Food Safety Check', icon: ScanEye, roles: ['kitchen_operator', 'admin'] },
    { id: 'rescue' as AppView, label: 'Food Rescue & Surplus', icon: HeartHandshake, roles: ['kitchen_operator', 'ngo', 'admin'] },
    { id: 'logistics' as AppView, label: 'Logistics & Deliveries', icon: Truck, roles: ['kitchen_operator', 'ngo', 'admin'] },
    { id: 'telemetry' as AppView, label: 'Cold Chain (Simulated)', icon: Activity, roles: ['kitchen_operator', 'admin'] },
    { id: 'impact' as AppView, label: 'Impact & ESG', icon: Award, roles: ['kitchen_operator', 'ngo', 'admin'] },
    { id: 'landing' as AppView, label: 'Project Story (5yo)', icon: Info, roles: ['kitchen_operator', 'ngo', 'admin'], isSpecial: true },
  ];

  // Filter based on active role
  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#133830] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } border-r border-[#0E2B25]`}
      >
        {/* Top Brand & Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div
              onClick={() => {
                onNavigate('dashboard');
                onCloseMobile();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Illustrated Grocery Bag Logo */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FA8128] to-[#FF9F45] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Food<span className="text-[#FA8128]">ResQ</span>
                </h1>
                <p className="text-[11px] text-[#96B3AB] tracking-wide font-medium">
                  Rescue Food. Reduce Waste.
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-[#96B3AB] hover:text-white hover:bg-[#1B4A3F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FA8128] text-white shadow-lg shadow-[#FA8128]/25 scale-[1.02]'
                      : 'text-[#96B3AB] hover:bg-[#1B4A3F] hover:text-white'
                  } ${item.isSpecial && !isActive ? 'bg-[#184239] text-[#E0F2FE]' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-white' : 'text-[#96B3AB]'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.isSpecial && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FA8128]/30 text-white border border-[#FA8128]/40">
                      Story
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-6 pt-0">
          {/* Active User Persona Card */}
          <div className="mb-4 p-3.5 rounded-2xl bg-[#184239] border border-[#225348]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FA8128] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar_initials || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">
                  {user?.full_name || 'Logged In User'}
                </p>
                <p className="text-[10px] text-[#96B3AB] truncate">
                  {user?.organization_name}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#225348]/60 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                {role === 'kitchen_operator' ? 'Kitchen Operator' : role === 'ngo' ? 'NGO Receiver' : 'System Admin'}
              </span>
              <button
                onClick={onLogout}
                className="text-[11px] text-[#96B3AB] hover:text-[#FA8128] font-bold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
