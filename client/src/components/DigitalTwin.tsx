import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Server, Building, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// Types for our "Smart Buildings"
interface BuildingStatus {
  id: string;
  name: string;
  load: number; // 0 to 100%
  status: "optimal" | "warning" | "critical";
}

export default function DigitalTwin() {
  // Mock Live Data for the Campus Buildings
  // In a real app, this would come from your Python API
  const [buildings, setBuildings] = useState<BuildingStatus[]>([
    { id: "lib", name: "Main Library", load: 45, status: "optimal" },
    { id: "sci", name: "Science Block", load: 72, status: "warning" },
    { id: "adm", name: "Admin Block", load: 20, status: "optimal" },
    { id: "server", name: "Data Center", load: 91, status: "critical" },
  ]);

  // Simulate "Live" fluctuations every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBuildings(prev => prev.map(b => {
        // Randomly fluctuate load by +/- 5%
        const change = Math.floor(Math.random() * 10) - 5;
        const newLoad = Math.max(0, Math.min(100, b.load + change));
        
        let newStatus: BuildingStatus["status"] = "optimal";
        if (newLoad > 70) newStatus = "warning";
        if (newLoad > 90) newStatus = "critical";

        return { ...b, load: newLoad, status: newStatus };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getFillColor = (status: string) => {
    switch(status) {
      case "optimal": return "#10b981"; // Emerald-500
      case "warning": return "#f59e0b"; // Amber-500
      case "critical": return "#ef4444"; // Red-500
      default: return "#64748b";
    }
  };

  return (
    <Card className="col-span-full border-blue-100 dark:border-blue-900 bg-slate-50/50 dark:bg-slate-950/30 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Campus Digital Twin
          </CardTitle>
          <p className="text-sm text-muted-foreground">Real-time zonal energy monitoring</p>
        </div>
        <Badge variant="outline" className="animate-pulse border-emerald-500 text-emerald-600 bg-emerald-50">
          ● Live Stream
        </Badge>
      </CardHeader>
      <CardContent className="relative h-[400px] w-full flex items-center justify-center p-0">
        
        {/* The 3D Isometric Map (SVG) */}
        <svg viewBox="0 0 800 500" className="w-full h-full max-w-4xl drop-shadow-2xl">
          
          {/* Ground Plane */}
          <path d="M400 100 L750 300 L400 500 L50 300 Z" fill="hsl(var(--muted))" opacity="0.3" />
          <path d="M400 100 L750 300 L400 500 L50 300 Z" fill="url(#grid)" opacity="0.2" />
          
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
            {/* Glow Effect for Critical Buildings */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Building 1: Science Block (Left) */}
          <BuildingGroup 
            x={150} y={220} 
            color={getFillColor(buildings[1].status)} 
            height={120} 
            label="Science Labs"
            load={buildings[1].load}
          />

          {/* Building 2: Main Library (Center, Big) */}
          <BuildingGroup 
            x={350} y={180} 
            color={getFillColor(buildings[0].status)} 
            height={160} 
            label="Library"
            isCenter
            load={buildings[0].load}
          />

          {/* Building 3: Data Center (Right, Glowing) */}
          <BuildingGroup 
            x={580} y={240} 
            color={getFillColor(buildings[3].status)} 
            height={90} 
            label="Data Center"
            load={buildings[3].load}
          />

          {/* Building 4: Admin (Back) */}
          <BuildingGroup 
            x={450} y={120} 
            color={getFillColor(buildings[2].status)} 
            height={100} 
            label="Admin"
            load={buildings[2].load}
          />

        </svg>

        {/* Floating Stats Panel */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur border p-4 rounded-xl shadow-lg w-64">
          <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Zonal Load Status</h4>
          <div className="space-y-3">
            {buildings.map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    b.status === 'optimal' ? 'bg-emerald-500' : 
                    b.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  {b.name}
                </span>
                <span className="font-mono font-medium">{b.load}%</span>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

// Helper component to draw an isometric building
function BuildingGroup({ x, y, color, height, label, isCenter, load }: any) {
  // Isometric projection math roughly
  const width = 60; 
  
  return (
    <motion.g 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Roof */}
      <path 
        d={`M${x} ${y} L${x+width} ${y+30} L${x} ${y+60} L${x-width} ${y+30} Z`} 
        fill={color} 
        stroke="white" 
        strokeWidth="2"
        className="transition-colors duration-500"
        filter={load > 85 ? "url(#glow)" : ""}
      />
      {/* Left Wall */}
      <path 
        d={`M${x-width} ${y+30} L${x} ${y+60} L${x} ${y+60+height} L${x-width} ${y+30+height} Z`} 
        fill={color} 
        filter="brightness(0.8)"
        className="transition-colors duration-500 opacity-90"
      />
      {/* Right Wall */}
      <path 
        d={`M${x} ${y+60} L${x+width} ${y+30} L${x+width} ${y+30+height} L${x} ${y+60+height} Z`} 
        fill={color} 
        filter="brightness(0.6)"
        className="transition-colors duration-500 opacity-80"
      />
      
      {/* Floating Label */}
      <g transform={`translate(${x}, ${y - 20})`}>
        <rect x="-40" y="-20" width="80" height="24" rx="4" fill="white" fillOpacity="0.9" />
        <text x="0" y="-4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">
          {label}
        </text>
      </g>
    </motion.g>
  );
}