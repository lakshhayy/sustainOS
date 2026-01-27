import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Leaf, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageData {
  time: string;
  actualEnergy: number | null;
  predictedEnergy: number | null;
  actualWater: number | null;
  predictedWater: number | null;
}

export default function Dashboard() {
  // CONNECTED: Fetches from GET /api/dashboard
  const { data: usageData, isLoading } = useQuery<UsageData[]>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl bg-sidebar" />
        ))}
        <Skeleton className="col-span-full h-96 rounded-xl bg-sidebar" />
      </div>
    );
  }

  // Calculate metrics based on the last real data point
  const latestData = usageData ? usageData[usageData.length - 3] : null; 
  const isPeakWarning = latestData && (latestData.predictedEnergy || 0) > 1000;

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
            <div className="text-2xl font-bold font-heading">{latestData?.actualEnergy ?? "--"} kWh</div>
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
            <div className="text-2xl font-bold font-heading">{latestData?.actualWater ?? "--"} L</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-amber-500" />
              +4.3% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-white to-lime-50/50 dark:from-sidebar dark:to-sidebar/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Grade (BEE)</CardTitle>
            <Leaf className="h-4 w-4 text-lime-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">4 Star</div>
            <p className="text-xs text-muted-foreground mt-1">
              Top 15% of similar facilities in region
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
            Predicted energy usage for tomorrow exceeds the 1000 kWh threshold. Consider enabling demand response protocols to avoid peak tariff surcharges.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Chart */}
      <Card className="shadow-sm border-border/60 overflow-hidden">
        <CardHeader>
          <CardTitle>Energy Demand Forecast</CardTitle>
          <CardDescription>Actual vs Predicted usage over the last 30 days + 48h forecast</CardDescription>
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
              <ReferenceLine y={1100} label="Grid Limit" stroke="hsl(var(--destructive))" strokeDasharray="3 3" />

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