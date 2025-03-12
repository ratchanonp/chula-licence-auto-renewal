import { ProgramLicenseID } from "../types/license";
import { LicenseSchedulerFactory, SchedulerConfig } from "../utils/licenseSchedulerFactory";

/**
 * Schedules a cron job to borrow an Adobe license every Sunday at midnight.
 */
const config: SchedulerConfig = {
  programName: "Adobe",
  programLicenseId: ProgramLicenseID.AdobeCC,
  cronExpression: "0 0 * * 0"
};

const scheduler = LicenseSchedulerFactory.getScheduler(config);

export const borrowAdobe = scheduler.createScheduler(); 