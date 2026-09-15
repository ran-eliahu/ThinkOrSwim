# ============================================================
# INSTITUTIONAL RELATIVE STRENGTH (RS ALPHA) LEADER SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   True Market Leaders show divergent strength: when the market 
#   (SPY/QQQ) pulls back or consolidates, institutional money 
#   floods into alpha leaders. When market tailwinds return, these 
#   stocks explode +20% to +50%.
#
# Logic:
#   1. Comparative RS Ratio: Ratio of Stock / Benchmark (SPY).
#   2. RS New Highs: RS Line is at or near its 20-day or 63-day high 
#      even if the broad market index is lagging.
#   3. Multi-Duration Outperformance: Stock 20-day ROC significantly 
#      exceeds SPY 20-day ROC.
#   4. Trend Health: Price is above the 20 EMA and 50 SMA.
#
# Modes:
#   - RS_NewHigh (Default): Finds stocks whose RS Line hits 20-day 
#     highs (pure alpha divergence).
#   - Market_Resilience: Identifies stocks up on days when SPY is down.
# ============================================================

# ---- USER INPUTS ----
input benchmark = "SPY";
input scanMode = {default "RS_NewHigh", "Market_Resilience"};
input rsLookback = 20;
input minPrice = 10.0;
input minAvgVolume = 500000;
input minAlphaPct = 5.0; # Stock must beat benchmark by at least 5% over 20 days

# ---- PRICE & BENCHMARK DATA ----
def benchClose = close(benchmark);
def benchCloseValid = !IsNaN(benchClose) and benchClose > 0;

# RS Ratio (Stock / Benchmark normalized)
def rsLine = if benchCloseValid then (close / benchClose) * 100 else (close / close[1]);
def rsLine20High = Highest(rsLine, rsLookback);
def rsLineNearHigh = rsLine >= rsLine20High * 0.985; # Within 1.5% of 20-day RS high

# ---- RATE OF CHANGE (ALPHA SPREAD) ----
def stockRoc20 = (close - close[20]) / close[20] * 100;
def benchRoc20 = if benchCloseValid then (benchClose - benchClose[20]) / benchClose[20] * 100 else 0;
def alphaSpread = stockRoc20 - benchRoc20;
def strongAlpha = alphaSpread >= minAlphaPct;

# ---- MARKET RESILIENCE (Divergence Today) ----
def stockUpToday = close > close[1];
def benchDownToday = if benchCloseValid then benchClose < benchClose[1] else no;
def resilientToday = stockUpToday and benchDownToday;

# ---- STRUCTURAL TREND FILTERS ----
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

def trendUp = close > ema20 and close > sma50 and (sma50 >= sma200 or close > sma200);
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- SCAN TRIGGER ----
def isRSNewHigh = rsLineNearHigh and strongAlpha and trendUp and liquidityOK;
def isResilient = resilientToday and strongAlpha and trendUp and liquidityOK;

plot RS_Alpha_Signal = if scanMode == scanMode."RS_NewHigh" then isRSNewHigh else isResilient;

# ---- FORMATTING ----
RS_Alpha_Signal.AssignValueColor(Color.CYAN);
RS_Alpha_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
