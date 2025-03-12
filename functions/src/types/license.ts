/**
 * Program License ID from licenseportal.it.chula.ac.th borrow page.
 */
export enum ProgramLicenseID {
  Zoom = 2,
  AdobeCC = 5,
  Foxit = 7,
}

/**
 * The longest duration that each program can be borrowed in days.
 */
export const longestBorrowDuration: Record<ProgramLicenseID, number> = {
  [ProgramLicenseID.Zoom]: 120,
  [ProgramLicenseID.AdobeCC]: 7,
  [ProgramLicenseID.Foxit]: 90,
};

export interface BorrowLicenseParams {
  azureUserId: string;
  userPrincipalName: string;
  programLicenseId: ProgramLicenseID;
  borrowDate: Date;
  expiryDate: Date;
} 