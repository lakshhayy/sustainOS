import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { sensorReadings } from "@shared/schema";
import { aiEngine } from "./ai";
import { desc, asc } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // 1. Dashboard API - Gets Real Historical Data
  // Replaces: getUsageData() in mockData.ts
  app.get("/api/dashboard", async (req, res) => {
    try {
      // Fetch all readings, sorted by time
      const data = await db
        .select()
        .from(sensorReadings)
        .orderBy(asc(sensorReadings.timestamp));

      // Transform for Recharts (Frontend expects specific format)
      // We group Energy and Water by timestamp
      const formattedData = [];
      const timeMap = new Map();

      for (const reading of data) {
        const timeKey = new Date(reading.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });

        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { 
            time: timeKey, 
            actualEnergy: null, 
            predictedEnergy: null,
            actualWater: null, 
            predictedWater: null 
          });
        }

        const entry = timeMap.get(timeKey);
        const val = parseInt(reading.value);

        if (reading.type === 'energy') {
          if (reading.isPredicted) entry.predictedEnergy = val;
          else entry.actualEnergy = val;
        } else {
          if (reading.isPredicted) entry.predictedWater = val;
          else entry.actualWater = val;
        }
      }

      // Convert Map to Array
      res.json(Array.from(timeMap.values()));
    } catch (error) {
      console.error("Dashboard API Error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // 2. Simulation API - Runs the AI Engine
  // Replaces: runSimulation() in mockData.ts
  app.post("/api/simulate", async (req, res) => {
    try {
      const params = req.body;
      const result = await aiEngine.simulatePolicy(params);

      // (Optional) Log this simulation to DB for audit trails
      // await db.insert(simulationLogs).values({ ... });

      res.json(result);
    } catch (error) {
      console.error("Simulation API Error:", error);
      res.status(500).json({ message: "Simulation failed" });
    }
  });

  // 3. Recommendations API
  // Replaces: getRecommendations() in mockData.ts
  app.get("/api/recommendations", async (req, res) => {
    try {
      const recs = await aiEngine.getRecommendations();
      res.json(recs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  return httpServer;
}