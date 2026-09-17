# 📈 ThinkorSwim Institutional Trading Studies & Scanners
## Professional ThinkScript Stock Screeners & Alpha-Generating Technical Indicators

> **Author:** Ran Eliahu | AI Cloud Engineer & Technical Trader  
> **Platform:** TD Ameritrade / Schwab ThinkorSwim (TOS)  
> **Language:** ThinkScript  
> **Trading Style:** Institutional Momentum, Swing Trading, Minervini VCP, Relative Strength (RS Alpha), Day Trading ORB

---

This repository is an elite, production-ready collection of [ThinkorSwim scanners](https://github.com/ran-eliahu/ThinkOrSwim), custom watchlist column formulas, and visual chart studies designed to give traders a **systematic edge over regular retail market participants**.

## ⚡ The Edge: Why Regular Scanners Fail vs. Institutional Scanners

| What Regular Retail Traders Do (No Edge) | The Pro Trader Edge (High Win Rate & R:R) |
| :--- | :--- |
| **Lagging Indicator Crossovers** (Simple EMA 9/21 cross) | **Multi-Factor Confluence**: Trend + Volume Dry-Up (VDU) + Volatility Contraction + Momentum Ignition. |
| **Buying High Beta on Green Market Days** (Noise) | **True Relative Strength (RS Alpha)**: Isolating market leaders making new highs while SPY/QQQ pulls back. |
| **Catching Oversold Falling Knives** (Downtrend traps) | **Institutional Pocket Pivots & Absorption**: Volume exceeding prior 10-day down-volume off key moving averages. |
| **Midday Chop Chasing** | **Intraday ORB + VWAP Anchor**: Precision morning breakout execution with defined risk at VWAP. |
| **Stock Hacker Scan Errors** (`AggregationPeriod.WEEK` crash) | **Mathematical Timeframe Synthesis**: Zero-lag daily synthesis without TOS secondary aggregation errors. |

---

## 🚀 Repository Structure

```
ThinkOrSwim/
├── scanners/
│   ├── VCP_VolatilityContraction_Scanner.ts       # Minervini / Qullamaggie VCP & High Tight Flag
│   ├── RS_AlphaLeader_Scanner.ts                   # True Relative Strength (RS) vs SPY/QQQ
│   ├── PocketPivot_Absorption_Scanner.ts           # Institutional Pocket Pivot & Absorption
│   ├── Intraday_ORB_VWAP_Scanner.ts                # 5-min/15-min Opening Range Breakout + VWAP
│   ├── EliteFundamentals_Scanner.ts               # Institutional Quality & Fundamentals
│   ├── FallenAngels_Scanner.ts                    # Mean Reversion: Oversold Quality Stocks
│   ├── InstitutionalAccumulation_Scanner.ts       # Smart Money Detection & Money Flow
│   ├── TrendReversal_Bullish_Scanner.ts           # Inflection Point: Bearish to Bullish Reversal
│   ├── TTMSqueeze_Scanner.ts                      # Volatility Squeeze & Fire Detector
│   ├── VolumeProfile_Breakout_Scan.ts             # Value Area High (VAH) Escape Scanner
│   ├── VolumeProfile_Squeeze_Scan.ts              # Value Area Compression Scanner
│   ├── AboutToBreakOut_Scan.ts                    # Momentum Compression Shelf Scanner
│   ├── DipInUptrend_Scan.ts                       # Controlled Pullback & Reversal in Uptrend
│   ├── EpisodicPivot_EarningsGap_Scanner.ts       # Post-Earnings PEAD & Catalyst Gap & Go / Flag
│   ├── AnchoredVWAP_Pinch_Scanner.ts              # Dynamic YTD / High / Low AVWAP Pinch & Reclaim
│   ├── PowerTrend_Pullback_Scanner.ts             # 10/20 EMA Moving Average Power Trend Wave Surfer
│   ├── WyckoffSpring_FalseBreakdown_Scanner.ts    # Liquidity Stop Flush & Turtle Soup Reclaim
│   ├── InsideBar_NR7_Contraction_Scanner.ts       # Double Inside Bar & NR7 Volatility Contraction
│   ├── InstitutionalDistribution_Short_Scanner.ts # Stage 4 Shelf Breakdown & UTAD Short Scanner
│   └── Premarket_GapMomentum_Scanner.ts           # Premarket Catalyst, Gap % & RVOL Momentum
├── custom columns/
│   ├── Alpha_Confluence_Score.ts             # 0-100 Quantitative HUD Watchlist Column
│   ├── DistanceToPOC.ts                      # Distance to Point of Control %
│   ├── CustomColumn_Trend_Strength.ts        # Trend Direction + ADX Strength
│   ├── CustomColumn_Volume_Surge.ts          # Real-time Volume Multiplier
│   ├── CustomColumn_RSI_Momentum.ts          # RSI Momentum Tier
│   └── signal.ts                             # Multi-Factor State Indicator
├── chart_visuals/
│   ├── Multi_Timeframe_POC_Study.ts          # Multi-Timeframe Naked POC Magnets
│   └── OrderBlock_Study.ts                   # Institutional Supply/Demand Order Blocks
├── README.md                                 # Complete documentation
└── SETUP_GUIDE.md                            # Step-by-step TOS setup and import tutorial
```

---

## 🔍 Institutional Scanner Suite

### 1. Volatility Contraction Pattern (VCP) & High Tight Flag Scanner
**File:** `scanners/VCP_VolatilityContraction_Scanner.ts`  
**Methodology:** Mark Minervini (U.S. Investing Champion) & Kristjan Qullamaggie Stage 2 Setups  
**Timeframe:** Daily  

Identifies high-momentum stocks coiling in a tight consolidation shelf after an uptrend:
- **Minervini Trend Template:** Price > 50 SMA > 200 SMA, 200 SMA rising, within 25% of 52-week high.
- **Volatility Contraction:** `ATR(5) <= ATR(20) * 0.75` and 5-bar high-to-low range <= 6%.
- **Volume Dry-Up (VDU):** Volume dries up significantly below the 50-day average (supply exhaustion).
- **Two Modes:**
  - `Coil_Setup` (Default): Catches the setup before the breakout.
  - `Breakout_Today`: Alerts at the exact moment price crosses the 5-day pivot shelf on high volume.

---

### 2. Institutional Relative Strength (RS Alpha) Leader Scanner
**File:** `scanners/RS_AlphaLeader_Scanner.ts`  
**Methodology:** Comparative Alpha Divergence (Stock vs SPY/QQQ)  
**Timeframe:** Daily  

Finds true market leaders that institutional funds are accumulating regardless of broader market chop:
- **RS Ratio:** Computes the Stock / SPY ratio line in real time.
- **Alpha Spread:** Stock 20-day Rate of Change exceeds SPY by at least 5%.
- **RS New Highs:** RS line reaches 20-day highs while price holds above 20 EMA and 50 SMA.
- **Market Resilience Mode:** Flags stocks advancing on days when SPY is red.

---

### 3. Institutional Pocket Pivot & Volume Absorption Scanner
**File:** `scanners/PocketPivot_Absorption_Scanner.ts`  
**Methodology:** Gil Morales & Dr. Chris Kacher (Former William O'Neil Portfolio Managers)  
**Timeframe:** Daily  

Detects smart money buying within bases or off moving averages before standard breakout patterns:
- **Pocket Pivot Signature:** Today's up-volume is greater than the highest down-day volume of the past 10 trading sessions.
- **Structural Pivot:** Bouncing off or reclaiming the 10 EMA, 20 EMA, or 50 SMA.
- **No Overextension:** Close is within 5% of the supporting moving average.
- **Upper Range Close:** Closes in the upper 50% of the daily candle range.

---

### 4. Intraday Institutional ORB + VWAP Momentum Scanner
**File:** `scanners/Intraday_ORB_VWAP_Scanner.ts`  
**Methodology:** Morning Opening Range Breakout (ORB) with VWAP Confluence  
**Timeframe:** 5-minute or 15-minute  

Engineered for active day traders operating between 9:45 AM and 11:30 AM EST:
- **Opening Range Breakout:** Price crosses above the first 15-min or 30-min opening range high.
- **Institutional Anchor:** Price holds strictly above VWAP.
- **RVOL Surge:** Intraday bar volume >= 1.8x average bar volume.
- **Anti-Chase Filter:** Triggers only within 1.5% of the breakout high to keep risk tight.

---

### 5. Episodic Pivot (EP) & Catalyst Gap & Go / Flag Scanner
**File:** `scanners/EpisodicPivot_EarningsGap_Scanner.ts`  
**Methodology:** Kristjan Qullamaggie & Pradeep Bonde (Stockbee) Post-Earnings Announcement Drift (PEAD)  
**Timeframe:** Daily  

Finds institutional re-pricings on earnings or massive catalyst events:
- **Day 1 EP Ignition:** Gap >= 3.5%, RVOL >= 2.5x 50-day average, strong close in upper range.
- **Post-EP High Tight Flag:** Detects constructive 2–10 day consolidations holding the 10/20 EMA shelf with volume drying up before leg two.

---

### 6. Multi-Timeframe Anchored VWAP (AVWAP) Pinch & Retest Scanner
**File:** `scanners/AnchoredVWAP_Pinch_Scanner.ts`  
**Methodology:** Brian Shannon (AlphaTrends) Anchored VWAP  
**Timeframe:** Daily  

Identifies price pinching and compressing against key institutional execution anchors:
- **Dynamic Anchors:** Year-to-Date (YTD), 52-Week High, and 52-Week Low anchors.
- **AVWAP Pinch:** Detects price testing within 1.5% of the AVWAP line on light volume and bouncing with bullish candle structure.

---

### 7. Institutional Power Trend & 10/20 EMA Wave Pullback Scanner
**File:** `scanners/PowerTrend_Pullback_Scanner.ts`  
**Methodology:** IBD Power Trend & Qullamaggie Trend Surfing  
**Timeframe:** Daily  

Isolates pristine market leaders riding their fast exponential moving averages:
- **4-Tier MA Stack:** `10 EMA > 20 EMA > 50 SMA > 200 SMA` held for >= 10 consecutive bars.
- **Low-Risk Touch:** Low kisses the 10 EMA or 20 EMA shelf on low volume (VDU) with buyer defense.

---

### 8. Wyckoff Spring & Turtle Soup (False Breakdown Reclaim) Scanner
**File:** `scanners/WyckoffSpring_FalseBreakdown_Scanner.ts`  
**Methodology:** Richard Wyckoff & Linda Raschke  
**Timeframe:** Daily  

Finds high-probability stop hunts and liquidity flushes:
- Undercuts 20-day swing low or 50/200 SMA to trigger retail stops, then aggressively reclaims and closes in the upper 40% of the daily candle range.

---

### 9. Multi-Inside Bar & NR7 Volatility Contraction Scanner
**File:** `scanners/InsideBar_NR7_Contraction_Scanner.ts`  
**Methodology:** Toby Crabel Price Action & Volatility Expansion  
**Timeframe:** Daily  

Catches explosive volatility coils inside Stage 2 uptrends:
- **Double Inside Bar:** Two consecutive inside sessions (coiled energy).
- **NR7:** Daily range is the narrowest of the last 7 sessions with volume dry-up.

---

### 10. Institutional Distribution & Bearish Breakdown Scanner (Short Side)
**File:** `scanners/InstitutionalDistribution_Short_Scanner.ts`  
**Timeframe:** Daily  

Finds high-probability short setups and market hedge candidates:
- **Shelf Breakdown:** Breaches multi-week support under declining 20/50 MAs on heavy selling RVOL.
- **Bear Flag Breakdown:** Rollover from low-volume bounce into declining 20 EMA.
- **UTAD Trap:** Upthrust after distribution (failed breakout reversal).

---

### 11. Premarket Gap & Relative Volume Surge Scanner
**File:** `scanners/Premarket_GapMomentum_Scanner.ts`  
**Timeframe:** 1-Minute / 5-Minute (Extended Hours ON)  

Pre-market preparation tool (7:00 AM – 9:25 AM EST):
- Real-time premarket volume > 100k, gap >= 3%, holding above premarket VWAP.

---

### 12. Trend Reversal Scanner — Bearish to Bullish Inflection
**File:** `scanners/TrendReversal_Bullish_Scanner.ts`  
**Timeframe:** Daily  

Catches early structural inflection points from downtrend to Stage 2 recovery:
- Macro Trend Guard eliminating weekly secondary period scan errors.
- Confirmed base-building (spent >= 4 of last 10 days below 20 EMA, now holding above 20 EMA).
- Synchronized MACD histogram expansion and RSI recovery (45–72).
- Volume expansion >= 50-day average.

---

### 13. Elite Fundamentals & Quality Stock Screener
**File:** `scanners/EliteFundamentals_Scanner.ts`  
**Timeframe:** Daily / Weekly  

Filters for institutional-grade balance sheets and profitability:
- P/E between 5 and 35, Price/Book < 10.
- ROE >= 15%, Gross Margin >= 40%, Current Ratio >= 1.5.
- Long-term trend intact (Price > 200 SMA).

---

### 14. Fallen Angels — Mean Reversion Quality Finder
**File:** `scanners/FallenAngels_Scanner.ts`  
**Timeframe:** Daily  

Finds premium S&P 500 stocks pulled back 8–25% from 52-week highs with oversold RSI (25–40) curling back up while remaining above the 200-day moving average.

---

### 15. Institutional Dip Buy in Uptrend Scanner (Pro Edition)
**File:** `scanners/DipInUptrend_Scan.ts`  
**Timeframe:** Daily  

Eliminates falling knife traps by finding constructive dips in Stage 2 leaders:
- **Macro Uptrend:** 50 SMA > 200 SMA, 200 SMA rising.
- **Controlled Dip:** Pullback directly to the 20 EMA or 50 SMA support shelf without heavy distribution.
- **Buyer Defense:** Bottoming wick rejection ($\ge 35\%$ lower wick) or green closing candle.
- **RSI Reload:** RSI resets cleanly into the 40–58 reload zone.

---

### 16. Institutional Accumulation & Smart Money Flow Scanner
**File:** `scanners/InstitutionalAccumulation_Scanner.ts`  
**Timeframe:** Daily  

Detects stealth smart money buying before visible price explosions:
- **Money Flow / OBV Expansion:** On-Balance Volume and Money Flow Index (MFI) curling up while price consolidates.
- **Up-Day Dominance:** Up-day trading volume significantly outweighs down-day selling volume.

---

### 17. Volume Profile Breakout & Squeeze Scanners
- **`scanners/VolumeProfile_Breakout_Scan.ts`:** Scans for price escaping the Value Area High (VAH) into Low Volume Nodes (fast momentum runs).
- **`scanners/VolumeProfile_Squeeze_Scan.ts`:** Scans for stocks where Value Area High/Low distance is compressed (< 2% of price), signalling an imminent volume explosion.

---

## 📊 Custom Watchlist Column: 0–100 Alpha Confluence Score

**File:** `custom columns/Alpha_Confluence_Score.ts`  
**Use Case:** Real-time HUD scoring column in any ThinkorSwim Watchlist.

Quantifies 4 core pillars (25 points each = 100 total):
1. **Trend Structure (25 pts):** Moving average alignment (`Price > 200 SMA > 50 SMA`, `10 EMA > 20 EMA`).
2. **Momentum & Compression (25 pts):** Squeeze acceleration, RSI in bull zone (50–72), ATR compression.
3. **Volume & Institutional Flow (25 pts):** Volume > 50 SMA volume, RVOL surge, up-day closing dominance.
4. **Location & Proximity (25 pts):** Within 3% of 20-day high, within 15% of 52-week high, above 10 EMA.

| Score Tier | Visual Badge | Strategy / Action |
| :--- | :--- | :--- |
| **85 – 100** | `⚡ 95 ULTRA` (Bright Green) | Prime breakout candidate; maximum edge setup |
| **70 – 84** | `🔥 80 STRONG` (Dark Green) | Confirmed trend continuation play |
| **50 – 69** | `🟡 60 READY` (Yellow) | Base building; watch for trigger |
| **30 – 49** | `🟠 35 CHOP` (Orange) | Lacking volume/momentum; pass |
| **0 – 29** | `⛔ 15 AVOID` (Red) | Bearish / broken market structure |

---

## 🛠️ Step-by-Step Installation

See [SETUP_GUIDE.md](file:///Users/raneliahu/Downloads/repos/ThinkOrSwim/SETUP_GUIDE.md) for full instructions on setting up custom columns, Stock Hacker study filters, and recommended scanning routines.

---

## ⚠️ Disclaimer

These tools are for **educational and informational purposes only**. Nothing in this repository constitutes financial advice. Always practice strict risk management and position sizing.
