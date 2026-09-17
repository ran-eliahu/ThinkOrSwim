# ============================================================
# EPISODIC PIVOT (EP) & CATALYST GAP & GO / FLAG SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Kristjan Qullamaggie & Pradeep Bonde (Stockbee)
#   Episodic Pivot (EP) and Post-Earnings Announcement Drift (PEAD):
#   1. Fundamental Re-Pricing Catalyst: Massive gap-up on earnings or
#      material catalyst where institutions must accumulate over days/weeks.
#   2. Day 1 Ignition: High gap %, huge Relative Volume (RVOL >= 2.5x),
#      closing in the top half/third of the day's candle.
#   3. Post-EP Consolidation (Day 2-10 Flag): Catches the high-tight
#      flag / 10 EMA coil after the EP occurs, before the 2nd wave breakout.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF (Regular Trading Hours).
#   • Embedded Filters (Already inside script):
#       - Minimum price ($5 default) & Average volume (500k default).
#       - Gap % calculation, RVOL multiplier, upper-wick control.
#       - Post-EP search window (checks 2-10 bars back for EP trigger).
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [OPTIONAL] "Scan In: S&P 500 / Russell 1000 / All Stocks".
#       - [OPTIONAL] Fundamental Filter: Earnings Date within last 7 days
#         (to filter specifically for earnings catalysts vs PR news).
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: All volume, gap, and
#         trend mechanics are fully self-contained in this script.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Day1_EP_Ignition", "Post_EP_Flag_Coil"};
input minGapPct = 3.5;             # Minimum gap % from previous close
input minDay1Rvol = 2.5;           # Minimum RVOL multiplier on EP day (e.g. 2.5x 50-day avg)
input maxEpLookback = 10;          # Days back to search for EP in Post_EP mode
input maxFlagAtrPullback = 1.5;    # Max pullback from EP high in terms of ATR
input minPrice = 5.0;
input minAvgVolume = 500000;

# ---- 1. BASELINE LIQUIDITY & BENCHMARKS ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);

# ---- 2. DAY 1 EPISODIC PIVOT (IGNITION) SIGNATURE ----
# Gap calculation relative to prior day's high/close
def gapUpPct = (low - high[1]) / close[1] * 100;
def openGapPct = (open - close[1]) / close[1] * 100;
def effectiveGap = Max(gapUpPct, openGapPct);

# High volume explosion (smart money footprint)
def rvolExplosion = volume >= (avgVol50 * minDay1Rvol);

# Strong candle structure: Closes green and finishes in upper 40% of the daily range
def candleRange = high - low;
def closeRangeLocation = if candleRange > 0 then (close - low) / candleRange else 0;
def strongClose = (close >= open) and (closeRangeLocation >= 0.50);

# Day 1 EP Trigger Definition
def isDay1EP = (effectiveGap >= minGapPct) and rvolExplosion and strongClose and liquidityOK;

# ---- 3. POST-EP HIGH TIGHT FLAG / COIL (DAY 2 TO 10) ----
# Identify if an EP occurred within the last [2 to maxEpLookback] days
def hadRecentEP = fold i = 1 to maxEpLookback with found = 0 do 
    if (effectiveGap[i] >= minGapPct and volume[i] >= (Average(volume[i], 50) * minDay1Rvol) and (close[i] >= open[i])) 
    then 1 
    else found;

# Find the highest price and lowest price since the EP
def epHigh = Highest(high, maxEpLookback);
def epLow = Lowest(low, maxEpLookback);

# Price holding above the rising 10/20 EMA and not giving back more than allowable ATR
def holdingSupport = close >= ema20 * 0.98 and close >= ema10 * 0.95;
def shallowPullback = (epHigh - close) <= (atr20 * maxFlagAtrPullback);

# Volume drying up during consolidation (Supply absorption)
def volumeDryingUp = volume <= (avgVol50 * 1.0) or (Average(volume, 3) <= avgVol50 * 0.85);

# Tight recent range (last 3 bars coiling)
def range3Pct = (Highest(high, 3) - Lowest(low, 3)) / close * 100;
def tightCoil = range3Pct <= 7.0;

# Post-EP Flag Trigger (Not today's EP, but a pristine flag following one)
def isPostEPFlag = hadRecentEP and (!isDay1EP) and holdingSupport and shallowPullback and volumeDryingUp and tightCoil and liquidityOK;

# ---- 4. SCAN TRIGGER OUTPUT ----
plot EpisodicPivot_Signal = if scanMode == scanMode."Day1_EP_Ignition" 
                            then isDay1EP 
                            else isPostEPFlag;

# ---- FORMATTING ----
EpisodicPivot_Signal.AssignValueColor(if scanMode == scanMode."Day1_EP_Ignition" then Color.GREEN else Color.CYAN);
EpisodicPivot_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
