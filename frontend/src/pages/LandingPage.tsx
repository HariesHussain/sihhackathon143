import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  CloudRain,
  Camera,
  Truck,
  KeyRound,
  CheckCircle,
  Leaf,
  Droplets,
  HeartHandshake,
  Users,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { AppView } from '../types';

interface LandingPageProps {
  onEnterApp: (view?: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeAgentTab, setActiveAgentTab] = useState(0);

  const agents = [
    {
      id: 1,
      name: 'Agent 1: Demand & Production Planner',
      icon: CloudRain,
      color: 'from-amber-500 to-orange-500',
      role: 'Proactive Kitchen Turnout & Procurement Forecaster',
      description:
        'Uses historical 90-day attendance logs, weather forecasts (monsoons/heatwaves), and university academic/holiday schedules to predict exact portion requirements 12–24h ahead. Recommends bulk raw ingredient procurement quantities.',
      metric: 'MAPE < 6.5% Attendance Accuracy',
    },
    {
      id: 2,
      name: 'Agent 2: Vision & Sensor Quality Auditor',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      role: 'Multi-Modal Food Safety & Freshness Inspector',
      description:
        'Combines visual image analysis (oxidation browning, surface texture loss) with holding temperature and elapsed time to output a standardized Freshness Index (0-100) and Safe Redistribution Window.',
      metric: 'Fail-Safe Threshold: Temp > 25°C for > 4h blocks human consumption',
    },
    {
      id: 3,
      name: 'Agent 3: Logistics & Rapid Redistribution',
      icon: Truck,
      color: 'from-emerald-500 to-teal-500',
      role: 'Autonomous Route Optimizer & OTP Custody Verifier',
      description:
        'Matches declared edible surplus with verified shelter registries (NGOs) by distance matrix, computes nearest-neighbor multi-drop routes that arrive before expiry, and enforces 6-digit cryptographic handover OTPs.',
      metric: 'Arrival Time < Batch Expiry Window Guarantee',
    },
    {
      id: 4,
      name: 'Agent 4: Plant Telemetry Sentinel',
      icon: Cpu,
      color: 'from-rose-500 to-pink-500',
      role: 'Cold-Chain & Industrial Line Reliability Monitor',
      description:
        'Monitors RTD cold room sensors, silos, and industrial packaging line load in real-time. Detects thermal breaches (> 4°C drift), unannounced motor jams, and energy spikes within 30 seconds.',
      metric: 'Sub-30s Anomaly Trigger Alerting',
    },
    {
      id: 5,
      name: 'Agent 5: ESG & Compliance Officer',
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-500',
      role: 'Environmental & Groundwater Impact Auditor',
      description:
        'Audits verified food transfers and translates prevented waste into estimated greenhouse emissions avoided (2.5 kg CO₂e / kg food) and conserved groundwater (1,200 L / kg). Grounded in IPCC empirical factors.',
      metric: 'UN SDG 2, 12.3 & 13 Aligned Accounting',
    },
  ];

