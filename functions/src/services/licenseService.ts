import * as logger from "firebase-functions/logger";
import fetch, {Headers, RequestInit, Response} from "node-fetch";
import {secrets, constants} from "../config/secrets";
import {BorrowLicenseParams, ProgramLicenseID, longestBorrowDuration} from "../types/license";

/**
 * Custom error class for license-related errors
 * @class LicenseError
 * @extends {Error}
 */
class LicenseError extends Error {
  /**
   * Creates an instance of LicenseError
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "LicenseError";
  }
}

/**
 * HTTP Status codes used in the application
 */
const HTTP_STATUS = {
  REDIRECT: 302,
} as const;

/**
 * Service class for handling license-related operations
 */
export class LicenseService {
  /**
   * Base URL for the license service API
   * @private
   */
  private static readonly BASE_URL = "https://license.it.chula.ac.th";

  /**
   * Validates the login credentials are set
   * @throws {LicenseError} If credentials are not set
   */
  private static validateCredentials(): void {
    if (!secrets.studentEmail.value()) {
      throw new LicenseError("Student email is not set", "MISSING_EMAIL");
    }
    if (!secrets.studentPassword.value()) {
      throw new LicenseError("Student password is not set", "MISSING_PASSWORD");
    }
  }

  /**
   * Creates common headers for requests
   * @param {string[]} [cookie] - Optional cookie array to include in headers
   * @returns {Headers} Headers object with common settings
   */
  private static createHeaders(cookie?: string[]): Headers {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    if (cookie) {
      headers.append("Cookie", cookie.join("; "));
    }
    return headers;
  }

  /**
   * Validates the HTTP response
   * @param {Response} response - Response to validate
   * @param {string} operation - Name of the operation for error context
   * @throws {LicenseError} If response status is not as expected
   */
  private static validateResponse(response: Response, operation: string): void {
    if (response.status !== HTTP_STATUS.REDIRECT) {
      throw new LicenseError(
        `${operation} failed with status: ${response.status}`,
        "INVALID_RESPONSE"
      );
    }
  }

  /**
   * Validates the cookies from response
   * @param {string[] | undefined} cookies - Cookies to validate
   * @returns {string[]} Validated cookies array
   * @throws {LicenseError} If cookies are missing or invalid
   */
  private static validateCookies(cookies: string[] | undefined): string[] {
    if (!cookies || cookies.length === 0) {
      throw new LicenseError("No cookies received from server", "MISSING_COOKIES");
    }
    return cookies;
  }

  /**
   * Validates borrow parameters
   * @param {BorrowLicenseParams} params - Parameters to validate
   * @throws {LicenseError} If parameters are invalid
   */
  private static validateBorrowParams(params: BorrowLicenseParams): void {
    if (!secrets.azureUserID.value()) {
      throw new LicenseError("Azure user ID is not set", "MISSING_AZURE_ID");
    }

    const maxDuration = longestBorrowDuration[params.programLicenseId];
    const durationInDays = Math.ceil(
      (params.expiryDate.getTime() - params.borrowDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (durationInDays > maxDuration) {
      throw new LicenseError(
        `Borrow duration exceeds maximum allowed (${maxDuration} days)`,
        "INVALID_DURATION"
      );
    }

    if (params.borrowDate > params.expiryDate) {
      throw new LicenseError(
        "Borrow date must be before expiry date",
        "INVALID_DATES"
      );
    }
  }

  /**
   * Formats a date in the required format (DD/MM/YYYY)
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  private static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Performs login to the license service
   * @returns {Promise<string>} Cookie string for authenticated session
   */
  public static async login(): Promise<string[]> {
    try {
      this.validateCredentials();

      const encodedPayload = new URLSearchParams({
        UserName: secrets.studentEmail.value(),
        Password: secrets.studentPassword.value(),
      });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: this.createHeaders(),
        body: encodedPayload.toString(),
        redirect: "manual",
      };

      logger.info("Logging in:", secrets.studentEmail.value());
      logger.debug("Login payload:", encodedPayload.toString());

      const response = await fetch(constants.BASE_URL, requestOptions);
      this.validateResponse(response, "Login");

      const cookies = this.validateCookies(response.headers.raw()["set-cookie"]);
      logger.debug("Received cookies:", cookies.join(", "));

      return cookies;
    } catch (error) {
      if (error instanceof LicenseError) {
        logger.error(`Login failed: ${error.message} (${error.code})`);
        throw error;
      }
      logger.error("Unexpected error during login:", error);
      throw new LicenseError("Login failed unexpectedly", "UNKNOWN_ERROR");
    }
  }

  /**
   * Handles API response and extracts operation result
   * @param {Response} response - Fetch API response
   * @param {string} operation - Name of the operation being performed
   * @returns {Promise<void>}
   * @private
   */
  private static async handleResponse(response: Response, operation: string): Promise<void> {
    if (response.status !== HTTP_STATUS.REDIRECT) {
      throw new LicenseError(
        `${operation} failed with status: ${response.status}`,
        "INVALID_RESPONSE"
      );
    }
  }

  /**
   * Extracts cookies from response headers
   * @param {Headers} cookies - Response headers containing cookies
   * @returns {string[]} Array of cookie strings
   * @private
   */
  private static extractCookies(cookies: Headers): string[] {
    const setCookieHeader = cookies.get("set-cookie");
    if (!setCookieHeader) {
      throw new Error("No cookies found in response");
    }
    return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  }

  /**
   * Borrows a license for a program
   * @param {string} cookie - Authentication cookie
   * @param {Object} params - License borrowing parameters
   * @param {string} params.azureUserId - Azure user ID
   * @param {string} params.userPrincipalName - User's email
   * @param {ProgramLicenseID} params.programLicenseId - ID of the program license
   * @param {Date} params.borrowDate - Date when the license is borrowed
   * @param {Date} params.expiryDate - Date when the license expires
   * @returns {Promise<void>}
   */
  public static async borrowLicense(
    cookie: string,
    params: {
      azureUserId: string;
      userPrincipalName: string;
      programLicenseId: ProgramLicenseID;
      borrowDate: Date;
      expiryDate: Date;
    }
  ): Promise<void> {
    try {
      this.validateBorrowParams(params);

      const encodedPayload = new URLSearchParams({
        AzureUserId: secrets.azureUserID.value(),
        UserPrincipalName: params.userPrincipalName,
        BorrowStatus: "Borrowing",
        ProgramLicenseID: params.programLicenseId.toString(),
        BorrowDateStr: this.formatDate(params.borrowDate),
        ExpiryDateStr: this.formatDate(params.expiryDate),
        Domain: constants.DEFAULT_DOMAIN,
      });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: this.createHeaders([cookie]),
        body: encodedPayload.toString(),
        redirect: "manual",
      };

      logger.info("Borrowing license for program:", ProgramLicenseID[params.programLicenseId]);
      logger.debug("Borrow payload:", encodedPayload.toString());

      const response = await fetch(`${constants.BASE_URL}/Home/Borrow`, requestOptions);
      this.validateResponse(response, "Borrow");

      logger.info("Successfully borrowed license");
    } catch (error) {
      if (error instanceof LicenseError) {
        logger.error(`License borrow failed: ${error.message} (${error.code})`);
        throw error;
      }
      logger.error("Unexpected error during license borrow:", error);
      throw new LicenseError("License borrow failed unexpectedly", "UNKNOWN_ERROR");
    }
  }
}
