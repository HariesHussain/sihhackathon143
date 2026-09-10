import React, { useState } from 'react';
import {
  ChefHat,
  CloudRain,
  Sun,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  Plus,
} from 'lucide-react';
import { db, DEFAULT_KITCHENS } from '../services/db';
import { AppView, MealPrediction, FoodBatch } from '../types';

interface KitchenDemandProps {
  onNavigate: (view: AppView) => void;
  onDataMutated: () => void;
}

export const KitchenDemand: React.FC<KitchenDemandProps> = ({ onNavigate, onDataMutated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'predict' | 'batch'>('predict');

  // Prediction Inputs (Step 1)
  const [selectedKitchen, setSelectedKitchen] = useState(DEFAULT_KITCHENS[0].name);
  const [diners, setDiners] = useState(850);
  const [mealType, setMealType] = useState('LUNCH');
  const [weather, setWeather] = useState<'Clear' | 'Rain' | 'Heatwave'>('Rain');
  const [isExam, setIsExam] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);

  // Explainable Calculation for Step 1
  // Baseline turnout approx 75% for lunch
  const weatherMult = weather === 'Rain' ? 0.88 : weather === 'Heatwave' ? 0.92 : 1.0;
  const examMult = isExam ? 1.05 : 1.0;
  const holidayMult = isHoliday ? 0.45 : 1.0;

  const expectedDemand = Math.round(diners * 0.75 * weatherMult * examMult * holidayMult);
  const bufferPortions = Math.max(10, Math.round(expectedDemand * 0.03)); // 3% safety buffer
  const recommendedCooking = expectedDemand + bufferPortions;
  // If naive kitchen prepared for full headcount:
  const wastePreventedKg = Math.max(0, Math.round((diners * 0.75 - recommendedCooking) * 0.25 * 10) / 10);

  // Batch Creation Inputs (Step 2)
  const [foodName, setFoodName] = useState('Rice + Paneer Butter Masala');
  const [preparedPortions, setPreparedPortions] = useState(700);
  const [savedBatch, setSavedBatch] = useState<FoodBatch | null>(null);

  // Computed surplus
  const computedSurplus = Math.max(0, preparedPortions - recommendedCooking);

  const handleSavePrediction = () => {
    db.savePrediction({
      kitchen_id: 'kitch_01',
      kitchen_name: selectedKitchen,
      meal_type: mealType,
      date: new Date().toISOString().split('T')[0],
      expected_diners: diners,
      predicted_quantity: expectedDemand,
      recommended_cooking: recommendedCooking,
      buffer_quantity: bufferPortions,
      waste_prevented_kg: wastePreventedKg,
      weather_condition: weather === 'Rain' ? 'Rainy (-12%)' : weather === 'Heatwave' ? 'Heatwave (-8%)' : 'Clear (Normal)',
      is_exam_period: isExam,
      is_holiday: isHoliday,
    });
    onDataMutated();
    setActiveSubTab('batch');
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = db.createBatch({
      kitchen_id: 'kitch_01',
      kitchen_name: selectedKitchen,
      food_name: foodName,
      prepared_portions: Number(preparedPortions),
      recommended_portions: recommendedCooking,
      unit: 'portions',
    });
    setSavedBatch(batch);
    onDataMutated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
          <ChefHat className="w-3.5 h-3.5" />
          <span>Stage 1 & 2: Demand Planning & Food Preparation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Proactive Waste Prevention & Batch Sizing
        </h2>
        <p className="text-xs text-[#96B3AB] mt-1 max-w-2xl leading-relaxed">
          Kitchen operators forecast dining turnout before cooking begins to prevent bulk overproduction. If actual cooked portions exceed recommendations, the excess is immediately flagged as surplus.
        </p>

        {/* Workflow Sub-tabs */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('predict')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'predict'
                ? 'bg-[#FA8128] text-white shadow-sm'
                : 'bg-white/10 text-[#96B3AB] hover:bg-white/15'
            }`}
          >
            Step 1: Demand Prediction
          </button>
          <button
            onClick={() => setActiveSubTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'batch'
                ? 'bg-[#FA8128] text-white shadow-sm'
                : 'bg-white/10 text-[#96B3AB] hover:bg-white/15'
            }`}
          >
            Step 2: Food Preparation & Surplus Check
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STEP 1 DEMAND PREDICTION */}
      {activeSubTab === 'predict' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Inputs (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-5">
            <div className="pb-3 border-b border-[#F0EAE1]">
              <h3 className="text-sm font-extrabold text-[#133830] uppercase tracking-wider">
                1. Enter Tomorrow's Shift Parameters
              </h3>
              <p className="text-xs text-[#64748B]">Explainable demand modeling</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Kitchen Facility
              </label>
              <select
                value={selectedKitchen}
                onChange={(e) => setSelectedKitchen(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-bold text-[#133830]"
              >
                {DEFAULT_KITCHENS.map((k) => (
                  <option key={k.id} value={k.name}>
                    {k.name} ({k.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Diners Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#133830]">
                  Expected Registered Diners
                </label>
                <span className="text-xs font-black text-[#FA8128] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                  {diners} Students
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={diners}
                onChange={(e) => setDiners(Number(e.target.value))}
                className="w-full accent-[#FA8128] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                <span>100 Diners</span>
                <span>850 (Typical)</span>
                <span>2,000 Capacity</span>
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Meal Shift
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`py-2 rounded-xl text-[11px] transition-all ${
                      mealType === m
                        ? 'bg-[#FA8128] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#64748B] border border-[#F0EAE1]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Weather Forecast Impact
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Clear', label: 'Clear Sky', icon: Sun },
                  { id: 'Rain', label: 'Rain (-12%)', icon: CloudRain },
                  { id: 'Heatwave', label: 'Heatwave (-8%)', icon: Sun },
                ].map((w) => {
                  const Icon = w.icon;
                  const isSelected = weather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeather(w.id as any)}
                      className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FFF3E8] border-[#FA8128] text-[#FA8128]'
                          : 'bg-[#FAF7F2] border-[#F0EAE1] text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px]">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Modifiers */}
            <div className="pt-2 border-t border-[#F0EAE1] space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] cursor-pointer">
                <span className="text-xs font-bold text-[#133830]">Academic Exam Week (+5% study buffer)</span>
                <input
                  type="checkbox"
                  checked={isExam}
                  onChange={(e) => setIsExam(e.target.checked)}
                  className="w-4 h-4 accent-[#FA8128]"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] cursor-pointer">
                <span className="text-xs font-bold text-[#133830]">University Holiday (-55% hostel turnout)</span>
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={(e) => setIsHoliday(e.target.checked)}
                  className="w-4 h-4 accent-[#FA8128]"
                />
              </label>
            </div>
          </div>

          {/* Right Calculations (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-7 shadow-card space-y-5">
              <div className="pb-3 border-b border-[#F0EAE1]">
                <h3 className="text-base font-extrabold text-[#133830]">
                  Explainable Portion Calculation Result
                </h3>
                <p className="text-xs text-[#64748B]">
                  Target headcount: {diners} • Weather factor applied
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD]">
                  <p className="text-[10px] font-bold text-[#0369A1] uppercase">Expected Demand</p>
                  <p className="text-2xl font-black text-[#0369A1] mt-1">{expectedDemand}</p>
                  <p className="text-[10px] text-[#0369A1]/80 mt-0.5">Estimated diners</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A]">
                  <p className="text-[10px] font-bold text-[#B45309] uppercase">Safety Buffer</p>
                  <p className="text-2xl font-black text-[#B45309] mt-1">+{bufferPortions}</p>
                  <p className="text-[10px] text-[#B45309]/80 mt-0.5">+3% contingency</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFEADB] border border-[#FFDEC4] col-span-2 sm:col-span-2">
                  <p className="text-[10px] font-bold text-[#FA8128] uppercase">Recommended Cooking</p>
                  <p className="text-3xl font-black text-[#133830] mt-1">{recommendedCooking} Portions</p>
                  <p className="text-[10px] text-[#133830]/80 mt-0.5">Sized quota for head chef</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E1F7E8] border border-[#C8F2D4] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#15803D]">
                    Waste Prevention Benefit
                  </p>
                  <p className="text-[11px] text-[#15803D]/80">
                    Avoids overproducing unneeded portions before cooking
                  </p>
                </div>
                <span className="text-xl font-black text-[#15803D]">
                  ~{wastePreventedKg} kg food saved
                </span>
              </div>

              {/* Action Button: Flow to Step 2 */}
              <button
                onClick={handleSavePrediction}
                className="w-full py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Save Calculation & Proceed to Food Preparation (Step 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STEP 2 FOOD PREPARATION & BATCH CREATION */}
      {activeSubTab === 'batch' && (
        <div className="max-w-2xl mx-auto bg-white border border-[#F0EAE1] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="pb-4 border-b border-[#F0EAE1]">
            <span className="text-xs font-bold text-[#FA8128] uppercase tracking-wider">
              Step 2 of Food Rescue Flow
            </span>
            <h3 className="text-xl font-black text-[#133830] mt-0.5">
              Record Actual Prepared Food Batch
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              After cooking shift concludes, record the actual quantity prepared to identify potential surplus.
            </p>
          </div>

          {/* Sizing Reference Banner */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#133830]">Recommended Cooking Quota:</p>
              <p className="text-[#64748B]">Calculated from Step 1 demand model</p>
            </div>
            <span className="text-lg font-black text-[#133830] bg-white px-3 py-1 rounded-xl border border-[#F0EAE1]">
              {recommendedCooking} portions
            </span>
          </div>

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Food Name / Description
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Rice + Paneer Butter Masala"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-bold text-[#133830] focus:outline-none focus:border-[#FA8128]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#133830] block mb-1.5">
                Actual Prepared Quantity (Portions)
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                required
                value={preparedPortions}
                onChange={(e) => setPreparedPortions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-bold text-[#133830] focus:outline-none focus:border-[#FA8128]"
              />
            </div>

            {/* Real-time Surplus Comparison Box */}
            <div
              className={`p-4 rounded-2xl border ${
                computedSurplus > 0 ? 'bg-[#FFEADB] border-[#FFDEC4]' : 'bg-[#FAF7F2] border-[#F0EAE1]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#133830]">Surplus Calculation:</span>
                <span className="font-mono text-[#64748B]">
                  {preparedPortions} prepared - {recommendedCooking} recommended
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#133830]">
                  Surplus Quantity:
                </span>
                <span
                  className={`text-xl font-black ${
                    computedSurplus > 0 ? 'text-[#FA8128]' : 'text-[#64748B]'
                  }`}
                >
                  {computedSurplus > 0 ? `${computedSurplus} Portions Available` : '0 Portions (Exact Quota)'}
                </span>
              </div>
              {computedSurplus > 0 && (
                <p className="text-[11px] text-[#B45309] font-medium mt-1">
                  💡 {computedSurplus} portions potentially available for rescue. Food safety inspection is required before donation.
                </p>
              )}
            </div>

            {!savedBatch ? (
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#133830] hover:bg-[#1B4A3F] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Save Batch Record</span>
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Batch saved successfully! ({savedBatch.surplus_portions} portions surplus detected).</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('quality')}
                  className="w-full py-3.5 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to 3-Photo Food Safety Inspection (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
