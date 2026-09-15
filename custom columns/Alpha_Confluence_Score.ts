# ============================================================
# MASTER ENTRY & QUALITY CONFLUENCE SCORE
# Architecture: Quantitative HUD(Alpha Confluence Alignment)
# Platform: TD Ameritrade / Schwab ThinkorSwim(TOS)
# Timeframe: Daily or Intraday(5m / 15m)
# ============================================================

# =========================
# 1. QUALITY SCORING MATRIX(0 to 10 Points)
# =========================

# ----RSI Institutional Zone(3 pts max)----
    def rsiVal = RSI(14);
def rsiScore =
    if rsiVal >= 55 and rsiVal <= 72 then 3      # Peak Bull Momentum Zone
    else if rsiVal >= 45 and rsiVal < 55 then 2  # Healthy Support Reload Zone
    else if rsiVal >= 35 and rsiVal < 45 then 1  # Deep Pullback
    else 0;                                      # Overbought(> 75) or Broken(<35)

# ----Squeeze Compression(2 pts max)----
# SqueezeAlert == 0 means Bollinger Bands are inside Keltner Channels(Coiling)
def squeeze = TTM_Squeeze().SqueezeAlert;
def squeezeScore = if squeeze == 0 then 2 else 0;

# ----Momentum Acceleration(3 pts max)----
    def momo = TTM_Squeeze().Histogram;
def momoScore =
    if momo > 0 and momo > momo[1] then 3        # Positive & Expanding(Green)
    else if momo > momo[1] then 2                # Negative but Curling UP(Dark Red)
    else if momo > 0 then 1                      # Positive but Fading(Dark Green)
    else 0;

# ----MACD Velocity(2 pts max)----
    def macdDiff = reference MACD().Diff;
def macdScore =
    if macdDiff > 0 and macdDiff > macdDiff[1] then 2
    else if macdDiff > macdDiff[1] then 1
    else 0;

# Combined Quality Score(0 to 10)
def qualityScore = rsiScore + squeezeScore + momoScore + macdScore;

# =========================
# 2. ENTRY TRIGGER(STRUCTURE & VOLUME)
# =========================

def ema10 = ExpAverage(close, 10);
def ema20 = ExpAverage(close, 20);
def sma50 = Average(close, 50);

# Trend Structure
def isUptrend = close > sma50 and(ema20 >= sma50 or close > ema20);

# Constructive Support Shelf(10 EMA, 20 EMA, or 50 SMA defense)
def atr = MovingAverage(AverageType.SIMPLE, TrueRange(high, close, low), 14);
def nearEmaSupport = (low <= ema10 + (atr * 0.4)) or(low <= ema20 + (atr * 0.4)) or(low <= sma50 + (atr * 0.4));

# Price Trigger & Buyer Confirmation
def breakout = close > high[1] and close >= open;

# Institutional Relative Volume Surge
def avgVol = Average(volume, 50);
def relVol = if avgVol > 0 then volume / avgVol else 1.0;
def volOK = relVol >= 1.20 and(close >= close[1]);

# Combined Trigger
def entryTrigger = isUptrend and nearEmaSupport and breakout and volOK;

# =========================
# 3. STATE & RANKING SYSTEM
# =========================

def isTradeNow = (qualityScore >= 7 and entryTrigger) or(qualityScore >= 9 and isUptrend);
def isSetupWatch = (qualityScore >= 6 and isUptrend) or entryTrigger;

def state =
    if isTradeNow then 2
    else if isSetupWatch then 1
    else 0;

# Numeric composite score for column sorting(0 - 100 scale)
plot SortableScore = (qualityScore * 8) + (if entryTrigger then 20 else 0);
SortableScore.Hide();

# =========================
# 4. VISUAL HUD UI
# =========================

AssignBackgroundColor(
    if state == 2 then Color.DARK_GREEN
    else if state == 1 then Color.DARK_ORANGE
    else Color.CURRENT
);

AddLabel(yes,
    if state == 2 then "⚡ TRADE (" + qualityScore + "/10)"
    else if state == 1 then "🔥 WATCH (" + qualityScore + "/10)"
    else "⚪ (" + qualityScore + ")",
    
    if state == 2 then Color.GREEN
    else if state == 1 then Color.YELLOW
    else Color.GRAY
);
