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
import { Loader2, ArrowRight, Leaf, Thermometer, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Matches backend interface
interface SimulationResult {
  costSavings: number;
  carbonReduction: number;
  comfortScore: number;
  energySaved: number;
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

  // CONNECTED: Sends POST to /api/simulate
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/simulate", values);
      return await res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Simulation Complete",
        description: "AI Engine has processed the policy parameters.",
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
      {/* Simulation Form */}
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
                      BEE guidelines recommend 24°C as the ideal default setting for Indian commercial spaces.
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
                      Percentage of non-critical load (signage, decorative lighting) to shed during peak hours.
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
                        Opt-in for local utility demand response rebates.
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
                    Processing with AI Engine...
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

      {/* Results Panel */}
      <div className="space-y-6">
        {!result && !mutation.isPending && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ArrowRight className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="font-heading font-medium text-lg">Ready to Simulate</h3>
                <p>Adjust parameters to see projected savings in INR (₹) and carbon reduction.</p>
            </div>
        )}

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                 <Card className="border-l-4 border-l-primary bg-muted/10">
                    <CardContent className="pt-6">
                        <h4 className="font-heading font-semibold mb-2">AI Analysis</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Increasing the setpoint to <span className="font-bold text-foreground">{form.getValues().acTemp}°C</span> significantly reduces energy consumption. 
                            {result.comfortScore < 0.7 
                                ? " However, the comfort score indicates a risk of occupant complaints. Consider a more moderate adjustment." 
                                : " The projected impact on occupant comfort is minimal, making this a high-value strategy."}
                        </p>
                    </CardContent>
                 </Card>
            </div>
        )}
      </div>
    </div>
  );
}