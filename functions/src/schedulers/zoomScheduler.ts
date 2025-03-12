import { ProgramLicenseID } from "../types/license";
import { LicenseSchedulerFactory, SchedulerConfig } from "../utils/licenseSchedulerFactory";

/**
 * Schedules a cron job to borrow a Zoom license every 4 months on the 1st day at midnight.
 */
const config: SchedulerConfig = {
  programName: "Zoom",
  programLicenseId: ProgramLicenseID.Zoom,
  cronExpression: "0 0 1 */4 *"
};

const scheduler = LicenseSchedulerFactory.getScheduler(config);
export const borrowZoom = scheduler.createScheduler(); 