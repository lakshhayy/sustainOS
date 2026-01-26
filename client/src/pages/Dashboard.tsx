import { useQuery } from "@tanstack/react-query";
import { getUsageData } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Leaf, Droplets } from "lucide-react";

export default function Dashboard() {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["usageData"],
    queryFn: getUsageData,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl bg-sidebar animate-pulse" />
        ))}
        <div className="col-span-full h-96 rounded-xl bg-sidebar animate-pulse" />
      </div>
    );
  }

  const latestData = usageData ? usageData[usageData.length - 3] : null; // Getting current day (approx)
  const isPeakWarning = latestData && latestData.predictedEnergy > 550;

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-white to-emerald-50/50 dark:from-sidebar dark:to-sidebar/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Energy Usage</CardTitle>
            <ZapIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{latestData?.actualEnergy ?? 450} kWh</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="w-3 h-3 mr-1 text-emerald-600" />
              -2.1% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-white to-blue-50/50 dark:from-sidebar dark:to-sidebar/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Water Consumption</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{latestData?.actualWater ?? 210} L</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-amber-500" />
              +4.3% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-white to-lime-50/50 dark:from-sidebar dark:to-sidebar/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Score</CardTitle>
            <Leaf className="h-4 w-4 text-lime-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">A-</div>
            <p className="text-xs text-muted-foreground mt-1">
              Top 15% of similar facilities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning Alert */}
      {isPeakWarning && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 !text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Peak Usage Warning</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            Predicted energy usage for tomorrow exceeds the 550 kWh threshold. Consider enabling demand response protocols.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Chart */}
      <Card className="shadow-sm border-border/60 overflow-hidden">
        <CardHeader>
          <CardTitle>Energy Demand Forecast</CardTitle>
          <CardDescription>Actual vs Predicted usage over the last 7 days + 48h forecast</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dx={-10}
              />
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-lg)"
                }}
              />
              <ReferenceLine y={600} label="Peak Limit" stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
              
              <Area 
                type="monotone" 
                dataKey="predictedEnergy" 
                name="Predicted (kWh)"
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
              />
              <Area 
                type="monotone" 
                dataKey="actualEnergy" 
                name="Actual (kWh)"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorActual)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ZapIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
