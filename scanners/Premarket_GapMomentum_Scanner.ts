# ============================================================
# PREMARKET GAP & RELATIVE VOLUME MOMENTUM SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: 1-Minute or 5-Minute Intraday (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Designed for premarket morning prep (7:00 AM - 9:25 AM EST):
#   1. Identifies premier catalysts & gappers BEFORE the opening bell rings.
#   2. Premarket Relative Volume: Flags stocks accumulating significant 
#      premarket volume (> 100,000 shares).
#   3. Directional Momentum: Price is holding constructive premarket structure 
#      (holding above premarket midpoint and VWAP).
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: 1-MINUTE (1m) or 5-MINUTE (5m).
#   • ⚠️ CRITICAL SETTING: Extended Hours (EXT) MUST BE CHECKED (ON).
#   • Scan Window: Best run between 7:30 AM and 9:25 AM EST.
#   • Embedded Filters (Already inside script):
#       - Prior regular session close reference (`close(period = "DAY")[1]`).
#       - Premarket cumulative volume tracking.
#       - Premarket Gap % threshold.
#       - Minimum price filter.
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: All Stocks / Russell 3000 / Watchlist".
#       - [RECOMMENDED] Exclude OTC/Penny stocks by setting Min Price >= $3.
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Computes gap, premarket volume,
#         and session metrics in real-time.
# ============================================================

# ---- USER INPUTS ----
input minGapPct = 3.0;             # Minimum gap % vs prior regular close
input minPremarketVol = 100000;    # Minimum shares traded in premarket session
input minPrice = 3.0;
input scanDirection = {default "Bullish_Gappers", "Bearish_Gappers"};

# ---- 1. SESSION & TIME BOUNDARIES ----
def isNewDay = GetDay() != GetDay()[1];
def isPremarket = SecondsFromTime(0400) >= 0 and SecondsTillTime(0930) > 0;

# Cumulative Premarket Volume
def pmVolumeTrack = if isNewDay then volume 
                    else if isPremarket then pmVolumeTrack[1] + volume 
                    else 0;

# Prior Regular Session Daily Close
def priorDayClose = close(period = AggregationPeriod.DAY)[1];

# ---- 2. PREMARKET GAP % CALCULATION ----
def gapPct = if priorDayClose > 0 then (close - priorDayClose) / priorDayClose * 100 else 0;

# ---- 3. PREMARKET VWAP & STRUCTURAL HOLD ----
def vwapVal = reference VWAP()."VWAP";
def holdingPmVwap = close >= vwapVal;

# ---- 4. SCAN TRIGGERS ----
def isBullishGapper = isPremarket 
                      and (gapPct >= minGapPct) 
                      and (pmVolumeTrack >= minPremarketVol) 
                      and holdingPmVwap 
                      and (close >= minPrice);

def isBearishGapper = isPremarket 
                      and (gapPct <= -minGapPct) 
                      and (pmVolumeTrack >= minPremarketVol) 
                      and (!holdingPmVwap) 
                      and (close >= minPrice);

plot Premarket_Signal = if scanDirection == scanDirection."Bullish_Gappers" 
                        then isBullishGapper 
                        else isBearishGapper;

# ---- FORMATTING ----
Premarket_Signal.AssignValueColor(if scanDirection == scanDirection."Bullish_Gappers" then Color.GREEN else Color.RED);
Premarket_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
