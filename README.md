# Testing Data App

A React + TypeScript web application for team members to submit testing data that gets saved to Google Sheets.

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet with headers in the first row:
   - Column A: Player Name
   - Column B: Test Type
   - Column C: Score
   - Column D: Date
   - Column E: Notes

2. Get your Google Sheets API key:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable the Google Sheets API
   - Create credentials (API key)
   - Restrict the API key to Google Sheets API

3. Make your sheet publicly viewable:
   - In your Google Sheet, click "Share"
   - Change access to "Anyone with the link can view"

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your values:
   ```
   VITE_GOOGLE_SHEETS_API_KEY=your_actual_api_key
   VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_from_url
   VITE_GOOGLE_SHEETS_RANGE=Sheet1!A:E
   ```

### 3. Update App Configuration

Edit `src/App.tsx` and replace the placeholder values in `GOOGLE_SHEETS_CONFIG` with your environment variables:

```typescript
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: import.meta.env.VITE_GOOGLE_SPREADSHEET_ID,
  range: import.meta.env.VITE_GOOGLE_SHEETS_RANGE,
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
};
```

## Development

Start the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Features

- [x] Form validation with Zod
- [x] TypeScript support
- [x] Real-time data submission to Google Sheets
- [x] View recent test results
- [x] Responsive design
- [x] Toast notifications
- [x] Loading states

## Test Types Available

- Sprint
- Endurance
- Strength
- Agility
- Skill

You can modify these in `src/components/TestResultForm.tsx`.

## Customization

- **Add more test types**: Edit the select options in `TestResultForm.tsx`
- **Change styling**: Modify the CSS classes in `src/index.css`
- **Add more fields**: Update the TypeScript interfaces in `src/types/index.ts` and form components
