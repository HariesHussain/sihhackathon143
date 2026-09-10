import React, { useState } from 'react';
import {
  HeartHandshake,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building,
  Check,
  X,
  Phone,
  Truck,
  KeyRound,
} from 'lucide-react';
import { db, DEFAULT_NGOS } from '../services/db';
import { AppView, SurplusDeclaration, NGO, RedistributionRequest, FoodBatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusPill } from '../components/ui/StatusPill';

interface RedistributionProps {
  onNavigate: (view: AppView) => void;
  onDataMutated: () => void;
}

export const Redistribution: React.FC<RedistributionProps> = ({ onNavigate, onDataMutated }) => {
  const { role, switchRole } = useAuth();
  const batches = db.getBatches();
  const inspectedBatch: FoodBatch | undefined = batches.find((b) => b.status === 'INSPECTED') || batches[0];
  const surplusList = db.getSurplusList();
  const requests = db.getRequests();

  const [selectedNGOId, setSelectedNGOId] = useState<string>(DEFAULT_NGOS[0].id);
  const [successMessage, setSuccessMessage] = useState('');
  const [requestSuccess, setRequestSuccess] = useState<{
    ngoName: string;
    etaMins: number;
    distanceKm: number;
    portions: number;
    otp: string;
  } | null>(null);

  // Safe display portions (defaults to 41 if 0)
  const displayPortions = inspectedBatch?.surplus_portions && inspectedBatch.surplus_portions > 0
    ? inspectedBatch.surplus_portions
    : 41;

  // Handle Kitchen Operator requesting pickup from NGO
  const handleRequestPickup = () => {
    let openSurplus = surplusList.find((s) => s.status === 'OPEN' || s.status === 'REQUESTED');
    const targetNGO = DEFAULT_NGOS.find((n) => n.id === selectedNGOId) || DEFAULT_NGOS[0];

    // Ensure surplus is registered in pool
    if (!openSurplus) {
      openSurplus = db.declareSurplus({
        food_batch_id: inspectedBatch?.id || 'batch_active',
        food_name: inspectedBatch?.food_name || 'Rice + Paneer Butter Masala',
        kitchen_name: inspectedBatch?.kitchen_name || 'ABC College Central Kitchen',
        quantity_portions: displayPortions,
        quantity_kg: Math.round(displayPortions * 0.25 * 10) / 10,
        freshness_score: 94,
        safe_window_minutes: 240,
        available_until: new Date(Date.now() + 4 * 3600000).toISOString(),
      });
    }

    // Create redistribution request
    const newReq = db.createRequest({
      surplus_id: openSurplus.id,
      food_name: openSurplus.food_name,
      kitchen_name: openSurplus.kitchen_name,
      ngo_id: targetNGO.id,
      ngo_name: targetNGO.name,
      portions: openSurplus.quantity_portions,
      distance_km: targetNGO.distance_km,
      estimated_time_mins: targetNGO.estimated_time_mins,
    });

    // Automatically accept and generate dispatch OTP for seamless demo
    const newDisp = db.acceptRequest(newReq.id);

    setRequestSuccess({
      ngoName: targetNGO.name,
      etaMins: targetNGO.estimated_time_mins,
      distanceKm: targetNGO.distance_km,
      portions: openSurplus.quantity_portions,
      otp: newDisp.otp,
    });

    setSuccessMessage(`✅ Pickup request successfully dispatched to ${targetNGO.name}! Driver en route (~${targetNGO.estimated_time_mins} mins ETA). Handover OTP: ${newDisp.otp}`);
    onDataMutated();
  };

  // Handle NGO accepting donation manually
  const handleNgoAccept = (reqId: string) => {
    const disp = db.acceptRequest(reqId);
    setSuccessMessage(`Donation accepted! Assigned delivery OTP: ${disp.otp}. Routing vehicle.`);
    onDataMutated();
    setTimeout(() => {
      onNavigate('logistics');
    }, 1200);
  };

  const pendingNgoRequests = requests.filter((r) => r.status === 'PENDING_NGO');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Stage 4 & 5: Surplus Declaration & NGO Matching</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Surplus Redistribution & Beneficiary Matching
        </h2>
        <p className="text-xs text-[#96B3AB] mt-1 max-w-2xl leading-relaxed">
          Matches verified edible surplus with registered, proximity-ranked community shelters before the safety window expires.
        </p>
      </div>

      {/* Success Banner */}
      {requestSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 shadow-card animate-in fade-in space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-900">
                  Pickup Dispatched & Assigned to {requestSuccess.ngoName}!
                </h4>
                <p className="text-xs text-emerald-700">
                  {requestSuccess.portions} portions allocated • Distance: {requestSuccess.distanceKm} km (~{requestSuccess.etaMins} mins travel time)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-[#FA8128]">
              OTP: {requestSuccess.otp}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-emerald-800 font-medium">
              💡 Vehicle dispatched. Proceed to the Logistics page to track delivery and confirm the 6-digit OTP.
            </p>
            <button
              onClick={() => onNavigate('logistics')}
              className="px-5 py-2 rounded-xl bg-[#FA8128] hover:bg-[#E6711B] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Logistics & Verify OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW FOR KITCHEN OPERATOR: DECLARE & REQUEST */}
      {role === 'kitchen_operator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Inspected Surplus Ready for Rescue (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-5">
            <div className="pb-3 border-b border-[#F0EAE1]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FA8128]">
                Inspected Surplus
              </span>
              <h3 className="text-base font-extrabold text-[#133830]">
                Food Ready for Rescue
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFEADB] border border-[#FFDEC4] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-[#133830]">
                    {inspectedBatch?.food_name || 'Rice + Paneer Butter Masala'}
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Prepared at {inspectedBatch?.kitchen_name || 'ABC College Central Kitchen'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Grade A (94%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 border border-orange-100">
                  <span className="text-[10px] text-[#64748B] block font-medium">Quantity</span>
                  <span className="font-extrabold text-[#133830] text-sm">
                    {displayPortions} Portions
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-orange-100">
                  <span className="text-[10px] text-[#64748B] block font-medium">Safe Window</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    4 Hours Left
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/70 text-[11px] text-[#475569]">
                ✓ Multi-angle 3-photo inspection passed <br />
                ✓ Verified safe for community redistribution
              </div>
            </div>
          </div>

          {/* Right: NGO Matching & Request Dispatch (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-5">
            <div className="pb-3 border-b border-[#F0EAE1]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Beneficiary Matching
              </span>
              <h3 className="text-base font-extrabold text-[#133830]">
                Select Nearby Verified Shelter
              </h3>
              <p className="text-xs text-[#64748B]">
                Ranked by transit time to ensure delivery within safe window
              </p>
            </div>

            <div className="space-y-3">
              {DEFAULT_NGOS.map((ngo) => {
                const isSelected = selectedNGOId === ngo.id;
                return (
                  <div
                    key={ngo.id}
                    onClick={() => setSelectedNGOId(ngo.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF8F2] border-[#FA8128] ring-1 ring-[#FA8128] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#F0EAE1] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#F0EAE1] flex items-center justify-center font-bold text-[#FA8128] text-base shrink-0 shadow-2xs">
                        🏛️
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-[#133830]">
                            {ngo.name}
                          </h4>
                          {ngo.verified && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B]">{ngo.location}</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                          Capacity: {ngo.beneficiary_capacity} diners • {ngo.contact}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#FA8128] block">
                        {ngo.distance_km} km
                      </span>
                      <span className="text-[10px] text-[#64748B] font-bold">
                        ~{ngo.estimated_time_mins} min ETA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleRequestPickup}
              className="w-full py-4 rounded-2xl bg-[#133830] hover:bg-[#1B4A3F] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 scale-100 hover:scale-[1.01]"
            >
              <span>Request Pickup From Selected NGO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW FOR NGO / COMMUNITY SHELTER: ACCEPT / DECLINE INCOMING FOOD */}
      {(role === 'ngo' || role === 'admin') && (
        <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
          <div className="pb-3 border-b border-[#F0EAE1]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#16A34A]">
              NGO Receiver Portal
            </span>
            <h3 className="text-lg font-black text-[#133830]">
              Incoming Food Donations Requiring Acceptance
            </h3>
            <p className="text-xs text-[#64748B]">
              Verified food donations available for community distribution
            </p>
          </div>

          <div className="space-y-4">
            {pendingNgoRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-extrabold text-[#133830]">
                      {req.food_name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
                      {req.portions} Portions
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Source: <strong className="text-[#133830]">{req.kitchen_name}</strong>
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Transit: {req.distance_km} km away • ~{req.estimated_time_mins} mins travel time
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleNgoAccept(req.id)}
                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Donation</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingNgoRequests.length === 0 && (
              <div className="p-8 text-center text-xs text-[#64748B] bg-[#FAF7F2] rounded-2xl">
                <p className="font-bold text-[#133830]">All incoming requests are currently processed.</p>
                <p className="mt-1">
                  Switch to Kitchen in the top bar to request a pickup, or view active dispatches in Logistics.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
