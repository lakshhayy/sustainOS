import { db } from "./db";
import { sensorReadings } from "@shared/schema";
import { sql, eq } from "drizzle-orm";
import axios from "axios"; // <--- The bridge to Python

export interface SimulationParams {
  acTemp: number;
  reductionPercent: number;
  incentiveEnabled: boolean;
}

export interface SimulationResult {
  costSavings: number;
  carbonReduction: number;
  comfortScore: number;
  energySaved: number;
  outdoorTemp?: number; // <--- New field from Python Weather API
}

export class AIEngine {

  // 1. Fetch Baseline Data (from Postgres)
  private async getBaselineEnergy(): Promise<number> {
    const result = await db
      .select({ 
        avgValue: sql<string>`avg(${sensorReadings.value})` 
      })
      .from(sensorReadings)
      .where(eq(sensorReadings.type, 'energy'));

    return parseFloat(result[0]?.avgValue || "850");
  }

  // 2. The Simulation Logic (Connects to Python)
  async simulatePolicy(params: SimulationParams): Promise<SimulationResult> {
    try {
      console.log("🤖 Sending data to Python AI Service...");
      
      // Call the Python Microservice running on Port 8000
      const response = await axios.post("http://127.0.0.1:8000/simulate", params);
      
      console.log("✅ Python AI responded:", response.data);
      return response.data;

    } catch (error: any) {
      console.error("❌ AI Service Offline. Switching to Fallback Mode.");
      // If Python is down, we use the old math so the demo doesn't crash
      return this.fallbackSimulation(params);
    }
  }

  // 3. Fallback Logic (The "Safety Net")
  private async fallbackSimulation(params: SimulationParams): Promise<SimulationResult> {
    const baselineEnergy = await this.getBaselineEnergy();
    
    // Simple Backup Math
    const tempDiff = Math.max(0, params.acTemp - 22);
    const savingsPct = (tempDiff * 0.06) + (params.reductionPercent / 100);
    
    const energySaved = (baselineEnergy * 30) * savingsPct;
    const costSavings = (energySaved * 12) + (params.incentiveEnabled ? 5000 : 0);
    
    // Simple linear penalty for comfort
    let comfortScore = 1.0;
    if (params.acTemp > 24) comfortScore -= 0.2;
    if (params.reductionPercent > 20) comfortScore -= 0.2;

    return {
      costSavings: Math.round(costSavings),
      carbonReduction: Math.round(energySaved * 0.82),
      comfortScore: Math.max(0.1, comfortScore),
      energySaved: Math.round(energySaved)
    };
  }

  // 4. Recommendations (Static for now)
  async getRecommendations() {
    return [
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
  }
}

export const aiEngine = new AIEngine();