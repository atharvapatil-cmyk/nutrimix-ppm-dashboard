import { google } from 'googleapis'
import { SPREADSHEET_ID } from './constants'

// Both LJ complaints and Live Sales Data live in the same spreadsheet
// Only ONE sheet needs to be shared with the service account

export function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set in environment')

  let credentials
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
}

async function readRange(range: string): Promise<string[][]> {
  const auth = getGoogleAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  })
  return (resp.data.values ?? []) as string[][]
}

/** Raw complaint rows from the Google Form response sheet */
export async function readLJSheet(): Promise<string[][]> {
  return readRange('LJ!A:Z')
}

/** Sales rows from the Live Sales Data sheet (synced from DRR) */
export async function readSalesSheet(): Promise<string[][]> {
  return readRange('Live Sales Data!A:E')
}
