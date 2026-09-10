export type AppView =
  | 'landing'
  | 'dashboard'
  | 'kitchen'
  | 'quality'
  | 'redistribution'
  | 'telemetry'
  | 'esg';

export type UserRole =
  | 'KITCHEN_OPERATOR'
  | 'PLANT_SUPERVISOR'
  | 'NGO_REPRESENTATIVE'
  | 'REGULATOR_AUDITOR';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  orgName: string;
  avatarUrl: string;
}

export interface DemandPrediction {
  recommended_portions: number;
  expected_attendance: number;
  overproduction_risk_percentage: number;
  confidence_score: number;
  buffer_portions: number;
  projected_waste_prevention_kg: number;
  procurement_recommendations: {
    ingredient: string;
    recommended_kg: number;
    unit: string;
  }[];
  ai_insights: string;
}

export interface QualityAnalysis {
  freshness_index: number;
  quality_grade: 'GRADE_A' | 'GRADE_B' | 'INEDIBLE';
  safe_window_minutes: number;
  safe_window_formatted: string;
  is_safe_for_consumption: boolean;
  spoilage_risk_factors: string[];
  action_directive: string;
}

export interface SurplusBatch {
  id: string;
  food_name: string;
  category: string;
  diet_type: string;
  quantity_portions: number;
  quantity_kg: number;
  freshness_index: number;
  safe_window_minutes: number;
  expiry_timestamp: string;
  donor_name: string;
  donor_lat: number;
  donor_lng: number;
  donor_address: string;
  status: 'AVAILABLE' | 'MATCHED' | 'IN_TRANSIT' | 'CLAIMED_VERIFIED' | 'EXPIRED';
  pickup_otp?: string;
  claimed_by?: string | null;
  created_at: string;
}

export interface NGOBeneficiary {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  beneficiary_capacity: number;
  verified: boolean;
  distance_km?: number;
  eta_minutes?: number;
}

export interface RouteStep {
  step_number: number;
  location_name: string;
  lat: number;
  lng: number;
  eta_from_start_minutes: number;
  distance_from_prev_km: number;
}

export interface RouteOptimizationResult {
  optimized_path: RouteStep[];
  total_distance_km: number;
  total_transit_minutes: number;
  arrives_before_expiry: boolean;
  fuel_co2e_estimate_kg: number;
}

export interface StorageTelemetryItem {
  unit_id: string;
  unit_name: string;
  facility: string;
  current_temp_celsius: number;
  setpoint_temp_celsius: number;
  humidity_rh: number;
  door_status: string;
  compressor_load_pct: number;
  is_breached: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export interface PlantLossAnalytics {
  total_raw_material_loss_kg: number;
  total_financial_loss_inr: number;
  total_machine_downtime_minutes: number;
  excess_energy_consumed_kwh: number;
  category_distribution: Record<string, number>;
  recent_loss_events: {
    id: string;
    line_name: string;
    category: string;
    loss_kg: number;
    cost_inr: number;
    downtime_minutes: number;
    energy_spike_kwh: number;
    description: string;
    timestamp: string;
  }[];
}

export interface ESGMetrics {
  total_food_diverted_kg: number;
  total_meals_saved: number;
  avoided_co2e_kg: number;
  groundwater_conserved_litres: number;
  total_institutions_participating: number;
  total_ngos_active: number;
  estimated_financial_value_inr: number;
  sdg_alignment: Record<string, string>;
}

export interface ESGComplianceReport {
  report_id: string;
  generated_at: string;
  regulatory_body: string;
  compliance_standard: string;
  reporting_period: string;
  aggregate_metrics: ESGMetrics;
  audit_status: string;
  verification_hash: string;
}
