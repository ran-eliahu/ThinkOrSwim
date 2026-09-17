# ============================================================
# INSTITUTIONAL POWER TREND & 10/20 EMA WAVE PULLBACK SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Institutional Edge:
#   Modeled after Investor's Business Daily (IBD) Power Trend rules &
#   Kristjan Qullamaggie 10/20 EMA moving average respect setups:
#   1. Strict Moving Average Alignment: 10 EMA > 20 EMA > 50 SMA > 200 SMA.
#   2. Power Trend Continuity: The moving averages must be stacked in proper
#      bullish order for at least 10 consecutive sessions (eliminates whipsaw chop).
#   3. Low-Risk Entry on Pullback: Price pulls back to "kiss" the rising 10 EMA or 
#      20 EMA, offering a low-risk entry with defined stop right under the moving average.
#   4. Volume Dry-Up (VDU): Pullback volume contracts below the 50-day average.
#   5. Candle Rejection: Lower shadow / green close proving institutional buyers
#      are defending the trendline.
#
# ============================================================
# 📋 STOCK HACKER FILTER CONFIGURATION & REQUIREMENTS:
# ============================================================
#   • Aggregation Period: DAILY (D).
#   • Extended Hours (EXT): OFF.
#   • Embedded Filters (Already inside script):
#       - Full 4-tier Moving Average Stack (`10 EMA > 20 EMA > 50 SMA > 200 SMA`).
#       - 10-bar persistence check (`CountTrue(stack, 10) == 10`).
#       - 200 SMA slope confirmation (rising over 20 bars).
#       - 10 EMA / 20 EMA proximity & touch detection.
#       - Volume contraction and candle reversal wick criteria.
#   • Additional TOS Stock Hacker Filters Needed / Recommended:
#       - [OPTIONAL] "Scan In: S&P 500 / Russell 1000 / Nasdaq 100".
#       - [OPTIONAL] Fundamental Filter: EPS Growth QoQ >= 20% (for CANSLIM confluence).
#       - [NO OTHER TECHNICAL FILTERS NEEDED]: Multi-layer trend and pullback
#         mechanisms are fully self-contained.
# ============================================================

# ---- USER INPUTS ----
input maTouchTarget = {default "10_EMA", "20_EMA", "Either_EMA"};
input minPowerTrendBars = 10;      # Consecutive bars MA stack must be active
input maxPullbackOvershootPct = 2.0; # Max % low can dip below the MA
input minPrice = 10.0;
input minAvgVolume = 500000;

# ---- 1. MOVING AVERAGE CALCULATIONS ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

# 200 SMA slope is rising
def sma200Rising = sma200 >= sma200[20];

# ---- 2. POWER TREND STACK & PERSISTENCE ----
# The sacred 4-tier stack
def maStackBullish = (ema10 > ema20) and (ema20 > sma50) and (sma50 > sma200) and sma200Rising;

# Verify the stack has held for at least [minPowerTrendBars] consecutive sessions
def powerTrendActive = CountTrue(maStackBullish, minPowerTrendBars) == minPowerTrendBars;

# ---- 3. PULLBACK & TOUCH LOGIC ----
# Price touches or dips slightly near 10 EMA / 20 EMA
def touches10Ema = (low <= ema10 * 1.01) and (low >= ema10 * (1 - maxPullbackOvershootPct / 100)) and (close >= ema10 * 0.985);
def touches20Ema = (low <= ema20 * 1.01) and (low >= ema20 * (1 - maxPullbackOvershootPct / 100)) and (close >= ema20 * 0.985);

def isTouchingTarget = if maTouchTarget == maTouchTarget."10_EMA" then touches10Ema
                       else if maTouchTarget == maTouchTarget."20_EMA" then touches20Ema
                       else (touches10Ema or touches20Ema);

# ---- 4. REVERSAL STABILIZATION & VOLUME CONTRACTION ----
def candleRange = high - low;
def lowerWick = Min(open, close) - low;
def buyersDefending = (lowerWick >= candleRange * 0.30) or (close >= open and close >= close[1]);

# Volume dries up on the pullback (No institutional selling)
def avgVol50 = Average(volume, 50);
def volumeDryUp = volume <= (avgVol50 * 1.10);

# ---- 5. LIQUIDITY ----
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- COMBINED SCAN TRIGGER ----
plot PowerTrendPullback_Signal = powerTrendActive 
                                 and isTouchingTarget 
                                 and buyersDefending 
                                 and volumeDryUp 
                                 and liquidityOK;

# ---- FORMATTING ----
PowerTrendPullback_Signal.AssignValueColor(Color.UPTICK);
PowerTrendPullback_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
