import { Card } from "@/components/ui/card";
import { ScanResult } from "@/lib/types";

interface SeverityChartProps {
  data: ScanResult;
}

export function SeverityChart({ data }: SeverityChartProps) {
  const total = data.summary.high + data.summary.medium + data.summary.low;
  
  const getWidth = (value: number) => {
    return total === 0 ? 0 : (value / total) * 100;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Distribución de problemas</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Alta severidad</span>
            <span>{data.summary.high}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-error rounded-full transition-all duration-500"
              style={{ width: `${getWidth(data.summary.high)}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Media severidad</span>
            <span>{data.summary.medium}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-warning rounded-full transition-all duration-500"
              style={{ width: `${getWidth(data.summary.medium)}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Baja severidad</span>
            <span>{data.summary.low}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${getWidth(data.summary.low)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}