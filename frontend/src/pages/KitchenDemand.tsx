import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  CloudRain,
  Sun,
  GraduationCap,
  Calendar,
  Sparkles,
  Printer,
  Download,
  CheckCircle,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { DemandPrediction } from '../types';

export const KitchenDemand: React.FC = () => {
  const [headcount, setHeadcount] = useState(850);
  const [mealType, setMealType] = useState('LUNCH');
  const [dayOfWeek, setDayOfWeek] = useState('Thursday');
  const [weatherCondition, setWeatherCondition] = useState('Torrential Monsoon Rain');
  const [isExamPeriod, setIsExamPeriod] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);

  const [prediction, setPrediction] = useState<DemandPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getDemandForecast({
        facility_name: 'Central Institutional Mess',
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        registered_headcount: Number(headcount),
        day_of_week: dayOfWeek,
        is_exam_period: isExamPeriod,
        is_holiday: isHoliday,
        weather_condition: weatherCondition,
      });
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [headcount, mealType, dayOfWeek, weatherCondition, isExamPeriod, isHoliday]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 1: Proactive Food Waste Prevention Strategist</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Demand Forecast & Smart Kitchen Sizing
          </h2>
          <p className="text-xs sm:text-sm text-[#96B3AB] mt-2 leading-relaxed">
            Eliminate batch overproduction before cooking starts. Annapurna’s predictive engine factors real-time weather forecasts, academic examination periods, and 90-day mess attendance trends to compute the exact portion quota.
          </p>
        </div>

        <div className="text-center bg-white/10 p-4 rounded-2xl border border-white/15 shrink-0 self-stretch sm:self-auto">
          <p className="text-xs text-[#96B3AB] uppercase font-bold tracking-wider">Target Precision</p>
          <p className="text-3xl font-black text-[#FA8128] mt-0.5">MAPE &lt; 6.5%</p>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">Verified on 12-24h horizon</p>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Predicted Plan on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Interactive Scenario Parameters */}
        <div className="lg:col-span-5 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h3 className="text-base font-extrabold text-[#133830]">
              Mess Sizing Parameters
            </h3>
            <span className="text-[10px] font-bold text-[#FA8128] uppercase tracking-wider">
              Live Recalculation
            </span>
          </div>

          {/* Registered Headcount Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#133830]">
                Registered Headcount / Diners
              </label>
              <span className="text-sm font-extrabold text-[#FA8128] bg-[#FFF3E8] px-2.5 py-0.5 rounded-lg border border-orange-200">
                {headcount} Students
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="w-full accent-[#FA8128] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-medium">
              <span>100 Diners</span>
              <span>1,250 Avg</span>
              <span>2,500 Full Capacity</span>
            </div>
          </div>

          {/* Meal Type Toggle */}
          <div>
            <label className="text-xs font-bold text-[#133830] block mb-2">
              Shift Meal Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setMealType(meal)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    mealType === meal
                      ? 'bg-[#FA8128] text-white shadow-sm'
                      : 'bg-[#FAF7F2] text-[#64748B] border border-[#F0EAE1] hover:bg-[#F0EAE1]'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Condition Scenario */}
          <div>
            <label className="text-xs font-bold text-[#133830] block mb-2">
              Real-Time Weather Forecast
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { name: 'Clear Sky (Normal)', val: 'Clear', icon: Sun },
                { name: 'Torrential Rain (-12%)', val: 'Torrential Monsoon Rain', icon: CloudRain },
                { name: 'Heatwave 42°C (-8%)', val: 'Scorching Heatwave', icon: Sun },
              ].map((w) => {
                const Icon = w.icon;
                const isSelected = weatherCondition === w.val;
                return (
                  <button
                    key={w.val}
                    onClick={() => setWeatherCondition(w.val)}
                    className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFF3E8] border-[#FA8128] text-[#FA8128]'
                        : 'bg-[#FAF7F2] border-[#F0EAE1] text-[#64748B] hover:bg-[#F0EAE1]'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar & University Schedule Modifiers */}
          <div className="pt-2 border-t border-[#F0EAE1] space-y-3">
            <label className="text-xs font-bold text-[#133830] block">
              Institutional Schedule Modifiers
            </label>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#133830]" />
                <div>
                  <p className="text-xs font-bold text-[#133830]">Academic Exam Week</p>
                  <p className="text-[10px] text-[#64748B]">Adds +4% safe study buffer for late diners</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isExamPeriod}
                onChange={(e) => setIsExamPeriod(e.target.checked)}
                className="w-4 h-4 accent-[#FA8128] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#133830]" />
                <div>
                  <p className="text-xs font-bold text-[#133830]">University Holiday / Long Weekend</p>
                  <p className="text-[10px] text-[#64748B]">Dramatically reduces expected hostel occupancy (-55%)</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4 h-4 accent-[#FA8128] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Sizing Output & Procurement Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#FFEADB] border border-[#FFDEC4] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Recommended Cooking
              </p>
              <h3 className="text-3xl font-black text-[#133830] mt-1">
                {prediction?.recommended_portions || 0}
              </h3>
              <p className="text-[11px] text-[#FA8128] font-semibold mt-1">
                Includes +{prediction?.buffer_portions || 0} portion buffer
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#E1F7E8] border border-[#C8F2D4] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Waste Prevented
              </p>
              <h3 className="text-3xl font-black text-[#15803D] mt-1">
                {prediction?.projected_waste_prevention_kg || 0} kg
              </h3>
              <p className="text-[11px] text-[#15803D] font-semibold mt-1">
                Avoided unneeded raw ingredients
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#E1F1FD] border border-[#CEE7FC] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Turnout Risk Index
              </p>
              <h3 className="text-3xl font-black text-[#0369A1] mt-1">
                {prediction?.overproduction_risk_percentage || 0}%
              </h3>
              <p className="text-[11px] text-[#0369A1] font-semibold mt-1">
                Without AI optimization
              </p>
            </div>
          </div>

          {/* AI Chef Insights Box */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0EAE1] shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#FA8128]" />
              <h4 className="text-xs font-extrabold text-[#133830] uppercase tracking-wider">
                Agent 1 Tactical Advisory
              </h4>
            </div>
            <p className="text-xs text-[#334155] leading-relaxed">
              {prediction?.ai_insights}
            </p>
          </div>

          {/* Raw Material Procurement Quantity Table */}
          <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
              <div>
                <h3 className="text-base font-extrabold text-[#133830]">
                  Recommended Raw Material Procurement Quota
                </h3>
                <p className="text-xs text-[#64748B]">
                  Batch-calculated raw ingredients matching target portion sizing
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#133830] font-bold text-xs border border-[#F0EAE1] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Slip</span>
              </button>
            </div>

            <div className="divide-y divide-[#F0EAE1] mt-3">
              {prediction?.procurement_recommendations.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between hover:bg-[#FAF7F2] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#F0EAE1] text-[#64748B] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#133830]">
                      {item.ingredient}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#FA8128]">
                      {item.recommended_kg}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B]">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
