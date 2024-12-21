import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/lib/types";

interface IssuesListProps {
  issues: Issue[];
}

const severityColors = {
  high: "bg-error text-white",
  medium: "bg-warning text-white",
  low: "bg-success text-white",
};

export function IssuesList({ issues }: IssuesListProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {issues.map((issue) => (
        <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg p-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-4">
              <Badge className={severityColors[issue.severity]}>
                {issue.severity}
              </Badge>
              <h3 className="text-left font-medium">{issue.title}</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <p className="text-gray-600">{issue.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Solución sugerida:</h4>
              <p className="text-gray-600">{issue.solution}</p>
            </div>
            
            <div className="pt-2">
              <a
                href={issue.wcagReference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Ver referencia WCAG →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}