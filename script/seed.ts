import { db } from "../server/db";
import { sensorReadings } from "@shared/schema";
import { addDays, subDays, startOfDay } from "date-fns";

async function seed() {
  console.log("🌱 Seeding database with historical sensor data...");

  // Clear existing data to avoid duplicates
  await db.delete(sensorReadings);

  const readings: any[] = [];
  const now = new Date();

  // Generate last 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = subDays(now, i);

    // Create a realistic usage curve (Sinusoidal wave for seasonality)
    // Base load + Variation + Random Noise
    const energyBase = 850;
    const waterBase = 400;
    const seasonality = Math.sin(i / 5) * 50; // Weekly fluctuation

    const actualEnergy = Math.round(energyBase + seasonality + (Math.random() * 40 - 20));
    const actualWater = Math.round(waterBase + (seasonality * 0.5) + (Math.random() * 20 - 10));

    // Add Energy Reading
    readings.push({
      timestamp: date,
      type: "energy",
      value: String(actualEnergy),
      isPredicted: false,
    });

    // Add Water Reading
    readings.push({
      timestamp: date,
      type: "water",
      value: String(actualWater),
      isPredicted: false,
    });
  }

  // Generate 2 days of FUTURE predictions (AI Forecast)
  for (let i = 1; i <= 2; i++) {
    const date = addDays(now, i);

    const predEnergy = Math.round(850 + (Math.sin(i) * 50) + 20); // Slightly higher (simulating peak)
    const predWater = Math.round(400 + 10);

    readings.push({
      timestamp: date,
      type: "energy",
      value: String(predEnergy),
      isPredicted: true, // This flags it as AI data
    });

    readings.push({
      timestamp: date,
      type: "water",
      value: String(predWater),
      isPredicted: true,
    });
  }

  // Bulk Insert
  await db.insert(sensorReadings).values(readings);

  console.log(`✅ Successfully inserted ${readings.length} sensor readings.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});