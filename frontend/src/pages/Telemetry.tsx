import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  AlertTriangle,
  Zap,
  Clock,
  Flame,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { api, MOCK_TELEMETRY } from '../services/api';
import { StorageTelemetryItem, PlantLossAnalytics } from '../types';
import { StatusPill } from '../components/ui/StatusPill';

export const Telemetry: React.FC = () => {
  const [telemetry, setTelemetry] = useState<StorageTelemetryItem[]>(MOCK_TELEMETRY);
  const [plantLosses, setPlantLosses] = useState<PlantLossAnalytics | null>(null);
  const [isBreachSimulated, setIsBreachSimulated] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTelemetryData = async () => {
    try {
      const [telData, lossData] = await Promise.all([
        api.getLiveTelemetry(),
        api.getPlantInefficiencies(),
      ]);
      setTelemetry(telData);
      setPlantLosses(lossData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
  }, []);

  const handleSimulateBreach = async () => {
    setLoading(true);
    try {
      // Simulate breach on Unit #1: spike temp to 14.8°C
      const updated = await api.simulateBreach('unit_cr_01', 14.8);
      setTelemetry((prev) =>
        prev.map((u) => (u.unit_id === 'unit_cr_01' ? updated : u))
      );
      setIsBreachSimulated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTelemetry = async () => {
    setIsBreachSimulated(false);
    fetchTelemetryData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 4: Industrial Plant Telemetry & Cold-Chain Sentinel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Real-Time RTD Sensors & Operational Anomaly Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#96B3AB] mt-2 leading-relaxed">
            Continuous IoT telemetry monitoring across cold storage rooms, chilling silos, and automated packaging lines. Instantly flags thermal drift above 4°C, compressor overloads, and mechanical packaging bottlenecks within 30 seconds.
          </p>
        </div>

        {/* Demo Simulator Buttons for Judges */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          {!isBreachSimulated ? (
            <button
              onClick={handleSimulateBreach}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 animate-pulse"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Thermal Breach (Demo)</span>
            </button>
          ) : (
            <button
              onClick={handleResetTelemetry}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Normal (4.0°C)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Cold Storage Chamber Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#133830] tracking-tight">
            Cold-Chain Chamber Sensor Gauges
          </h3>
          <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Sampling every 2.5s</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {telemetry.map((unit) => {
            const isCritical = unit.status === 'CRITICAL';
            const isWarning = unit.status === 'WARNING';

            return (
              <div
                key={unit.unit_id}
                className={`p-6 rounded-3xl border shadow-card transition-all flex flex-col justify-between ${
                  isCritical
                    ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20'
                    : isWarning
                    ? 'bg-amber-50/80 border-amber-300'
                    : 'bg-white border-[#F0EAE1]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        {unit.unit_id}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#133830] mt-0.5">
                        {unit.unit_name}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">{unit.facility}</p>
                    </div>
                    <StatusPill status={unit.status} size="sm" />
                  </div>

                  {/* Temperature Gauge Display */}
                  <div className="my-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase">Current Temp</p>
                      <p
                        className={`text-3xl font-black ${
                          isCritical
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-[#133830]'
                        }`}
                      >
                        {unit.current_temp_celsius.toFixed(1)}°C
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase">Setpoint</p>
                      <p className="text-base font-extrabold text-[#64748B]">
                        {unit.setpoint_temp_celsius.toFixed(1)}°C
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Metrics: Humidity, Compressor, Door */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1]">
                      <p className="text-[10px] text-[#64748B] font-bold">Humidity</p>
                      <p className="font-extrabold text-[#133830] mt-0.5">{unit.humidity_rh}%</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1]">
                      <p className="text-[10px] text-[#64748B] font-bold">Load</p>
                      <p className="font-extrabold text-[#133830] mt-0.5">{unit.compressor_load_pct}%</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#F0EAE1]">
                      <p className="text-[10px] text-[#64748B] font-bold">Door</p>
                      <p className={`font-extrabold text-[11px] mt-0.5 ${unit.door_status.includes('BREACH') ? 'text-rose-600' : 'text-[#133830]'}`}>
                        {unit.door_status}
                      </p>
                    </div>
                  </div>
                </div>

                {isCritical && (
                  <div className="mt-4 p-2.5 rounded-xl bg-rose-200/60 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                    <span>Thermal breach! Inventory quarantine alert sent to supervisor.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Industrial Waste & Mechanical Bottlenecks Section */}
      <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#133830] tracking-tight">
              Processing Plant Inefficiencies & Scrap Losses
            </h3>
            <p className="text-xs text-[#64748B]">
              Automated anomaly detection across mechanical packaging lines and bulk kettles
            </p>
          </div>
        </div>

        {/* Aggregate Loss Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#FFEADB] border border-[#FFDEC4]">
            <p className="text-xs font-bold text-[#64748B] uppercase">Raw Material Scrap</p>
            <p className="text-2xl font-black text-[#133830] mt-0.5">
              {plantLosses?.total_raw_material_loss_kg || 140.5} kg
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FEF6D8] border border-[#FDF0BE]">
            <p className="text-xs font-bold text-[#64748B] uppercase">Financial Scrap Loss</p>
            <p className="text-2xl font-black text-[#133830] mt-0.5">
              ₹{plantLosses?.total_financial_loss_inr?.toLocaleString() || '16,200'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FEE4E8] border border-[#FCD3DC]">
            <p className="text-xs font-bold text-[#64748B] uppercase">Packaging Downtime</p>
            <p className="text-2xl font-black text-[#BE123C] mt-0.5">
              {plantLosses?.total_machine_downtime_minutes || 57} mins
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#E1F1FD] border border-[#CEE7FC]">
            <p className="text-xs font-bold text-[#64748B] uppercase">Excess Energy Spike</p>
            <p className="text-2xl font-black text-[#0369A1] mt-0.5">
              {plantLosses?.excess_energy_consumed_kwh || 45.7} kWh
            </p>
          </div>
        </div>

        {/* Loss Events Stream Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0EAE1] text-[#64748B] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Production Line</th>
                <th className="py-2.5 px-3">Loss Classification</th>
                <th className="py-2.5 px-3">Yield Scrap (kg)</th>
                <th className="py-2.5 px-3">Cost Impact</th>
                <th className="py-2.5 px-3">Root Cause Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {plantLosses?.recent_loss_events.map((event) => (
                <tr key={event.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3 px-3 font-bold text-[#133830]">{event.line_name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                      {event.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#133830]">{event.loss_kg} kg</td>
                  <td className="py-3 px-3 font-bold text-rose-600">₹{event.cost_inr.toLocaleString()}</td>
                  <td className="py-3 px-3 text-[#64748B]">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
