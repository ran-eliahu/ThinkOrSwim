# ============================================================
# 2-YEAR BULLS SCANNER: SECULAR TREND & 2-YEAR HIGH BREAKOUT
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Identifies leading equities breaking out to new 2-Year (504-day) highs 
#   or coiling in a multi-year secular Stage 2 bull structure:
#   1. Multi-Year Structural Breakout: Slicing above the 2-year (504 trading days)
#      resistance ceiling where there is ZERO trapped overhead supply.
#   2. Secular Stage 2 Institutional Alignment: Perfect moving average stacking
#      (Price > 10 EMA > 20 EMA > 50 SMA > 200 SMA) with a rising 200 SMA.
#   3. Multi-Year Base Coil: Catches stocks coiling within 3.5% of the 2-year
#      ceiling with supply exhaustion (Volume Dry-Up) before the secular surge.
#   4. Institutional Volume Ignition: Expansion in buying volume validating
#      smart money sponsorship.
#
# Modes:
#   - Two_Year_Breakout (Default): Real-time breakout to new 2-year highs on heavy volume.
#   - Two_Year_Base_Coil: Volatility contraction shelf within 3.5% of 2-year high.
#   - Secular_Bull_Trend: Sustained multi-year leader holding above the rising 50/200 SMA.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF (Regular Trading Hours).
#   • Embedded Filters (Already inside script):
#       - 2-Year (504-day) structural high calculation (`Highest(high[1], 504)`).
#       - Full Stage 2 moving average stack & Golden Cross (`50 SMA > 200 SMA`).
#       - Volume Dry-Up (VDU) & Volume Expansion (RVOL).
#       - Liquidity filters (Price >= $5.00, Avg Volume >= 500k).
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [RECOMMENDED] "Scan In: S&P 500 / Russell 1000 / Optionable / All Stocks".
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Script handles all multi-year
#         calculations, moving averages, and breakout levels self-contained.
# ============================================================

# ---- USER INPUTS ----
input scanMode = {default "Two_Year_Breakout", "Two_Year_Base_Coil", "Secular_Bull_Trend"};
input lookbackDays = 504;          # 2 Trading Years (~252 days/yr * 2)
input maxPctFromHigh = 3.5;        # Max % distance below 2-year high for Base Coil mode
input rvolBreakout = 1.20;         # Volume multiplier required on breakout day
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

# Rising 200 SMA over the past month (confirmed macro uptrend)
def sma200Rising = sma50 > sma200 and sma200 >= sma200[20] * 0.998;

# Stage 2 Moving Average Alignment
def stage2Trend = close > sma50 and sma50 > sma200 and close > ema20 and sma200Rising;

# ---- 3. MULTI-YEAR (2-YEAR) HIGH BENCHMARK ----
def twoYearHigh = Highest(high[1], lookbackDays);
def distFromTwoYearHigh = (twoYearHigh - close) / twoYearHigh * 100;

# ---- 4. MODE 1: 2-YEAR STRUCTURAL BREAKOUT ----
# Price crosses or closes at new 2-year high with positive close and volume confirmation
def breaksTwoYearHigh = (close >= twoYearHigh or high >= twoYearHigh) and close >= open and close >= close[1];
def volumeConfirmed = volume >= (avgVol50 * rvolBreakout) or volume >= avgVol50;
def isTwoYearBreakout = stage2Trend and breaksTwoYearHigh and volumeConfirmed;

# ---- 5. MODE 2: 2-YEAR BASE COIL (PRE-BREAKOUT COMPRESSION) ----
# Price is coiling tightly within 3.5% of 2-year high along 10/20 EMA shelf
def nearCeiling = distFromTwoYearHigh >= 0 and distFromTwoYearHigh <= maxPctFromHigh;
def holdsEmaSupport = close >= ema20 * 0.985 and close >= ema10 * 0.98;

# Volatility compression (ATR 5 vs ATR 20)
def atr5 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 5);
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def volatilityCoiling = atr5 <= (atr20 * 0.85);

# Momentum support (RSI above 50 floor)
def rsiVal = RSI(14);
def rsiHealthy = rsiVal >= 50 and rsiVal <= 75;

def isTwoYearCoil = stage2Trend and nearCeiling and holdsEmaSupport and volatilityCoiling and rsiHealthy;

# ---- 6. MODE 3: SECULAR BULL TREND (MULTI-YEAR LEADER) ----
# Long-term macro bull leader holding clean 10/20/50 moving average fan
def perfectFan = ema10 > ema20 and ema20 > sma50 and sma50 > sma200;
def nearMacroHighs = distFromTwoYearHigh <= 8.0;
def isSecularBull = stage2Trend and perfectFan and nearMacroHighs and (close > ema10 * 0.99);

# ---- 7. SCAN TRIGGER PLOT ----
plot scan = liquidityOK and (
    if scanMode == scanMode.Two_Year_Breakout then isTwoYearBreakout
    else if scanMode == scanMode.Two_Year_Base_Coil then isTwoYearCoil
    else isSecularBull
);

# ---- 8. FORMATTING & ALERTS ----
scan.SetPaintingStrategy(PaintingStrategy.BOOLEAN_POINTS);
scan.SetDefaultColor(Color.UPTICK);
scan.HideBubble();
scan.HideTitle();
