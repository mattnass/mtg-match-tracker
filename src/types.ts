export interface TestResult {
  id?: string;
  playerName: string;
  testType: string;
  score: number;
  date: string;
  notes?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
  apiKey: string;
}