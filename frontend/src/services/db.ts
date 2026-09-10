import {
  Kitchen,
  NGO,
  MealPrediction,
  FoodBatch,
  FoodInspection,
  SurplusDeclaration,
  RedistributionRequest,
  Dispatch,
  ImpactMetrics,
  ColdStorageUnit,
  UserProfile,
} from '../types';

const STORAGE_KEYS = {
  PREDICTIONS: 'foodresq_predictions',
  BATCHES: 'foodresq_batches',
  INSPECTIONS: 'foodresq_inspections',
  SURPLUS: 'foodresq_surplus',
  REQUESTS: 'foodresq_requests',
  DISPATCHES: 'foodresq_dispatches',
  COLD_STORAGE: 'foodresq_cold_storage',
  CURRENT_USER: 'foodresq_current_user',
};

// --- DEFAULT ENTITIES ---
export const DEFAULT_KITCHENS: Kitchen[] = [
  {
    id: 'kitch_01',
    name: 'ABC College Central Kitchen',
    location: 'Hauz Khas, New Delhi',
    capacity: 1200,
  },
  {
    id: 'kitch_02',
    name: 'Apex Hospital Staff & Patient Cafeteria',
    location: 'Ansari Nagar, New Delhi',
    capacity: 800,
  },
  {
    id: 'kitch_03',
    name: 'Metropolitan Corporate Canteen Hub',
    location: 'Connaught Place, New Delhi',
    capacity: 1500,
  },
];

export const DEFAULT_NGOS: NGO[] = [
  {
    id: 'ngo_01',
    name: 'Robin Hood Army - South Delhi Shelter',
    location: 'Saket Community Centre, New Delhi',
    contact: '+91 98112 34567 (Aman Verma)',
    beneficiary_capacity: 150,
    verified: true,
    distance_km: 2.1,
    estimated_time_mins: 12,
  },
  {
    id: 'ngo_02',
    name: 'Feeding India Community Hub',
    location: 'Lajpat Nagar Ring Road, New Delhi',
    contact: '+91 98223 45678 (Priya Nair)',
    beneficiary_capacity: 220,
    verified: true,
    distance_km: 3.2,
    estimated_time_mins: 14,
  },
  {
    id: 'ngo_03',
    name: 'Delhi Night Shelter Care (DUSIB #14)',
    location: 'Mehrauli Badarpur Road, New Delhi',
    contact: '+91 98334 56789 (Rajesh Kumar)',
    beneficiary_capacity: 90,
    verified: true,
    distance_km: 5.4,
    estimated_time_mins: 18,
  },
  {
    id: 'ngo_04',
    name: 'Akshaya Chaitanya Food Relief Centre',
    location: 'Chanakyapuri Service Lane, New Delhi',
    contact: '+91 98445 67890 (Sneha Iyer)',
    beneficiary_capacity: 180,
    verified: true,
    distance_km: 6.8,
    estimated_time_mins: 22,
  },
];

export const DEFAULT_COLD_STORAGE: ColdStorageUnit[] = [
  {
    unit_id: 'CS-01',
    unit_name: 'Cooked Inventory Cold Chamber #1',
    facility: 'ABC College Central Kitchen',
    current_temp_celsius: 3.2,
    setpoint_temp_celsius: 4.0,
    safe_min_celsius: 1.0,
    safe_max_celsius: 5.0,
    humidity_rh: 78.5,
    status: 'NORMAL',
    is_simulated: true,
    last_updated: new Date().toISOString(),
  },
  {
    unit_id: 'CS-02',
    unit_name: 'Dairy & Protein Deep Freezer #2',
    facility: 'Apex Food Processing Unit',
    current_temp_celsius: -18.2,
    setpoint_temp_celsius: -18.0,
    safe_min_celsius: -22.0,
    safe_max_celsius: -15.0,
    humidity_rh: 62.0,
    status: 'NORMAL',
    is_simulated: true,
    last_updated: new Date().toISOString(),
  },
  {
    unit_id: 'CS-03',
    unit_name: 'Raw Produce Chill Silo #3',
    facility: 'Agri-Logistics Terminal #4',
    current_temp_celsius: 4.8,
    setpoint_temp_celsius: 4.0,
    safe_min_celsius: 2.0,
    safe_max_celsius: 6.0,
    humidity_rh: 85.0,
    status: 'NORMAL',
    is_simulated: true,
    last_updated: new Date().toISOString(),
  },
];

// Helper to load/save in localStorage
const load = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

