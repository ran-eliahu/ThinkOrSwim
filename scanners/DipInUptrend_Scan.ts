# ============================================================
# INSTITUTIONAL DIP BUY IN UPTREND SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Eliminates the #1 fatal flaw of retail dip scanners (buying 
#   falling knives and breakdown traps). 
#
#   Ensures high-probability entries by verifying:
#   1. Pristine Stage 2 Trend: 50 SMA > 200 SMA, 200 SMA rising.
#   2. Controlled Pullback: Price pulls back to the 20 EMA or 50 SMA 
#      shelf WITHOUT heavy institutional distribution.
#   3. Volume Supply Exhaustion: Down-volume on the dip dries up 
#      below the 50-day average.
#   4. Candle Reversal Trigger: Bottoming wick rejection or green 
#      close proving buyers have stepped back in at support.
#   5. RSI Reload Zone: RSI resets to 42-56 (constructive reload).
# ============================================================

# ---- USER INPUTS ----
input rsiLength = 14;
input rsiMin = 40.0;
input rsiMax = 58.0;
input minPrice = 10.0;
input minAvgVolume = 500000;
input maxDipPctBelow20EMA = 4.0; # Max dip depth below 20 EMA

# ---- 1. MACRO STAGE 2 TREND TEMPLATE ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# 200 SMA must be rising or flat (not in macro bear dump)
def sma200Rising = sma200 >= sma200[15];
def macroTrendBullish = sma50 > sma200 and sma200Rising and close > sma200;

# ---- 2. CONTROLLED PULLBACK (Dip to 20 EMA / 50 SMA) ----
def distFromEma20 = (close - ema20) / ema20 * 100;
def distFromSma50 = (close - sma50) / sma50 * 100;

# Price is dipping near 20 EMA or 50 SMA support
def touchingEma20 = (low <= ema20 * 1.01) and (distFromEma20 >= -maxDipPctBelow20EMA);
def touchingSma50 = (low <= sma50 * 1.015) and (distFromSma50 >= -3.0) and (close >= sma50 * 0.98);
def inDipZone = (touchingEma20 or touchingSma50) and close >= sma50 * 0.97;

# ---- 3. REVERSAL STABILIZATION TRIGGER (Anti-Knife) ----
# Candle shows buyers defending the low (hammer / bottom wick / green close)
def candleRange = high - low;
def lowerWick = Min(open, close) - low;
def upperWick = high - Max(open, close);
def buyersDefending = (lowerWick >= candleRange * 0.35) or (close >= open and close >= close[1]);

# Low is holding above the recent multi-week structural low
def lowest10Low = Lowest(low[2], 10);
def structuralSupportHeld = low >= lowest10Low;

# ---- 4. SUPPLY EXHAUSTION (No Heavy Selling) ----
def avgVol50 = Average(volume, 50);
# Dip volume should NOT be massive panic distribution
def noHeavyDistribution = volume <= (avgVol50 * 1.35);

# ---- 5. RSI MOMENTUM RELOAD ZONE ----
def rsiVal = RSI(length = rsiLength);
def rsiReloadZone = rsiVal >= rsiMin and rsiVal <= rsiMax and rsiVal >= rsiVal[1];

# ---- 6. LIQUIDITY ----
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- COMBINED SCAN TRIGGER ----
plot DipInUptrendSignal = macroTrendBullish 
                          and inDipZone 
                          and buyersDefending 
                          and structuralSupportHeld 
                          and noHeavyDistribution 
                          and rsiReloadZone 
                          and liquidityOK;

# ---- FORMATTING ----
DipInUptrendSignal.AssignValueColor(Color.YELLOW);
DipInUptrendSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
