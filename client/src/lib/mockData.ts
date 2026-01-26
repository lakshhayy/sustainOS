import { addDays, format, subDays } from "date-fns";

export interface UsageDataPoint {
  time: string;
  actualEnergy: number | null; // kWh
  predictedEnergy: number; // kWh
  actualWater: number | null; // Liters
  predictedWater: number; // Liters
  peakLimit: number;
}

export interface SimulationParams {
  acTemp: number; // Celsius
  reductionPercent: number; // 0-100
  incentiveEnabled: boolean;
}

export interface SimulationResult {
  costSavings: number; // $
  carbonReduction: number; // kg CO2
  comfortScore: number; // 0.0 - 1.0
  energySaved: number; // kWh
}

export interface Recommendation {
  id: string;
  action: string;
  reason: string;
  impact: string;
  category: "energy" | "water" | "cost" | "comfort";
  difficulty: "easy" | "medium" | "hard";
}

// --- Mock Data Generators ---

const generateHistoricalData = (): UsageDataPoint[] => {
  const data: UsageDataPoint[] = [];
  const now = new Date();
  
  // Generate last 7 days + next 2 days
  for (let i = -7; i <= 2; i++) {
    const date = addDays(now, i);
    const dateStr = format(date, "MMM dd");
    const isFuture = i > 0;
    
    // Base patterns
    const baseEnergy = 450 + Math.random() * 50;
    const baseWater = 200 + Math.random() * 30;
    
    // Trends
    const energyTrend = Math.sin(i / 2) * 20;
    
    data.push({
      time: dateStr,
      actualEnergy: isFuture ? null : Math.round(baseEnergy + energyTrend),
      predictedEnergy: Math.round(baseEnergy + energyTrend + (Math.random() * 10 - 5)),
      actualWater: isFuture ? null : Math.round(baseWater),
      predictedWater: Math.round(baseWater + (Math.random() * 5)),
      peakLimit: 600,
    });
  }
  return data;
};

export const MOCK_USAGE_DATA = generateHistoricalData();

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    action: "Shift HVAC Schedule",
    reason: "Peak demand predicted between 2pm-4pm tomorrow.",
    impact: "Save ~$450/month",
    category: "energy",
    difficulty: "easy"
  },
  {
    id: "2",
    action: "Install Smart Flow Sensors",
    reason: "Water usage in Sector B is 15% above baseline.",
    impact: "Detect leaks early",
    category: "water",
    difficulty: "medium"
  },
  {
    id: "3",
    action: "Enable Demand Response",
    reason: "Grid incentives active for next 48 hours.",
    impact: "Earn $0.50 per kWh reduced",
    category: "cost",
    difficulty: "easy"
  },
  {
    id: "4",
    action: "Upgrade Chillers to VFD",
    reason: "Current chiller efficiency is degrading.",
    impact: "Reduce baseload by 12%",
    category: "energy",
    difficulty: "hard"
  }
];

// --- Mock Service Functions ---

export const getUsageData = async (): Promise<UsageDataPoint[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_USAGE_DATA;
};

export const runSimulation = async (params: SimulationParams): Promise<SimulationResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Heuristic Simulation Logic (Mocking Python Service)
  const baseCost = 5000;
  const baseCarbon = 2000;
  
  // Impact of AC Temp (Higher is better for savings, worse for comfort)
  // Baseline 22C. Each degree up saves ~5% energy.
  const tempDiff = params.acTemp - 22;
  const tempSavings = Math.max(0, tempDiff * 0.05);
  
  // Impact of Reduction %
  const manualSavings = params.reductionPercent / 100;
  
  // Combined Savings Factor
  const totalSavingsFactor = tempSavings + manualSavings;
  
  // Incentive Impact (Mock: Just flat bonus if enabled)
  const incentiveBonus = params.incentiveEnabled ? 200 : 0;
  
  const costSavings = Math.round((baseCost * totalSavingsFactor) + incentiveBonus);
  const carbonReduction = Math.round(baseCarbon * totalSavingsFactor);
  const energySaved = Math.round(1000 * totalSavingsFactor);
  
  // Comfort Score Calculation
  // 22C is 1.0. 26C is 0.5.
  let comfortScore = 1.0;
  if (params.acTemp > 22) {
    comfortScore -= (params.acTemp - 22) * 0.12;
  }
  // Heavy reduction hurts comfort
  comfortScore -= (params.reductionPercent / 200); 
  
  return {
    costSavings,
    carbonReduction,
    comfortScore: Math.max(0.1, Math.min(1.0, comfortScore)),
    energySaved
  };
};

export const getRecommendations = async (): Promise<Recommendation[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_RECOMMENDATIONS;
};
