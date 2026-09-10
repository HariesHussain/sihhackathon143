import React from 'react';
import {
  LayoutDashboard,
  ChefHat,
  ScanEye,
  MapPin,
  Activity,
  Award,
  LogOut,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { AppView } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'landing' as AppView, label: 'About Project (Story)', icon: Info, isSpecial: true },
    { id: 'dashboard' as AppView, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'kitchen' as AppView, label: 'Kitchen & Demand AI', icon: ChefHat },
    { id: 'quality' as AppView, label: 'Quality & Freshness', icon: ScanEye },
    { id: 'redistribution' as AppView, label: 'Logistics & NGO Map', icon: MapPin },
    { id: 'telemetry' as AppView, label: 'Plant & Cold Chain', icon: Activity },
    { id: 'esg' as AppView, label: 'ESG & Compliance', icon: Award },
  ];

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
                onNavigate('landing');
                onCloseMobile();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Cute Bag / Grocery Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FA8128] to-[#FF9F45] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍱</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                    Food<span className="text-[#FA8128]">ResQ</span>
                  </h1>
                </div>
                <p className="text-[11px] text-[#96B3AB] tracking-wide uppercase font-semibold">
                  MoFPI Food Waste AI
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-[#96B3AB] hover:text-white hover:bg-[#1B4A3F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FA8128] text-white shadow-lg shadow-[#FA8128]/25 font-bold scale-[1.02]'
                      : 'text-[#96B3AB] hover:bg-[#1B4A3F] hover:text-white'
                  } ${item.isSpecial && !isActive ? 'bg-[#184239] text-[#E0F2FE]' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
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

        {/* Bottom Graphic & Footer (Matches Sepetbox Grocery Bag Illustration) */}
        <div className="p-6 pt-0">
          {/* Grocery Bag Illustration Card */}
          <div className="relative mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#184239] to-[#0E2B25] border border-[#225348]/40 text-center overflow-hidden">
            <div className="flex justify-center mb-2">
              {/* Illustrated Grocery Bag Elements */}
              <div className="relative">
                <div className="text-4xl filter drop-shadow-md">🛍️</div>
                <div className="absolute -top-2 -right-3 text-lg animate-bounce">🥕</div>
                <div className="absolute -top-2 -left-3 text-lg">🥖</div>
              </div>
            </div>
            <h4 className="text-xs font-bold text-white mb-0.5">
              Zero Waste Mission
            </h4>
            <p className="text-[11px] text-[#96B3AB] leading-relaxed">
              Target 12.3: 50% Reduction in Food Waste by 2030
            </p>
          </div>

          {/* Quick Info & Logout */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1B4A3F]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#96B3AB] font-medium">
                Live Sentinel Mesh
              </span>
            </div>
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 text-xs text-[#96B3AB] hover:text-[#FA8128] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
