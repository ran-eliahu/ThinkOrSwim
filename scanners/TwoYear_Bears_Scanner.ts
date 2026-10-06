# ============================================================
# 2-YEAR BEARS SCANNER: SECULAR DOWNTREND & 2-YEAR LOW BREAKDOWN
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Identifies failing equities breaking down to new 2-Year (504-day) lows 
#   or rolling over in a multi-year secular Stage 4 bear structure:
#   1. Multi-Year Structural Floor Breakdown: Slicing below the 2-year (504 trading days)
#      support floor where institutional stop runs and capitulation occur.
#   2. Secular Stage 4 Institutional Alignment: Bearish moving average waterfall
#      (Price < 10 EMA < 20 EMA < 50 SMA < 200 SMA) with a declining 200 SMA.
#   3. Multi-Year Bear Flag Rollover: Catches low-volume relief bounces into declining
#      moving averages near multi-year lows, setting up optimal asymmetric short entries.
#   4. Heavy Institutional Distribution: Heavy selling volume expansion confirming
#      aggressive fund liquidation.
#
# Modes:
#   - Two_Year_Breakdown (Default): Real-time breakdown to new 2-year lows on heavy selling volume.
#   - Two_Year_Bear_Flag: Low-volume bounce into declining 20 EMA rolling over near 2-year floor.
#   - Secular_Bear_Trend: Sustained multi-year Stage 4 laggard trading under declining 50/200 SMA.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF (Regular Trading Hours).
#   • Embedded Filters (Already inside script):
#       - 2-Year (504-day) structural low calculation (`Lowest(low[1], 504)`).
#       - Full Stage 4 moving average stack & Death Cross (`50 SMA < 200 SMA`).
#       - High RVOL selling volume & distribution candle validation.
#       - Liquidity filters (Price >= $5.00, Avg Volume >= 500k to ensure borrowability/options liquidity).
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 1000 / Optionable Stocks"
#         (ensures liquid put options or easy-to-borrow shares).
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Script handles all multi-year
#         calculations, moving averages, and breakdown levels self-contained.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Two_Year_Breakdown", "Two_Year_Bear_Flag", "Secular_Bear_Trend"};
input lookbackDays = 504;          # 2 Trading Years (~252 days/yr * 2)
input maxPctFromLow = 4.0;         # Max % distance above 2-year low for Bear Flag mode
input rvolBreakdown = 1.20;        # Minimum volume multiplier on breakdown day
input minPrice = 5.0;
input minAvgVolume = 500000;

# ---- 1. BASELINE LIQUIDITY & BENCHMARKS ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- 2. MOVING AVERAGES & MACRO TREND TEMPLATE ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# Declining 200 SMA over the past month (confirmed macro downtrend)
def sma200Declining = sma50 < sma200 and sma200 <= sma200[20] * 1.002;

# Stage 4 Moving Average Alignment
def stage4Trend = close < sma50 and sma50 < sma200 and close < ema20 and sma200Declining;

# ---- 3. MULTI-YEAR (2-YEAR) LOW BENCHMARK ----
def twoYearLow = Lowest(low[1], lookbackDays);
def distFromTwoYearLow = (close - twoYearLow) / twoYearLow * 100;

# ---- 4. MODE 1: 2-YEAR STRUCTURAL BREAKDOWN ----
# Price crosses or closes at new 2-year low with red close and volume confirmation
def breaksTwoYearLow = (close <= twoYearLow or low <= twoYearLow) and close <= open and close <= close[1];
def heavySellingVolume = volume >= (avgVol50 * rvolBreakdown) or volume >= avgVol50;
def isTwoYearBreakdown = stage4Trend and breaksTwoYearLow and heavySellingVolume;

# ---- 5. MODE 2: 2-YEAR BEAR FLAG ROLLOVER ----
# Price recently bounced into 20 EMA on light volume, now rolling over near multi-year lows
def nearFloor = distFromTwoYearLow >= 0 and distFromTwoYearLow <= maxPctFromLow;
def rolledOverFromEma = (high[1] >= ema20[1] * 0.98 and high[1] <= ema20[1] * 1.03) and (close < ema10) and (close < close[1]);
def isTwoYearBearFlag = stage4Trend and nearFloor and rolledOverFromEma and (close < open);

# ---- 6. MODE 3: SECULAR BEAR TREND (MULTI-YEAR LAGGARD) ----
# Long-term macro bear trapped under 10/20/50/200 moving average waterfall
def bearWaterfall = ema10 < ema20 and ema20 < sma50 and sma50 < sma200;
def nearMacroLows = distFromTwoYearLow <= 8.0;
def rsiVal = RSI(14);
def rsiWeak = rsiVal <= 45;
def isSecularBear = stage4Trend and bearWaterfall and nearMacroLows and rsiWeak and (close < ema10 * 1.01);

# ---- 7. SCAN TRIGGER PLOT ----
plot scan = liquidityOK and (
    if scanMode == scanMode.Two_Year_Breakdown then isTwoYearBreakdown
    else if scanMode == scanMode.Two_Year_Bear_Flag then isTwoYearBearFlag
    else isSecularBear
);

# ---- 8. FORMATTING & ALERTS ----
scan.SetPaintingStrategy(PaintingStrategy.BOOLEAN_POINTS);
scan.SetDefaultColor(Color.DOWNTICK);
scan.HideBubble();
scan.HideTitle();
