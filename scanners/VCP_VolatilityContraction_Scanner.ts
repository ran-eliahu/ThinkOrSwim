# ============================================================
# VOLATILITY CONTRACTION PATTERN (VCP) & HIGH TIGHT FLAG SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Mark Minervini (U.S. Investing Champion) &
#   Kristjan Qullamaggie Stage 2 breakout setups:
#   1. Minervini Trend Template: Confirmed Stage 2 uptrend
#      (Price > 50 SMA > 200 SMA, 200 SMA rising, near 52w high).
#   2. Volatility Contraction: ATR(5) tightens significantly vs
#      ATR(20), and 5-bar high-low range compresses into a tight shelf.
#   3. Volume Dry-Up (VDU): Sellers have dried up; volume drops
#      well below the 50-day average (calm before the explosion).
#   4. Shelf Hugging: Price rests directly along the rising 10/20 EMA.
#
# Modes:
#   - Coil_Setup (Default): Finds the stock at peak tightness BEFORE
#     the breakout happens so you are already prepared.
#   - Breakout_Today: Alerts when price crosses above the tight 5-day
#     pivot shelf on explosive volume.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Coil_Setup", "Breakout_Today"};
input minPrice = 10.0;
input minAvgVolume = 500000;
input maxRangePct5Day = 6.0;      # Max 5-day consolidation range (%)
input atrCompressionRatio = 0.75; # ATR(5) must be <= 75% of ATR(20)
input vduVolumeRatio = 0.80;      # Volume must be <= 80% of 50-day avg for VDU

# ---- 1. MINERVINI STAGE 2 TREND TEMPLATE ----
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);

def high52 = Highest(high, 252);
def low52 = Lowest(low, 252);

# 200 SMA rising over past month
def sma200Rising = sma200 >= sma200[20];

# Trend template alignment
def stage2Trend = close > sma50 and sma50 > sma200 and sma200Rising;
def near52wHigh = close >= high52 * 0.75; # Within 25% of 52w high
def above52wLow = close >= low52 * 1.30;  # At least 30% above 52w low

def trendTemplateOK = stage2Trend and near52wHigh and above52wLow;

# ---- 2. VOLATILITY CONTRACTION (VCP) ----
def atr5 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 5);
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def atrCompressed = atr5 <= (atr20 * atrCompressionRatio);

# 5-bar high-to-low range compression percentage
def highest5 = Highest(high[1], 5);
def lowest5 = Lowest(low[1], 5);
def range5Pct = (highest5 - lowest5) / close * 100;
def tightConsolidation = range5Pct <= maxRangePct5Day;

# Price resting constructively on 10/20 EMA shelf
def restingOnEmaShelf = close >= (ema20 * 0.985) and (low <= ema10 * 1.02 or close >= ema10);

# ---- 3. VOLUME DRY-UP (VDU) & LIQUIDITY ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# Contraction volume is quiet (supply exhaustion)
def volumeDryUp = volume <= (avgVol50 * vduVolumeRatio) or (Average(volume, 3) <= avgVol50 * 0.85);

# ---- 4. BREAKOUT IGNITION METRICS ----
def pivotHigh = highest5;
def breakoutPivot = close crosses above pivotHigh or (close > pivotHigh and close[1] <= pivotHigh);
def volumeIgnition = volume >= (avgVol50 * 1.25);

# ---- SCAN SIGNALS ----
def isCoilSetup = trendTemplateOK and atrCompressed and tightConsolidation and restingOnEmaShelf and volumeDryUp and liquidityOK;
def isBreakout = trendTemplateOK and tightConsolidation[1] and breakoutPivot and volumeIgnition and liquidityOK;

plot VCP_Signal = if scanMode == scanMode."Coil_Setup" then isCoilSetup else isBreakout;

# ---- FORMATTING ----
VCP_Signal.AssignValueColor(if scanMode == scanMode."Coil_Setup" then Color.CYAN else Color.GREEN);
VCP_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
