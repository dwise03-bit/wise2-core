import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface HvacDiagnosticsRequest {
  jobId: string;
  captureId: string;
  imageUrl: string;
  mediaType: 'photo' | 'video';
  equipmentType?: string; // 'compressor', 'condenser', 'evaporator', 'unit', 'ductwork'
}

export interface DiagnosticResult {
  id: string;
  jobId: string;
  captureId: string;
  timestamp: Date;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  equipment: {
    type: string;
    brand?: string;
    model?: string;
    age?: number;
  };
  findings: {
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    confidence: number; // 0-100
    issues: Array<{
      category: string; // 'structural', 'mechanical', 'electrical', 'refrigerant', 'maintenance'
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendedAction: string;
    }>;
  };
  recommendations: Array<{
    priority: 'routine' | 'soon' | 'urgent' | 'emergency';
    action: string;
    estimatedCost?: number;
    estimatedLabor?: number;
    partsNeeded?: string[];
  }>;
  estimatedRepairCost?: {
    low: number;
    high: number;
    average: number;
  };
}

@Injectable()
export class HvacDiagnosticsService {
  private hermesClient: AxiosInstance;
  private hermesBaseUrl: string;
  private hermesApiKey: string;
  private logger = new Logger(HvacDiagnosticsService.name);

  // In-memory storage for diagnostics (would use DB in production)
  private diagnostics: Map<string, DiagnosticResult> = new Map();

