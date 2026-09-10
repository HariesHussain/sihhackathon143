import React, { useState } from 'react';
import {
  ScanEye,
  Camera,
  Thermometer,
  Clock,
  Droplets,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { QualityAnalysis, AppView } from '../types';
import { StatusPill } from '../components/ui/StatusPill';

interface QualityScanProps {
  onNavigate: (view: AppView) => void;
}

export const QualityScan: React.FC<QualityScanProps> = ({ onNavigate }) => {
  const [foodName, setFoodName] = useState('Mixed Vegetable Curry & Rice');
  const [category, setCategory] = useState('GRAVIES_CURRIES');
  const [holdingTemp, setHoldingTemp] = useState(24.0);
  const [hoursElapsed, setHoursElapsed] = useState(2.0);
  const [humidity, setHumidity] = useState(65.0);

  const [selectedPreset, setSelectedPreset] = useState<'fresh' | 'warning' | 'spoil'>('fresh');
  const [result, setResult] = useState<QualityAnalysis | null>({
    freshness_index: 94.5,
    quality_grade: 'GRADE_A',
    safe_window_minutes: 240,
    safe_window_formatted: '4h 0m remaining',
    is_safe_for_consumption: true,
    spoilage_risk_factors: ['Holding temperature within stable threshold.'],
    action_directive: 'CERTIFIED GRADE A: Immediate human consumption redistribution approved.',
  });
  const [loading, setLoading] = useState(false);

  const applyPreset = (type: 'fresh' | 'warning' | 'spoil') => {
    setSelectedPreset(type);
    if (type === 'fresh') {
      setFoodName('Steamed Basmati Rice & Paneer Butter Masala');
      setHoldingTemp(18.0);
      setHoursElapsed(1.5);
      runScan(18.0, 1.5);
    } else if (type === 'warning') {
      setFoodName('Yellow Dal Tadka & Roti');
      setHoldingTemp(28.0);
      setHoursElapsed(3.8);
      runScan(28.0, 3.8);
    } else {
      setFoodName('Overnight Mixed Gravy');
      setHoldingTemp(34.0);
      setHoursElapsed(5.5);
      runScan(34.0, 5.5);
    }
  };

  const runScan = async (temp = holdingTemp, hours = hoursElapsed) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('food_name', foodName);
      formData.append('category', category);
      formData.append('holding_temp_celsius', temp.toString());
      formData.append('hours_since_preparation', hours.toString());
      formData.append('ambient_humidity_rh', humidity.toString());

      const data = await api.analyzeQuality(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 2: Computer Vision & Multi-Modal Safety Inspector</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Food Freshness & Safe Window Auditor
          </h2>
          <p className="text-xs sm:text-sm text-[#96B3AB] mt-2 leading-relaxed">
            Multi-modal food safety assessment combining surface texture and oxidation analysis with holding temperature telemetry and time elapsed. Computes the real-time Safe Redistribution Window before microbial proliferation.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => applyPreset('fresh')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedPreset === 'fresh' ? 'bg-[#FA8128] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Demo: Grade A
          </button>
          <button
            onClick={() => applyPreset('warning')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedPreset === 'warning' ? 'bg-[#FA8128] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Demo: Grade B
          </button>
          <button
            onClick={() => applyPreset('spoil')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedPreset === 'spoil' ? 'bg-[#FA8128] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Demo: Inedible
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Photo & Environmental Telemetry */}
        <div className="lg:col-span-6 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h3 className="text-base font-extrabold text-[#133830]">
              Food Tray Inspection Telemetry
            </h3>
            <span className="text-[10px] font-bold text-[#FA8128] uppercase tracking-wider">
              Sensors + Image
            </span>
          </div>

          {/* Image Upload / Camera Box */}
          <div className="relative border-2 border-dashed border-[#F0EAE1] hover:border-[#FA8128] rounded-3xl p-6 text-center transition-colors bg-[#FAF7F2] cursor-pointer group">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
              {selectedPreset === 'fresh' ? '🍲' : selectedPreset === 'warning' ? '🥘' : '🥣'}
            </div>
            <p className="text-xs font-extrabold text-[#133830] mb-1">
              Food Tray Snapshot Loaded
            </p>
            <p className="text-[11px] text-[#64748B]">
              {foodName} • Color channels RGB variance analyzed
            </p>
            <button
              onClick={() => runScan()}
              className="mt-3 px-4 py-1.5 rounded-xl bg-white border border-[#F0EAE1] text-xs font-bold text-[#133830] hover:bg-[#FFF3E8] hover:text-[#FA8128] transition-colors"
            >
              Re-Scan Camera
            </button>
          </div>

          {/* Sliders: Temperature, Hours, Humidity */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#133830] flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span>Holding Temperature</span>
                </span>
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                  {holdingTemp.toFixed(1)}°C
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={holdingTemp}
                onChange={(e) => {
                  setHoldingTemp(Number(e.target.value));
                  runScan(Number(e.target.value), hoursElapsed);
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                <span>0°C (Chilled)</span>
                <span>20°C (Ambient)</span>
                <span>50°C (Hot Zone)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#133830] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FA8128]" />
                  <span>Time Elapsed Since Preparation</span>
                </span>
                <span className="text-xs font-extrabold text-[#FA8128] bg-[#FFF3E8] px-2 py-0.5 rounded-lg">
                  {hoursElapsed.toFixed(1)} Hours
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={hoursElapsed}
                onChange={(e) => {
                  setHoursElapsed(Number(e.target.value));
                  runScan(holdingTemp, Number(e.target.value));
                }}
                className="w-full accent-[#FA8128] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                <span>0h (Fresh Cooked)</span>
                <span>4h (Safety Threshold)</span>
                <span>12h (Spoiled)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Freshness Score Card & Directives */}
        <div className="lg:col-span-6 space-y-5">
          {result && (
            <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-7 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Inspection Outcome
                  </span>
                  <h3 className="text-2xl font-black text-[#133830]">
                    Freshness Index: {result.freshness_index}%
                  </h3>
                </div>
                <StatusPill status={result.quality_grade} size="md" />
              </div>

              {/* Safe Redistribution Window Box */}
              <div
                className={`p-5 rounded-2xl border ${
                  result.quality_grade === 'GRADE_A'
                    ? 'bg-[#E1F7E8] border-[#C8F2D4]'
                    : result.quality_grade === 'GRADE_B'
                    ? 'bg-[#FEF6D8] border-[#FDF0BE]'
                    : 'bg-[#FEE4E8] border-[#FCD3DC]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#133830]">
                    Safe Redistribution Window
                  </span>
                  <Clock className="w-4 h-4 text-[#133830]" />
                </div>
                <p className="text-3xl font-black text-[#133830]">
                  {result.safe_window_formatted}
                </p>
                <p className="text-xs text-[#475569] mt-1 font-medium">
                  Dynamic countdown before microbial proliferation risk begins.
                </p>
              </div>

              {/* Action Directive Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
                <h4 className="text-xs font-extrabold text-[#133830] uppercase tracking-wider mb-1">
                  Safety Directive
                </h4>
                <p className="text-xs font-bold text-[#133830] leading-relaxed">
                  {result.action_directive}
                </p>
              </div>

              {/* Spoilage Risk Factors */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Observed Spoilage Factors
                </h4>
                <ul className="space-y-1.5">
                  {result.spoilage_risk_factors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-[#475569] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA8128]" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action: Flow straight into Redistribution */}
              {result.is_safe_for_consumption ? (
                <button
                  onClick={() => onNavigate('redistribution')}
                  className="w-full py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Declare as Verified Surplus for Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-100 border border-rose-200 text-center">
                  <AlertOctagon className="w-6 h-6 text-rose-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-rose-900">
                    Human Consumption Redistribution Blocked
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Automatically routed to institutional bio-methanation / composting unit.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
