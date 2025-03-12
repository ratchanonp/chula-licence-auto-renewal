# Chula License Auto Renewal - Firebase Functions

This directory contains the Firebase Cloud Functions implementation for automatically renewing software licenses provided by Chulalongkorn University. The functions are built with TypeScript and use Firebase Cloud Functions v2.

## Project Structure

```
functions/
├── src/
│   ├── config/        # Configuration files and environment secrets
│   ├── schedulers/    # Scheduler implementations for each software
│   ├── services/      # Service layer for API interaction
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and factories
│   └── index.ts       # Entry point that exports all cloud functions
├── lib/               # Compiled JavaScript output
├── node_modules/      # Dependencies
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Technical Overview

### Architecture

The project uses a well-structured architecture:

- **Factory Pattern**: `LicenseRenewalFactory` creates schedulers with standardized interfaces
- **Service Layer**: `LicenseService` handles the API interactions with Chula's license system
- **Schedulers**: Individual schedulers for each software type (Adobe, Zoom, Foxit)
- **Type Safety**: Strong TypeScript typing throughout the codebase

### Key Components

#### License Renewal Schedulers

Each software has its own scheduler (in `src/schedulers/`) that configures:
- The software name
- The program license ID (from the Chula system)
- The cron schedule for renewal

Example from `adobeScheduler.ts`:
```typescript
const config: SchedulerConfig = {
  programName: "Adobe",
  programLicenseId: ProgramLicenseID.AdobeCC,
  cronExpression: "0 0 * * 0", // Run every Sunday at midnight
};
```

#### License Renewal Factory

`LicenseRenewalFactory` in `src/utils/licenseSchedulerFactory.ts` creates standardized schedulers that:
1. Run on the configured cron schedule
2. Log in to the Chula system using stored credentials
3. Request license renewal for the specified software
4. Handle errors and logging

#### License Service

`LicenseService` in `src/services/licenseService.ts` handles:
- Authentication with Chula's system
- API interactions for borrowing licenses
- Error handling and validation
- Date formatting and request preparation

## Configuration

### Firebase Secrets

The application uses Firebase Secrets to securely store sensitive information:

- `STUDENT_EMAIL`: Your Chula student email (usually student_id@chula.ac.th)
- `STUDENT_PASSWORD`: Your CU-NET password

These secrets are set using the Firebase CLI:

```bash
firebase functions:secrets:set STUDENT_EMAIL
firebase functions:secrets:set STUDENT_PASSWORD
```

### Cron Schedules

Each software has its own cron schedule defined in its scheduler file. By default:

- Adobe CC: Renews every Sunday at midnight (`0 0 * * 0`)
- Zoom: Renews every Sunday at midnight (`0 0 * * 0`)
- Foxit PDF Reader: Renews every Sunday at midnight (`0 0 * * 0`)

You can customize these schedules by modifying the `cronExpression` in each scheduler file.

## Development

### Prerequisites

- Node.js 22 (as specified in package.json)
- Firebase CLI
- Firebase project with Blaze plan (required for scheduled functions)

### Setup for Development

1. Install dependencies:
   ```bash
   cd functions
   pnpm install   # or npm install
   ```

2. Build the TypeScript code:
   ```bash
   pnpm build     # or npm run build
   ```

3. Run in watch mode during development:
   ```bash
   pnpm build:watch  # or npm run build:watch
   ```

### Deployment

Deploy to Firebase:
```bash
pnpm deploy  # or npm run deploy
```

This will deploy all functions defined in the `index.ts` file.

## Adding New Software

To add support for a new software:

1. Add the new license ID in `src/types/license.ts`
2. Create a new scheduler in `src/schedulers/`
3. Export the new function in `index.ts`

## Troubleshooting

- Check Firebase Function logs in the Firebase Console
- Verify that your secrets are correctly set
- Ensure your Firebase project is on the Blaze plan
- Confirm that your Chula account credentials are valid

## License

This project is not affiliated with Chulalongkorn University. Use it at your own risk and ensure you comply with Chula's terms of service for software usage. 