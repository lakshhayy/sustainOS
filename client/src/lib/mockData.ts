import { addDays, format } from "date-fns";

/**
 * Represents a single point in time for resource usage.
 */
export interface UsageDataPoint {
  time: string;
  actualEnergy: number | null; // kWh
  predictedEnergy: number; // kWh
  actualWater: number | null; // Liters
  predictedWater: number; // Liters
  peakLimit: number;
}

/**
 * Parameters for the sustainability policy simulation.
 */
export interface SimulationParams {
  acTemp: number; // Celsius (Standard Indian AC setting range 18-30)
  reductionPercent: number; // 0-100% load shedding
  incentiveEnabled: boolean; // Participation in Discom Demand Response
}

/**
 * Results returned by the AI simulation engine.
 */
export interface SimulationResult {
  costSavings: number; // in INR (₹)
  carbonReduction: number; // kg CO2
  comfortScore: number; // 0.0 (Poor) to 1.0 (Excellent)
  energySaved: number; // kWh
}

/**
 * AI-generated recommendation for operational improvements.
 */
export interface Recommendation {
  id: string;
  action: string;
  reason: string;
  impact: string;
  category: "energy" | "water" | "cost" | "comfort";
  difficulty: "easy" | "medium" | "hard";
}

// --- Mock Data Generators ---

/**
 * Generates mock historical and predicted data for the dashboard.
 * Simulates a typical commercial building pattern in an Indian metro.
 */
const generateHistoricalData = (): UsageDataPoint[] => {
  const data: UsageDataPoint[] = [];
  const now = new Date();
  
  // Generate last 7 days + next 2 days
  for (let i = -7; i <= 2; i++) {
    const date = addDays(now, i);
    const dateStr = format(date, "MMM dd");
    const isFuture = i > 0;
    
    // Base patterns (Higher base load due to cooling needs)
    const baseEnergy = 850 + Math.random() * 100; 
    const baseWater = 400 + Math.random() * 50;
    
    // Trends: Sinusoidal wave to simulate weekly variance
    const energyTrend = Math.sin(i / 2) * 50;
    
    data.push({
      time: dateStr,
      actualEnergy: isFuture ? null : Math.round(baseEnergy + energyTrend),
      predictedEnergy: Math.round(baseEnergy + energyTrend + (Math.random() * 20 - 10)),
      actualWater: isFuture ? null : Math.round(baseWater),
      predictedWater: Math.round(baseWater + (Math.random() * 10)),
      peakLimit: 1100, // Peak limit in kWh
    });
  }
  return data;
};

export const MOCK_USAGE_DATA = generateHistoricalData();

/**
 * Curated list of recommendations tailored for Indian infrastructure.
 */
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    action: "Optimize AC Setpoint (BEE Guidelines)",
    reason: "Bureau of Energy Efficiency recommends 24°C default.",
    impact: "Save ~₹15,000/month",
    category: "energy",
    difficulty: "easy"
  },
  {
    id: "2",
    action: "Rooftop Solar Integration",
    reason: "High solar irradiance predicted for next 3 months.",
    impact: "Offset 40% grid usage",
    category: "energy",
    difficulty: "hard"
  },
  {
    id: "3",
    action: "Rainwater Harvesting Check",
    reason: "Monsoon season approaching; ensure catchment is clean.",
    impact: "Water security bonus",
    category: "water",
    difficulty: "medium"
  },
  {
    id: "4",
    action: "Shift to Off-Peak Hours",
    reason: "Avoid peak tariff rates (6 PM - 10 PM).",
    impact: "Reduce bill by 12%",
    category: "cost",
    difficulty: "easy"
  }
];

// --- Mock Service Functions ---

/**
 * Simulates fetching usage data from a backend API.
 */
export const getUsageData = async (): Promise<UsageDataPoint[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_USAGE_DATA;
};

/**
 * Simulates the AI Engine processing a policy change.
 * Uses heuristics to estimate impact on Cost (₹), Carbon, and Comfort.
 */
export const runSimulation = async (params: SimulationParams): Promise<SimulationResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Heuristic Simulation Logic (Mocking Python Service)
  // Base monthly cost in INR
  const baseCostINR = 450000; 
  const baseCarbon = 2000; // kg
  
  // Impact of AC Temp (Higher is better for savings, worse for comfort)
  // Baseline 22C. Each degree up saves ~5% energy (typical rule of thumb).
  const tempDiff = params.acTemp - 22;
  const tempSavings = Math.max(0, tempDiff * 0.06); // Slightly higher savings in hot climate
  
  // Impact of Reduction %
  const manualSavings = params.reductionPercent / 100;
  
  // Combined Savings Factor
  const totalSavingsFactor = tempSavings + manualSavings;
  
  // Incentive Impact (Mock: DISCOM rebate)
  const incentiveBonus = params.incentiveEnabled ? 5000 : 0;
  
  const costSavings = Math.round((baseCostINR * totalSavingsFactor) + incentiveBonus);
  const carbonReduction = Math.round(baseCarbon * totalSavingsFactor);
  const energySaved = Math.round(2000 * totalSavingsFactor);
  
  // Comfort Score Calculation
  // 24C is considered ideal balance in India (BEE). 
  // > 26C starts getting uncomfortable.
  let comfortScore = 1.0;
  
  // Penalize if temp goes too high
  if (params.acTemp > 24) {
    comfortScore -= (params.acTemp - 24) * 0.15;
  }
  
  // Heavy reduction hurts comfort
  comfortScore -= (params.reductionPercent / 150); 
  
  return {
    costSavings,
    carbonReduction,
    comfortScore: Math.max(0.1, Math.min(1.0, comfortScore)),
    energySaved
  };
};

/**
 * Fetches AI-generated recommendations.
 */
export const getRecommendations = async (): Promise<Recommendation[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_RECOMMENDATIONS;
};
