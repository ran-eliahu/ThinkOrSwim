# ThinkorSwim Setup & Installation Guide

## 1. Importing Scanners into Stock Hacker

1. Open ThinkorSwim desktop app → click the **Scan** tab at the top.
2. Select **Stock Hacker**.
3. Under the **Scan In** dropdown, select your preferred universe:
   - Swing Trading / VCP / RS Alpha: **S&P 500** or **Russell 1000**
   - Intraday ORB / Volume Surges: **All Stocks** or **S&P 500**
4. Click **Add Study Filter** (on the right side).
5. Click on the study filter dropdown → click **Custom...**
6. In the modal that opens, click the **thinkScript Editor** tab.
7. Paste the entire code from any scanner file (e.g., [VCP_VolatilityContraction_Scanner.ts](file:///Users/raneliahu/Downloads/repos/ThinkOrSwim/scanners/VCP_VolatilityContraction_Scanner.ts)).
8. Set the timeframe aggregation (e.g., `D` for Daily scanners, `5m` or `15m` for Intraday ORB).
9. Click **OK** → Click **Scan**.
10. Click the **Show Action Menu** icon (three horizontal lines / disk icon at top right) and select **Save Scan Query...** to save it.

---

## 2. Setting Up Custom Watchlist Columns (e.g., 0–100 Alpha Score)

To display real-time HUD badges and scores in your Watchlists or Scan results:

1. Open any **Watchlist** or the **Scan Results** table in ThinkorSwim.
2. Click the **Gear icon (Customize)** at the top right of the table header.
3. In the search box on the left, type `Custom` (e.g., `Custom1`, `Custom2`).
4. Click on `Custom1` → Click the **Scroll / Script icon** next to it.
5. In the script editor window:
   - Rename the column tab at the top to `Alpha Score` (or matching study name).
   - Set the aggregation period (e.g., `D` for Daily or `5m` for Intraday).
   - **Delete any default code** and paste the code from [Alpha_Confluence_Score.ts](file:///Users/raneliahu/Downloads/repos/ThinkOrSwim/custom%20columns/Alpha_Confluence_Score.ts).
6. Click **OK** → Click **Add Items** to move it to the right column.
7. Click **OK** to apply.
8. Click on the column header in your watchlist to **sort descending** (stocks with 85–100 scores appear at the top).

---

## 3. Recommended Institutional Daily Routine

| Time (EST) | Action | Recommended Scanner / Column |
| :--- | :--- | :--- |
| **8:30 – 9:15 AM** | Pre-market prep & Watchlist ranking | Sort watchlist by `Alpha_Confluence_Score.ts`; run `VCP_VolatilityContraction_Scanner.ts` (Coil_Setup mode). |
| **9:45 – 11:00 AM** | Morning momentum execution | Run `Intraday_ORB_VWAP_Scanner.ts` (15m aggregation) on volume leaders. |
| **1:00 – 3:30 PM** | Midday leader tracking | Run `RS_AlphaLeader_Scanner.ts` to identify stocks holding green while SPY pulls back. |
| **3:45 – 4:30 PM** | Swing trade discovery & pocket pivots | Run `PocketPivot_Absorption_Scanner.ts` and `TrendReversal_Bullish_Scanner.ts` for end-of-day positioning. |

---

## 4. Troubleshooting & Best Practices

- **Scan Returns 0 Results:** Relax the minimum volume (`minAvgVolume`) or price (`minPrice`) input inside the scanner parameters.
- **"Secondary Aggregation Not Supported" Errors:** None of these next-level scanner files use secondary aggregations in Stock Hacker; all multi-timeframe calculations are mathematically synthesized on the native chart period.
- **Intraday ORB Not Triggering:** Ensure the chart aggregation in Stock Hacker is set to `5m` or `15m` and that the scan is run **after** 9:45 AM EST (when the opening range has been established).
