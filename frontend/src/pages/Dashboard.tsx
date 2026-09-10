import React, { useState, useEffect } from 'react';
import {
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  Leaf,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Database,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { PastelCard } from '../components/ui/PastelCard';
import { StatusPill } from '../components/ui/StatusPill';
import { db } from '../services/db';
import { AppView, ImpactMetrics, FoodBatch, Dispatch } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  refreshKey?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, refreshKey }) => {
  const { role } = useAuth();
  const [metrics, setMetrics] = useState<ImpactMetrics>(db.getImpactMetrics());
  const [batches, setBatches] = useState<FoodBatch[]>(db.getBatches());
  const [dispatches, setDispatches] = useState<Dispatch[]>(db.getDispatches());

  useEffect(() => {
    setMetrics(db.getImpactMetrics());
    setBatches(db.getBatches());
    setDispatches(db.getDispatches());
  }, [refreshKey]);

  const hasActivity = metrics.total_meals_rescued > 0 || batches.length > 0;

  return (
    <div className="space-y-6">
      {/* Guided Workflow Banner for Judges & Operators */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coherent End-to-End Food Rescue Lifecycle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              One Connected System: From Sizing to Handover
            </h2>
            <p className="text-xs text-[#96B3AB] mt-1.5 leading-relaxed">
              Predict kitchen demand before cooking → record actual prepared portions → inspect surplus with 3 photos → match nearby shelter → confirm delivery with 6-digit OTP.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {role === 'kitchen_operator' && (
              <button
                onClick={() => onNavigate('kitchen')}
                className="px-5 py-3 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <span>Start Today's Shift & Sizing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {role === 'ngo' && (
              <button
                onClick={() => onNavigate('rescue')}
                className="px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs shadow-md shadow-green-600/20 transition-all flex items-center gap-2"
              >
                <span>Review Incoming Food Donations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('impact')}
                className="px-5 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <span>System Impact Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 5-Step Visual Workflow Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/10 text-xs font-bold">
          <div
            onClick={() => onNavigate('kitchen')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-center"
          >
            <span className="text-[10px] text-[#FA8128] block uppercase">Step 1</span>
            <span>1. Demand AI</span>
          </div>
          <div
            onClick={() => onNavigate('kitchen')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-center"
          >
            <span className="text-[10px] text-[#FA8128] block uppercase">Step 2</span>
            <span>2. Cook Batch</span>
          </div>
          <div
            onClick={() => onNavigate('quality')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-center"
          >
            <span className="text-[10px] text-[#FA8128] block uppercase">Step 3</span>
            <span>3. 3-Photo Check</span>
          </div>
          <div
            onClick={() => onNavigate('rescue')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-center"
          >
            <span className="text-[10px] text-[#FA8128] block uppercase">Step 4</span>
            <span>4. NGO Match</span>
          </div>
          <div
            onClick={() => onNavigate('logistics')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-center col-span-2 sm:col-span-1"
          >
            <span className="text-[10px] text-[#FA8128] block uppercase">Step 5</span>
            <span>5. OTP Confirm</span>
          </div>
        </div>
      </div>

      {/* 5 Real Metric Cards (Calculated directly from database records) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-[#133830] uppercase tracking-wider">
            Verified Network Activity (Live Database Records)
          </h3>
          <span className="text-xs text-[#64748B] font-medium">
            {hasActivity ? 'Calculated from delivered batches' : 'Database empty (0 records)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <PastelCard
            title="Total Meals Rescued"
            value={metrics.total_meals_rescued.toLocaleString()}
            subtitle={metrics.total_meals_rescued > 0 ? `${metrics.total_meals_rescued} plates delivered` : 'No deliveries yet'}
            icon={Users}
            variant="peach"
            badge={metrics.total_meals_rescued > 0 ? `${metrics.completed_dispatches} Dispatches` : '0'}
          />
          <PastelCard
            title="Total Food Saved"
            value={`${metrics.total_food_saved_kg} kg`}
            subtitle="Based on ~0.25 kg/portion"
            icon={Utensils}
            variant="sky"
          />
          <PastelCard
            title="Surplus Managed"
            value={`${metrics.total_surplus_redistributed_portions} Portions`}
            subtitle="Identified & redistributed"
            icon={ShoppingBag}
            variant="sunlight"
          />
          <PastelCard
            title="Monetary Value"
            value={`₹${metrics.total_money_saved_inr.toLocaleString()}`}
            subtitle="Estimated @ ₹40/meal"
            icon={IndianRupee}
            variant="rose"
          />
          <PastelCard
            title="CO₂e Avoided"
            value={`${metrics.total_co2_avoided_kg} kg`}
            subtitle="IPCC 2.5 kg CO₂e/kg factor"
            icon={Leaf}
            variant="mint"
          />
        </div>
      </div>

      {/* Empty State Banner (if 0 records) */}
      {!hasActivity && (
        <div className="p-8 rounded-3xl bg-white border border-[#F0EAE1] text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEADB] text-[#FA8128] flex items-center justify-center mx-auto mb-3">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#133830]">
            Database is Ready (0 Active Transactions)
          </h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-5">
            You can start a brand new live food rescue flow right now, or click below to populate sample historical records to demonstrate to judges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('kitchen')}
              className="px-5 py-2.5 rounded-xl bg-[#FA8128] text-white text-xs font-bold hover:bg-[#E6711B] shadow-xs"
            >
              Start Step 1: Predict Demand
            </button>
            <button
              onClick={() => {
                db.loadDemoData();
                setMetrics(db.getImpactMetrics());
                setBatches(db.getBatches());
                setDispatches(db.getDispatches());
              }}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#F0EAE1] text-[#133830] text-xs font-bold hover:bg-[#FAF7F2]"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Recent Food Batches & Redirection Status */}
      {hasActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Batches Stream (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#133830]">
                  Live Food Batches & Redirection Status
                </h3>
                <p className="text-xs text-[#64748B]">
                  Records created by kitchen operators
                </p>
              </div>
              <button
                onClick={() => onNavigate('kitchen')}
                className="text-xs font-bold text-[#FA8128] hover:underline flex items-center gap-1"
              >
                <span>+ New Batch</span>
              </button>
            </div>

            <div className="space-y-3">
              {batches.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-[#133830]">
                      {b.food_name}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Prepared: <span className="font-bold text-[#133830]">{b.prepared_portions}</span> portions • Recommended: {b.recommended_portions}
                      {b.surplus_portions > 0 && (
                        <span className="text-[#FA8128] font-bold ml-2">
                          (+{b.surplus_portions} Surplus)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <StatusPill status={b.status} size="sm" />
                    {b.status === 'COOKED' && (
                      <button
                        onClick={() => onNavigate('quality')}
                        className="px-2.5 py-1 rounded-xl bg-[#FA8128] text-white text-[10px] font-bold hover:bg-[#E6711B]"
                      >
                        Inspect Photos
                      </button>
                    )}
                    {b.status === 'INSPECTED' && (
                      <button
                        onClick={() => onNavigate('rescue')}
                        className="px-2.5 py-1 rounded-xl bg-[#16A34A] text-white text-[10px] font-bold hover:bg-[#15803D]"
                      >
                        Match NGO
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Dispatches (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#133830]">
                  Verified Handover Logs
                </h3>
                <p className="text-xs text-[#64748B]">
                  Confirmed with 6-digit OTP
                </p>
              </div>
              <button
                onClick={() => onNavigate('logistics')}
                className="text-xs font-bold text-[#FA8128] hover:underline"
              >
                View Deliveries
              </button>
            </div>

            <div className="space-y-3">
              {dispatches.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#133830]">{d.food_name}</p>
                      <p className="text-[11px] text-[#64748B]">{d.ngo_name}</p>
                    </div>
                    <StatusPill status={d.status} size="sm" />
                  </div>

                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#FA8128]">
                      {d.portions} meals delivered
                    </span>
                    <span className="font-mono text-[#64748B]">
                      OTP: {d.otp}
                    </span>
                  </div>
                </div>
              ))}

              {dispatches.length === 0 && (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  No dispatches confirmed yet. Complete an OTP handover in Logistics to see verified records here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