  const storySteps = [
    {
      step: '1',
      title: 'The Brainy Chef Helper 👨‍🍳',
      subtitle: 'Stopping waste before cooking starts',
      icon: CloudRain,
      bg: 'bg-[#FFEADB]',
      border: 'border-[#FFDEC4]',
      badge: '#FF9F45',
      desc: 'Early in the morning, FoodResQ checks the weather and calendar. If it is pouring rain and exams are ongoing, it tells the chef: "Only cook 800 plates today instead of 1,000!" So 200 plates are never wasted in the first place!',
    },
    {
      step: '2',
      title: 'The Magic Camera 📷',
      subtitle: 'Checking food freshness with AI vision',
      icon: Camera,
      bg: 'bg-[#E1F1FD]',
      border: 'border-[#CEE7FC]',
      badge: '#38BDF8',
      desc: 'If there is extra hot food left over, the camera inspects it: "Is the color bright? Is the temperature safe?" If the Freshness Score is 95%, it stamps it as Grade A and starts a safe delivery clock.',
    },
    {
      step: '3',
      title: 'The Quick Rocket Map 🗺️',
      subtitle: 'Finding nearby hungry shelters in seconds',
      icon: Truck,
      bg: 'bg-[#FEF6D8]',
      border: 'border-[#FDF0BE]',
      badge: '#FACC15',
      desc: 'FoodResQ scans nearby registered NGO kitchens and shelters. It picks the closest home with hungry children and calculates the fastest route: "Quick! Deliver in 14 minutes before the food cools down!"',
    },
    {
      step: '4',
      title: 'The Secret Magic Code 🔐',
      subtitle: 'Zero double-dipping, verified food delivery',
      icon: KeyRound,
      bg: 'bg-[#E1F7E8]',
      border: 'border-[#C8F2D4]',
      badge: '#4ADE80',
      desc: 'When the van arrives, the driver and the shelter teacher enter a secret 6-digit magic passcode. Once matched, the food is handed over safely, and a green tree is planted in our carbon ledger!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#F0EAE1] px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FA8128] to-[#FF9F45] flex items-center justify-center shadow-md">
            <span className="text-xl">🍱</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#133830]">
              Food<span className="text-[#FA8128]">ResQ</span>
            </span>
            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              MoFPI SIH26234
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="px-5 py-2.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 sm:px-12 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEADB] border border-[#FFDEC4] text-[#E6711B] text-xs font-bold mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Autonomous Food Waste Reduction Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#133830] tracking-tight leading-[1.1] mb-6">
            Rescue Every Meal. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA8128] to-[#FF9F45]">
              Zero Food to Landfills.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-8">
            An end-to-end intelligent network connecting institutional kitchens, food processing units, and NGO redistribution networks. Built with 5 autonomous AI sub-agents to predict demand, audit quality, route logistics, and certify ESG compliance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-7 py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-base shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2.5 scale-100 hover:scale-[1.02]"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('story-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F8F5EE] border border-[#F0EAE1] text-[#133830] font-bold text-base shadow-sm transition-all"
            >
              How It Works (5-Year-Old Story)
            </button>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="text-center p-3 border-b sm:border-b-0 sm:border-r border-[#F0EAE1]">
            <div className="w-10 h-10 rounded-2xl bg-[#FFEADB] text-[#FF9238] flex items-center justify-center mx-auto mb-2">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#133830]">46,125+</p>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Meals Rescued</p>
          </div>

          <div className="text-center p-3 border-b sm:border-b-0 lg:border-r border-[#F0EAE1]">
            <div className="w-10 h-10 rounded-2xl bg-[#E1F7E8] text-[#16A34A] flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#133830]">46.1 Tons</p>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">CO₂e Avoided</p>
          </div>

          <div className="text-center p-3 border-b sm:border-b-0 sm:border-r border-[#F0EAE1]">
            <div className="w-10 h-10 rounded-2xl bg-[#E1F1FD] text-[#0284C7] flex items-center justify-center mx-auto mb-2">
              <Droplets className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#133830]">22.1 M Litres</p>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Water Conserved</p>
          </div>

          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF6D8] text-[#EAB308] flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#133830]">92 Units</p>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Kitchens & NGOs Active</p>
          </div>
        </div>
      </section>

      {/* 5-Year-Old Explanation Storybook Section */}
      <section id="story-section" className="px-6 sm:px-12 py-16 bg-[#F5EFE6]/60 border-y border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FA8128] bg-orange-100/80 px-3 py-1 rounded-full">
              Simplified Story Mode 👶
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#133830] tracking-tight mt-3">
              How FoodResQ Works in 4 Easy Steps
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Explained so simply that anyone from a 5-year-old to a hackathon judge instantly gets it!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storySteps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className={`p-6 rounded-3xl ${s.bg} border ${s.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#133830]" />
                      </div>
                      <span className="text-xs font-black text-[#133830] bg-white/70 px-2.5 py-1 rounded-full">
                        Step {s.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#133830] mb-1">
                      {s.title}
                    </h3>
                    <p className="text-xs font-bold text-[#64748B] mb-3">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/5 flex items-center text-xs font-bold text-[#133830]">
                    <span>Automated by AI</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 AI Agents Multi-Agent Ecosystem Section */}
      <section className="px-6 sm:px-12 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#133830] bg-emerald-100 px-3 py-1 rounded-full">
            Autonomous Agent Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#133830] tracking-tight mt-3">
            5 Specialized AI Sub-Agents at Work
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Each agent handles a critical phase of the food supply chain with real-time pub/sub event orchestration.
          </p>
        </div>

        {/* Agent Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {agents.map((ag, idx) => (
            <button
              key={ag.id}
              onClick={() => setActiveAgentTab(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeAgentTab === idx
                  ? 'bg-[#133830] text-white shadow-md'
                  : 'bg-white border border-[#F0EAE1] text-[#64748B] hover:bg-[#F8F5EE]'
              }`}
            >
              <span>Agent {ag.id}</span>
            </button>
          ))}
        </div>

        {/* Selected Agent Display Card */}
        {(() => {
          const current = agents[activeAgentTab];
          const Icon = current.icon;
          return (
            <div className="bg-white border border-[#F0EAE1] rounded-3xl p-8 sm:p-10 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#133830]">
                      {current.name}
                    </h3>
                    <p className="text-xs font-bold text-[#FA8128] uppercase tracking-wider">
                      {current.role}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#475569] leading-relaxed mb-6">
                  {current.description}
                </p>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#1E293B]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Metric: {current.metric}</span>
                </div>
              </div>

              <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => {
                    const viewMap: Record<number, AppView> = {
                      1: 'kitchen',
                      2: 'quality',
                      3: 'rescue',
                      4: 'telemetry',
                      5: 'impact',
                    };
                    onEnterApp(viewMap[current.id]);
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Test Agent {current.id} Live</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Traditional Waste vs FoodResQ Comparison */}
      <section className="px-6 sm:px-12 py-16 bg-white border-t border-[#F0EAE1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#133830] tracking-tight">
              Why FoodResQ Wins
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Transforming conventional blind cooking into an AI-orchestrated circular economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200/80">
              <h3 className="text-lg font-bold text-rose-950 mb-3 flex items-center gap-2">
                <span>Traditional Kitchens (High Waste)</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-rose-900/90">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Cooks same fixed batch every day regardless of rain, heat, or exams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Surplus is judged by smell/touch; safe food discarded to avoid legal risk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>NGOs called via informal phone calls; food cools and spoils before pickup.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Zero audit trail; food lands in landfills generating toxic methane gas.</span>
                </li>
              </ul>
            </div>

            {/* FoodResQ */}
            <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80">
              <h3 className="text-lg font-bold text-emerald-950 mb-3 flex items-center gap-2">
                <span>With FoodResQ Ecosystem</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-emerald-900/90">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>AI forecasts exact attendance with weather, holidays & exams (MAPE &lt; 6.5%).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Computer Vision + thermal sensors compute standardized Freshness Score (0-100).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Automated nearest-neighbor route solver guarantees arrival before expiry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>6-digit OTP custody verification & verifiable SHA-256 MoFPI ESG certification.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-8 py-4 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-black text-base shadow-xl shadow-orange-500/25 transition-all inline-flex items-center gap-3"
            >
              <span>Launch Interactive Platform</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#133830] text-white px-6 sm:px-12 py-10 border-t border-[#0E2B25]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl">🍱</span>
              <span className="text-xl font-bold">Food<span className="text-[#FA8128]">ResQ</span></span>
            </div>
            <p className="text-xs text-[#96B3AB] mt-1">
              Ministry of Food Processing Industries (MoFPI) • SIH Problem Statement ID 26234
            </p>
          </div>
          <div className="text-xs text-[#96B3AB]">
            Designed with sustainable tech for institutional kitchens & food processing units.
          </div>
        </div>
      </footer>
    </div>
  );
};
