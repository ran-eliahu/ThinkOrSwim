# ============================================================
# ELITE FUNDAMENTALS SCAN (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
# ============================================================

input minPrice = 15.0;
input minAvgVolume = 500000;
input maxPctFrom52High = 20.0;

# Moving Average Stack & 200 SMA Slope
def ema21 = ExpAverage(close, 21);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

def sma200Rising = sma200 >= sma200[20];
def bullStack = close > ema21 and ema21 > sma50 and sma50 > sma200 and sma200Rising;

# 52-Week High & Low Proximity
def high52 = Highest(high, 252);
def low52 = Lowest(low, 252);

def pctFromHigh = (high52 - close) / high52 * 100;
def nearHigh = pctFromHigh <= maxPctFrom52High;
def wellAboveLow = close >= low52 * 1.25;

# Momentum & Liquidity
def rsiVal = RSI(14);
def rsiHealthy = rsiVal >= 50 and rsiVal <= 75;
def avgVol50 = Average(volume, 50);
def volOK = avgVol50 >= minAvgVolume and close >= minPrice;

plot scan = bullStack and nearHigh and wellAboveLow and rsiHealthy and volOK;
