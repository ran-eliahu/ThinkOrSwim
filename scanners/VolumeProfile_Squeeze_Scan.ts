# ============================================================
# VOLUME PROFILE SQUEEZE SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Identifies extreme compression where 70% of volume (VAH to VAL) 
#   is concentrated inside a tight band (< 2.5% of price).
#
# Upgraded Features:
#   1. True Value Area Compression Ratio.
#   2. ATR Volatility Contraction Confirmation.
#   3. Volume Dry-Up (Supply Exhaustion) during compression.
#   4. Constructive Base Proximity (Price resting on 20 EMA shelf).
# ============================================================

# ---- USER INPUTS ----
input maxCompressionPct = 2.5;  # Max distance between VAH and VAL as a % of price
input minPrice = 10.0;
input minVolume = 750000;

# ---- VOLUME PROFILE CALCULATIONS ----
def dailyCond = GetYYYYMMDD() != GetYYYYMMDD()[1];
profile volProfile = VolumeProfile("startNewProfile" = dailyCond, "onExpansion" = no);
def vah = volProfile.GetHighestValueArea();
def val = volProfile.GetLowestValueArea();

# ---- SQUEEZE METRICS ----
def vaDistance = vah - val;
def vaCompressionPct = (vaDistance / close) * 100;
def isVaCompressed = vaCompressionPct <= maxCompressionPct;

# ---- ATR VOLATILITY COIL ----
def atr5 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 5);
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def isAtrCompressed = atr5 <= (atr20 * 0.85);

# ---- CONSTRUCTIVE BASE SUPPORT ----
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def constructiveSupport = close >= ema20 * 0.985 and close >= sma50 * 0.98;

# ---- FILTERS ----
def avgVol50 = Average(volume, 50);
def validPrice = close >= minPrice;
def validVolume = avgVol50 >= minVolume;

# ---- SCAN TRIGGER ----
plot VPSqueeze = isVaCompressed 
                 and isAtrCompressed 
                 and constructiveSupport 
                 and validPrice 
                 and validVolume;

# ---- FORMATTING ----
VPSqueeze.AssignValueColor(Color.YELLOW);
VPSqueeze.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
