import { Card } from "@/components/ui/card";
import { ScanResult } from "@/lib/types";
import { SeverityChart } from "./SeverityChart";
import { IssuesList } from "./IssuesList";
import { ReportDownload } from "./ReportDownload";
import { RecommendationsList } from "./RecommendationsList";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ResultsDashboardProps {
  data: ScanResult;
}

export function ResultsDashboard({ data }: ResultsDashboardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">Puntuación global</h2>
          <div className="flex items-center justify-center h-32">
            <span className="text-6xl font-bold text-primary">{data.score}</span>
            <span className="text-2xl text-gray-500 ml-2">/100</span>
          </div>
        </Card>
        
        <SeverityChart data={data} />
      </div>

      {data.recommendations && Object.keys(data.recommendations).length > 0 && (
        <RecommendationsList recommendations={data.recommendations} />
      )}

      <Collapsible className="space-y-4">
        <div className="flex justify-between items-center">
          <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
            <h2 className="text-2xl font-bold">Problemas encontrados</h2>
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
          <ReportDownload data={data} />
        </div>
        
        <CollapsibleContent>
          <IssuesList issues={data.issues} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}