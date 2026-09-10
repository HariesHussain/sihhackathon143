import React, { useState } from 'react';
import {
  Activity,
  Thermometer,
  AlertTriangle,
  Flame,
  RotateCcw,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { db } from '../services/db';
import { ColdStorageUnit } from '../types';
import { StatusPill } from '../components/ui/StatusPill';

export const Telemetry: React.FC = () => {
  const [units, setUnits] = useState<ColdStorageUnit[]>(db.getColdStorage());
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const handleSimulateBreach = (unitId: string) => {
    try {
      const updated = db.simulateTemperatureBreach(unitId, 14.8);
      setUnits([...db.getColdStorage()]);
      setAlertBanner(`WARNING: Storage temperature in ${updated.unit_name} exceeded safe threshold! (Current: 14.8°C, Max: ${updated.safe_max_celsius}°C)`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    db.resetColdStorage();
    setUnits([...db.getColdStorage()]);
    setAlertBanner(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Honest Labeling */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 text-white shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>SIMULATED SENSOR TELEMETRY (DEMO)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Cold Storage & Storage Temperature Monitoring
        </h2>
        <p className="text-xs text-[#96B3AB] mt-1 max-w-2xl leading-relaxed">
          Demonstrates how IoT RTD thermal sensors monitor cooked inventory holding chambers to detect thermal drift and prevent batch spoilage.
        </p>

        <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => handleSimulateBreach('CS-01')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Temperature Breach</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sensors to Normal</span>
          </button>
        </div>
      </div>

      {/* Active Breach Alert Banner */}
      {alertBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-extrabold">{alertBanner}</p>
            <p className="text-[11px] text-rose-700 font-medium mt-0.5">
              Automated high-priority alert triggered for kitchen supervisor. Food inventory quarantined.
            </p>
          </div>
        </div>
      )}

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {units.map((unit) => {
          const isCritical = unit.status === 'CRITICAL';
          return (
            <div
              key={unit.unit_id}
              className={`p-6 rounded-3xl border shadow-card transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white border-[#F0EAE1]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#64748B]">
                      {unit.unit_id} • SIMULATED SENSOR
                    </span>
                    <h4 className="text-sm font-extrabold text-[#133830] mt-0.5">
                      {unit.unit_name}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">{unit.facility}</p>
                  </div>
                  <StatusPill status={unit.status} size="sm" />
                </div>

                {/* Temperature Box */}
                <div className="my-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      Current Temp
                    </span>
                    <p
                      className={`text-3xl font-black mt-0.5 ${
                        isCritical ? 'text-rose-600' : 'text-[#133830]'
                      }`}
                    >
                      {unit.current_temp_celsius.toFixed(1)}°C
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      Safe Range
                    </span>
                    <p className="text-xs font-bold text-[#64748B] mt-0.5">
                      {unit.safe_min_celsius}°C to {unit.safe_max_celsius}°C
                    </p>
                    <span className="text-[10px] text-[#94A3B8]">
                      Setpoint: {unit.setpoint_temp_celsius}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F0EAE1]">
                  <span>Humidity: <strong>{unit.humidity_rh}%</strong></span>
                  <span className="text-[11px]">Sampling every 3s</span>
                </div>
              </div>

              {isCritical ? (
                <div className="mt-4 pt-3 border-t border-rose-200 text-[11px] text-rose-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Threshold Exceeded: Holding unsafe</span>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-[#F0EAE1] text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thermal Holding Stable</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