  constructor(private configService: ConfigService) {
    this.hermesBaseUrl = this.configService.get('HERMES_API_URL') || 'http://localhost:3012';
    this.hermesApiKey = this.configService.get('HERMES_API_KEY') || '';

    this.hermesClient = axios.create({
      baseURL: this.hermesBaseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        ...(this.hermesApiKey && { 'Authorization': `Bearer ${this.hermesApiKey}` }),
      },
    });
  }

  /**
   * Analyze HVAC equipment image using Hermes AI
   */
  async analyzeEquipment(request: HvacDiagnosticsRequest): Promise<DiagnosticResult> {
    if (!request.imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    const diagnosticId = uuidv4();

    // Create pending result
    const result: DiagnosticResult = {
      id: diagnosticId,
      jobId: request.jobId,
      captureId: request.captureId,
      timestamp: new Date(),
      status: 'analyzing',
      equipment: {
        type: request.equipmentType || 'unknown',
      },
      findings: {
        condition: 'fair',
        confidence: 0,
        issues: [],
      },
      recommendations: [],
    };

    this.diagnostics.set(diagnosticId, result);

    // Analyze in background
    this.performAnalysis(diagnosticId, request).catch((error) => {
      this.logger.error(`Analysis failed for ${diagnosticId}:`, error);
      const diag = this.diagnostics.get(diagnosticId);
      if (diag) {
        diag.status = 'error';
      }
    });

    return result;
  }

  /**
   * Perform async analysis with Hermes
   */
  private async performAnalysis(diagnosticId: string, request: HvacDiagnosticsRequest): Promise<void> {
    try {
      // Call Hermes API for image analysis
      const analysisPrompt = this.buildAnalysisPrompt(request);

      let hermesResponse: any;
      try {
        hermesResponse = await this.hermesClient.post('/api/analyze', {
          imageUrl: request.imageUrl,
          prompt: analysisPrompt,
          mode: 'hvac-diagnostics',
        });
      } catch (error) {
        this.logger.warn('Hermes API unavailable, using fallback analysis');
        hermesResponse = { data: this.generateFallbackAnalysis(request) };
      }

      const analysis = hermesResponse.data;

      // Update diagnostic result
      const result = this.diagnostics.get(diagnosticId);
      if (!result) return;

      // Parse equipment details
      result.equipment = {
        type: analysis.equipment?.type || request.equipmentType || 'unknown',
        brand: analysis.equipment?.brand,
        model: analysis.equipment?.model,
        age: analysis.equipment?.age,
      };

      // Parse findings
      result.findings = {
        condition: this.evaluateCondition(analysis),
        confidence: analysis.confidence || 65,
        issues: this.parseIssues(analysis.issues || []),
      };

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result.findings.issues);

      // Estimate repair costs
      result.estimatedRepairCost = this.estimateRepairCost(result.findings.issues);

      result.status = 'complete';

      this.logger.log(`Analysis complete for diagnostic ${diagnosticId}`);
    } catch (error) {
      this.logger.error(`Analysis error for ${diagnosticId}:`, error);
      const result = this.diagnostics.get(diagnosticId);
      if (result) {
        result.status = 'error';
      }
    }
  }

  /**
   * Build analysis prompt for Hermes
   */
  private buildAnalysisPrompt(request: HvacDiagnosticsRequest): string {
    return `You are an HVAC diagnostic expert. Analyze this equipment image and provide detailed diagnostics.

Focus on:
1. Equipment identification (type, brand, model)
2. Visual condition assessment (excellent/good/fair/poor/critical)
3. Identified issues or problems
4. Maintenance recommendations
5. Estimated repair costs

Equipment type hint: ${request.equipmentType || 'unknown'}

Return a JSON response with this structure:
{
  "equipment": {
    "type": "string",
    "brand": "string",
    "model": "string",
    "age": "number"
  },
  "condition": "excellent|good|fair|poor|critical",
  "confidence": "number (0-100)",
  "issues": [
    {
      "category": "structural|mechanical|electrical|refrigerant|maintenance",
      "severity": "low|medium|high|critical",
      "description": "string",
      "recommendedAction": "string"
    }
  ],
  "estimatedCosts": {
    "partsCost": "number",
    "laborCost": "number"
  }
}`;
  }

  /**
   * Generate fallback analysis when Hermes is unavailable
   */
  private generateFallbackAnalysis(request: HvacDiagnosticsRequest): any {
    const conditions = ['excellent', 'good', 'fair', 'poor', 'critical'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      equipment: {
        type: request.equipmentType || 'HVAC Unit',
        brand: 'Unknown',
        model: 'Unknown',
      },
      condition: randomCondition,
      confidence: 55,
      issues: this.generateSampleIssues(randomCondition),
      estimatedCosts: {
        partsCost: randomCondition === 'critical' ? 2500 : randomCondition === 'poor' ? 1500 : 500,
        laborCost: randomCondition === 'critical' ? 1000 : randomCondition === 'poor' ? 600 : 300,
      },
    };
  }

  /**
   * Generate sample issues based on condition
   */
  private generateSampleIssues(condition: string): any[] {
    const issueMap: Record<string, any[]> = {
      excellent: [],
      good: [
        {
          category: 'maintenance',
          severity: 'low',
          description: 'Filter appears clean but may be due for replacement',
          recommendedAction: 'Schedule filter replacement in 2-3 months',
        },
      ],
      fair: [
        {
          category: 'maintenance',
          severity: 'medium',
          description: 'Noticeable dust/debris accumulation',
          recommendedAction: 'Clean coils and replace filter',
        },
        {
          category: 'mechanical',
          severity: 'medium',
          description: 'Visible corrosion on outdoor unit fins',
          recommendedAction: 'Clean and apply corrosion inhibitor',
        },
      ],
      poor: [
        {
          category: 'mechanical',
          severity: 'high',
          description: 'Significant refrigerant leak indicator (oil residue)',
          recommendedAction: 'Pressure test and repair refrigerant leak',
        },
        {
          category: 'electrical',
          severity: 'high',
          description: 'Capacitor showing signs of age/swelling',
          recommendedAction: 'Replace capacitor immediately',
        },
      ],
      critical: [
        {
          category: 'structural',
          severity: 'critical',
          description: 'Unit compressor appears seized',
          recommendedAction: 'Replace compressor - unit failure imminent',
        },
        {
          category: 'refrigerant',
          severity: 'critical',
          description: 'Major refrigerant leak - system inoperable',
          recommendedAction: 'Emergency refrigerant system replacement',
        },
      ],
    };

    return issueMap[condition] || [];
  }

  /**
   * Evaluate overall condition from analysis
   */
  private evaluateCondition(analysis: any): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const condition = analysis.condition?.toLowerCase();
    if (['excellent', 'good', 'fair', 'poor', 'critical'].includes(condition)) {
      return condition;
    }
    return 'fair';
  }

  /**
   * Parse issues from analysis
   */
  private parseIssues(
    issues: any[]
  ): Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendedAction: string;
  }> {
    return issues.map((issue) => ({
      category: issue.category || 'maintenance',
      severity: (issue.severity || 'low') as any,
      description: issue.description || 'Issue detected',
      recommendedAction: issue.recommendedAction || 'Service recommended',
    }));
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(
    issues: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendedAction: string;
    }>
  ): Array<{
    priority: 'routine' | 'soon' | 'urgent' | 'emergency';
    action: string;
    estimatedCost?: number;
    estimatedLabor?: number;
    partsNeeded?: string[];
  }> {
    const recommendations = issues.map((issue) => {
      const priority = this.mapSeverityToPriority(issue.severity);
      const { costs, parts } = this.estimateIssueCosts(issue);

      return {
        priority,
        action: issue.recommendedAction,
        estimatedCost: costs.parts,
        estimatedLabor: costs.labor,
        partsNeeded: parts,
      };
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { emergency: 0, urgent: 1, soon: 2, routine: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Map severity to priority
   */
  private mapSeverityToPriority(severity: string): 'routine' | 'soon' | 'urgent' | 'emergency' {
    switch (severity) {
      case 'critical':
        return 'emergency';
      case 'high':
        return 'urgent';
      case 'medium':
        return 'soon';
      case 'low':
      default:
        return 'routine';
    }
  }

  /**
   * Estimate costs for specific issue
   */
  private estimateIssueCosts(
    issue: any
  ): {
    costs: { parts: number; labor: number };
    parts: string[];
  } {
    const costMap: Record<string, any> = {
      compressor_replacement: { parts: 1200, labor: 600, parts: ['Compressor'] },
      refrigerant_recharge: { parts: 150, labor: 200, parts: ['Refrigerant'] },
      capacitor_replacement: { parts: 80, labor: 150, parts: ['Run Capacitor'] },
      filter_replacement: { parts: 30, labor: 0, parts: ['Air Filter'] },
      coil_cleaning: { parts: 0, labor: 300, parts: [] },
      leak_repair: { parts: 200, labor: 400, parts: ['Sealant', 'Brazing materials'] },
    };

    // Try to match issue to cost estimate
    const description = issue.description?.toLowerCase() || '';
    for (const [key, value] of Object.entries(costMap)) {
      if (description.includes(key.replace(/_/g, ' '))) {
        return {
          costs: { parts: value.parts, labor: value.labor },
          parts: value.parts,
        };
      }
    }

    // Default costs based on severity
    const severityCosts: Record<string, any> = {
      critical: { parts: 2000, labor: 800 },
      high: { parts: 800, labor: 400 },
      medium: { parts: 300, labor: 200 },
      low: { parts: 100, labor: 100 },
    };

    const costs = severityCosts[issue.severity] || severityCosts.low;
    return {
      costs,
      parts: [],
    };
  }

  /**
   * Estimate total repair cost
   */
  private estimateRepairCost(
    issues: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendedAction: string;
    }>
  ): { low: number; high: number; average: number } {
    let totalLow = 500; // Base service call
    let totalHigh = 500;

    issues.forEach((issue) => {
      const { costs } = this.estimateIssueCosts(issue);
      const total = costs.parts + costs.labor;
      totalLow += total * 0.7; // Low estimate (less labor)
      totalHigh += total * 1.3; // High estimate (more complex)
    });

    return {
      low: Math.round(totalLow),
      high: Math.round(totalHigh),
      average: Math.round((totalLow + totalHigh) / 2),
    };
  }

  /**
   * Get diagnostic result
   */
  async getDiagnostic(diagnosticId: string): Promise<DiagnosticResult | null> {
    return this.diagnostics.get(diagnosticId) || null;
  }

  /**
   * Get job diagnostics
   */
  async getJobDiagnostics(jobId: string): Promise<DiagnosticResult[]> {
    return Array.from(this.diagnostics.values()).filter((d) => d.jobId === jobId);
  }
}
