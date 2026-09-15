import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { HvacDiagnosticsService, HvacDiagnosticsRequest, DiagnosticResult } from './hvac-diagnostics.service';

@Controller('api/diagnostics')
@UseGuards(JwtAuthGuard)
export class HvacDiagnosticsController {
  constructor(private readonly diagnosticsService: HvacDiagnosticsService) {}

  /**
   * Analyze HVAC equipment image
   * POST /api/diagnostics/analyze
   */
  @Post('analyze')
  async analyzeEquipment(@Body() request: HvacDiagnosticsRequest): Promise<{
    diagnosticId: string;
    status: string;
    message: string;
  }> {
    if (!request.jobId || !request.captureId || !request.imageUrl) {
      throw new BadRequestException('jobId, captureId, and imageUrl are required');
    }

    const result = await this.diagnosticsService.analyzeEquipment(request);

    return {
      diagnosticId: result.id,
      status: result.status,
      message: 'Analysis started - results will be available shortly',
    };
  }

  /**
   * Get diagnostic result
   * GET /api/diagnostics/:diagnosticId
   */
  @Get(':diagnosticId')
  async getDiagnostic(@Param('diagnosticId') diagnosticId: string): Promise<DiagnosticResult> {
    const result = await this.diagnosticsService.getDiagnostic(diagnosticId);

    if (!result) {
      throw new NotFoundException(`Diagnostic ${diagnosticId} not found`);
    }

    return result;
  }

  /**
   * Get all diagnostics for a job
   * GET /api/diagnostics/job/:jobId
   */
  @Get('job/:jobId')
  async getJobDiagnostics(@Param('jobId') jobId: string): Promise<{
    diagnostics: DiagnosticResult[];
    total: number;
  }> {
    const diagnostics = await this.diagnosticsService.getJobDiagnostics(jobId);

    return {
      diagnostics: diagnostics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      total: diagnostics.length,
    };
  }

  /**
   * Auto-generate estimate from diagnostics
   * POST /api/diagnostics/:diagnosticId/estimate
   */
  @Post(':diagnosticId/estimate')
  async generateEstimate(
    @Param('diagnosticId') diagnosticId: string
  ): Promise<{
    estimateId: string;
    jobId: string;
    estimatedTotal: number;
    estimatedLow: number;
    estimatedHigh: number;
    partsBreakdown: Array<{
      category: string;
      items: string[];
      cost: number;
    }>;
    laborBreakdown: Array<{
      category: string;
      hours: number;
      rate: number;
      cost: number;
    }>;
    createdAt: Date;
  }> {
    const diagnostic = await this.diagnosticsService.getDiagnostic(diagnosticId);

    if (!diagnostic) {
      throw new NotFoundException(`Diagnostic ${diagnosticId} not found`);
    }

    // Build estimate from diagnostic data
    const partsBreakdown: Array<{
      category: string;
      items: string[];
      cost: number;
    }> = [];
    const laborBreakdown: Array<{
      category: string;
      hours: number;
      rate: number;
      cost: number;
    }> = [];

    let totalPartsCost = 0;
    let totalLaborCost = 0;

    diagnostic.recommendations.forEach((rec) => {
      if (rec.partsNeeded && rec.partsNeeded.length > 0) {
        partsBreakdown.push({
          category: rec.action,
          items: rec.partsNeeded,
          cost: rec.estimatedCost || 0,
        });
        totalPartsCost += rec.estimatedCost || 0;
      }

      if (rec.estimatedLabor) {
        laborBreakdown.push({
          category: rec.action,
          hours: rec.estimatedLabor / 125, // Assume $125/hour rate
          rate: 125,
          cost: rec.estimatedLabor,
        });
        totalLaborCost += rec.estimatedLabor;
      }
    });

    const estimatedTotal = totalPartsCost + totalLaborCost;

    return {
      estimateId: `EST-${diagnosticId.substring(0, 8)}`,
      jobId: diagnostic.jobId,
      estimatedTotal,
      estimatedLow: diagnostic.estimatedRepairCost?.low || estimatedTotal,
      estimatedHigh: diagnostic.estimatedRepairCost?.high || estimatedTotal,
      partsBreakdown,
      laborBreakdown,
      createdAt: new Date(),
    };
  }
}
