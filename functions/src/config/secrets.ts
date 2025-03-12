// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineSecret } = require("firebase-functions/params");

export const secrets = {
  studentEmail: defineSecret("STUDENT_EMAIL"),
  studentPassword: defineSecret("STUDENT_PASSWORD"),
  azureUserID: defineSecret("AZURE_USER_ID"),
};

export const constants = {
  BASE_URL: "https://licenseportal.it.chula.ac.th",
  DEFAULT_DOMAIN: "student.chula.ac.th",
}; 