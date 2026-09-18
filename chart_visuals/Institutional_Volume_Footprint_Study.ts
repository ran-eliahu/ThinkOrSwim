# ============================================================
# INSTITUTIONAL VOLUME FOOTPRINT & VDU STUDY
# Author: Ran Eliahu | github.com/ran-eliahu
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Chart Type: Lower Study (Volume Histogram & Footprint HUD)
# Timeframe: Recommended for Daily, Weekly, or Intraday
#
# Description:
#   Replaces standard binary red/green volume with institutional 
#   intent classification:
#     - 🟩 Emerald Green: Pocket Pivot Accumulation (O'Neil/Kacher)
#     - ⚪ Silver / Light Gray: Volume Dry-Up (VDU — supply exhaustion)
#     - 🟪 Violet / Purple: Ultra-High Volume Churn & Absorption
#     - 🟥 Magenta: Climax Distribution / Heavy Selling Pressure
#     - 🌲 Dark Green / 🛑 Dark Red: Normal Trading Volume
# ============================================================

declare lower;

# ─────────────────────────────────────────────
# INPUTS
# ─────────────────────────────────────────────
input volMaLength          = 50;     # Volume moving average period
input vduRatio             = 0.60;   # Volume Dry-Up threshold (<= 60% of average)
input climaxRatio          = 2.20;   # Climax volume multiplier (>= 2.2x average)
input pocketPivotLookback  = 10;     # Highest down-volume lookback for pocket pivot
input vduStreakThreshold   = 5;      # Alert when consecutive VDU bars >= this number
input alertOnVDUStreak     = yes;    # Trigger TOS audio/visual alert on VDU cluster
input showHUDLabels        = yes;    # Display RVOL & Volume State HUD
input showPocketPivotDots  = yes;    # Plot indicator dot above Pocket Pivot bars

# ─────────────────────────────────────────────
# CALCULATIONS
# ─────────────────────────────────────────────
def volMA = Average(volume, volMaLength);
def rvolPct = if volMA > 0 then (volume / volMA) * 100 else 100;
def atr = Average(TrueRange(high, close, low), 14);
def barRange = AbsValue(close - open);

# Down-volume tracking for Pocket Pivot detection
def isDownDay = close < close[1];
def downVolume = if isDownDay then volume else 0;
def maxDownVol = Highest(downVolume[1], pocketPivotLookback);

# 1. Pocket Pivot Accumulation
def fastEMA = ExpAverage(close, 10);
def baseSMA = Average(close, 50);
def isPocketPivot = (close > close[1]) and (volume > maxDownVol) and (close >= fastEMA or close >= baseSMA);

# 2. Volume Dry-Up (VDU)
def isVDU = volume <= (volMA * vduRatio);
rec vduStreak = if isVDU then vduStreak[1] + 1 else 0;
def isVDUClusterTrigger = vduStreak == vduStreakThreshold;

# 3. Ultra-High Volume Churn / Absorption (Massive volume with small price spread)
def isChurn = (volume >= volMA * 2.0) and (barRange <= (atr * 0.45));

# 4. Selling Climax / High-Volume Distribution
def isClimaxSell = (volume >= volMA * climaxRatio) and (close < open) and ((close - low) < (high - close));

# ─────────────────────────────────────────────
# PLOTS — VOLUME HISTOGRAM
# ─────────────────────────────────────────────
plot Vol = volume;
Vol.SetPaintingStrategy(PaintingStrategy.HISTOGRAM);
Vol.SetLineWeight(3);
Vol.HideTitle();

# Dynamic Institutional Bar Color Assignment
Vol.AssignValueColor(
    if isClimaxSell then Color.MAGENTA
    else if isChurn then CreateColor(186, 85, 211)       # Medium Orchid / Violet
    else if isPocketPivot then CreateColor(0, 255, 127)  # Spring Green / Emerald
    else if isVDU then Color.LIGHT_GRAY                  # Silver VDU
    else if close >= close[1] then CreateColor(34, 139, 34)  # Dark Forest Green
    else CreateColor(178, 34, 34)                        # Dark Red
);

plot VolMA_Line = volMA;
VolMA_Line.SetDefaultColor(Color.YELLOW);
VolMA_Line.SetLineWeight(2);
VolMA_Line.HideBubble();
VolMA_Line.HideTitle();

# Pocket Pivot Dot Marker
plot PPDot = if showPocketPivotDots and isPocketPivot then volume * 1.12 else Double.NaN;
PPDot.SetPaintingStrategy(PaintingStrategy.POINTS);
PPDot.SetLineWeight(3);
PPDot.SetDefaultColor(CreateColor(0, 255, 127));
PPDot.HideBubble();
PPDot.HideTitle();

# ─────────────────────────────────────────────
# HUD DASHBOARD LABELS
# ─────────────────────────────────────────────
AddLabel(
    showHUDLabels and vduStreak >= vduStreakThreshold,
    "⚡ VDU COIL: " + vduStreak + " CONSECUTIVE BARS (SUPPLY EXHAUSTED)",
    Color.CYAN
);

AddLabel(
    showHUDLabels,
    "RVOL: " + Round(rvolPct, 0) + "%",
    if rvolPct >= 200 then Color.MAGENTA
    else if rvolPct >= 120 then Color.UPTICK
    else if rvolPct <= 60 then Color.LIGHT_GRAY
    else Color.WHITE
);

AddLabel(
    showHUDLabels,
    if isClimaxSell then "▼ SELLING CLIMAX (High Vol Distribution)"
    else if isChurn then "⚡ VOLUME ABSORPTION / CHURN"
    else if isPocketPivot then "★ POCKET PIVOT ACCUMULATION"
    else if isVDU then "○ VOLUME DRY-UP (" + vduStreak + " Bar" + (if vduStreak > 1 then "s" else "") + ")"
    else "• Normal Volume Flow",
    if isClimaxSell then Color.MAGENTA
    else if isChurn then CreateColor(186, 85, 211)
    else if isPocketPivot then CreateColor(0, 255, 127)
    else if isVDU then Color.LIGHT_GRAY
    else Color.DARK_GRAY
);

AddLabel(
    showHUDLabels,
    "50D Vol Avg: " + (if volMA >= 1000000 then Round(volMA / 1000000, 2) + "M" else Round(volMA / 1000, 0) + "k"),
    Color.GRAY
);

# ─────────────────────────────────────────────
# ALERTS
# ─────────────────────────────────────────────
Alert(
    alertOnVDUStreak and isVDUClusterTrigger,
    "Institutional VDU Alert: " + vduStreakThreshold + "+ consecutive Volume Dry-Up bars detected! Floating supply exhausted — watch for breakout!",
    Alert.BAR,
    Sound.Chimes
);
