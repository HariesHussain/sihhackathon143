import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Navigation,
  ShieldCheck,
  AlertCircle,
  X,
  Phone,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, MOCK_NGOS } from '../services/api';
import { SurplusBatch, NGOBeneficiary, RouteOptimizationResult } from '../types';
import { StatusPill } from '../components/ui/StatusPill';
import { Modal } from '../components/ui/Modal';

export const Redistribution: React.FC = () => {
  const [batches, setBatches] = useState<SurplusBatch[]>([]);
  const [ngos, setNgos] = useState<NGOBeneficiary[]>(MOCK_NGOS);
  const [selectedBatch, setSelectedBatch] = useState<SurplusBatch | null>(null);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [targetBatchForOtp, setTargetBatchForOtp] = useState<SurplusBatch | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Route Optimization State
  const [routeResult, setRouteResult] = useState<RouteOptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Declare Surplus Modal State
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newPortions, setNewPortions] = useState(100);
  const [newKg, setNewKg] = useState(25.0);

  const fetchBatches = async () => {
    try {
      const data = await api.getSurplusBatches();
      setBatches(data);
      if (data.length > 0) setSelectedBatch(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleOptimizeRoute = async () => {
    setOptimizing(true);
    try {
      const origin = { lat: 28.5450, lng: 77.1926, label: 'IIT Central Dining Hall' };
      const destinations = ngos.slice(0, 3).map((ngo) => ({
        lat: ngo.lat,
        lng: ngo.lng,
        label: ngo.name,
      }));
      const result = await api.optimizeRoute(origin, destinations);
      setRouteResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleOpenOtpModal = (batch: SurplusBatch) => {
    setTargetBatchForOtp(batch);
    setEnteredOtp('');
    setOtpError('');
    setOtpSuccessMsg('');
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtp = async () => {
    if (!targetBatchForOtp) return;
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter exactly 6 numeric digits.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');

    try {
      const res = await api.verifyOTP(targetBatchForOtp.id, enteredOtp);
      setOtpSuccessMsg(res.message);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FA8128', '#16A34A', '#38BDF8'],
      });

      // Update local batch state
      setBatches((prev) =>
        prev.map((b) =>
          b.id === targetBatchForOtp.id
            ? { ...b, status: 'CLAIMED_VERIFIED' }
            : b
        )
      );
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleDeclareSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBatch = await api.declareSurplus({
        food_name: newFoodName || 'Cooked Rice & Lentil Curry',
        category: 'COOKED_GRAINS',
        diet_type: 'VEGETARIAN',
        quantity_portions: Number(newPortions),
        quantity_kg: Number(newKg),
        freshness_index: 94.0,
        safe_window_minutes: 240,
        donor_name: 'IIT Delhi Dining Hall #3',
        donor_lat: 28.5450,
        donor_lng: 77.1926,
        donor_address: 'Hauz Khas, New Delhi',
      });
      setBatches((prev) => [newBatch, ...prev]);
      setIsDeclareModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 3: Autonomous Logistics & Rapid Redistribution Dispatcher</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Logistics Routing & Chain of Custody
          </h2>
          <p className="text-xs sm:text-sm text-[#96B3AB] mt-2 leading-relaxed">
            Matches active edible surplus with nearby verified beneficiaries (shelters, community kitchens) and calculates the optimal multi-drop delivery route under strict freshness decay deadlines. Validates handovers with 6-digit cryptographic OTPs.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setIsDeclareModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Surplus</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Batches on Left, Map & Route on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Active Surplus Batches List */}
        <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <div>
              <h3 className="text-base font-extrabold text-[#133830]">
                Surplus Ready for Dispatch
              </h3>
              <p className="text-xs text-[#64748B]">
                {batches.length} declared batches in your hub
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {batches.map((batch) => {
              const isSelected = selectedBatch?.id === batch.id;
              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFF8F2] border-[#FA8128] shadow-sm'
                      : 'bg-[#FAF7F2] border-[#F0EAE1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#133830]">
                        {batch.food_name}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        {batch.donor_name} • {batch.quantity_portions} Portions ({batch.quantity_kg} kg)
                      </p>
                    </div>
                    <StatusPill status={batch.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                    <span className="text-[#FA8128] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{batch.safe_window_minutes} mins window</span>
                    </span>

                    {batch.status === 'AVAILABLE' || batch.status === 'MATCHED' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOtpModal(batch);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#FA8128] text-white font-bold text-[11px] hover:bg-[#E6711B] shadow-xs flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Verify OTP</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Handover Complete</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Proximity Map & Route Optimizer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Preview & Proximity Ranking Card */}
          <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#133830]">
                  Verified Beneficiary Registry & Dispatch Router
                </h3>
                <p className="text-xs text-[#64748B]">
                  Proximity-ranked community kitchens and shelters
                </p>
              </div>

              <button
                onClick={handleOptimizeRoute}
                disabled={optimizing}
                className="px-4 py-2 rounded-2xl bg-[#133830] hover:bg-[#1B4A3F] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{optimizing ? 'Calculating...' : 'Optimize Van Route'}</span>
              </button>
            </div>

            {/* Simulated Map Container with Geographic Pins */}
            <div className="relative h-56 rounded-2xl bg-[#E8F1EC] border border-[#C8DFD2] overflow-hidden p-4 flex flex-col justify-between">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#133830_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#133830] bg-white/90 px-3 py-1 rounded-full border border-black/10 shadow-xs">
                  📍 Active Origin: IIT Delhi Dining Hall #2
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200">
                  5 Shelters in Range
                </span>
              </div>

              {/* Graphical Network Pins */}
              <div className="relative z-10 grid grid-cols-3 gap-2 my-auto">
                <div className="p-2 rounded-xl bg-white/95 border border-black/10 shadow-sm text-center">
                  <p className="text-[10px] font-extrabold text-[#133830] truncate">Robin Hood Army</p>
                  <p className="text-[10px] text-[#FA8128] font-bold">2.1 km • 12 mins ETA</p>
                </div>
                <div className="p-2 rounded-xl bg-white/95 border border-black/10 shadow-sm text-center">
                  <p className="text-[10px] font-extrabold text-[#133830] truncate">Feeding India Hub</p>
                  <p className="text-[10px] text-[#FA8128] font-bold">5.4 km • 18 mins ETA</p>
                </div>
                <div className="p-2 rounded-xl bg-white/95 border border-black/10 shadow-sm text-center">
                  <p className="text-[10px] font-extrabold text-[#133830] truncate">Night Shelter #14</p>
                  <p className="text-[10px] text-[#FA8128] font-bold">3.2 km • 14 mins ETA</p>
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-[#64748B] text-center font-semibold">
                Haversine Road Network Transit Matrix Synchronized
              </div>
            </div>

            {/* Route Optimization Results (if computed) */}
            {routeResult && (
              <div className="mt-5 p-4 rounded-2xl bg-[#FFEADB] border border-[#FFDEC4] animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#133830] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FA8128]" />
                    <span>Optimized Van Itinerary (Arrives Before Expiry)</span>
                  </span>
                  <span className="text-xs font-extrabold text-[#15803D] bg-emerald-100 px-2 py-0.5 rounded-md">
                    Total: {routeResult.total_transit_minutes} mins ({routeResult.total_distance_km} km)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {routeResult.optimized_path.map((step) => (
                    <div
                      key={step.step_number}
                      className="flex items-center justify-between bg-white/80 p-2 rounded-xl font-medium"
                    >
                      <span className="font-bold text-[#133830]">
                        Stop {step.step_number}: {step.location_name}
                      </span>
                      <span className="text-[#64748B]">
                        +{step.eta_from_start_minutes} mins from start
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Chain of Custody Handover Verification"
        subtitle={`Verify pickup of ${targetBatchForOtp?.food_name || 'surplus batch'}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs">
            <p className="font-bold text-[#133830]">
              Batch ID: {targetBatchForOtp?.id}
            </p>
            <p className="text-[#64748B]">
              Quantity: {targetBatchForOtp?.quantity_portions} portions ({targetBatchForOtp?.quantity_kg} kg)
            </p>
            <p className="text-[11px] text-[#FA8128] font-bold mt-1">
              Demo Test OTP: 783921 or 419852
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#133830] block mb-1">
              Enter 6-Digit Handover OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 783921"
              className="w-full text-center tracking-widest text-2xl font-black py-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] focus:border-[#FA8128] focus:outline-none"
            />
          </div>

          {otpError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#F0EAE1] text-xs font-bold text-[#64748B] hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={otpVerifying || enteredOtp.length !== 6}
              className="flex-1 py-2.5 rounded-xl bg-[#FA8128] hover:bg-[#E6711B] text-white text-xs font-extrabold shadow-md disabled:opacity-50"
            >
              {otpVerifying ? 'Verifying...' : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Declare Surplus Modal */}
      <Modal
        isOpen={isDeclareModalOpen}
        onClose={() => setIsDeclareModalOpen(false)}
        title="Declare Verified Edible Surplus"
        subtitle="Registers food in real-time dispatch pool"
      >
        <form onSubmit={handleDeclareSurplus} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#133830] block mb-1">
              Food Item Description
            </label>
            <input
              type="text"
              required
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              placeholder="e.g. Steamed Rice & Dal Makhani"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium focus:outline-none focus:border-[#FA8128]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1">
                Portions Count
              </label>
              <input
                type="number"
                min="5"
                max="5000"
                value={newPortions}
                onChange={(e) => setNewPortions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium focus:outline-none focus:border-[#FA8128]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1">
                Net Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="1000"
                value={newKg}
                onChange={(e) => setNewKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium focus:outline-none focus:border-[#FA8128]"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsDeclareModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#F0EAE1] text-xs font-bold text-[#64748B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#FA8128] hover:bg-[#E6711B] text-white text-xs font-extrabold shadow-md"
            >
              Register Surplus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
