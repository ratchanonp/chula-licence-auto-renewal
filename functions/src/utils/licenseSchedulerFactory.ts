import * as logger from "firebase-functions/logger";
import {onSchedule} from "firebase-functions/scheduler";
import {LicenseService} from "../services/licenseService";
import {ProgramLicenseID, longestBorrowDuration} from "../types/license";
import {secrets} from "../config/secrets";

/**
 * Configuration interface for license scheduler
 */
export interface SchedulerConfig {
  programName: string;
  programLicenseId: ProgramLicenseID;
  cronExpression: string;
}

/**
 * Interface defining the contract for license schedulers
 */
export interface ILicenseScheduler {
  /**
   * Creates a scheduled function for license management
   * @returns {ReturnType<typeof onSchedule>} Firebase scheduled function
   */
  createScheduler(): ReturnType<typeof onSchedule>;
}

/**
 * Abstract factory for creating license schedulers
 */
export abstract class LicenseSchedulerFactory {
  /**
   * Abstract method to create a scheduler
   * @param {SchedulerConfig} config - Configuration for the scheduler
   * @returns {ILicenseScheduler} License scheduler instance
   */
  abstract createScheduler(config: SchedulerConfig): ILicenseScheduler;

  /**
   * Creates a new scheduler instance.
   * @param {SchedulerConfig} config Configuration for the scheduler
   * @returns {ILicenseScheduler} A new license scheduler instance
   */
  public static getScheduler(config: SchedulerConfig): ILicenseScheduler {
    return new DefaultLicenseScheduler(config);
  }
}

/**
 * Default implementation of license scheduler
 */
export class DefaultLicenseScheduler implements ILicenseScheduler {
  private readonly programName: string;
  private readonly programLicenseId: ProgramLicenseID;
  private readonly cronExpression: string;

  /**
   * Creates an instance of DefaultLicenseScheduler
   * @param {SchedulerConfig} config - Configuration for the scheduler
   */
  constructor(config: SchedulerConfig) {
    this.programName = config.programName;
    this.programLicenseId = config.programLicenseId;
    this.cronExpression = config.cronExpression;
  }

  /**
   * Creates a scheduled function for license management
   * @returns {ReturnType<typeof onSchedule>} Firebase scheduled function
   */
  public createScheduler() {
    return onSchedule(this.cronExpression, async () => {
      logger.info(`Starting ${this.programName} license renewal process...`);

      try {
        if (!secrets.azureUserID.value() || !secrets.studentEmail.value()) {
          throw new Error("Required credentials are not set");
        }

        const cookies = await LicenseService.login();
        const cookie = cookies.join("; ");

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
