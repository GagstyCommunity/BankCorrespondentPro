import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";

interface StatisticCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendColor?: string;
}

export function StatisticCard({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  trendColor,
}: StatisticCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            </div>
          </div>
          {trend !== "neutral" && (
            <div className={`flex items-center ${trendColor || (trend === "up" ? "text-green-600" : "text-red-600")}`}>
              {trend === "up" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{description}</p>
      </CardContent>
    </Card>
  );
}
