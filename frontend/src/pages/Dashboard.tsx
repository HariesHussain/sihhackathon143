import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  ShoppingBag,
  AlertCircle,
  IndianRupee,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
  Download,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { PastelCard } from '../components/ui/PastelCard';
import { StatusPill } from '../components/ui/StatusPill';
import { api } from '../services/api';
import { SurplusBatch, AppView } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [batches, setBatches] = useState<SurplusBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'Month' | '6 month' | 'Year' | 'All time'>('Year');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await api.getSurplusBatches();
        setBatches(data);
      } catch (err) {
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // Monthly Bar Chart Data (Matches the Sepetbox bar chart in Screenshot 1)
  const monthlyData = [
    { month: 'Jan', meals: 1800 },
    { month: 'Feb', meals: 3800 },
    { month: 'Mar', meals: 2500 },
    { month: 'Apr', meals: 6400 },
    { month: 'May', meals: 7200 },
    { month: 'Jun', meals: 4800 },
    { month: 'July', meals: 9800 },
    { month: 'Aug', meals: 5900 },
    { month: 'Sept', meals: 7400 },
    { month: 'Oct', meals: 2100 },
    { month: 'Nov', meals: 4800 },
    { month: 'Dec', meals: 6200 },
  ];

  const filteredBatches = batches.filter(
    (b) =>
      b.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.donor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top 5 Signature Pastel Metric Cards (Exact Sepetbox layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <PastelCard
          title="Total Rescued Diners"
          value="46,125"
          subtitle="Portions safely delivered"
          icon={Users}
          variant="peach"
          badge="+14.2%"
          badgePositive={true}
        />
        <PastelCard
          title="Active Kitchens"
          value="34 Units"
          subtitle="Registered mess halls"
          icon={Store}
          variant="sky"
          badge="100% Active"
          badgePositive={true}
        />
        <PastelCard
          title="NGO Dispatches"
          value="1,452"
          subtitle="Completed route drops"
          icon={ShoppingBag}
          variant="sunlight"
          badge="+8 today"
          badgePositive={true}
        />
        <PastelCard
          title="Spoilage Blocked"
          value="0 kg"
          subtitle="Zero unsafe handovers"
          icon={AlertCircle}
          variant="rose"
          badge="Protected"
          badgePositive={true}
        />
        <PastelCard
          title="Preserved Value"
          value="₹18.45 L"
          subtitle="Food value saved from waste"
          icon={IndianRupee}
          variant="mint"
          badge="MoFPI Certified"
          badgePositive={true}
        />
      </div>

      {/* Main Analytics Section: Revenue/Volume Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Rescued Volume Chart (Matches Sepetbox Screenshot 1) */}
        <div className="lg:col-span-2 bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#133830] tracking-tight">
                Monthly Meal Diversion Trend
              </h3>
              <p className="text-xs text-[#64748B]">
                Portions diverted from landfills into verified community kitchens
              </p>
            </div>

            {/* Period Selector Pills (Matches Sepetbox Month/6month/Year pills) */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#F0EAE1] self-start">
              {(['Month', '6 month', 'Year', 'All time'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    chartPeriod === p
                      ? 'bg-[#FA8128] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#133830]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EAE1" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#F0EAE1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#F0EAE1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: '#FFF3E8' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#133830] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-[#0E2B25]">
                          <span>{payload[0].value?.toLocaleString()} Portions</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="meals" fill="#FA8128" radius={[8, 8, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Actions & AI Status */}
        <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#133830] tracking-tight">
                Quick Actions
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Ready
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-5">
              Instantly jump into operations or trigger simulated judge demos.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('kitchen')}
                className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF3E8] border border-[#F0EAE1] transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#133830] group-hover:text-[#FA8128] transition-colors">
                    Plan Tomorrow's Cooking Shift
                  </h4>
                  <p className="text-[11px] text-[#64748B]">Predict headcount with weather & exam filters</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FA8128] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('quality')}
                className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF3E8] border border-[#F0EAE1] transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#133830] group-hover:text-[#FA8128] transition-colors">
                    Run Freshness Scan on Food Tray
                  </h4>
                  <p className="text-[11px] text-[#64748B]">Computer vision + temperature decay formula</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FA8128] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('redistribution')}
                className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF3E8] border border-[#F0EAE1] transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#133830] group-hover:text-[#FA8128] transition-colors">
                    Dispatch Food & Verify Handover OTP
                  </h4>
                  <p className="text-[11px] text-[#64748B]">6-digit OTP verification with double-spend proof</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FA8128] group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EAE1] flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>5 Agents Active</span>
            </span>
            <button
              onClick={() => onNavigate('esg')}
              className="text-[#FA8128] font-bold hover:underline"
            >
              View ESG Audit &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Active Food Surplus Live Stream Table (Matches Sepetbox Screenshot 1 & 2) */}
      <div className="bg-white border border-[#F0EAE1] rounded-3xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0EAE1]">
          <div>
            <h3 className="text-lg font-extrabold text-[#133830] tracking-tight">
              Live Surplus Inventory & Handover Stream
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time batch declarations across registered institutional kitchens
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food or facility..."
                className="pl-9 pr-3 py-1.5 rounded-2xl bg-[#FAF7F2] border border-[#F0EAE1] text-xs font-medium text-[#133830] focus:outline-none focus:border-[#FA8128] transition-colors w-48 sm:w-64"
              />
            </div>

            <button
              onClick={() => onNavigate('redistribution')}
              className="px-4 py-2 rounded-2xl bg-[#FA8128] hover:bg-[#E6711B] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Declare Surplus</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0EAE1] text-[#64748B] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Food Item</th>
                <th className="py-3 px-3">Donor Facility</th>
                <th className="py-3 px-3">Portions / Kg</th>
                <th className="py-3 px-3">Freshness Score</th>
                <th className="py-3 px-3">Safe Window</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFEADB] text-[#FA8128] flex items-center justify-center font-bold text-base shadow-xs">
                        🍲
                      </div>
                      <div>
                        <p className="font-extrabold text-[#133830]">{batch.food_name}</p>
                        <p className="text-[10px] text-[#64748B] font-medium">{batch.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-[#133830]">{batch.donor_name}</p>
                    <p className="text-[10px] text-[#64748B]">{batch.donor_address}</p>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-[#133830]">
                    <span>{batch.quantity_portions} portions</span>
                    <span className="text-[#64748B] text-[10px] block font-medium">({batch.quantity_kg} kg)</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-600">{batch.freshness_index}%</span>
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${batch.freshness_index}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#133830]">
                      <Clock className="w-3.5 h-3.5 text-[#FA8128]" />
                      <span>{batch.safe_window_minutes} mins left</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <StatusPill status={batch.status} />
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('redistribution')}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FA8128] text-[#133830] hover:text-white font-bold text-[11px] transition-colors border border-[#F0EAE1]"
                    >
                      {batch.status === 'AVAILABLE' ? 'Dispatch' : 'Track OTP'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
