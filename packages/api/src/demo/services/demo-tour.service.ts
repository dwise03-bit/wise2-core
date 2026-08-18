import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoTourProgress, TourStatus } from '@prisma/client';
import { getTourByKey, getToursForAudience } from '../constants/tours';

/**
 * DemoTourService (Phase 6)
 *
 * Manages guided tours for demo environments.
 * Tracks tour progress and completion.
 */
@Injectable()
export class DemoTourService {
  private readonly logger = new Logger('Demo/TourService');

  constructor(private prisma: PrismaService) {}

  /**
   * Start a tour for a session
   */
  async startTour(
    demoSessionId: string,
    tourKey: string,
  ): Promise<DemoTourProgress> {
    const tour = getTourByKey(tourKey);
    if (!tour) {
      throw new Error(`Tour not found: ${tourKey}`);
    }

    // Create or update tour progress
    let progress = await this.prisma.demoTourProgress.findUnique({
      where: { demoSessionId },
    });

    if (progress) {
      // Update existing tour
      progress = await this.prisma.demoTourProgress.update({
        where: { demoSessionId },
        data: {
          tourId: tourKey,
          currentStep: 0,
          completedSteps: [],
          status: TourStatus.ACTIVE,
          startedAt: new Date(),
          completedAt: null,
        },
      });
    } else {
      // Create new tour progress
      progress = await this.prisma.demoTourProgress.create({
        data: {
          demoSessionId,
          tourId: tourKey,
          currentStep: 0,
          completedSteps: [],
          status: TourStatus.ACTIVE,
          startedAt: new Date(),
        },
      });
    }

    this.logger.log(`Started tour ${tourKey} for session ${demoSessionId}`);
    return progress;
  }

  /**
   * Advance to next step in tour
   */
  async nextStep(demoSessionId: string): Promise<DemoTourProgress> {
    const progress = await this.prisma.demoTourProgress.findUnique({
      where: { demoSessionId },
    });

    if (!progress) {
      throw new Error(`Tour progress not found for session ${demoSessionId}`);
    }

    const tour = getTourByKey(progress.tourId);
    if (!tour) {
      throw new Error(`Tour not found: ${progress.tourId}`);
    }

    const nextStep = progress.currentStep + 1;
    const isComplete = nextStep >= tour.steps.length;

    const completed = [...progress.completedSteps, progress.currentStep];

    if (isComplete) {
      return await this.prisma.demoTourProgress.update({
        where: { demoSessionId },
        data: {
          currentStep: nextStep,
          completedSteps: completed,
          status: TourStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return await this.prisma.demoTourProgress.update({
      where: { demoSessionId },
      data: {
        currentStep: nextStep,
        completedSteps: completed,
      },
    });
  }

  /**
   * Get current tour step
   */
  async getCurrentStep(demoSessionId: string) {
    const progress = await this.prisma.demoTourProgress.findUnique({
      where: { demoSessionId },
    });

    if (!progress) {
      return null;
    }

    const tour = getTourByKey(progress.tourId);
    if (!tour || progress.currentStep >= tour.steps.length) {
      return null;
    }

    return tour.steps[progress.currentStep];
  }

  /**
   * Get tour progress
   */
  async getProgress(demoSessionId: string): Promise<DemoTourProgress | null> {
    return this.prisma.demoTourProgress.findUnique({
      where: { demoSessionId },
    });
  }

  /**
   * Get tours for audience
   */
  getToursForAudience(audience: 'owner' | 'customer') {
    return getToursForAudience(audience);
  }

  /**
   * Complete tour
   */
  async completeTour(demoSessionId: string): Promise<DemoTourProgress> {
    return this.prisma.demoTourProgress.update({
      where: { demoSessionId },
      data: {
        status: TourStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Pause tour
   */
  async pauseTour(demoSessionId: string): Promise<DemoTourProgress> {
    return this.prisma.demoTourProgress.update({
      where: { demoSessionId },
      data: {
        status: TourStatus.PAUSED,
      },
    });
  }

  /**
   * Resume tour
   */
  async resumeTour(demoSessionId: string): Promise<DemoTourProgress> {
    return this.prisma.demoTourProgress.update({
      where: { demoSessionId },
      data: {
        status: TourStatus.ACTIVE,
      },
    });
  }
}
