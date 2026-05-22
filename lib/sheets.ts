import { google } from 'googleapis'
import { LJ_SPREADSHEET_ID, DRR_SPREADSHEET_ID } from './constants'

export function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set in environment')
  }

  let credentials
  try {
    credentials = JSON.parse(raw)
  } catch (e) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
}

export async function readLJSheet(): Promise<string[][]> {
  const auth = getGoogleAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: LJ_SPREADSHEET_ID,
    range: 'LJ!A:Z'
  })

  return (resp.data.values ?? []) as string[][]
}

export async function readDRRSales(): Promise<string[][]> {
  const auth = getGoogleAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: DRR_SPREADSHEET_ID,
    range: 'DRR!A:E'
  })

  return (resp.data.values ?? []) as string[][]
}
