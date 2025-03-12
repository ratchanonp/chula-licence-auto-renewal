import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/scheduler";
import { LicenseService } from "../services/licenseService";
import { ProgramLicenseID, longestBorrowDuration } from "../types/license";
import { secrets } from "../config/secrets";

export interface SchedulerConfig {
  programName: string;
  programLicenseId: ProgramLicenseID;
  cronExpression: string;
}

// Abstract Product
export interface ILicenseScheduler {
  createScheduler(): ReturnType<typeof onSchedule>;
}

// Abstract Factory
export abstract class LicenseSchedulerFactory {
  abstract createScheduler(config: SchedulerConfig): ILicenseScheduler;

  // Factory method to get the appropriate scheduler instance
  static getScheduler(config: SchedulerConfig): ILicenseScheduler {
    return new DefaultLicenseScheduler(config);
  }
}

// Concrete Product
export class DefaultLicenseScheduler implements ILicenseScheduler {
  private readonly programName: string;
  private readonly programLicenseId: ProgramLicenseID;
  private readonly cronExpression: string;

  constructor(config: SchedulerConfig) {
    this.programName = config.programName;
    this.programLicenseId = config.programLicenseId;
    this.cronExpression = config.cronExpression;
  }

  public createScheduler() {
    return onSchedule(this.cronExpression, async () => {
      logger.info(`Starting ${this.programName} license renewal process...`);

      try {
        if (!secrets.azureUserID.value() || !secrets.studentEmail.value()) {
          throw new Error("Required credentials are not set");
        }

        const cookie = await LicenseService.login();

        const borrowDate = new Date();
        const expiryDate = new Date(borrowDate);
        expiryDate.setDate(expiryDate.getDate() + longestBorrowDuration[this.programLicenseId]);

        await LicenseService.borrowLicense(cookie, {
          azureUserId: secrets.azureUserID.value(),
          userPrincipalName: secrets.studentEmail.value(),
          programLicenseId: this.programLicenseId,
          borrowDate,
          expiryDate,
        });

        logger.info(`Successfully renewed ${this.programName} license until ${expiryDate.toLocaleDateString()}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        logger.error(`${this.programName} license renewal failed: ${errorMessage}`);
        throw error; // Re-throw to mark the function execution as failed
      }
    });
  }
} 