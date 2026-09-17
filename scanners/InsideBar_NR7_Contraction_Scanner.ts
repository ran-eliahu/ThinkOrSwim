# ============================================================
# MULTI-INSIDE BAR & NR7 VOLATILITY CONTRACTION SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Toby Crabel's price action principles & Tony Crabel's NR7:
#   1. Double Inside Bar (II): Today's bar is completely inside yesterday's bar,
#      which was also completely inside the previous day's bar (Extreme energy coil).
#   2. NR7 (Narrowest Range of 7 Days): Today's high-low range is the narrowest
#      of the last 7 trading days.
#   3. Stage 2 Trend Filter: Ensures the compression is happening within an established
#      bullish trend (Price > 50 SMA > 200 SMA), filtering out lifeless flat stocks.
#   4. Volume Contraction: Confirms institutional supply has dried up completely.
#
# Modes:
#   - Double_Inside_Bar: Two consecutive inside days (High < High[1] and Low > Low[1]).
#   - NR7_Narrow_Range: Daily range is strictly the narrowest of the last 7 sessions.
#   - Inside_NR7_Confluence (Default): Inside Bar + NR7 occurring simultaneously.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF.
#   • Embedded Filters (Already inside script):
#       - Double inside day range comparisons.
#       - 7-bar range minification (`range == Lowest(range, 7)`).
#       - Stage 2 Trend Template (Price > 50 SMA > 200 SMA).
#       - Volume Dry-Up and liquidity filters.
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 1000 / Watchlist".
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Pure price action compression
#         and trend checks are fully integrated.
# ============================================================

# ---- USER INPUTS ----
input setupMode = {default "Inside_NR7_Confluence", "Double_Inside_Bar", "NR7_Narrow_Range"};
input requireUptrend = yes;        # Require Price > 50 SMA > 200 SMA
input minPrice = 10.0;
input minAvgVolume = 500000;
input vduThreshold = 0.90;         # Volume must be <= 90% of 50-day average

# ---- 1. BASELINE LIQUIDITY & TREND ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

def sma50 = Average(close, 50);
def sma200 = Average(close, 200);
def uptrendOK = if requireUptrend then (close > sma50 and sma50 >= sma200) else yes;

# ---- 2. INSIDE BAR DETECTION ----
# Single Inside Bar (Today inside Yesterday)
def isInsideBar1 = (high <= high[1]) and (low >= low[1]);

# Double Inside Bar (Today inside Yesterday AND Yesterday inside Day Before)
def isInsideBar2 = (high[1] <= high[2]) and (low[1] >= low[2]);
def isDoubleInsideBar = isInsideBar1 and isInsideBar2;

# ---- 3. NR7 (NARROWEST RANGE OF 7 SESSIONS) ----
def barRange = high - low;
def minRange7 = Lowest(barRange, 7);
def isNR7 = barRange == minRange7;

# ---- 4. CONFLUENCE (INSIDE BAR + NR7) ----
def isInsideNR7Confluence = isInsideBar1 and isNR7;

# ---- 5. VOLUME DRY-UP ----
def volumeDryingUp = volume <= (avgVol50 * vduThreshold);

# ---- 6. SCAN TRIGGER OUTPUT ----
def selectedPattern = if setupMode == setupMode."Double_Inside_Bar" then isDoubleInsideBar
                      else if setupMode == setupMode."NR7_Narrow_Range" then isNR7
                      else isInsideNR7Confluence;

plot Contraction_Signal = selectedPattern 
                          and uptrendOK 
                          and volumeDryingUp 
                          and liquidityOK;

# ---- FORMATTING ----
Contraction_Signal.AssignValueColor(Color.CYAN);
Contraction_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
