import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface RecommendationsListProps {
  recommendations: Record<string, string>;
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Recomendaciones de Accesibilidad</h2>
      </div>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {Object.entries(recommendations).map(([title, description], index) => (
          <AccordionItem 
            key={`rec-${index}`} 
            value={`item-${index}`}
            className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline">
              <h3 className="text-left font-medium">{title}</h3>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <p className="text-muted-foreground whitespace-pre-line">{description}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}