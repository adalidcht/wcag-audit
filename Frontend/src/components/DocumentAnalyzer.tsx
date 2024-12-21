import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2 } from "lucide-react";
import { analyzeDocument } from "@/lib/api";
import { FileUpload } from "./document-analyzer/FileUpload";
import { ContentEditor } from "./document-analyzer/ContentEditor";
import { DocumentPreview } from "./document-analyzer/DocumentPreview";
import { RecommendationItem } from "./document-analyzer/RecommendationItem";

export function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeDocument(file);
      setAnalysisResult(result);
      toast({
        title: "Análisis completado",
        description: "El documento ha sido analizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al analizar el documento",
        description: "Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImproveDocument = async () => {
    if (!file) return;
    
    setIsImproving(true);
    try {
      // Aquí iría la lógica para mejorar el documento automáticamente
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación
      toast({
        title: "Mejoras aplicadas",
        description: "El documento ha sido mejorado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al mejorar el documento",
        description: "No se pudieron aplicar las mejoras automáticas.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyRecommendation = async (index: number) => {
    try {
      // Aquí iría la lógica para aplicar una recomendación específica
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      toast({
        title: "Mejora aplicada",
        description: "La recomendación ha sido aplicada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al aplicar la mejora",
        description: "No se pudo aplicar la recomendación.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Análisis de Documentos</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sube tu documento para analizar su contenido, estructura y accesibilidad. 
          Obtendrás recomendaciones detalladas y la opción de aplicar mejoras automáticas.
        </p>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUpload
            onFileSelect={setFile}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
            file={file}
          />

          {analysisResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Resultados del análisis</h3>
                <Button
                  onClick={handleImproveDocument}
                  disabled={isImproving}
                  variant="secondary"
                  className="w-auto"
                >
                  {isImproving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Aplicando mejoras...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Mejorar automáticamente
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="preview">Vista previa</TabsTrigger>
                  <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content">
                  <ContentEditor
                    initialContent={analysisResult.data.content.text}
                    onSave={(content) => {
                      // Aquí iría la lógica para guardar el contenido editado
                      console.log("Contenido guardado:", content);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="preview">
                  <DocumentPreview content={analysisResult.data.content.text} />
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <div className="grid gap-4">
                    {Object.entries(analysisResult.data.recommendations || {}).map(([title, description], index) => (
                      <RecommendationItem
                        key={index}
                        title={title}
                        description={description as string}
                        onApply={() => handleApplyRecommendation(index)}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
