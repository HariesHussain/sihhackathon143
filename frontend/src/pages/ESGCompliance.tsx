import React, { useState, useEffect } from 'react';
import {
  Award,
  Leaf,
  Droplets,
  HeartHandshake,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { ESGMetrics, ESGComplianceReport } from '../types';

export const ESGCompliance: React.FC = () => {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [report, setReport] = useState<ESGComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchESG = async () => {
      try {
        const [m, r] = await Promise.all([
          api.getESGMetrics(),
          api.getESGComplianceReport(),
        ]);
        setMetrics(m);
        setReport(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchESG();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133830] to-[#1B4A3F] rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 5: ESG & MoFPI Sustainability Compliance Auditor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Environmental Impact & Government Reporting
          </h2>
          <p className="text-xs sm:text-sm text-[#96B3AB] mt-2 leading-relaxed">
            Translates verified landfill diversion into auditable carbon avoidance (IPCC standard: 2.5 kg CO₂e / kg food) and groundwater conservation (1,200 L / kg). Produces tamper-evident compliance certificates stamped with SHA-256 digital seals.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-5 py-3 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Export Official Certificate</span>
          </button>
        </div>
      </div>

      {/* 3 UN Sustainable Development Goals (SDGs) Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#E1F7E8] border border-[#C8F2D4] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#16A34A] text-white">
                UN SDG 2
              </span>
              <HeartHandshake className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h3 className="text-lg font-black text-[#133830]">Zero Hunger</h3>
            <p className="text-xs text-[#334155] mt-2 leading-relaxed">
              Targeted redistribution ensures verified edible surplus directly reaches low-income beneficiary shelters, night shelters, and community kitchens within hours of preparation.
            </p>
          </div>
          <p className="text-xs font-extrabold text-[#16A34A] mt-4 pt-3 border-t border-black/5">
            46,125 Meals Delivered
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FEF6D8] border border-[#FDF0BE] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#EAB308] text-white">
                UN SDG 12
              </span>
              <Award className="w-6 h-6 text-[#EAB308]" />
            </div>
            <h3 className="text-lg font-black text-[#133830]">
              Responsible Consumption
            </h3>
            <p className="text-xs text-[#334155] mt-2 leading-relaxed">
              Supports Target 12.3: Halving per capita global food waste at institutional kitchen and food manufacturing stages through predictive AI batch sizing and quality redirection.
            </p>
          </div>
          <p className="text-xs font-extrabold text-[#B45309] mt-4 pt-3 border-t border-black/5">
            18.45 Metric Tons Diverted
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#E1F1FD] border border-[#CEE7FC] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#0284C7] text-white">
                UN SDG 13
              </span>
              <Leaf className="w-6 h-6 text-[#0284C7]" />
            </div>
            <h3 className="text-lg font-black text-[#133830]">Climate Action</h3>
            <p className="text-xs text-[#334155] mt-2 leading-relaxed">
              Methane mitigation: Preventing organic food decomposition in municipal open-air dumps avoids approximately 2.5 kg of greenhouse emissions per kg of edible food.
            </p>
          </div>
          <p className="text-xs font-extrabold text-[#0369A1] mt-4 pt-3 border-t border-black/5">
            46.1 Tons CO₂e Mitigated
          </p>
        </div>
      </div>

      {/* Official MoFPI Compliance Certificate View */}
      {report && (
        <div className="bg-white border-2 border-[#133830] rounded-3xl p-8 sm:p-10 shadow-card relative overflow-hidden">
          {/* Government Watermark / Seal Background */}
          <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
            <span className="text-9xl">🏛️</span>
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-6 border-b border-[#F0EAE1]">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#64748B]">
              Government of India • Ministry of Food Processing Industries (MoFPI)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#133830] mt-1 tracking-tight">
              Institutional Food Waste Management Protocol 2026
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-semibold">
              Official Environmental, Social & Governance (ESG) Audit Certificate
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-[#E1F7E8] border border-[#C8F2D4] text-[#15803D] text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>AUDIT STATUS: {report.audit_status}</span>
            </div>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-[#F0EAE1] text-xs">
            <div>
              <p className="text-[#64748B] font-bold uppercase text-[10px]">Certificate ID</p>
              <p className="font-extrabold text-[#133830] mt-0.5">{report.report_id}</p>
            </div>
            <div>
              <p className="text-[#64748B] font-bold uppercase text-[10px]">Reporting Period</p>
              <p className="font-extrabold text-[#133830] mt-0.5">{report.reporting_period}</p>
            </div>
            <div>
              <p className="text-[#64748B] font-bold uppercase text-[10px]">Participating Canteens</p>
              <p className="font-extrabold text-[#133830] mt-0.5">34 Kitchen Units</p>
            </div>
            <div>
              <p className="text-[#64748B] font-bold uppercase text-[10px]">Verified NGO Receivers</p>
              <p className="font-extrabold text-[#133830] mt-0.5">58 Community Hubs</p>
            </div>
          </div>

          {/* Environmental Ledger Summary */}
          <div className="py-6 border-b border-[#F0EAE1]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#64748B] mb-4">
              Cumulative Verified Resource Offset Ledger
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <Leaf className="w-4 h-4" />
                  <span>Avoided Greenhouse Gases</span>
                </div>
                <p className="text-2xl font-black text-[#133830]">
                  {report.aggregate_metrics.avoided_co2e_kg?.toLocaleString()} kg CO₂e
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Equivalent to removing ~10 passenger cars for 1 year
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
                  <Droplets className="w-4 h-4" />
                  <span>Groundwater Conserved</span>
                </div>
                <p className="text-2xl font-black text-[#133830]">
                  {report.aggregate_metrics.groundwater_conserved_litres?.toLocaleString()} L
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Based on 1,200 L embodied agricultural water per kg food
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1]">
                <div className="flex items-center gap-2 text-[#FA8128] font-bold text-xs mb-1">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Nutritional Plates Served</span>
                </div>
                <p className="text-2xl font-black text-[#133830]">
                  {report.aggregate_metrics.total_meals_saved?.toLocaleString()} Plates
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  100% verified via chain-of-custody OTP verification
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Stamp */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-[10px] text-[#64748B] font-bold uppercase">
                Cryptographic Integrity Verification Seal
              </p>
              <p className="font-mono text-xs font-bold text-[#133830] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#F0EAE1] mt-1">
                {report.verification_hash}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#64748B] block font-bold">Authorized Signatory</span>
              <span className="font-serif italic text-base font-bold text-[#133830]">MoFPI ESG Sentinel</span>
              <span className="text-[10px] text-[#94A3B8] block">Automated Distributed Ledger</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
