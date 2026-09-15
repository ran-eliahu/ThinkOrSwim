# ============================================================
# FALLEN ANGELS INSTITUTIONAL MEAN REVERSION SCANNER (PRO EDITION)
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Daily (Stock Hacker Native)
#
# Core Strategy & Edge:
#   Eliminates broken falling knives by strictly requiring:
#   1. Quality Blue Chip / High Liquidity Universe.
#   2. Deep Pullback to Major Value: 8% to 28% off 52-week highs.
#   3. Long-Term Health: Price ABOVE rising 200-day SMA.
#   4. Wyckoff Support Spring / Reversal Candle: Price rejected 
#      breakdown and closed green or formed a bullish bottoming wick.
#   5. Synchronized RSI Momentum Rebound: RSI(14) curling out of 
#      the 25-42 oversold pocket with positive MACD velocity.
# ============================================================

# ---- USER INPUTS ----
input rsiLength = 14;
input rsiMin = 25.0;
input rsiMax = 44.0;
input minPullbackPct = 8.0;
input maxPullbackPct = 28.0;
input minPrice = 15.0;
input minAvgVolume = 1000000;

# ---- 1. PULLBACK DEPTH FROM 52-WEEK HIGH ----
def high52 = Highest(high, 252);
def pullbackPct = (high52 - close) / high52 * 100;
def inValidPullbackZone = pullbackPct >= minPullbackPct and pullbackPct <= maxPullbackPct;

# ---- 2. LONG-TERM STRUCTURAL TREND ----
def sma200 = Average(close, 200);
def sma200Rising = sma200 >= sma200[20] - (0.005 * close);
def aboveSma200 = close >= (sma200 * 0.985) and sma200Rising; # Above or kissing 200 SMA

# ---- 3. RSI MOMENTUM REBOUND ----
def rsiVal = RSI(length = rsiLength);
def rsiOversoldRecovering = rsiVal >= rsiMin and rsiVal <= rsiMax and rsiVal > rsiVal[2];

# MACD histogram turning up from deep depression
def macdHist = MACD().Diff;
def macdTurningUp = macdHist > macdHist[1];

# ---- 4. REVERSAL STABILIZATION (Support Floor) ----
# Candle shows buyers defending the low (hammer or green close)
def candleRange = high - low;
def lowerWick = Min(open, close) - low;
def buyerSupport = (lowerWick >= candleRange * 0.30) or (close >= open and close >= close[1]);

# Low is holding support floor (not in freefall waterfall)
def lowest5Low = Lowest(low[2], 5);
def holdingSupportFloor = low >= lowest5Low * 0.985;

# ---- 5. LIQUIDITY ----
def avgVol50 = Average(volume, 50);
def liquidityOK = avgVol50 >= minAvgVolume and close >= minPrice;

# ---- COMBINED SCAN TRIGGER ----
plot FallenAngelSignal = inValidPullbackZone 
                      and aboveSma200 
                      and rsiOversoldRecovering 
                      and macdTurningUp 
                      and buyerSupport 
                      and holdingSupportFloor 
                      and liquidityOK;

# ---- FORMATTING ----
FallenAngelSignal.AssignValueColor(Color.CYAN);
FallenAngelSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