export const db = {
  // --- KITCHENS & NGOS ---
  getKitchens: (): Kitchen[] => DEFAULT_KITCHENS,
  getNGOs: (): NGO[] => DEFAULT_NGOS,

  // --- PREDICTIONS ---
  getPredictions: (): MealPrediction[] => load<MealPrediction[]>(STORAGE_KEYS.PREDICTIONS, []),
  savePrediction: (pred: Omit<MealPrediction, 'id' | 'created_at'>): MealPrediction => {
    const list = db.getPredictions();
    const newRecord: MealPrediction = {
      ...pred,
      id: `pred_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.PREDICTIONS, list);
    return newRecord;
  },

  // --- BATCHES ---
  getBatches: (): FoodBatch[] => load<FoodBatch[]>(STORAGE_KEYS.BATCHES, []),
  getBatchById: (id: string): FoodBatch | undefined => {
    return db.getBatches().find((b) => b.id === id);
  },
  createBatch: (batch: Omit<FoodBatch, 'id' | 'surplus_portions' | 'status' | 'prepared_at'>): FoodBatch => {
    const list = db.getBatches();
    const surplus = Math.max(0, batch.prepared_portions - batch.recommended_portions);
    const newRecord: FoodBatch = {
      ...batch,
      id: `batch_${Date.now()}`,
      surplus_portions: surplus,
      status: 'COOKED',
      prepared_at: new Date().toISOString(),
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.BATCHES, list);
    return newRecord;
  },
  updateBatchStatus: (id: string, status: FoodBatch['status'], inspectionId?: string): void => {
    const list = db.getBatches();
    const idx = list.findIndex((b) => b.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (inspectionId) list[idx].inspection_id = inspectionId;
      save(STORAGE_KEYS.BATCHES, list);
    }
  },

  // --- INSPECTIONS ---
  getInspections: (): FoodInspection[] => load<FoodInspection[]>(STORAGE_KEYS.INSPECTIONS, []),
  saveInspection: (insp: Omit<FoodInspection, 'id' | 'created_at'>): FoodInspection => {
    const list = db.getInspections();
    const newRecord: FoodInspection = {
      ...insp,
      id: `insp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.INSPECTIONS, list);
    db.updateBatchStatus(insp.food_batch_id, 'INSPECTED', newRecord.id);
    return newRecord;
  },

  // --- SURPLUS DECLARATIONS ---
  getSurplusList: (): SurplusDeclaration[] => load<SurplusDeclaration[]>(STORAGE_KEYS.SURPLUS, []),
  declareSurplus: (decl: Omit<SurplusDeclaration, 'id' | 'status' | 'created_at'>): SurplusDeclaration => {
    const list = db.getSurplusList();
    const newRecord: SurplusDeclaration = {
      ...decl,
      id: `surplus_${Date.now()}`,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.SURPLUS, list);
    db.updateBatchStatus(decl.food_batch_id, 'SURPLUS_DECLARED');
    return newRecord;
  },

  // --- REDISTRIBUTION REQUESTS ---
  getRequests: (): RedistributionRequest[] => load<RedistributionRequest[]>(STORAGE_KEYS.REQUESTS, []),
  createRequest: (req: Omit<RedistributionRequest, 'id' | 'status' | 'created_at'>): RedistributionRequest => {
    const list = db.getRequests();
    const newRecord: RedistributionRequest = {
      ...req,
      id: `req_${Date.now()}`,
      status: 'PENDING_NGO',
      created_at: new Date().toISOString(),
    };
    list.unshift(newRecord);
    save(STORAGE_KEYS.REQUESTS, list);

    // Update surplus status to REQUESTED
    const surplusList = db.getSurplusList();
    const sIdx = surplusList.findIndex((s) => s.id === req.surplus_id);
    if (sIdx !== -1) {
      surplusList[sIdx].status = 'REQUESTED';
      save(STORAGE_KEYS.SURPLUS, surplusList);
    }
    return newRecord;
  },

  // --- NGO ACCEPTS DONATION ---
  acceptRequest: (requestId: string): Dispatch => {
    const reqList = db.getRequests();
    const req = reqList.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'ACCEPTED';
    save(STORAGE_KEYS.REQUESTS, reqList);

    // Generate 6-digit OTP (e.g. 482193)
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    const pickupTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const deadline = new Date(Date.now() + 180 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newDispatch: Dispatch = {
      id: `disp_${Date.now()}`,
      redistribution_request_id: requestId,
      food_name: req.food_name,
      kitchen_name: req.kitchen_name,
      ngo_name: req.ngo_name,
      portions: req.portions,
      distance_km: req.distance_km,
      pickup_time: `Today, ${pickupTime}`,
      delivery_deadline: `Today, ${deadline}`,
      status: 'SCHEDULED',
      otp: otp,
      created_at: new Date().toISOString(),
    };

    const dispatches = db.getDispatches();
    dispatches.unshift(newDispatch);
    save(STORAGE_KEYS.DISPATCHES, dispatches);

    req.dispatch_id = newDispatch.id;
    save(STORAGE_KEYS.REQUESTS, reqList);

    return newDispatch;
  },

  // --- DISPATCHES & OTP CONFIRMATION ---
  getDispatches: (): Dispatch[] => load<Dispatch[]>(STORAGE_KEYS.DISPATCHES, []),
  verifyDispatchOTP: (dispatchId: string, enteredOtp: string): { success: boolean; message: string; portions: number } => {
    const dispatches = db.getDispatches();
    const disp = dispatches.find((d) => d.id === dispatchId);
    if (!disp) throw new Error('Dispatch record not found.');

    if (disp.status === 'DELIVERED') {
      throw new Error('This delivery has already been verified and delivered.');
    }

    if (disp.otp !== enteredOtp.trim()) {
      throw new Error(`Invalid OTP (${enteredOtp}). The correct OTP is provided on the NGO driver screen.`);
    }

    // Mark as DELIVERED
    disp.status = 'DELIVERED';
    disp.delivered_at = new Date().toISOString();
    save(STORAGE_KEYS.DISPATCHES, dispatches);

    // Update associated request
    const reqList = db.getRequests();
    const req = reqList.find((r) => r.id === disp.redistribution_request_id);
    if (req) {
      req.status = 'COMPLETED';
      save(STORAGE_KEYS.REQUESTS, reqList);

      // Update surplus to CLAIMED
      const surplusList = db.getSurplusList();
      const s = surplusList.find((item) => item.id === req.surplus_id);
      if (s) {
        s.status = 'CLAIMED';
        save(STORAGE_KEYS.SURPLUS, surplusList);
        db.updateBatchStatus(s.food_batch_id, 'DELIVERED');
      }
    }

    return {
      success: true,
      message: `Chain of custody verified! ${disp.portions} portions safely delivered to ${disp.ngo_name}.`,
      portions: disp.portions,
    };
  },

  // --- DYNAMIC IMPACT METRICS (Calculated from real delivered transactions) ---
  getImpactMetrics: (): ImpactMetrics => {
    const dispatches = db.getDispatches().filter((d) => d.status === 'DELIVERED');
    const predictions = db.getPredictions();

    const totalMealsRescued = dispatches.reduce((acc, d) => acc + d.portions, 0);
    // Standard conversion: 1 portion approx 0.25 kg
    const totalFoodSavedKg = Math.round(totalMealsRescued * 0.25 * 10) / 10;
    // Standard conversion: 1 kg food waste = 2.5 kg CO2e (IPCC standard)
    const totalCo2AvoidedKg = Math.round(totalFoodSavedKg * 2.5 * 10) / 10;
    // Standard value: Rs 40 per prepared nutritional meal
    const totalMoneySavedInr = totalMealsRescued * 40;

    const totalWastePreventedKg = Math.round(
      predictions.reduce((acc, p) => acc + (p.waste_prevented_kg || 0), 0) * 10
    ) / 10;

    return {
      total_meals_rescued: totalMealsRescued,
      total_food_saved_kg: totalFoodSavedKg,
      total_surplus_redistributed_portions: totalMealsRescued,
      total_waste_prevented_kg: totalWastePreventedKg,
      total_money_saved_inr: totalMoneySavedInr,
      total_co2_avoided_kg: totalCo2AvoidedKg,
      active_kitchens: DEFAULT_KITCHENS.length,
      active_ngos: DEFAULT_NGOS.length,
      completed_dispatches: dispatches.length,
    };
  },

  // --- COLD STORAGE (SIMULATED SENSORS) ---
  getColdStorage: (): ColdStorageUnit[] => load<ColdStorageUnit[]>(STORAGE_KEYS.COLD_STORAGE, DEFAULT_COLD_STORAGE),
  simulateTemperatureBreach: (unitId: string, tempCelsius: number = 14.8): ColdStorageUnit => {
    const list = db.getColdStorage();
    const unit = list.find((u) => u.unit_id === unitId);
    if (!unit) throw new Error('Unit not found');

    unit.current_temp_celsius = tempCelsius;
    unit.status = tempCelsius > unit.safe_max_celsius ? 'CRITICAL' : 'NORMAL';
    unit.last_updated = new Date().toISOString();
    save(STORAGE_KEYS.COLD_STORAGE, list);
    return unit;
  },
  resetColdStorage: (): void => {
    save(STORAGE_KEYS.COLD_STORAGE, DEFAULT_COLD_STORAGE);
  },

  // --- DEMO DATA LOADER (For Judges) ---
  loadDemoData: (): void => {
    // 1. Predictions
    const demoPredictions: MealPrediction[] = [
      {
        id: 'pred_01',
        kitchen_id: 'kitch_01',
        kitchen_name: 'ABC College Central Kitchen',
        meal_type: 'LUNCH',
        date: '2026-09-10',
        expected_diners: 850,
        predicted_quantity: 640,
        recommended_cooking: 659,
        buffer_quantity: 19,
        waste_prevented_kg: 30.8,
        weather_condition: 'Rainy (-12%)',
        is_exam_period: false,
        is_holiday: false,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ];

    // 2. Batches
    const demoBatches: FoodBatch[] = [
      {
        id: 'batch_01',
        kitchen_id: 'kitch_01',
        kitchen_name: 'ABC College Central Kitchen',
        food_name: 'Rice + Paneer Butter Masala',
        prepared_portions: 700,
        recommended_portions: 659,
        surplus_portions: 41,
        status: 'DELIVERED',
        prepared_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'batch_02',
        kitchen_id: 'kitch_01',
        kitchen_name: 'ABC College Central Kitchen',
        food_name: 'Whole Wheat Roti & Dal Makhani',
        prepared_portions: 350,
        recommended_portions: 300,
        surplus_portions: 50,
        status: 'DELIVERED',
        prepared_at: new Date(Date.now() - 28 * 3600000).toISOString(),
      },
    ];

    // 3. Inspections
    const demoInspections: FoodInspection[] = [
      {
        id: 'insp_01',
        food_batch_id: 'batch_01',
        food_name: 'Rice + Paneer Butter Masala',
        freshness_score: 94,
        grade: 'GRADE_A',
        safe_window_minutes: 240,
        recommendation: 'Suitable for redistribution subject to normal food-safety handling.',
        image_url_top: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80',
        image_url_side: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80',
        image_url_closeup: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80',
        observations: [
          'Surface appearance normal and steam retained',
          'No obvious discoloration or browning detected',
          'Holding temperature verified at 65°C',
        ],
        created_at: new Date(Date.now() - 4.5 * 3600000).toISOString(),
      },
    ];

    // 4. Surplus
    const demoSurplus: SurplusDeclaration[] = [
      {
        id: 'surplus_01',
        food_batch_id: 'batch_01',
        food_name: 'Rice + Paneer Butter Masala',
        kitchen_name: 'ABC College Central Kitchen',
        quantity_portions: 41,
        quantity_kg: 10.25,
        freshness_score: 94,
        safe_window_minutes: 240,
        available_until: new Date(Date.now() + 3 * 3600000).toISOString(),
        status: 'CLAIMED',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ];

    // 5. Requests
    const demoRequests: RedistributionRequest[] = [
      {
        id: 'req_01',
        surplus_id: 'surplus_01',
        food_name: 'Rice + Paneer Butter Masala',
        kitchen_name: 'ABC College Central Kitchen',
        ngo_id: 'ngo_01',
        ngo_name: 'Robin Hood Army - South Delhi Shelter',
        portions: 41,
        distance_km: 2.1,
        estimated_time_mins: 12,
        status: 'COMPLETED',
        dispatch_id: 'disp_01',
        created_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
      },
    ];

    // 6. Dispatches
    const demoDispatches: Dispatch[] = [
      {
        id: 'disp_01',
        redistribution_request_id: 'req_01',
        food_name: 'Rice + Paneer Butter Masala',
        kitchen_name: 'ABC College Central Kitchen',
        ngo_name: 'Robin Hood Army - South Delhi Shelter',
        portions: 41,
        distance_km: 2.1,
        pickup_time: 'Today, 01:15 PM',
        delivery_deadline: 'Today, 04:00 PM',
        status: 'DELIVERED',
        otp: '482193',
        delivered_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'disp_02',
        redistribution_request_id: 'req_prev',
        food_name: 'Whole Wheat Roti & Dal Makhani',
        kitchen_name: 'ABC College Central Kitchen',
        ngo_name: 'Feeding India Community Hub',
        portions: 50,
        distance_km: 3.2,
        pickup_time: 'Yesterday, 07:30 PM',
        delivery_deadline: 'Yesterday, 10:00 PM',
        status: 'DELIVERED',
        otp: '739201',
        delivered_at: new Date(Date.now() - 26 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 27 * 3600000).toISOString(),
      },
    ];

    save(STORAGE_KEYS.PREDICTIONS, demoPredictions);
    save(STORAGE_KEYS.BATCHES, demoBatches);
    save(STORAGE_KEYS.INSPECTIONS, demoInspections);
    save(STORAGE_KEYS.SURPLUS, demoSurplus);
    save(STORAGE_KEYS.REQUESTS, demoRequests);
    save(STORAGE_KEYS.DISPATCHES, demoDispatches);
    save(STORAGE_KEYS.COLD_STORAGE, DEFAULT_COLD_STORAGE);
  },

  // --- RESET ALL DATA (For Clean Testing) ---
  resetData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.PREDICTIONS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.SURPLUS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.DISPATCHES);
    localStorage.removeItem(STORAGE_KEYS.COLD_STORAGE);
  },
};
