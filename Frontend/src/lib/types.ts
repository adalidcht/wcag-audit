export interface ScanResult {
  score: number;
  issues: Issue[];
  summary: {
    high: number;
    medium: number;
    low: number;
  };
  recommendations: Record<string, string>;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  wcagReference: string;
  solution: string;
}