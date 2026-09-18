# ============================================================
# RELATIVE STRENGTH (RS) LINE & BLUE DOT NEW HIGH STUDY
# Author: Ran Eliahu | github.com/ran-eliahu
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Chart Type: Upper Study (Price Overlay & HUD)
# Timeframe: Recommended for Daily and Weekly
#
# Description:
#   Implements the legendary William O'Neil / Mark Minervini 
#   Relative Strength (RS) leadership visual indicator.
#   Identifies true institutional market leaders that make new
#   RS highs BEFORE nominal price breaks out of its consolidation base.
#
# Key Features:
#   - Blue Dot / Cyan Star plotted above candles hitting new RS highs
#   - RS Alpha Divergence detection (RS breaking out while price consolidates)
#   - Real-time HUD Dashboard displaying Alpha Spread %, RS MA Trend, and Leadership Tier
# ============================================================

declare upper;

# ─────────────────────────────────────────────
# INPUTS
# ─────────────────────────────────────────────
input benchmark              = "SPY";       # Benchmark symbol (e.g., SPY, QQQ, IWM)
input rsLookback             = 20;          # Period for RS New High detection (e.g. 20, 50, 252)
input rsMaLength             = 50;          # Moving average length for RS trend filter
input showBlueDots           = yes;         # Plot Cyan dots on candles with RS New Highs
input showDivergenceMarkers  = yes;         # Show specific markers when RS leads price
input showHUDLabels          = yes;         # Display live Alpha HUD metrics in top-left
input alertOnRSNewHigh       = no;          # Trigger TOS alert when stock prints a new RS High

# ─────────────────────────────────────────────
# CORE CALCULATIONS
# ─────────────────────────────────────────────
def benchClose = close(symbol = benchmark);
def hasBench = !IsNaN(benchClose) and benchClose > 0;

# Pure Relative Strength Ratio (Stock / Benchmark)
def rsRatio = if hasBench then close / benchClose else 1;
def rsMA    = Average(rsRatio, rsMaLength);

# Highest RS over lookback period
def highestRS = Highest(rsRatio, rsLookback);
def isRSNewHigh = rsRatio >= highestRS;

# Nominal Price Highest High over same period
def highestPrice = Highest(high, rsLookback);
def isPriceNewHigh = high >= highestPrice;

# True Alpha Divergence: RS is printing fresh highs while nominal price is still coiled below prior high
def isAlphaDivergence = isRSNewHigh and !isPriceNewHigh;

# Rate of Change (ROC) Calculations for Alpha Spread
def stockROC20 = if close[20] > 0 then ((close - close[20]) / close[20]) * 100 else 0;
def benchROC20 = if benchClose[20] > 0 then ((benchClose - benchClose[20]) / benchClose[20]) * 100 else 0;
def alphaSpread20 = stockROC20 - benchROC20;

def stockROC60 = if close[60] > 0 then ((close - close[60]) / close[60]) * 100 else 0;
def benchROC60 = if benchClose[60] > 0 then ((benchClose - benchClose[60]) / benchClose[60]) * 100 else 0;
def alphaSpread60 = stockROC60 - benchROC60;

# Average True Range for clean marker offsets
def atr = Average(TrueRange(high, close, low), 14);

# ─────────────────────────────────────────────
# PLOTS — BLUE DOT / CYAN RS NEW HIGH MARKER
# ─────────────────────────────────────────────
plot RS_NewHigh_Dot = if showBlueDots and isRSNewHigh then high + (atr * 0.45) else Double.NaN;
RS_NewHigh_Dot.SetPaintingStrategy(PaintingStrategy.POINTS);
RS_NewHigh_Dot.SetLineWeight(4);
RS_NewHigh_Dot.SetDefaultColor(Color.CYAN);
RS_NewHigh_Dot.HideBubble();
RS_NewHigh_Dot.HideTitle();

plot RS_Divergence_Arrow = if showDivergenceMarkers and isAlphaDivergence then high + (atr * 0.75) else Double.NaN;
RS_Divergence_Arrow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
RS_Divergence_Arrow.SetLineWeight(2);
RS_Divergence_Arrow.SetDefaultColor(Color.YELLOW);
RS_Divergence_Arrow.HideBubble();
RS_Divergence_Arrow.HideTitle();

# ─────────────────────────────────────────────
# CHART BUBBLES
# ─────────────────────────────────────────────
AddChartBubble(
    showDivergenceMarkers and isAlphaDivergence and !isAlphaDivergence[1],
    high + (atr * 0.8),
    "RS Alpha Lead",
    Color.CYAN,
    yes
);

# ─────────────────────────────────────────────
# HUD DASHBOARD LABELS
# ─────────────────────────────────────────────
AddLabel(
    showHUDLabels,
    "Benchmark: " + benchmark,
    Color.GRAY
);

AddLabel(
    showHUDLabels,
    if isRSNewHigh then "★ RS " + rsLookback + "D NEW HIGH"
    else if rsRatio > rsMA then "RS Trend: Bullish (Above " + rsMaLength + " MA)"
    else "RS Trend: Lagging",
    if isRSNewHigh then Color.CYAN
    else if rsRatio > rsMA then Color.GREEN
    else Color.DARK_GRAY
);

AddLabel(
    showHUDLabels,
    "20D Alpha: " + (if alphaSpread20 >= 0 then "+" else "") + Round(alphaSpread20, 1) + "%",
    if alphaSpread20 > 5 then Color.UPTICK
    else if alphaSpread20 < -5 then Color.DOWNTICK
    else Color.LIGHT_GRAY
);

AddLabel(
    showHUDLabels,
    "60D Alpha: " + (if alphaSpread60 >= 0 then "+" else "") + Round(alphaSpread60, 1) + "%",
    if alphaSpread60 > 10 then Color.UPTICK
    else if alphaSpread60 < -10 then Color.DOWNTICK
    else Color.LIGHT_GRAY
);

# ─────────────────────────────────────────────
# ALERTS
# ─────────────────────────────────────────────
Alert(
    alertOnRSNewHigh and isRSNewHigh and !isRSNewHigh[1],
    "RS Line printed a NEW HIGH vs " + benchmark + " — Institutional Outperformance!",
    Alert.BAR,
    Sound.Ding
);
