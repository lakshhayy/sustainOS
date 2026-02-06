import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowRight, Leaf, Thermometer, Zap, CloudSun } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SimulationResult {
  costSavings: number;
  carbonReduction: number;
  comfortScore: number;
  energySaved: number;
  outdoorTemp?: number; // <--- NEW: Received from Python
}

const formSchema = z.object({
  acTemp: z.number().min(18).max(30),
  reductionPercent: z.number().min(0).max(100),
  incentiveEnabled: z.boolean().default(false),
});

export default function Simulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acTemp: 22,
      reductionPercent: 10,
      incentiveEnabled: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/simulate", values);
      return await res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Simulation Complete",
        description: `Analysis based on live outdoor conditions (${data.outdoorTemp}°C).`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to run simulation. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Policy Simulator</CardTitle>
          <CardDescription>
            Adjust parameters to simulate environmental and cost impacts using the Server-Side AI engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="acTemp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                        <span>HVAC Setpoint Limit (°C)</span>
                        <span className="font-mono text-muted-foreground">{field.value}°C</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={18}
                        max={30}
                        step={0.5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      BEE guidelines recommend 24°C as the ideal default setting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reductionPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                        <span>Peak Load Reduction (%)</span>
                        <span className="font-mono text-muted-foreground">{field.value}%</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Percentage of non-critical load (lighting, pumps) to shed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incentiveEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                    <div className="space-y-0.5">
                      <FormLabel>DISCOM Incentive Program</FormLabel>
                      <FormDescription>
                        Opt-in for utility demand response rebates.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Live Data...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run Policy Simulation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        {!result && !mutation.isPending && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ArrowRight className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="font-heading font-medium text-lg">Ready to Simulate</h3>
                <p>Click "Run" to fetch live weather data and calculate impact.</p>
            </div>
        )}

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* NEW: Live Weather Card */}
                 <Card className="bg-blue-950 text-white border-none shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CloudSun className="w-32 h-32" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <CloudSun className="w-4 h-4" /> Live Environment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-heading">{result.outdoorTemp}°C</span>
                            <span className="text-blue-200">Outdoor Temp (Delhi)</span>
                        </div>
                        <p className="text-xs text-blue-300 mt-2">
                            Thermodynamic load calculated based on real-time API data.
                        </p>
                    </CardContent>
                 </Card>

                 <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white/90">Projected Monthly Savings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold font-heading">₹{result.costSavings.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-100">est.</span>
                    </CardContent>
                 </Card>

                 <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Reduction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-emerald-500" />
                                <span className="text-2xl font-bold">{result.carbonReduction} kg</span>
                            </div>
                            <Progress value={result.carbonReduction / 30} className="h-2 mt-3 bg-muted" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Comfort Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-blue-500" />
                                <span className="text-2xl font-bold">{(result.comfortScore * 100).toFixed(0)}%</span>
                            </div>
                            <Progress 
                                value={result.comfortScore * 100} 
                                className={`h-2 mt-3 bg-muted ${result.comfortScore < 0.6 ? "text-amber-500" : ""}`} 
                            />
                        </CardContent>
                    </Card>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}