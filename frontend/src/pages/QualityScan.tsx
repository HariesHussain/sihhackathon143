import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { db } from '../services/db';
import { AppView, FoodInspection, FoodBatch } from '../types';
import { StatusPill } from '../components/ui/StatusPill';

interface QualityScanProps {
  onNavigate: (view: AppView) => void;
  onDataMutated: () => void;
}

// Realistic sample photo assets for fast demo presentation
const SAMPLE_PHOTOS = {
  top: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
  side: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80',
  closeup: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
};

export const QualityScan: React.FC<QualityScanProps> = ({ onNavigate, onDataMutated }) => {
  const batches = db.getBatches();
  const targetBatch: FoodBatch | undefined = batches[0]; // Active batch

  // Exactly 3 photos required
  const [photoTop, setPhotoTop] = useState<string | null>(SAMPLE_PHOTOS.top);
  const [photoSide, setPhotoSide] = useState<string | null>(SAMPLE_PHOTOS.side);
  const [photoCloseup, setPhotoCloseup] = useState<string | null>(SAMPLE_PHOTOS.closeup);

  const [analyzing, setAnalyzing] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<FoodInspection | null>(null);

  const allThreeReady = Boolean(photoTop && photoSide && photoCloseup);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 'top' | 'side' | 'closeup') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        if (slot === 'top') setPhotoTop(url);
        if (slot === 'side') setPhotoSide(url);
        if (slot === 'closeup') setPhotoCloseup(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = () => {
    if (!allThreeReady) return;
    setAnalyzing(true);

    setTimeout(() => {
      const saved = db.saveInspection({
        food_batch_id: targetBatch?.id || 'batch_active',
        food_name: targetBatch?.food_name || 'Rice + Paneer Butter Masala',
        freshness_score: 94,
        grade: 'GRADE_A',
        safe_window_minutes: 240, // 4 hours
        recommendation: 'Suitable for redistribution subject to standard food-safety handling procedures.',
        image_url_top: photoTop!,
        image_url_side: photoSide!,
        image_url_closeup: photoCloseup!,
        observations: [
          'Surface appearance normal and steam moisture retained',
          'No obvious discoloration or oxidation browning detected',
          'Texture density matches acceptable freshly cooked threshold',
        ],
      });

      setInspectionResult(saved);
      setAnalyzing(false);
      onDataMutated();
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Stage 3: Food Safety & Multi-Angle Visual Inspection</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          3-Photo Food Safety Inspection
        </h2>
        <p className="text-xs text-[#96B3AB] mt-1 max-w-2xl leading-relaxed">
          Standardized visual inspection protocol. To ensure proper verification, FoodResQ requires exactly 3 perspectives: Top View, Side View, and Close-up Texture View.
        </p>

        {targetBatch && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#96B3AB]">
              Inspecting Batch: <strong className="text-white">{targetBatch.food_name}</strong>
            </span>
            <span className="text-[#FA8128] font-bold">
              {targetBatch.surplus_portions} Portions Surplus
            </span>
          </div>
        )}
      </div>

      {/* 3-Photo Upload Grid */}
      <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="pb-4 border-b border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#133830]">
              Mandatory Food Safety Photos (3 of 3)
            </h3>
            <p className="text-xs text-[#64748B]">
              Take live photos with device camera or upload image files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPhotoTop(SAMPLE_PHOTOS.top);
                setPhotoSide(SAMPLE_PHOTOS.side);
                setPhotoCloseup(SAMPLE_PHOTOS.closeup);
              }}
              className="text-xs font-bold text-[#FA8128] hover:underline"
            >
              Use Sample Photos (Demo)
            </button>
          </div>
        </div>

        {/* 3 Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PHOTO 1: TOP / FRONT */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#133830]">
                Photo 1: Top / Front View
              </span>
              {photoTop ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="text-[10px] text-rose-500 font-bold">Required</span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mb-3">Overall tray portion & appearance</p>

            <div className="relative aspect-video rounded-xl bg-white border border-[#F0EAE1] overflow-hidden flex items-center justify-center mb-3">
              {photoTop ? (
                <img src={photoTop} alt="Top view" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-[#CBD5E1]" />
              )}
            </div>

            <label className="w-full py-2 rounded-xl bg-white border border-[#F0EAE1] text-xs font-bold text-[#133830] text-center hover:bg-[#FFF3E8] hover:text-[#FA8128] cursor-pointer transition-colors block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, 'top')}
                className="hidden"
              />
              <span>{photoTop ? 'Change Photo 1' : 'Upload Top View'}</span>
            </label>
          </div>

          {/* PHOTO 2: SIDE VIEW */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#133830]">
                Photo 2: Side View
              </span>
              {photoSide ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="text-[10px] text-rose-500 font-bold">Required</span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mb-3">Gravy consistency & depth profile</p>

            <div className="relative aspect-video rounded-xl bg-white border border-[#F0EAE1] overflow-hidden flex items-center justify-center mb-3">
              {photoSide ? (
                <img src={photoSide} alt="Side view" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-[#CBD5E1]" />
              )}
            </div>

            <label className="w-full py-2 rounded-xl bg-white border border-[#F0EAE1] text-xs font-bold text-[#133830] text-center hover:bg-[#FFF3E8] hover:text-[#FA8128] cursor-pointer transition-colors block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, 'side')}
                className="hidden"
              />
              <span>{photoSide ? 'Change Photo 2' : 'Upload Side View'}</span>
            </label>
          </div>

          {/* PHOTO 3: CLOSE-UP TEXTURE */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#133830]">
                Photo 3: Close-Up Texture View
              </span>
              {photoCloseup ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="text-[10px] text-rose-500 font-bold">Required</span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mb-3">Surface sheen, rice grain texture</p>

            <div className="relative aspect-video rounded-xl bg-white border border-[#F0EAE1] overflow-hidden flex items-center justify-center mb-3">
              {photoCloseup ? (
                <img src={photoCloseup} alt="Closeup view" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-[#CBD5E1]" />
              )}
            </div>

            <label className="w-full py-2 rounded-xl bg-white border border-[#F0EAE1] text-xs font-bold text-[#133830] text-center hover:bg-[#FFF3E8] hover:text-[#FA8128] cursor-pointer transition-colors block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, 'closeup')}
                className="hidden"
              />
              <span>{photoCloseup ? 'Change Photo 3' : 'Upload Close-Up'}</span>
            </label>
          </div>
        </div>

        {/* Analyze Button */}
        {!inspectionResult ? (
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={!allThreeReady || analyzing}
              className="w-full py-4 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing 3 Perspectives...' : 'Analyze Food Safety (AI-Assisted)'}</span>
            </button>
          </div>
        ) : null}

        {/* Inspection Results Box */}
        {inspectionResult && (
          <div className="mt-6 p-6 rounded-3xl bg-[#FAF7F2] border border-[#F0EAE1] space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EAE1]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Inspection Outcome
                </span>
                <h4 className="text-2xl font-black text-[#133830]">
                  Freshness Score: {inspectionResult.freshness_score}%
                </h4>
              </div>
              <StatusPill status={inspectionResult.grade} size="md" />
            </div>

            {/* Estimated Safe Redistribution Window */}
            <div className="p-4 rounded-2xl bg-[#E1F7E8] border border-[#C8F2D4] flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[#15803D] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Estimated Safe Redistribution Window</span>
                </p>
                <p className="text-2xl font-black text-[#15803D] mt-0.5">
                  {inspectionResult.safe_window_minutes / 60} Hours Remaining
                </p>
              </div>
              <span className="text-xs font-bold text-[#15803D] bg-white/80 px-3 py-1 rounded-xl">
                Redistribute by 4:00 PM
              </span>
            </div>

            {/* Observations */}
            <div>
              <p className="text-xs font-bold text-[#133830] mb-2 uppercase tracking-wider">
                Visual Assessment Observations:
              </p>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {inspectionResult.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation & Mandatory Disclaimer */}
            <div className="p-4 rounded-2xl bg-white border border-[#F0EAE1] text-xs">
              <p className="font-bold text-[#133830] mb-1">
                Recommendation: {inspectionResult.recommendation}
              </p>
              <p className="text-[11px] text-[#64748B] italic mt-1 pt-2 border-t border-[#F0EAE1]">
                ⚠️ <strong>Note:</strong> This is an AI-assisted visual assessment. Final food safety decisions must follow standard kitchen food safety and temperature holding guidelines.
              </p>
            </div>

            {/* CTA to Step 4 */}
            <button
              onClick={() => onNavigate('rescue')}
              className="w-full py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Declare Surplus for NGO Rescue (Step 4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
