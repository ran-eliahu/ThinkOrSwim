# ============================================================
# TTM SQUEEZE PRO SCANNER (MULTI-TIER EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily or Intraday (5m / 15m / 60m)
#
# Core Strategy & Edge:
#   Upgrades standard retail squeeze scans with:
#   1. Multi-Tier Squeeze Matrix:
#      - Ultra Squeeze (1.0x ATR Keltner): Maximum explosive potential.
#      - Standard Squeeze (1.5x ATR Keltner): Broad volatility coil.
#   2. Pre-Fire Momentum Shift: Identifies the exact inflection 
#      bar where momentum turns UP inside the squeeze BEFORE it fires.
#   3. Directional Bullish Fire: Squeeze fires today with positive 
#      expanding momentum and above-average volume.
#   4. Trend Alignment Guard: Price above 20 EMA & 50 SMA.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "JustFired_Bullish", "InSqueeze_Ultra", "InSqueeze_Standard", "PreFire_Momentum"};
input length = 20;
input bbMult = 2.0;
input minPrice = 10.0;
input minAvgVolume = 500000;

# ---- 1. BOLLINGER BANDS & MULTI-TIER KELTNER CHANNELS ----
def bbBasis = Average(close, length);
def bbDev = bbMult * StdDev(close, length);
def bbUpper = bbBasis + bbDev;
def bbLower = bbBasis - bbDev;

def kcBasis = Average(close, length);
def atr = Average(TrueRange(high, close, low), length);

# Standard Keltner (1.5x ATR)
def kcUpperStd = kcBasis + (1.5 * atr);
def kcLowerStd = kcBasis - (1.5 * atr);

# Ultra Keltner (1.0x ATR)
def kcUpperUltra = kcBasis + (1.0 * atr);
def kcLowerUltra = kcBasis - (1.0 * atr);

# Squeeze States
def squeezeStdOn = bbUpper < kcUpperStd and bbLower > kcLowerStd;
def squeezeUltraOn = bbUpper < kcUpperUltra and bbLower > kcLowerUltra;
def squeezeFired = squeezeStdOn[1] and !squeezeStdOn;

# ---- 2. MOMENTUM HISTOGRAM & ACCELERATION ----
def momentumLen = 12;
def midLine = (Highest(high, momentumLen) + Lowest(low, momentumLen)) / 2;
def delta = close - (midLine + Average(close, momentumLen)) / 2;
def momHist = LinearRegValue(delta, momentumLen, 0);

def momPositive = momHist > 0;
def momAccelerating = momHist > momHist[1];
def momPreFireShift = (squeezeStdOn or squeezeUltraOn) and momHist > momHist[1] and (momHist[1] < momHist[2] or momHist[1] < 0);

# ---- 3. TREND & LIQUIDITY FILTERS ----
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def trendUp = close >= ema20 and close >= sma50;

def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;
def fireVolume = volume >= (avgVol50 * 1.10);

# ---- SCAN TRIGGER ----
def isUltraSqueeze = squeezeUltraOn and trendUp and liquidityOK;
def isStandardSqueeze = squeezeStdOn and trendUp and liquidityOK;
def isPreFire = momPreFireShift and trendUp and liquidityOK;
def isBullishFire = squeezeFired and momPositive and momAccelerating and fireVolume and trendUp and liquidityOK;

plot TTMSqueezeSignal = if scanMode == scanMode."JustFired_Bullish" then isBullishFire
                        else if scanMode == scanMode."InSqueeze_Ultra" then isUltraSqueeze
                        else if scanMode == scanMode."InSqueeze_Standard" then isStandardSqueeze
                        else isPreFire;

# ---- FORMATTING ----
TTMSqueezeSignal.AssignValueColor(if scanMode == scanMode."JustFired_Bullish" then Color.GREEN else Color.YELLOW);
TTMSqueezeSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
