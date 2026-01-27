import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Users (Admin Access)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// 2. Sensor Readings (Time-Series Data)
// This stores the raw data for your Dashboard charts
export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  type: text("type").notNull(), // 'energy' or 'water'
  value: numeric("value").notNull(), // kWh or Liters
  isPredicted: boolean("is_predicted").default(false), // separate actual vs AI forecast
});

// 3. Simulation Logs (Audit Trail)
// Stores every simulation run so admins can see history
export const simulationLogs = pgTable("simulation_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  acTemp: integer("ac_temp").notNull(),
  reductionPercent: integer("reduction_percent").notNull(),
  projectedSavings: numeric("projected_savings"), // INR
  comfortScore: numeric("comfort_score"), // 0-100
});

// Export Zod Schemas for API Validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReadingSchema = createInsertSchema(sensorReadings).pick({
  timestamp: true,
  type: true,
  value: true,
  isPredicted: true,
});

export const insertSimulationSchema = createInsertSchema(simulationLogs).pick({
  acTemp: true,
  reductionPercent: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Reading = typeof sensorReadings.$inferSelect;
export type SimulationLog = typeof simulationLogs.$inferSelect;