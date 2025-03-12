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
 * Interface defining the contract for automated license renewal schedulers
 */
export interface LicenseRenewalScheduler {
  /**
   * Creates a scheduled function for automated license renewal
   * @returns {ReturnType<typeof onSchedule>} Firebase scheduled function
   */
  createRenewalTask(): ReturnType<typeof onSchedule>;
}

/**
 * Factory for creating license renewal schedulers
 */
export class LicenseRenewalFactory {
  /**
   * Creates a new license renewal scheduler instance
   * @param {SchedulerConfig} config Configuration for the scheduler
   * @returns {LicenseRenewalScheduler} A new license renewal scheduler instance
   */
  public static createRenewalScheduler(config: SchedulerConfig): LicenseRenewalScheduler {
    return new AutomaticLicenseRenewalScheduler(config);
  }
}

/**
 * Implementation of automatic license renewal scheduler
 */
export class AutomaticLicenseRenewalScheduler implements LicenseRenewalScheduler {
  private readonly programName: string;
  private readonly programLicenseId: ProgramLicenseID;
  private readonly cronExpression: string;

  /**
   * Creates an instance of AutomaticLicenseRenewalScheduler
   * @param {SchedulerConfig} config - Configuration for the scheduler
   */
  constructor(config: SchedulerConfig) {
    this.programName = config.programName;
    this.programLicenseId = config.programLicenseId;
    this.cronExpression = config.cronExpression;
  }

  /**
   * Creates a scheduled function for automated license renewal
   * @returns {ReturnType<typeof onSchedule>} Firebase scheduled function
   */
  public createRenewalTask() {
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
