from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import requests  # <--- New import

app = FastAPI()

# --- Data Models ---
class SimulationParams(BaseModel):
    acTemp: float
    reductionPercent: float
    incentiveEnabled: bool

class SimulationResult(BaseModel):
    costSavings: float
    carbonReduction: float
    comfortScore: float
    energySaved: float
    outdoorTemp: float # <--- Sending this back to UI

# --- Helper: Fetch Real Weather ---
def get_live_temperature():
    try:
        # Open-Meteo API for New Delhi (DTU Location approx: 28.75, 77.11)
        url = "https://api.open-meteo.com/v1/forecast?latitude=28.75&longitude=77.11&current=temperature_2m"
        response = requests.get(url, timeout=2)
        data = response.json()
        temp = data['current']['temperature_2m']
        print(f"🌤️  Live Weather Fetched: {temp}°C")
        return temp
    except Exception as e:
        print(f"⚠️ Weather API Error: {e}. Using fallback.")
        return 35.0 # Fallback to a hot summer day if API fails

# --- Routes ---
@app.get("/")
def health_check():
    return {"status": "AI Service Online", "mode": "Live Weather Enabled"}

@app.post("/simulate", response_model=SimulationResult)
def simulate_policy(params: SimulationParams):
    try:
        # 1. Get Real-World Context
        outdoor_temp = get_live_temperature()
        
        # 2. Physics Modeling (Thermal Load)
        # If it's hotter outside, AC has to work harder.
        # We calculate the "Delta T" (Outdoor - Indoor)
        delta_t_baseline = max(0, outdoor_temp - 22) # Baseline setpoint
        delta_t_new = max(0, outdoor_temp - params.acTemp)
        
        # Thermodynamics: Energy is proportional to Delta T
        # If new setpoint reduces Delta T by 10%, we save ~10% energy (simplified)
        if delta_t_baseline > 0:
            thermal_savings_pct = 1 - (delta_t_new / delta_t_baseline)
        else:
            thermal_savings_pct = 0 # It's cold outside, AC not working hard anyway

        # 3. Calculate Impacts
        baseline_energy_monthly = 25500.0
        
        # Total savings = Thermal Physics Savings + Load Shedding
        total_savings_pct = thermal_savings_pct + (params.reductionPercent / 100.0)
        
        energy_saved_kwh = baseline_energy_monthly * total_savings_pct
        
        # Cost & Carbon
        base_rate = 12.0
        incentive = 5000.0 if params.incentiveEnabled else 0.0
        cost_savings = (energy_saved_kwh * base_rate) + incentive
        carbon_reduction = energy_saved_kwh * 0.82

        # 4. Comfort Score (Adaptive)
        # If it's 45°C outside, setting AC to 26°C feels worse than if it's 30°C outside.
        score = 1.0
        
        # Penalty for heat stress relative to outdoor temp
        if params.acTemp > 24:
            # Higher penalty if outdoor is scorching
            heat_factor = 1.5 if outdoor_temp > 40 else 1.0
            score -= ((params.acTemp - 24) * 0.1) * heat_factor
            
        if params.reductionPercent > 15:
            score -= (params.reductionPercent - 15) * 0.015

        return {
            "costSavings": round(cost_savings, 2),
            "carbonReduction": round(carbon_reduction, 2),
            "comfortScore": round(max(0.1, min(1.0, score)), 2),
            "energySaved": round(energy_saved_kwh, 2),
            "outdoorTemp": round(outdoor_temp, 1)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)