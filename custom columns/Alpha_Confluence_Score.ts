# ============================================================
# CUSTOM COLUMN: 0-100 ALPHA CONFLUENCE SCORE
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript (Custom Watchlist Column)
# Timeframe: Daily or Intraday
#
# Description:
#   A quantitative HUD column for your ThinkorSwim watchlists.
#   Computes a real-time composite 0-100 score across 4 pillars:
#     1. Trend Structure (0-25 pts)
#     2. Momentum & Squeeze (0-25 pts)
#     3. Institutional Volume & Accumulation (0-25 pts)
#     4. Price Location & Breakout Proximity (0-25 pts)
#
# Score Brackets:
#   - 85-100: [⚡ ULTRA EDGE]  - Elite setups ready for execution
#   - 70-84:  [🔥 STRONG BULL] - High probability trend alignment
#   - 50-69:  [🟡 CONSTRUCTIVE]- Building base / Watchlist candidate
#   - 30-49:  [🟠 CHOP / WEAK] - Lacking momentum or volume
#   - 0-29:   [⛔ BEAR / AVOID] - Broken structure / Down-trend
# ============================================================

# ---- 1. TREND STRUCTURE (0 to 25 pts) ----
def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);
def sma200 = Average(close, 200);

def trendScore = (if close > sma200 then 10 else 0)
               + (if close > sma50 then 5 else 0)
               + (if ema10 > ema20 then 5 else 0)
               + (if ema20 > sma50 then 5 else 0);

# ---- 2. MOMENTUM & COMPRESSION (0 to 25 pts) ----
def rsiVal = RSI(14);
def rsiInBullZone = rsiVal >= 50 and rsiVal <= 72;

def sqzHist = TTM_Squeeze().Histogram;
def momAccelerating = sqzHist > sqzHist[1];

def atr5 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 5);
def atr20 = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 20);
def isCompressed = atr5 <= (atr20 * 0.85);

def momentumScore = (if momAccelerating then 10 else 0)
                  + (if rsiInBullZone then 8 else 0)
                  + (if isCompressed then 7 else 0);

# ---- 3. VOLUME & INSTITUTIONAL FLOW (0 to 25 pts) ----
def avgVol50 = Average(volume, 50);
def volAboveAvg = volume >= avgVol50;
def rvolSurge = volume >= (avgVol50 * 1.25);
def isUpDay = close >= close[1] and close >= open;

def volumeScore = (if volAboveAvg then 10 else 0)
                + (if rvolSurge then 8 else 0)
                + (if isUpDay then 7 else 0);

# ---- 4. PRICE LOCATION & PROXIMITY (0 to 25 pts) ----
def high20 = Highest(high, 20);
def high52 = Highest(high, 252);

def near20High = close >= (high20 * 0.97); # Within 3% of 20-day high
def near52High = close >= (high52 * 0.85); # Within 15% of 52-week high
def aboveEma10 = close >= ema10;

def locationScore = (if near20High then 10 else 0)
                  + (if near52High then 8 else 0)
                  + (if aboveEma10 then 7 else 0);

# ---- TOTAL CONFLUENCE SCORE (0 - 100) ----
def totalScore = trendScore + momentumScore + volumeScore + locationScore;

# Plot the numeric value so watchlist column can be sorted ascending/descending
plot EdgeScore = totalScore;
EdgeScore.SetLineWeight(2);
EdgeScore.Hide();

# ---- DYNAMIC HUD LABEL ----
AddLabel(yes,
    if totalScore >= 85 then "⚡ " + totalScore + " ULTRA"
    else if totalScore >= 70 then "🔥 " + totalScore + " STRONG"
    else if totalScore >= 50 then "🟡 " + totalScore + " READY"
    else if totalScore >= 30 then "🟠 " + totalScore + " CHOP"
    else "⛔ " + totalScore + " AVOID",
    
    if totalScore >= 85 then Color.GREEN
    else if totalScore >= 70 then Color.DARK_GREEN
    else if totalScore >= 50 then Color.YELLOW
    else if totalScore >= 30 then Color.ORANGE
    else Color.RED
);
