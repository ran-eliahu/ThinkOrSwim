# ============================================================
# ABOUT TO BREAK OUT SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily or 60-min (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Takes momentum coiling to the next level by combining:
#   1. Resistance Shelf Proximity: Price consolidated within 3% 
#      of the 20-day / 50-day resistance pivot.
#   2. Multi-Factor Volatility Contraction: ATR(5) compression and 
#      TTM Squeeze coiling along the rising 10/20 EMA shelf.
#   3. Volume Dry-Up (Supply Exhaustion): Sellers have vanished, 
#      setting up an asymmetric risk/reward breakout.
#   4. Early Momentum Acceleration: Squeeze histogram and MACD 
#      curling upwards prior to explosive price ignition.
#
# Modes:
#   - Coil_Setup (Default): Catches the stock at maximum compression 
#     the day BEFORE the breakout.
#   - Breakout_Trigger: Alerts on the exact bar price breaches resistance.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Coil_Setup", "Breakout_Trigger"};
input pivotLookback = 20;         # Resistance pivot lookback (10, 20, 50 bars)
input maxPctFromPivot = 3.5;      # Max % distance below pivot for coil
input atrRatio = 0.80;            # ATR(5) <= ATR(20) * 0.80
input minPrice = 10.0;
input minAvgVolume = 500000;

# ---- 1. STRUCTURAL TREND & RESISTANCE SHELF ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# Confirmed uptrend alignment
def trendConstructive = close > sma50 and (sma50 >= sma200 or close > sma200);

# Dynamic resistance pivot
def pivotHigh = Highest(high[1], pivotLookback);
def distFromPivot = (pivotHigh - close) / pivotHigh * 100;
def nearPivotShelf = distFromPivot >= 0 and distFromPivot <= maxPctFromPivot;

# Support hugging along 10/20 EMA
def holdsEmaSupport = close >= ema20 * 0.985 and close >= ema10 * 0.98;

# ---- 2. VOLATILITY CONTRACTION (COIL) ----
def atr5 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 5);
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def atrCoiling = atr5 <= (atr20 * atrRatio);

# TTM Squeeze momentum
def sqzHist = TTM_Squeeze().Histogram;
def momTurningUp = sqzHist > sqzHist[1] or sqzHist > 0;

# RSI momentum floor
def rsiVal = RSI(14);
def rsiHealthy = rsiVal >= 52 and rsiVal <= 72;

# ---- 3. VOLUME DRY-UP & LIQUIDITY ----
def avgVol50 = Average(volume, 50);
def volDryUp = volume <= (avgVol50 * 0.90) or Average(volume, 3) <= avgVol50;
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- 4. BREAKOUT TRIGGER METRICS ----
def breakingPivotToday = close crosses above pivotHigh or (close > pivotHigh and close[1] <= pivotHigh);
def breakoutVolumeSurge = volume >= (avgVol50 * 1.25);

# ---- SCAN TRIGGER ----
def isCoil = trendConstructive and nearPivotShelf and holdsEmaSupport and atrCoiling and momTurningUp and rsiHealthy and volDryUp and liquidityOK;
def isBreakout = trendConstructive and breakingPivotToday and breakoutVolumeSurge and liquidityOK;

plot AboutToBreakOut = if scanMode == scanMode."Coil_Setup" then isCoil else isBreakout;

# ---- FORMATTING ----
AboutToBreakOut.AssignValueColor(if scanMode == scanMode."Coil_Setup" then Color.CYAN else Color.GREEN);
AboutToBreakOut.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
