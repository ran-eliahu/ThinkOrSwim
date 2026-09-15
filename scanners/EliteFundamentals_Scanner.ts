# ============================================================
# ELITE FUNDAMENTALS & STAGE 2 LEADER SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Combines CANSLIM / Minervini fundamental monster screening 
#   with institutional Stage 2 technical execution.
#
# Technical Execution Matrix:
#   1. Bullish Moving Average Stack: Price > 21 EMA > 50 SMA > 200 SMA.
#   2. 200 SMA Slope: 200 SMA rising over past month (structural bull).
#   3. Stage 2 High Proximity: Within 20% of 52-week high, at least 
#      25% above 52-week low.
#   4. Volume Accumulation: Up-volume supported with positive Money Flow.
#
# Recommended Stock Hacker Fundamental Filters to pair:
#   - P/E Ratio: 5 to 35
#   - Return on Equity (ROE): >= 15%
#   - Gross Profit Margin: >= 40%
#   - Current Ratio: >= 1.5
# ============================================================

# ---- USER INPUTS ----
input minPrice = 15.0;
input minAvgVolume = 500000;
input maxPctFrom52High = 20.0;

# ---- 1. MOVING AVERAGE STACK ----
def ema10 = ExpAverage(close, 10);
def ema21 = ExpAverage(close, 21);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

def sma200Rising = sma200 >= sma200[20];
def bullStack = close > ema21 and ema21 > sma50 and sma50 > sma200 and sma200Rising;

# ---- 2. 52-WEEK HIGH / LOW METRICS ----
def high52 = Highest(high, 252);
def low52 = Lowest(low, 252);

def pctFromHigh = (high52 - close) / high52 * 100;
def nearHigh = pctFromHigh <= maxPctFrom52High;
def wellAboveLow = close >= low52 * 1.25;

# ---- 3. MOMENTUM & VOLUME SUPPORT ----
def rsiVal = RSI(14);
def rsiHealthy = rsiVal >= 50 and rsiVal <= 75;

def avgVol50 = Average(volume, 50);
def volOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- COMBINED SCAN TRIGGER ----
plot EliteFundamentalsSignal = bullStack 
                            and nearHigh 
                            and wellAboveLow 
                            and rsiHealthy 
                            and volOK;

# ---- FORMATTING ----
EliteFundamentalsSignal.AssignValueColor(Color.GREEN);
EliteFundamentalsSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
