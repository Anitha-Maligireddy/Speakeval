import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";

export function ScoreCard({ label, value, icon: Icon, tint = "primary" }: { label: string; value: number; icon: LucideIcon; tint?: "primary" | "secondary" | "accent" | "success" }) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/20 text-accent-foreground",
    success: "bg-success/10 text-success",
  } as const;
  return (
    <Card className="shadow-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className={`size-9 rounded-lg grid place-items-center ${tintMap[tint]}`}>
            <Icon className="size-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">{value}<span className="text-base text-muted-foreground font-normal">/100</span></div>
        <Progress value={value} className="mt-3 h-1.5" />
      </CardContent>
    </Card>
  );
}