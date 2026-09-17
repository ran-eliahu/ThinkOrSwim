# ============================================================
# INSTITUTIONAL DISTRIBUTION & BEARISH BREAKDOWN SCANNER (SHORT SIDE)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Designed for short sellers, inverse ETF traders, and macro hedgers:
#   1. Stage 4 Downtrend & Distribution: Price trading below declining 50 SMA 
#      and 200 SMA (`Price < 20 EMA < 50 SMA`).
#   2. Support Shelf Breakdown: Price breaches multi-week support floor on heavy
#      institutional selling volume (`Volume >= 1.3x 50-day average`).
#   3. Bear Flag Breakdown: Tight, low-volume consolidation under the declining 20 EMA
#      followed by a breakdown candle.
#   4. Failed Breakout / UTAD (Upthrust After Distribution): Reversal from new highs
#      trapping aggressive retail longs.
#
# Modes:
#   - Shelf_Breakdown (Default): Multi-week support breakdown on heavy volume.
#   - Bear_Flag_Breakdown: Rollover after low-volume bounce into declining 20 EMA.
#   - UTAD_Trap: Intraday new high that closed near the daily lows on heavy volume.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF.
#   • Embedded Filters (Already inside script):
#       - Stage 4 moving average trend checks (`Price < 50 SMA`).
#       - Multi-week support floor detection (`Lowest(low[1], 15)`).
#       - High RVOL selling volume surge.
#       - Liquidity filters (Price >= $10, Avg Vol >= 500k to ensure borrowability).
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 1000 / Optionable Stocks"
#         (ensures easy-to-borrow shares or liquid put options).
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Script handles all bear
#         metrics, volume expansion, and breakdown levels.
# ============================================================

# ---- USER INPUTS ----
input shortMode = {default "Shelf_Breakdown", "Bear_Flag_Breakdown", "UTAD_Trap"};
input supportLookbackBars = 15;    # Lookback period for support floor
input rvolThreshold = 1.25;        # Minimum volume multiplier on breakdown day
input minPrice = 10.0;
input minAvgVolume = 500000;

# ---- 1. BASELINE LIQUIDITY & MOVING AVERAGES ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# Stage 4 Bearish alignment
def stage4Trend = close < sma50 and (ema20 <= sma50 or close < sma200);

# ---- 2. SUPPORT SHELF BREAKDOWN ----
def supportFloor = Lowest(low[1], supportLookbackBars);
def breaksSupport = close < supportFloor and (close[1] >= supportFloor * 0.99);
def heavySellingVolume = volume >= (avgVol50 * rvolThreshold);
def isShelfBreakdown = stage4Trend and breaksSupport and heavySellingVolume and (close < open);

# ---- 3. BEAR FLAG BREAKDOWN ----
# Price recently bounced into 20 EMA on light volume, now rolling over
def rolledOverFromEma20 = (high[1] >= ema20[1] * 0.98 and high[1] <= ema20[1] * 1.03) and (close < ema10) and (close < close[1]);
def isBearFlagBreakdown = stage4Trend and rolledOverFromEma20 and (close < open) and (volume >= avgVol50);

# ---- 4. UTAD (UPTHRUST AFTER DISTRIBUTION) / FAILED BREAKOUT TRAP ----
# Stock pushed to 20-day high today, but closed near the low with heavy volume
def high20 = Highest(high[1], 20);
def pushedAboveHigh = high > high20;
def failedAndDownticked = close < high20 and close < open;
def closedNearLow = (high - close) >= (high - low) * 0.60; # Closes in bottom 40% of bar
def isUTADTrap = pushedAboveHigh and failedAndDownticked and closedNearLow and heavySellingVolume;

# ---- 5. SCAN TRIGGER SELECTION ----
def selectedSignal = if shortMode == shortMode."Shelf_Breakdown" then isShelfBreakdown
                     else if shortMode == shortMode."Bear_Flag_Breakdown" then isBearFlagBreakdown
                     else isUTADTrap;

plot Distribution_Signal = selectedSignal and liquidityOK;

# ---- FORMATTING ----
Distribution_Signal.AssignValueColor(Color.RED);
Distribution_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
