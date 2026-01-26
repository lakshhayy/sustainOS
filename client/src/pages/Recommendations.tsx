import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Droplets, DollarSign, Thermometer } from "lucide-react";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
  });

  const getIcon = (category: string) => {
    switch (category) {
      case "energy": return <Zap className="w-5 h-5 text-emerald-500" />;
      case "water": return <Droplets className="w-5 h-5 text-blue-500" />;
      case "cost": return <DollarSign className="w-5 h-5 text-amber-500" />;
      default: return <Thermometer className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "hard": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-heading font-semibold">AI Recommended Actions</h2>
            <p className="text-muted-foreground">Prioritized list of actions to optimize sustainability performance based on current data.</p>
       </div>

      <div className="grid gap-4">
        {isLoading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-xl bg-sidebar animate-pulse" />
              ))
        ) : (
            recommendations?.map((rec) => (
                <Card key={rec.id} className="group hover:border-primary/50 transition-colors duration-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                    {getIcon(rec.category)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{rec.action}</CardTitle>
                                    <CardDescription className="mt-1">{rec.reason}</CardDescription>
                                </div>
                            </div>
                            <Badge variant="secondary" className={getDifficultyColor(rec.difficulty)}>
                                {rec.difficulty.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mt-2 pl-12">
                            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                                <ArrowRight className="w-4 h-4" />
                                {rec.impact}
                            </div>
                            <Button variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                <Check className="w-4 h-4" />
                                Mark as Done
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
