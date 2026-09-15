# ============================================================
# INSTITUTIONAL ACCUMULATION & SMART MONEY SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Detects the mathematical footprint of institutional block buying 
#   before retail momentum breaks out.
#
# Quantitative Signals:
#   1. Wyckoff Up/Down Volume Ratio (U/D Ratio >= 1.25): Buyers 
#      aggressively dominating total volume over the past 10 sessions.
#   2. Institutional Absorption: Closes in the top 45% of the daily 
#      range on volume >= 1.35x the 50-day average.
#   3. Money Flow & OBV Trend: Money Flow Index (MFI) > 52 and 
#      On-Balance Volume (OBV) rising above its 20-day average.
#   4. Constructive Stage 2 Base: Price above 20 EMA & 50 SMA, 
#      trading within 8% of 52-week high.
#
# Modes:
#   - Accumulation_Base (Default): Finds quiet smart money accumulation.
#   - Institutional_Ignition: Heavy block volume breakout today.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Accumulation_Base", "Institutional_Ignition"};
input minPrice = 15.0;
input minAvgVolume = 750000;
input minMfi = 52.0;
input maxPctFrom52High = 8.0;

# ---- 1. VOLUME SURGE & UP/DOWN VOLUME RATIO ----
def avgVol50 = Average(volume, 50);
def volumeSurge = volume >= (avgVol50 * 1.35);

# Calculate 10-day Up-Volume vs Down-Volume
def isUpDay = close >= close[1];
def isDownDay = close < close[1];

def upVolSum = Sum(if isUpDay then volume else 0, 10);
def downVolSum = Sum(if isDownDay then volume else 0, 10);
def udRatio = if downVolSum > 0 then upVolSum / downVolSum else 2.0;
def healthyUdRatio = udRatio >= 1.25;

# ---- 2. CANDLE ABSORPTION QUALITY ----
# Closes near high of day (institutional bid absorbing selling)
def candleRange = high - low;
def closeInUpperRange = if candleRange > 0 then (close - low) / candleRange >= 0.45 else yes;

# ---- 3. MONEY FLOW & ON-BALANCE VOLUME (OBV) ----
def mfiVal = MoneyFlowIndex(14);
def mfiBullish = mfiVal >= minMfi;

# On Balance Volume Trend
def obv = TotalSum(Sign(close - close[1]) * volume);
def obvAvg = Average(obv, 20);
def obvRising = obv >= obvAvg;

# ---- 4. STRUCTURAL BASE & 52-WEEK PROXIMITY ----
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

def high52 = Highest(high, 252);
def pctFrom52High = (high52 - close) / high52 * 100;
def near52wHigh = pctFrom52High <= maxPctFrom52High;

def stage2Uptrend = close > ema20 and close > sma50 and (sma50 >= sma200 or close > sma200);

# Accumulation consistency: at least 3 high-volume accumulation days in last 10
def accumDay = isUpDay and (volume >= avgVol50 * 1.15) and closeInUpperRange;
def sustainedAccumulation = Sum(accumDay, 10) >= 3;

# ---- 5. LIQUIDITY ----
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- SCAN TRIGGER ----
def isBaseAccumulation = stage2Uptrend and near52wHigh and healthyUdRatio and mfiBullish and obvRising and sustainedAccumulation and liquidityOK;
def isIgnitionToday = stage2Uptrend and near52wHigh and volumeSurge and closeInUpperRange and isUpDay and mfiBullish and liquidityOK;

plot InstitutionalAccumulation = if scanMode == scanMode."Accumulation_Base" then isBaseAccumulation else isIgnitionToday;

# ---- FORMATTING ----
InstitutionalAccumulation.AssignValueColor(Color.MAGENTA);
InstitutionalAccumulation.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
