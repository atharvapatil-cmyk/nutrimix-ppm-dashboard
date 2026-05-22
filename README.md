# Nutrimix PPM Dashboard v2

A complete Next.js 14 (App Router, TypeScript, Tailwind) dashboard application replacing the legacy App Script + Google Sheets pipeline.

## Architecture

- **Data Sources**: Reads directly from 2 Google Sheets (no intermediate processing sheets)
- **Processing**: All complaint classification, PPM calculation, and aggregation happens inside the Next.js app
- **Caching**: 15-minute in-memory cache with manual refresh capability
- **Cron**: Daily 2 AM refresh via Vercel crons (protected by CRON_SECRET header)

## Data Sources

1. **LJ Sheet (Complaints)**: `1D2cR7PylAvoXB-wex4h9CgvPzt-s7GAVCho95H2hV5A` → range `LJ!A:Z`
2. **DRR Sheet (Sales)**: `1sNRNAH2Wv22qnAwoaP8CVM9p21TDw382jGcqABjz3z8` → range `DRR!A:E`

## Business Rules

### Complaint Hygiene
- **INVALID (excluded)**: Missing BOTH image link (drive.google.com, docs.google.com) AND valid batch number (matches `/^[A-Za-z]+\d{4,}/`)
- **DUPLICATE (excluded)**: Same order ID appeared in an earlier valid row
- **VALID**: Passes both checks

### Filters
- **Nutrimix filter**: product name contains 'nutrimix' (case-insensitive)
- **Sales filter**: channel in {webapp, web app, web_app} AND product contains 'nutrimix'

### PPM Calculation
- **Formula**: `complaints / sales × 1,000,000`
- **EXCLUDE_FROM_PPM**: Wrong/Missing Product, Technical Issue (out of all views)
- **Delivery Issue**: Out of "Excl Del" view, in "Incl Del" view
- **CRITICAL**: Infestation, Health Issue, Foreign Object

## Project Structure

```
/tmp/nutrimix-v2/
├── lib/
│   ├── constants.ts       # Business rules, issue keywords, issue types
│   ├── types.ts           # TypeScript interfaces
│   ├── classifier.ts      # Complaint classification logic
│   ├── sheets.ts          # Google Sheets API integration
│   ├── ppm.ts             # PPM calculations & period helpers
│   └── engine.ts          # Core computation: reads sheets, aggregates data
├── app/
│   ├── api/
│   │   ├── data/route.ts  # GET /api/data - returns cached/fresh dashboard data
│   │   └── cron/route.ts  # POST/GET /api/cron - cron job endpoint
│   ├── globals.css        # Tailwind styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Server component - renders Dashboard
├── components/
│   ├── Dashboard.tsx      # Main dashboard with tabs and controls
│   ├── KPICards.tsx       # 4 KPI cards (sales, complaints, PPM, WoW change)
│   ├── PPMTable.tsx       # Scrollable PPM table with color coding
│   └── TrendChart.tsx     # Recharts LineChart showing PPM trends
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── vercel.json
└── .env.example
```

## Setup

1. **Install dependencies**:
   ```bash
   cd /tmp/nutrimix-v2
   npm install --legacy-peer-deps
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env.local` and add your Google Service Account JSON:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and paste your full service account credentials JSON into `GOOGLE_SERVICE_ACCOUNT_JSON`, plus set a `CRON_SECRET`.

3. **Verify TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

4. **Run locally**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Dashboard Tabs

1. **Packaging Type PPM**: PPM by packaging (350g Jar, 700g Pouch, etc.) with toggle for Excl/Incl Delivery
2. **Issue Type PPM**: PPM by issue type (Infestation, Health Issue, etc.)
3. **Product Category**: PPM by product + flavour combination
4. **Critical Issues**: Critical issue counts (Infestation, Health Issue, Foreign Object) by product category
5. **Infestation by Packaging**: Infestation-only complaints by packaging type
6. **Pkg Issue Details**: Primary Packaging Issues by packaging type

Each tab shows:
- Toggle: Weekly / Monthly period selection
- Toggle: Exclude Delivery / Include Delivery (issue type tab has no toggle)
- Trend chart (LineChart showing last 12 periods)
- PPM table with color coding:
  - Green: PPM < 500
  - Amber: PPM 500–2000
  - Red: PPM > 2000

## KPI Cards

Top-of-dashboard metrics for the last completed week:
- **Total Sales**: Units sold via webapp/web app
- **Complaints (Excl Del)**: Count excluding Delivery Issue, Wrong/Missing Product, Technical Issue
- **PPM (Excl Del)**: Calculated as above
- **WoW Change**: Weekly-on-weekly PPM delta and percentage change

## Stats Bar

Below KPI cards:
- Total Nutrimix complaints (all rows read)
- Valid (green): Passed hygiene checks
- Invalid (red): Missing both image + batch number
- Duplicates (yellow): Duplicate order IDs

## API Endpoints

### `GET /api/data`
Returns cached dashboard data. Pass `?refresh=1` to force a fresh computation and cache update.

### `POST/GET /api/cron`
Protected by `x-cron-secret` header. Triggers a fresh data computation and updates cache. Called daily at 2 AM via Vercel crons.

## Deployment

### Vercel
1. Connect the repository to Vercel
2. Set environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (paste the full JSON)
   - `CRON_SECRET` (any secure random string)
3. Deploy automatically on git push
4. Cron job runs daily at 2 AM UTC

### Other Platforms
- Ensure `GOOGLE_SERVICE_ACCOUNT_JSON` and `CRON_SECRET` are set
- Call `/api/cron` periodically (via external cron service) to refresh the cache
- The app will serve cached data with 15-minute TTL

## Troubleshooting

### "GOOGLE_SERVICE_ACCOUNT_JSON not set"
- Check `.env.local` exists and has the full service account JSON (not just a string placeholder)
- Restart the dev server: `npm run dev`

### TypeScript errors
- Run `npx tsc --noEmit` to see exact errors
- Ensure all types match the interfaces in `lib/types.ts`

### No data showing
- Verify the Google Sheets are accessible by the service account
- Check the sheet ranges (`LJ!A:Z` for complaints, `DRR!A:E` for sales)
- Look at the browser console and server logs for errors

## Feature Flags & Future Enhancements

- Could add CSV export
- Could add date range picker (currently shows last 12 periods)
- Could add filtering by product or packaging at dashboard level
- Could add drill-down into individual complaints
- Could add SLA tracking

## Notes

- All processing happens server-side (in `lib/engine.ts` → `computeDashboardData()`)
- No intermediate Google Sheets required—reads directly from source sheets
- Complaint classification is keyword-based with special rules (e.g., near expiry + redelivery = Delivery Issue)
- Product info extraction (product, packaging, flavour) is heuristic-based; can be improved with better regex patterns
