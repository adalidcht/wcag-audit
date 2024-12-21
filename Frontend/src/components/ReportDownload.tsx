import { Button } from "@/components/ui/button";
import { ScanResult } from "@/lib/types";
import jsPDF from "jspdf";

interface ReportDownloadProps {
  data: ScanResult;
}

export function ReportDownload({ data }: ReportDownloadProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 20;

    // Configuración de estilos
    const titleSize = 20;
    const subtitleSize = 16;
    const normalSize = 12;
    const smallSize = 10;
    const lineHeight = 8;
    const sectionSpacing = 15;

    // Función helper para centrar texto
    const centerText = (text: string, y: number, size: number) => {
      doc.setFontSize(size);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
      return y + lineHeight;
    };

    // Función helper para añadir texto con salto de línea automático
    const addWrappedText = (text: string, y: number, fontSize = normalSize) => {
      doc.setFontSize(fontSize);
      const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(textLines, margin, y);
      return y + (textLines.length * lineHeight);
    };

    // Función helper para añadir sección
    const addSection = (title: string, content: string | (() => void), fontSize = normalSize) => {
      doc.setFontSize(subtitleSize);
      doc.setFont(undefined, 'bold');
      yPosition = addWrappedText(title, yPosition);
      yPosition += 5;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(fontSize);
      
      if (typeof content === 'string') {
        yPosition = addWrappedText(content, yPosition, fontSize);
      } else {
        content();
      }
      yPosition += sectionSpacing;
    };

    // Encabezado
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Título y fecha
    yPosition = centerText("Reporte de Accesibilidad Web", yPosition, titleSize);
    yPosition += 5;
    yPosition = centerText(currentDate, yPosition, smallSize);
    yPosition += sectionSpacing;

    // Resumen Ejecutivo
    addSection("Resumen Ejecutivo", `Este reporte presenta un análisis detallado de accesibilidad web, con una puntuación global de ${data.score}/100. El análisis identifica áreas de mejora y proporciona recomendaciones específicas para optimizar la accesibilidad del sitio.`);

    // Puntuación y Estadísticas
    addSection("Análisis de Severidad", () => {
      const stats = [
        `• Problemas graves: ${data.summary.high}`,
        `• Problemas medios: ${data.summary.medium}`,
        `• Problemas leves: ${data.summary.low}`
      ];
      stats.forEach(stat => {
        yPosition = addWrappedText(stat, yPosition);
        yPosition += 2;
      });
    });

    // Recomendaciones Principales
    if (data.recommendations && Object.keys(data.recommendations).length > 0) {
      addSection("Recomendaciones Principales", () => {
        Object.entries(data.recommendations).forEach(([title, description], index) => {
          if (yPosition > doc.internal.pageSize.height - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          const cleanDescription = description.replace('recommendation: ', '');
          doc.setFont(undefined, 'bold');
          yPosition = addWrappedText(`${index + 1}. ${title}`, yPosition, normalSize);
          yPosition += 3;
          
          doc.setFont(undefined, 'normal');
          yPosition = addWrappedText(cleanDescription, yPosition, smallSize);
          yPosition += 8;
        });
      });
    }

    // Problemas Detallados
    doc.addPage();
    yPosition = 20;
    addSection("Detalle de Problemas Encontrados", () => {
      data.issues.forEach((issue, index) => {
        if (yPosition > doc.internal.pageSize.height - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont(undefined, 'bold');
        yPosition = addWrappedText(`${index + 1}. ${issue.title} (${issue.severity.toUpperCase()})`, yPosition);
        yPosition += 3;

        doc.setFont(undefined, 'normal');
        yPosition = addWrappedText(`Descripción: ${issue.description}`, yPosition, smallSize);
        yPosition += 3;
        yPosition = addWrappedText(`Solución: ${issue.solution}`, yPosition, smallSize);
        yPosition += 3;
        yPosition = addWrappedText(`Referencia WCAG: ${issue.wcagReference}`, yPosition, smallSize);
        yPosition += sectionSpacing;
      });
    });

    // Pie de página en cada página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(smallSize);
      doc.setTextColor(128);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin - 20,
        doc.internal.pageSize.height - 10
      );
    }

    // Guardar el PDF
    doc.save("reporte-accesibilidad.pdf");
  };

  return (
    <Button
      onClick={handleDownload}
      className="bg-primary hover:bg-primary/90"
    >
      Descargar reporte PDF
    </Button>
  );
}