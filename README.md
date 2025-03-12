# Chula Software Renewal Automation

This project helps Chula students automate the renewal process for borrowed software like Adobe CC, Zoom, and Foxit PDF Reader. It uses Firebase Cloud Functions (v2) with TypeScript to schedule automatic renewals, preventing interruptions and the frustration of expired licenses.

## Problem

Chulalongkorn University provides various software benefits for students, including Adobe CC, Zoom, and Foxit PDF Reader. These licenses have expiration dates and require manual renewal. Often, students need to use the software urgently only to find out the license has expired. Remembering to renew these licenses can be a hassle.

## Solution

This project leverages Firebase Cloud Functions (v2) with TypeScript to schedule a function that automatically re-borrows the software before it expires. This eliminates the need for manual renewal and ensures uninterrupted access to these essential tools.

## Features

* **Automated Renewal:** Scheduled Firebase Cloud Functions automatically renew specified software licenses.
* **Support for Multiple Software:** Currently supports Adobe CC, Zoom, and Foxit PDF Reader. More software can be added with minor modifications.
* **Type Safety:** Built with TypeScript for better code reliability and developer experience.
* **Easy Setup:** Clear instructions and scripts are provided to simplify the setup process.
* **Open Source:** Contribute to the project and improve it for everyone!

## Prerequisites

* **Chulalongkorn University Account:** You must have a valid Chula account to access and borrow the software.
* **Firebase Account:** You will need a Firebase project to deploy the Cloud Function.
* **Node.js:** Version 22 (as specified in the functions' package.json)
* **pnpm:** For package management (recommended) or npm

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/ratchanonp/chula-licence-auto-renewal.git
   cd chula-licence-auto-renewal
   ```

2. **Install Dependencies:**

   Using pnpm (recommended):
   ```bash
   pnpm install
   cd functions
   pnpm install
   ```

   Or using npm:
   ```bash
   npm install
   cd functions
   npm install
   ```

3. **Configure Firebase:**
   * Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/). Firebase project must use the Blaze plan!
   * Install Firebase CLI if you haven't:
     ```bash
     npm install -g firebase-tools
     ```
   * Login to Firebase:
     ```bash
     firebase login
     ```
   * Replace `<firebase-project-id>` in `.firebaserc` file with your project id

4. **Set up Firebase Secrets:**
   * Instead of using a local .env file, this project uses Firebase Secrets for secure configuration
   * Set up your secrets using the Firebase CLI:
     ```bash
     firebase functions:secrets:set STUDENT_EMAIL
     # Enter your student email when prompted (typically <your_student_id>@chula.ac.th)
     
     firebase functions:secrets:set STUDENT_PASSWORD
     # Enter your CU-NET password when prompted
     ```

   **Note:** Firebase Secrets are securely stored by Firebase and automatically made available to your Cloud Functions.

5. **Build and Deploy:**

   ```bash
   # In the functions directory
   npm run build   # Build the TypeScript code
   npm run deploy  # Deploy to Firebase
   ```

   You can also use `npm run build:watch` during development to automatically rebuild on changes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions, bug fixes, or new features to add.

## Disclaimer

This project is not affiliated with Chulalongkorn University. Use it at your own risk. Ensure you comply with Chula's terms of service for software usage.
