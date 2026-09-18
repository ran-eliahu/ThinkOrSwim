# ============================================================
# INSTITUTIONAL TREND RIBBON & PULLBACK ENGINE
# Author: Ran Eliahu | github.com/ran-eliahu
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Chart Type: Upper Study (Price Overlay, Clouds, & Bar Coloring)
# Timeframe: Recommended for Daily, Weekly, or 65-min/Intraday
#
# Description:
#   Synthesizes the moving average framework of Kristjan Qullamaggie 
#   and Mark Minervini (10 EMA, 20 EMA, 50 SMA, 200 SMA) into a clean,
#   uncluttered visual trend ribbon and smart candle coloring engine.
#
# Visual Color Logic:
#   - 🟢 Bright Green Bars: "Power Trend" (Price > 10 EMA > 20 EMA > 50 SMA > 200 SMA)
#   - 🟡 Cyan Bars: "Low-Risk Pullback Sweet Spot" (Testing 10/20 EMA support shelf in uptrend)
#   - 🟣 Magenta Bars: "Extended / Climax" (> 2.5 ATR above 10 EMA — take profits, avoid FOMO)
#   - 🔴 Dark Red Bars: "Stage 4 Distribution" (Price below 50 SMA and 10 EMA < 20 EMA)
#   - ⚫ Dark Gray Bars: Neutral / Chop / Consolidation
# ============================================================

declare upper;

# ─────────────────────────────────────────────
# INPUTS
# ─────────────────────────────────────────────
input fastEmaLength     = 10;     # Fast Momentum EMA (Default 10)
input slowEmaLength     = 20;     # Base Guide EMA (Default 20)
input baseSmaLength     = 50;     # Institutional Accumulation Line (Default 50)
input trendSmaLength    = 200;    # Long-term Regime Filter (Default 200)
input atrLength         = 14;     # ATR Period for extension bounds
input atrExtensionMult  = 2.5;    # ATR multiplier above 10 EMA considered overextended
input enableBarColors   = yes;    # Color candles dynamically by trend regime
input showRibbonCloud   = yes;    # Display 10/20 EMA cloud shading
input showBaseMAs       = yes;    # Plot 50 SMA and 200 SMA lines
input showHUDLabels     = yes;    # Display Trend Regime HUD label in top-left

# ─────────────────────────────────────────────
# MOVING AVERAGES & ATR
# ─────────────────────────────────────────────
plot FastEMA = ExpAverage(close, fastEmaLength);
FastEMA.SetDefaultColor(Color.YELLOW);
FastEMA.SetLineWeight(2);
FastEMA.HideBubble();
FastEMA.HideTitle();

plot SlowEMA = ExpAverage(close, slowEmaLength);
SlowEMA.SetDefaultColor(CreateColor(255, 140, 0)); # Dark Orange
SlowEMA.SetLineWeight(2);
SlowEMA.HideBubble();
SlowEMA.HideTitle();

plot BaseSMA = if showBaseMAs then Average(close, baseSmaLength) else Double.NaN;
BaseSMA.SetDefaultColor(Color.CYAN);
BaseSMA.SetLineWeight(2);
BaseSMA.SetStyle(Curve.SHORT_DASH);
BaseSMA.HideBubble();
BaseSMA.HideTitle();

plot TrendSMA = if showBaseMAs then Average(close, trendSmaLength) else Double.NaN;
TrendSMA.SetDefaultColor(Color.WHITE);
TrendSMA.SetLineWeight(2);
TrendSMA.SetStyle(Curve.LONG_DASH);
TrendSMA.HideBubble();
TrendSMA.HideTitle();

def atr = Average(TrueRange(high, close, low), atrLength);
def atrPct = if close > 0 then (atr / close) * 100 else 0;

# ─────────────────────────────────────────────
# REGIME DEFINITIONS
# ─────────────────────────────────────────────
def hasTrendSMA = !IsNaN(TrendSMA);
def above200 = if hasTrendSMA then close > TrendSMA else yes;
def maUptrend = FastEMA > SlowEMA and SlowEMA > BaseSMA;
def maDowntrend = FastEMA < SlowEMA and close < BaseSMA;

# 1. Power Trend: Strong uptrend alignment
def isPowerTrend = close > FastEMA and maUptrend and above200;

# 2. Low-Risk Pullback Sweet Spot: Uptrend intact, price dipping to touch 10/20 EMA zone and holding
def isPullback = maUptrend and (low <= FastEMA or low <= SlowEMA) and (close >= SlowEMA * 0.995) and (close >= open);

# 3. Overextended / Climax: Price stretched excessively above the 10 EMA
def isExtended = close > (FastEMA + (atrExtensionMult * atr));

# 4. Distribution / Bearish: Breakdown below key moving averages
def isDistribution = maDowntrend;

# Distance to Fast EMA %
def distToFastEMA = if FastEMA > 0 then ((close - FastEMA) / FastEMA) * 100 else 0;

# ─────────────────────────────────────────────
# RIBBON CLOUD SHADING
# ─────────────────────────────────────────────
DefineGlobalColor("BullCloud", CreateColor(34, 139, 34));   # Forest Green
DefineGlobalColor("BearCloud", CreateColor(178, 34, 34));   # Firebrick Red

AddCloud(
    if showRibbonCloud and FastEMA >= SlowEMA then FastEMA else Double.NaN,
    if showRibbonCloud and FastEMA >= SlowEMA then SlowEMA else Double.NaN,
    GlobalColor("BullCloud"),
    GlobalColor("BullCloud")
);

AddCloud(
    if showRibbonCloud and FastEMA < SlowEMA then SlowEMA else Double.NaN,
    if showRibbonCloud and FastEMA < SlowEMA then FastEMA else Double.NaN,
    GlobalColor("BearCloud"),
    GlobalColor("BearCloud")
);

# ─────────────────────────────────────────────
# DYNAMIC CANDLE BAR COLORING
# ─────────────────────────────────────────────
AssignPriceColor(
    if !enableBarColors then Color.CURRENT
    else if isExtended then Color.MAGENTA
    else if isPullback then Color.CYAN
    else if isPowerTrend then Color.GREEN
    else if isDistribution then Color.DARK_RED
    else Color.DARK_GRAY
);

# ─────────────────────────────────────────────
# HUD DASHBOARD LABELS
# ─────────────────────────────────────────────
AddLabel(
    showHUDLabels,
    if isExtended then "⚡ OVEREXTENDED (+ " + Round(distToFastEMA, 1) + "% from 10 EMA)"
    else if isPullback then "🎯 10/20 EMA PULLBACK BUY ZONE"
    else if isPowerTrend then "★ POWER TREND (10>20>50)"
    else if isDistribution then "▼ STAGE 4 DISTRIBUTION"
    else "• NEUTRAL / CONSOLIDATION",
    if isExtended then Color.MAGENTA
    else if isPullback then Color.CYAN
    else if isPowerTrend then Color.GREEN
    else if isDistribution then Color.DARK_RED
    else Color.DARK_GRAY
);

AddLabel(
    showHUDLabels,
    "ATR: $" + Round(atr, 2) + " (" + Round(atrPct, 1) + "%)",
    Color.LIGHT_GRAY
);

AddLabel(
    showHUDLabels and hasTrendSMA,
    if close > TrendSMA then "200 SMA: Bullish" else "200 SMA: Bearish",
    if close > TrendSMA then Color.UPTICK else Color.DOWNTICK
);
