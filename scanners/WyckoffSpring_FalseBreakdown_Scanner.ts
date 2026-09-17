# ============================================================
# WYCKOFF SPRING & TURTLE SOUP (FALSE BREAKDOWN RECLAIM) SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Richard Wyckoff's "Spring" pattern & Linda Raschke's "Turtle Soup":
#   1. Liquidity Hunt: Retail stop losses sit right below well-defined 20-day
#      support levels or the 50/200 SMA.
#   2. The Flush: Algorithmic market makers sweep below the support floor
#      to trigger sell stops and absorb institutional liquidity.
#   3. Immediate Reclaim: Price rejects the breakdown in the same session,
#      closing back ABOVE the broken support level.
#   4. Asymmetric R:R: Provides an ultra-tight stop loss right at today's low,
#      targeting a mean-reversion move to the upper range.
#
# Modes:
#   - SwingLow_Reclaim: Flushes the 20-day swing low and reclaims it today.
#   - SMA50_Flush_Reclaim: Flushes below the 50 SMA and reclaims it today.
#   - SMA200_Flush_Reclaim: Flushes below the 200 SMA and reclaims it today.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF.
#   • Embedded Filters (Already inside script):
#       - 20-day swing low reference calculation (`Lowest(low[1], 20)`).
#       - 50 SMA / 200 SMA undercut & reclaim detection.
#       - Upper range candle close requirement (closes in top 40% of bar).
#       - Bullish RSI divergence & liquidity checks.
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 1000 / Liquid Equities".
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Breakdown traps and reclaim
#         calculations are completely evaluated in the script.
# ============================================================

# ---- USER INPUTS ----
input reclaimMode = {default "SwingLow_Reclaim", "SMA50_Flush_Reclaim", "SMA200_Flush_Reclaim"};
input lookbackBars = 20;           # Lookback period for swing low support
input minPrice = 10.0;
input minAvgVolume = 500000;
input minCloseRangePct = 40.0;     # Candle close must finish in top X% of the day's range

# ---- 1. BASELINE LIQUIDITY & BENCHMARKS ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# ---- 2. SUPPORT BENCHMARK CALCULATIONS ----
# Prior N-bar swing low (excluding current bar)
def priorSwingLow = Lowest(low[1], lookbackBars);

# ---- 3. THE FLUSH & RECLAIM TRIGGER ----
# A. Swing Low Flush & Reclaim
def flushesSwingLow = low < priorSwingLow;
def reclaimsSwingLow = close >= priorSwingLow;
def isSwingLowSpring = flushesSwingLow and reclaimsSwingLow;

# B. 50 SMA Flush & Reclaim
def flushesSma50 = low < sma50;
def reclaimsSma50 = close >= sma50;
def isSma50Spring = flushesSma50 and reclaimsSma50 and (close[1] >= sma50 * 0.95);

# C. 200 SMA Flush & Reclaim
def flushesSma200 = low < sma200;
def reclaimsSma200 = close >= sma200;
def isSma200Spring = flushesSma200 and reclaimsSma200 and (close[1] >= sma200 * 0.95);

# ---- 4. CANDLE STRUCTURE CONFIRMATION ----
# High-volume absorption / Strong wick rejection
def barRange = high - low;
def closePosition = if barRange > 0 then (close - low) / barRange * 100 else 0;
def strongRejectionClose = closePosition >= minCloseRangePct;

# RSI Stabilization (RSI < 50, curling up from oversold territory)
def rsiVal = RSI(length = 14);
def rsiRecovering = rsiVal <= 50 and (rsiVal >= rsiVal[1]);

# ---- 5. SCAN SIGNAL SELECTION ----
def selectedTrigger = if reclaimMode == reclaimMode."SwingLow_Reclaim" then isSwingLowSpring
                      else if reclaimMode == reclaimMode."SMA50_Flush_Reclaim" then isSma50Spring
                      else isSma200Spring;

plot WyckoffSpring_Signal = selectedTrigger 
                            and strongRejectionClose 
                            and rsiRecovering 
                            and liquidityOK;

# ---- FORMATTING ----
WyckoffSpring_Signal.AssignValueColor(Color.YELLOW);
WyckoffSpring_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
