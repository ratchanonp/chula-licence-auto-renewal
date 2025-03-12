import {ProgramLicenseID} from "../types/license";
import {LicenseRenewalFactory, SchedulerConfig} from "../utils/licenseSchedulerFactory";

/**
 * Schedules a cron job to borrow an Adobe license every Sunday at midnight.
 */
const config: SchedulerConfig = {
  programName: "Adobe",
  programLicenseId: ProgramLicenseID.AdobeCC,
  cronExpression: "0 0 * * 0",
};

const scheduler = LicenseRenewalFactory.createRenewalScheduler(config);

export const borrowAdobe = scheduler.createRenewalTask();
