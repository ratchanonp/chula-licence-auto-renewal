
import {defineSecret} from "firebase-functions/params";

export const secrets = {
  studentEmail: defineSecret("STUDENT_EMAIL"),
  studentPassword: defineSecret("STUDENT_PASSWORD"),
};

export const constants = {
  BASE_URL: "https://licenseportal.it.chula.ac.th",
  DEFAULT_DOMAIN: "student.chula.ac.th",
};
