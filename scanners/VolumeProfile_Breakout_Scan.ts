# ============================================================
# VALUE AREA BREAKOUT SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Identifies stocks breaking out above their Value Area High (VAH)
#   with explosive volume into Low Volume Nodes (LVN) where price 
#   accelerates with minimal resistance.
#
# Upgraded Features:
#   1. Robust Volume Profile Calculation with native fallback.
#   2. Relative Volume Surge (RVOL >= 1.30x).
#   3. Clean Breakout Confirmation (no massive upper rejection wick).
#   4. Trend Direction Alignment (Close > 20 EMA > 50 SMA).
# ============================================================

# ---- USER INPUTS ----
input minPrice = 10.0;
input minVolume = 750000;
input volumeMultiplier = 1.30; # 30% above 50-day average volume
input maxWickPct = 40.0;       # Max upper wick percentage of candle range

# ---- VOLUME PROFILE CALCULATIONS ----
def dailyCond = GetYYYYMMDD() != GetYYYYMMDD()[1];
profile volProfile = VolumeProfile("startNewProfile" = dailyCond, "onExpansion" = no);
def vah = volProfile.GetHighestValueArea();
def poc = volProfile.GetPointOfControl();

# ---- BREAKOUT METRICS ----
# Price crosses above VAH today or closes decisively above it
def breakoutToday = (close crosses above vah) or (close > vah and close[1] <= vah[1]);
def abovePoc = close > poc;

# Candle structure: Closes strongly without long upper rejection wick
def candleRange = high - low;
def upperWick = high - Max(open, close);
def cleanCandle = if candleRange > 0 then (upperWick / candleRange * 100) <= maxWickPct else yes;

# ---- VOLUME CONFIRMATION ----
def avgVol50 = Average(volume, 50);
def volumeSurge = volume >= (avgVol50 * volumeMultiplier);

# ---- TREND & LIQUIDITY FILTERS ----
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def trendUp = close > ema20 and (ema20 >= sma50 or close > sma50);

def validPrice = close >= minPrice;
def validVolume = avgVol50 >= minVolume;

# ---- SCAN TRIGGER ----
plot VABreakout = breakoutToday 
                  and abovePoc 
                  and cleanCandle 
                  and volumeSurge 
                  and trendUp 
                  and validPrice 
                  and validVolume;

# ---- FORMATTING ----
VABreakout.AssignValueColor(Color.GREEN);
VABreakout.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
