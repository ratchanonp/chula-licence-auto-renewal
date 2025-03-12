import {ProgramLicenseID} from "../types/license";
import {LicenseRenewalFactory, SchedulerConfig} from "../utils/licenseSchedulerFactory";

/**
 * Schedules a cron job to borrow a Foxit license every 3 months on the 1st day at midnight.
 */
const config: SchedulerConfig = {
  programName: "Foxit",
  programLicenseId: ProgramLicenseID.Foxit,
  cronExpression: "0 0 1 */3 *",
};

const scheduler = LicenseRenewalFactory.createRenewalScheduler(config);

export const borrowFoxit = scheduler.createRenewalTask();
