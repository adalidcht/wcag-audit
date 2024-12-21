import { useState } from "react";
import { ScanForm } from "@/components/ScanForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { DocumentAnalyzer } from "@/components/DocumentAnalyzer";
import type { ScanResult } from "@/lib/types";
import { analyzeSite } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const handleScan = async (url: string) => {
    setIsLoading(true);
    try {
      const scanResult = await analyzeSite(url);
      setResult(scanResult);
    } catch (error) {
      console.error("Error al analizar el sitio:", error);
      toast({
        title: "Error al analizar el sitio",
        description: "Por favor verifica la URL e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Escáner de Accesibilidad
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Analiza la accesibilidad de tu sitio web o documento y obtén recomendaciones basadas en WCAG.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <Tabs defaultValue="website" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="website">Sitio Web</TabsTrigger>
            <TabsTrigger value="document">Documento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="website" className="space-y-8">
            <ScanForm onScan={handleScan} isLoading={isLoading} />
            {result && <ResultsDashboard data={result} />}
          </TabsContent>
          
          <TabsContent value="document">
            <DocumentAnalyzer />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}