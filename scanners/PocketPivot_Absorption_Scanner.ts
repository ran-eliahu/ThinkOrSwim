# ============================================================
# INSTITUTIONAL POCKET PIVOT & VOLUME ABSORPTION SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Derived from the Pocket Pivot method created by Gil Morales & 
#   Dr. Chris Kacher (former William O'Neil portfolio managers).
#   
#   Identifies institutional accumulation inside a base or along 
#   key moving averages BEFORE traditional breakout points.
#
# Core Logic:
#   1. Volume Signature: Today's up-volume is GREATER than the 
#      HIGHEST down-volume bar of the prior 10 trading sessions.
#   2. Key MA Support: Price is pivoting off or breaking through 
#      the 10 EMA, 20 EMA, or 50 SMA.
#   3. Not Overextended: Price is within 5% of its supporting MA.
#   4. Upper Range Close: Price closes in the top 50% of the day's 
#      candle range (strong institutional closing bid).
#   5. Stage 2 Filter: Price above 50 SMA and 200 SMA.
# ============================================================

# ---- USER INPUTS ----
input downVolLookback = 10;
input minPrice = 10.0;
input minAvgVolume = 500000;
input maxExtFromMA = 5.0; # Max % distance above MA to prevent chasing

# ---- 1. MOVING AVERAGES ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# Long-term constructive structure
def trendHealthy = close > sma50 and (sma50 >= sma200 or close > sma200);

# ---- 2. POCKET PIVOT VOLUME SIGNATURE ----
# Identify down days (close < close[1]) in prior 10 bars and find max down volume
def isDownDay = close < close[1];
def downVolume = if isDownDay then volume else 0;

def maxDownVol10 = Highest(downVolume[1], downVolLookback);

# Today must be an up day with volume higher than any down-day in the last 10 days
def isUpDay = close > close[1] and close >= open;
def pocketPivotVolume = isUpDay and (volume > maxDownVol10) and (volume >= Average(volume, 50));

# ---- 3. CONSTRUCTIVE STRUCTURAL BOUNCE / PIVOT ----
# Price touches or sits near 10 EMA, 20 EMA, or 50 SMA today
def nearEma10 = (low <= ema10 * 1.015) and (close >= ema10) and (close <= ema10 * (1 + maxExtFromMA / 100));
def nearEma20 = (low <= ema20 * 1.015) and (close >= ema20) and (close <= ema20 * (1 + maxExtFromMA / 100));
def nearSma50 = (low <= sma50 * 1.015) and (close >= sma50) and (close <= sma50 * (1 + maxExtFromMA / 100));

def structuralPivot = nearEma10 or nearEma20 or nearSma50;

# ---- 4. STRONG CLOSING RANGE (No Rejection Wicks) ----
def candleRange = high - low;
def closeRangePct = if candleRange > 0 then (close - low) / candleRange else 1.0;
def strongClose = closeRangePct >= 0.50; # Closes in upper 50% of bar

# ---- 5. LIQUIDITY FILTER ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- COMBINED SCAN TRIGGER ----
plot PocketPivotSignal = pocketPivotVolume 
                         and structuralPivot 
                         and strongClose 
                         and trendHealthy 
                         and liquidityOK;

# ---- FORMATTING ----
PocketPivotSignal.AssignValueColor(Color.MAGENTA);
PocketPivotSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
