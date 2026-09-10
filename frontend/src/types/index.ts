export type AppView =
  | 'landing'
  | 'dashboard'
  | 'kitchen'
  | 'batches'
  | 'quality'
  | 'rescue'
  | 'logistics'
  | 'telemetry'
  | 'impact';

export type UserRole = 'kitchen_operator' | 'ngo' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_name: string;
  phone?: string;
  avatar_initials?: string;
}

export interface Kitchen {
  id: string;
  owner_id?: string;
  name: string;
  location: string;
  capacity: number;
}

export interface NGO {
  id: string;
  owner_id?: string;
  name: string;
  location: string;
  contact: string;
  beneficiary_capacity: number;
  verified: boolean;
  distance_km: number;
  estimated_time_mins: number;
}

export interface MealPrediction {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  meal_type: string;
  date: string;
  expected_diners: number;
  predicted_quantity: number;
  recommended_cooking: number;
  buffer_quantity: number;
  waste_prevented_kg: number;
  weather_condition: string;
  is_exam_period: boolean;
  is_holiday: boolean;
  created_at: string;
}

export interface FoodBatch {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  food_name: string;
  prepared_portions: number;
  recommended_portions: number;
  surplus_portions: number;
  unit?: string;
  status: 'COOKED' | 'INSPECTED' | 'SURPLUS_DECLARED' | 'MATCHED' | 'DELIVERED' | 'DISCARDED';
  prepared_at: string;
  inspection_id?: string;
}

export interface FoodInspection {
  id: string;
  food_batch_id: string;
  food_name: string;
  freshness_score: number;
  grade: 'GRADE_A' | 'GRADE_B' | 'INEDIBLE';
  safe_window_minutes: number;
  recommendation: string;
  image_url_top: string;
  image_url_side: string;
  image_url_closeup: string;
  observations: string[];
  created_at: string;
}

export interface SurplusDeclaration {
  id: string;
  food_batch_id: string;
  food_name: string;
  kitchen_name: string;
  quantity_portions: number;
  quantity_kg: number;
  freshness_score: number;
  safe_window_minutes: number;
  available_until: string;
  status: 'OPEN' | 'REQUESTED' | 'CLAIMED' | 'EXPIRED';
  created_at: string;
}

export interface RedistributionRequest {
  id: string;
  surplus_id: string;
  food_name: string;
  kitchen_name: string;
  ngo_id: string;
  ngo_name: string;
  portions: number;
  distance_km: number;
  estimated_time_mins: number;
  status: 'PENDING_NGO' | 'ACCEPTED' | 'DECLINED' | 'IN_TRANSIT' | 'COMPLETED';
  dispatch_id?: string;
  created_at: string;
}

export interface Dispatch {
  id: string;
  redistribution_request_id: string;
  food_name: string;
  kitchen_name: string;
  ngo_name: string;
  portions: number;
  distance_km: number;
  pickup_time: string;
  delivery_deadline: string;
  status: 'SCHEDULED' | 'PICKED_UP' | 'DELIVERED';
  otp: string; // 6-digit handover passcode
  delivered_at?: string;
  created_at: string;
}

export interface ImpactMetrics {
  total_meals_rescued: number;
  total_food_saved_kg: number;
  total_surplus_redistributed_portions: number;
  total_waste_prevented_kg: number;
  total_money_saved_inr: number;
  total_co2_avoided_kg: number;
  active_kitchens: number;
  active_ngos: number;
  completed_dispatches: number;
}

export interface ColdStorageUnit {
  unit_id: string;
  unit_name: string;
  facility: string;
  current_temp_celsius: number;
  setpoint_temp_celsius: number;
  safe_min_celsius: number;
  safe_max_celsius: number;
  humidity_rh: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  is_simulated: boolean;
  last_updated: string;
}

// Backward-compatible types for legacy api client
export type DemandPrediction = any;
export type QualityAnalysis = any;
export type SurplusBatch = any;
export type NGOBeneficiary = any;
export type RouteOptimizationResult = any;
export type StorageTelemetryItem = any;
export type PlantLossAnalytics = any;
export type ESGMetrics = any;
export type ESGComplianceReport = any;
