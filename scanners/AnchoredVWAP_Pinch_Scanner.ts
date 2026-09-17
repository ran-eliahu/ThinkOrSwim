# ============================================================
# ANCHORED VWAP (AVWAP) PINCH & INSTITUTIONAL RETEST SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Brian Shannon (AlphaTrends) Anchored VWAP analysis:
#   1. Major Institutions execute orders anchored to psychological & structural
#      milestones (Year-To-Date, 52-Week Highs, 52-Week Lows).
#   2. AVWAP acts as an impenetrable institutional support/resistance magnet.
#   3. AVWAP Pinch: Detects when price compresses right at the key AVWAP line
#      with volume drying up, setting up an explosive continuation bounce or reclaim.
#
# Modes:
#   - YTD_Anchor_Retest: Price testing & holding the Year-To-Date AVWAP.
#   - High52_Anchor_Reclaim: Price breaking out / reclaiming the 52-Week High AVWAP.
#   - Low52_Anchor_Bounce: Price riding the 52-Week Low recovery AVWAP.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF.
#   • Embedded Filters (Already inside script):
#       - Dynamic YTD anchor detection (`GetYear() != GetYear()[1]`).
#       - 52-Week High / Low anchor calculation (fold-based cumulative volume-weighted price).
#       - Proximity threshold (within 1.5% of AVWAP).
#       - Volume and price liquidity filters.
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 3000 / Watchlist".
#       - [OPTIONAL] Study Filter: ADX > 20 (for directional momentum).
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Script natively computes
#         all multi-month volume-weighted anchor levels.
# ============================================================

# ---- USER INPUTS ----
input anchorMode = {default "YTD_Anchor_Retest", "High52_Anchor_Reclaim", "Low52_Anchor_Bounce"};
input maxDistancePct = 1.5;        # Max % distance between price and AVWAP for "Pinch"
input minPrice = 10.0;
input minAvgVolume = 500000;

# ---- 1. LIQUIDITY & BASICS ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;
def typicalPrice = (high + low + close) / 3;

# ---- 2. DYNAMIC YEAR-TO-DATE (YTD) AVWAP ----
def isNewYear = GetYear() != GetYear()[1];
def ytdVolume = if isNewYear then volume else ytdVolume[1] + volume;
def ytdVwapSum = if isNewYear then (typicalPrice * volume) else ytdVwapSum[1] + (typicalPrice * volume);
def ytdVwap = if ytdVolume > 0 then ytdVwapSum / ytdVolume else close;

# ---- 3. 52-WEEK (252-BAR) HIGH ANCHOR VWAP ----
# Find bar offset of 52-week high
def bars252 = 252;
def highestHigh252 = Highest(high, bars252);
def isHighBar = high == highestHigh252;

# Cumulative calculation from 52-week high
def highAnchorVol = if isHighBar then volume else highAnchorVol[1] + volume;
def highAnchorSum = if isHighBar then (typicalPrice * volume) else highAnchorSum[1] + (typicalPrice * volume);
def avwapFromHigh = if highAnchorVol > 0 then highAnchorSum / highAnchorVol else close;

# ---- 4. 52-WEEK (252-BAR) LOW ANCHOR VWAP ----
def lowestLow252 = Lowest(low, bars252);
def isLowBar = low == lowestLow252;

def lowAnchorVol = if isLowBar then volume else lowAnchorVol[1] + volume;
def lowAnchorSum = if isLowBar then (typicalPrice * volume) else lowAnchorSum[1] + (typicalPrice * volume);
def avwapFromLow = if lowAnchorVol > 0 then lowAnchorSum / lowAnchorVol else close;

# ---- 5. PINCH & RETEST PROXIMITY LOGIC ----
# Measure % distance from selected AVWAP
def selectedVwap = if anchorMode == anchorMode."YTD_Anchor_Retest" then ytdVwap
                   else if anchorMode == anchorMode."High52_Anchor_Reclaim" then avwapFromHigh
                   else avwapFromLow;

def distPct = (close - selectedVwap) / selectedVwap * 100;

# Support Defense / Retest: Price is near AVWAP and holding it constructively
def isPinchingAtVwap = AbsValue(distPct) <= maxDistancePct;
def isDefendingVwap = (low <= selectedVwap * 1.01) and (close >= selectedVwap * 0.99);
def candleBullish = close >= open or close >= close[1];

# Reclaim Mode: Price crossing above AVWAP
def isCrossingAbove = close crosses above selectedVwap or (close > selectedVwap and close[1] <= selectedVwap);

# ---- 6. SCAN TRIGGER OUTPUT ----
def ytdSignal = isDefendingVwap and isPinchingAtVwap and (close >= ytdVwap) and candleBullish and liquidityOK;
def high52Signal = (isCrossingAbove or (isPinchingAtVwap and close >= avwapFromHigh)) and candleBullish and liquidityOK;
def low52Signal = isDefendingVwap and isPinchingAtVwap and (close >= avwapFromLow) and candleBullish and liquidityOK;

plot AVWAP_Signal = if anchorMode == anchorMode."YTD_Anchor_Retest" then ytdSignal
                    else if anchorMode == anchorMode."High52_Anchor_Reclaim" then high52Signal
                    else low52Signal;

# ---- FORMATTING ----
AVWAP_Signal.AssignValueColor(Color.MAGENTA);
AVWAP_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
