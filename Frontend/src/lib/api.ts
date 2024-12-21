import axios from "axios";
import { ScanResult } from "./types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse {
  status: string;
  data: {
    violations: Array<{
      description: string;
      impact: string;
      nodes: number;
      wcag_reference: string;
      suggested_fix: string;
      affected_nodes: string[];
    }>;
    recommendations: Record<string, string>;
  };
}

const mapSeverity = (impact: string): "high" | "medium" | "low" => {
  switch (impact.toLowerCase()) {
    case "critical":
    case "serious":
      return "high";
    case "moderate":
      return "medium";
    default:
      return "low";
  }
};

export const analyzeSite = async (url: string): Promise<ScanResult> => {
  try {
    console.log('Enviando solicitud a:', `${API_URL}/api/analyze`);
    console.log('Datos enviados:', { url });
    
    const response = await axios.post<ApiResponse>(
      `${API_URL}/api/analyze`, 
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Respuesta recibida:', response.data);
    
    const violations = response.data.data.violations;
    
    const summary = {
      high: violations.filter(v => ["critical", "serious"].includes(v.impact.toLowerCase())).length,
      medium: violations.filter(v => v.impact.toLowerCase() === "moderate").length,
      low: violations.filter(v => !["critical", "serious", "moderate"].includes(v.impact.toLowerCase())).length
    };
    
    const totalIssues = violations.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - (totalIssues * 5))));
    
    const issues = violations.map((violation, index) => ({
      id: `issue-${index}`,
      title: violation.description,
      description: `Encontrado en ${violation.nodes} elemento${violation.nodes > 1 ? 's' : ''}.
                   ${violation.affected_nodes[0]}`,
      severity: mapSeverity(violation.impact),
      wcagReference: violation.wcag_reference,
      solution: violation.suggested_fix
    }));

    // Agregamos las recomendaciones al resultado
    const recommendations = response.data.data.recommendations || {};

    return {
      score,
      issues,
      summary,
      recommendations
    };
  } catch (error) {
    console.error("Error al analizar el sitio:", error);
    throw error;
  }
};

interface DocumentAnalysisResponse {
  status: string;
  data: {
    metadata: {
      status: string;
      createdDateTime: string;
      lastUpdatedDateTime: string;
    };
    content: {
      text: string;
      pages: Array<{
        pageNumber: number;
        angle: number;
        dimensions: {
          width: number;
          height: number;
          unit: string;
        };
        words: Array<{
          content: string;
          confidence: number;
          boundingBox: number[];
          span: {
            start: number;
            length: number;
          };
        }>;
      }>;
      tables?: Array<{
        rowCount: number;
        columnCount: number;
        cells: Array<{
          rowIndex: number;
          columnIndex: number;
          content: string;
          boundingRegions: number[];
        }>;
      }>;
    };
  };
}

export const analyzeDocument = async (file: File): Promise<DocumentAnalysisResponse> => {
  try {
    console.log('Enviando solicitud a:', `${API_URL}/api/analyze-document-upload`);
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<DocumentAnalysisResponse>(
      `${API_URL}/api/analyze-document-upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    console.log('Respuesta recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al analizar el documento:", error);
    throw error;
  }
};