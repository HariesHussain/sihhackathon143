import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../services/db';
import { AppView, Dispatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusPill } from '../components/ui/StatusPill';

interface LogisticsProps {
  onNavigate: (view: AppView) => void;
  onDataMutated: () => void;
}

export const Logistics: React.FC<LogisticsProps> = ({ onNavigate, onDataMutated }) => {
  const { role } = useAuth();
  const dispatches = db.getDispatches();

  const [activeDispatchId, setActiveDispatchId] = useState<string>(dispatches[0]?.id || '');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const selectedDispatch = dispatches.find((d) => d.id === activeDispatchId) || dispatches[0];

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess(null);

    if (!selectedDispatch) return;

    try {
      const res = db.verifyDispatchOTP(selectedDispatch.id, enteredOtp);
      setOtpSuccess(res.message);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FA8128', '#16A34A', '#0284C7'],
      });

      onDataMutated();
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
          <Truck className="w-3.5 h-3.5" />
          <span>Stage 6 & 7: Logistics Route & OTP Handover Confirmation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Delivery Routing & Chain of Custody
        </h2>
        <p className="text-xs text-[#96B3AB] mt-1 max-w-2xl leading-relaxed">
          Tracks transit from donor kitchen to shelter. Delivery is finalized via a temporary 6-digit OTP code provided by the NGO driver to guarantee chain of custody.
        </p>
      </div>

      {dispatches.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-[#F0EAE1] text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEADB] text-[#FA8128] flex items-center justify-center mx-auto mb-3">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#133830]">
            No Active Deliveries Scheduled
          </h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-5">
            Accept an incoming surplus request from the Food Rescue page to generate a delivery dispatch with an OTP.
          </p>
          <button
            onClick={() => onNavigate('rescue')}
            className="px-5 py-2.5 rounded-xl bg-[#FA8128] text-white text-xs font-bold hover:bg-[#E6711B]"
          >
            Go to Food Rescue & Match NGO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatches List (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-[#F0EAE1]">
              <h3 className="text-base font-extrabold text-[#133830]">
                Active Dispatches
              </h3>
              <p className="text-xs text-[#64748B]">
                {dispatches.length} delivery records in system
              </p>
            </div>

            <div className="space-y-3">
              {dispatches.map((d) => {
                const isSelected = selectedDispatch?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveDispatchId(d.id);
                      setOtpSuccess(null);
                      setOtpError('');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFF8F2] border-[#FA8128] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#F0EAE1] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#133830]">
                          {d.food_name}
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          {d.portions} portions • {d.ngo_name}
                        </p>
                      </div>
                      <StatusPill status={d.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {d.delivery_deadline}</span>
                      </span>

                      {d.status === 'DELIVERED' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Handed Over</span>
                        </span>
                      ) : (
                        <span className="text-[#FA8128] font-bold">
                          Awaiting OTP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route & OTP Handover Confirmation Box (7 cols) */}
          {selectedDispatch && (
            <div className="lg:col-span-7 bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-7 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FA8128]">
                    Dispatch Details
                  </span>
                  <h3 className="text-base font-extrabold text-[#133830]">
                    {selectedDispatch.food_name} ({selectedDispatch.portions} Portions)
                  </h3>
                </div>
                <StatusPill status={selectedDispatch.status} size="md" />
              </div>

              {/* Clean Visual Route Component (Kitchen -> NGO) */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Delivery Itinerary
                </span>

                <div className="relative pl-6 space-y-4 border-l-2 border-[#FA8128]/40 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[31px] -top-0.5 w-4 h-4 rounded-full bg-[#133830] text-white flex items-center justify-center text-[9px] font-bold">
                      A
                    </span>
                    <p className="text-xs font-bold text-[#133830]">
                      Pickup: {selectedDispatch.kitchen_name}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Scheduled Time: {selectedDispatch.pickup_time}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] -top-0.5 w-4 h-4 rounded-full bg-[#FA8128] text-white flex items-center justify-center text-[9px] font-bold">
                      B
                    </span>
                    <p className="text-xs font-bold text-[#133830]">
                      Drop-off: {selectedDispatch.ngo_name}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Distance: {selectedDispatch.distance_km} km • Delivery Deadline: {selectedDispatch.delivery_deadline}
                    </p>
                  </div>
                </div>
              </div>

              {/* DRIVER VIEW: SHOWS 6-DIGIT OTP */}
              {(role === 'ngo' || role === 'admin') && selectedDispatch.status !== 'DELIVERED' && (
                <div className="p-5 rounded-2xl bg-[#E1F7E8] border border-[#C8F2D4] text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#15803D]">
                    NGO Driver Passcode
                  </span>
                  <h4 className="text-3xl font-black font-mono tracking-widest text-[#15803D] my-2">
                    {selectedDispatch.otp}
                  </h4>
                  <p className="text-[11px] text-[#15803D]/90">
                    Show this 6-digit passcode to the kitchen operator at the time of loading to confirm pickup.
                  </p>
                </div>
              )}

              {/* KITCHEN OPERATOR VIEW: OTP INPUT FORM */}
              {selectedDispatch.status !== 'DELIVERED' ? (
                <form onSubmit={handleVerifyOtp} className="p-5 rounded-2xl bg-white border border-[#F0EAE1] space-y-4 shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-[#133830] block mb-1">
                      Enter 6-Digit OTP From NGO Driver
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder={`e.g. ${selectedDispatch.otp}`}
                        className="w-full pl-11 pr-3 py-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] font-mono text-xl font-bold tracking-widest text-[#133830] focus:outline-none focus:border-[#FA8128]"
                      />
                    </div>
                    <span className="text-[10px] text-[#64748B] mt-1 block">
                      💡 Tip for demo: The driver code is <strong className="text-[#FA8128]">{selectedDispatch.otp}</strong>
                    </span>
                  </div>

                  {otpError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enteredOtp.length !== 6}
                    className="w-full py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Verify Handover & Complete Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-[#E1F7E8] border border-[#C8F2D4] space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#15803D]">
                    Delivery Successfully Verified & Logged!
                  </h4>
                  <p className="text-xs text-[#15803D]/90">
                    Chain of custody verified. {selectedDispatch.portions} meals delivered safely to {selectedDispatch.ngo_name}.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      View Updated Impact Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
