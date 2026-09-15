# ============================================================
# FALLEN ANGELS MEAN REVERSION SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
# ============================================================

input rsiLength = 14;
input rsiMin = 25.0;
input rsiMax = 44.0;
input minPullbackPct = 8.0;
input maxPullbackPct = 28.0;
input minPrice = 15.0;
input minAvgVolume = 1000000;

# Pullback from 52-week High
def high52 = Highest(high, 252);
def pullbackPct = (high52 - close) / high52 * 100;
def inValidPullbackZone = pullbackPct >= minPullbackPct and pullbackPct <= maxPullbackPct;

# Long-term health (Above or testing rising 200 SMA)
def sma200 = Average(close, 200);
def sma200Rising = sma200 >= sma200[20] - (0.005 * close);
def aboveSma200 = close >= (sma200 * 0.985) and sma200Rising;

# Momentum Rebound
def rsiVal = RSI(length = rsiLength);
def rsiOversoldRecovering = rsiVal >= rsiMin and rsiVal <= rsiMax and rsiVal > rsiVal[2];
def macdHist = MACD().Diff;
def macdTurningUp = macdHist > macdHist[1];

# Support defense
def candleRange = high - low;
def lowerWick = Min(open, close) - low;
def buyerSupport = (lowerWick >= candleRange * 0.30) or (close >= open and close >= close[1]);
def lowest5Low = Lowest(low[2], 5);
def holdingSupportFloor = low >= lowest5Low * 0.985;

# Liquidity
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

plot scan = inValidPullbackZone and aboveSma200 and rsiOversoldRecovering and macdTurningUp and buyerSupport and holdingSupportFloor and liquidityOK;
