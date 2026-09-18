# ============================================================
# SMART MONEY FAIR VALUE GAP (FVG) & IMBALANCE STUDY
# Author: Ran Eliahu | github.com/ran-eliahu
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Chart Type: Upper Study (Shaded Price Imbalance Zones & Alerts)
# Timeframe: Recommended for Daily, Weekly, 15m, 65m
#
# Description:
#   Identifies Smart Money Fair Value Gaps (FVG) — 3-bar liquidity
#   imbalance voids created by aggressive institutional displacement.
#   These zones act as high-probability dynamic magnetic support / resistance.
#
# Visual Features:
#   - 🟩 Green Cloud: Bullish FVG (Demand Imbalance Void)
#   - 🟥 Red Cloud: Bearish FVG (Supply Imbalance Void)
#   - Automatic Mitigation: Zones fade once price closes through them
#   - HUD Label & Alerts on Imbalance Retest
# ============================================================

declare upper;

# ─────────────────────────────────────────────
# INPUTS
# ─────────────────────────────────────────────
input minGapAtrRatio   = 0.15;     # Minimum gap size relative to ATR(14)
input showBullishFVG   = yes;      # Display Bullish Demand FVGs
input showBearishFVG   = yes;      # Display Bearish Supply FVGs
input showBubbles      = yes;      # Show "Bull FVG" / "Bear FVG" text bubbles
input showMitigation   = yes;      # Flag when an FVG has been filled/mitigated
input alertOnRetest    = no;       # Trigger TOS alert when price enters active FVG

# ─────────────────────────────────────────────
# CORE CALCULATIONS & IMBALANCE DETECTION
# ─────────────────────────────────────────────
def atr = Average(TrueRange(high, close, low), 14);
def minGap = atr * minGapAtrRatio;

# 1. Bullish FVG: Bar 1 High < Bar 3 Low with green displacement bar
def isBullFVG_Raw = (low > high[2]) and ((low - high[2]) >= minGap) and (close[1] > open[1]);

# 2. Bearish FVG: Bar 1 Low > Bar 3 High with red displacement bar
def isBearFVG_Raw = (high < low[2]) and ((low[2] - high) >= minGap) and (close[1] < open[1]);

# Active Zone Tracking (Most Recent Active Gaps)
rec bullTop = if isBullFVG_Raw then low else if close < bullTop[1] and close < bullBot[1] then Double.NaN else bullTop[1];
rec bullBot = if isBullFVG_Raw then high[2] else if close < bullBot[1] then Double.NaN else bullBot[1];

rec bearTop = if isBearFVG_Raw then low[2] else if close > bearTop[1] then Double.NaN else bearTop[1];
rec bearBot = if isBearFVG_Raw then high else if close > bearTop[1] and close > bearBot[1] then Double.NaN else bearBot[1];

# Mitigation Detection
def bullMitigated = !IsNaN(bullBot[1]) and IsNaN(bullBot);
def bearMitigated = !IsNaN(bearTop[1]) and IsNaN(bearTop);

# Price inside active FVG
def insideBullFVG = !IsNaN(bullTop) and close <= bullTop and close >= bullBot;
def insideBearFVG = !IsNaN(bearTop) and close <= bearTop and close >= bearBot;

# ─────────────────────────────────────────────
# PLOTS — BULLISH FVG BOUNDARIES
# ─────────────────────────────────────────────
plot Bull_Top = if showBullishFVG and !IsNaN(bullTop) then bullTop else Double.NaN;
Bull_Top.SetDefaultColor(CreateColor(46, 139, 87)); # SeaGreen
Bull_Top.SetLineWeight(1);
Bull_Top.SetStyle(Curve.SHORT_DASH);
Bull_Top.HideBubble();
Bull_Top.HideTitle();

plot Bull_Bot = if showBullishFVG and !IsNaN(bullBot) then bullBot else Double.NaN;
Bull_Bot.SetDefaultColor(CreateColor(46, 139, 87));
Bull_Bot.SetLineWeight(1);
Bull_Bot.SetStyle(Curve.SHORT_DASH);
Bull_Bot.HideBubble();
Bull_Bot.HideTitle();

# ─────────────────────────────────────────────
# PLOTS — BEARISH FVG BOUNDARIES
# ─────────────────────────────────────────────
plot Bear_Top = if showBearishFVG and !IsNaN(bearTop) then bearTop else Double.NaN;
Bear_Top.SetDefaultColor(CreateColor(205, 92, 92)); # IndianRed
Bear_Top.SetLineWeight(1);
Bear_Top.SetStyle(Curve.SHORT_DASH);
Bear_Top.HideBubble();
Bear_Top.HideTitle();

plot Bear_Bot = if showBearishFVG and !IsNaN(bearBot) then bearBot else Double.NaN;
Bear_Bot.SetDefaultColor(CreateColor(205, 92, 92));
Bear_Bot.SetLineWeight(1);
Bear_Bot.SetStyle(Curve.SHORT_DASH);
Bear_Bot.HideBubble();
Bear_Bot.HideTitle();

# ─────────────────────────────────────────────
# CLOUDS — ZONE FILLS
# ─────────────────────────────────────────────
DefineGlobalColor("BullFVG_Cloud", CreateColor(34, 139, 34));
DefineGlobalColor("BearFVG_Cloud", CreateColor(178, 34, 34));

AddCloud(
    if showBullishFVG then Bull_Top else Double.NaN,
    if showBullishFVG then Bull_Bot else Double.NaN,
    GlobalColor("BullFVG_Cloud"),
    GlobalColor("BullFVG_Cloud")
);

AddCloud(
    if showBearishFVG then Bear_Top else Double.NaN,
    if showBearishFVG then Bear_Bot else Double.NaN,
    GlobalColor("BearFVG_Cloud"),
    GlobalColor("BearFVG_Cloud")
);

# ─────────────────────────────────────────────
# BUBBLES
# ─────────────────────────────────────────────
AddChartBubble(
    showBubbles and showBullishFVG and isBullFVG_Raw,
    low,
    "Bull FVG\n$" + Round(high[2], 2) + " - $" + Round(low, 2),
    Color.GREEN,
    no
);

AddChartBubble(
    showBubbles and showBearishFVG and isBearFVG_Raw,
    high,
    "Bear FVG\n$" + Round(high, 2) + " - $" + Round(low[2], 2),
    Color.RED,
    yes
);

AddChartBubble(
    showMitigation and bullMitigated,
    low,
    "Bull FVG Filled",
    Color.GRAY,
    no
);

AddChartBubble(
    showMitigation and bearMitigated,
    high,
    "Bear FVG Filled",
    Color.GRAY,
    yes
);

# ─────────────────────────────────────────────
# HUD LABELS & ALERTS
# ─────────────────────────────────────────────
AddLabel(
    !IsNaN(bullTop),
    "Active Bull FVG: $" + Round(bullBot, 2) + " - $" + Round(bullTop, 2),
    if insideBullFVG then Color.CYAN else Color.GREEN
);

AddLabel(
    !IsNaN(bearTop),
    "Active Bear FVG: $" + Round(bearBot, 2) + " - $" + Round(bearTop, 2),
    if insideBearFVG then Color.MAGENTA else Color.RED
);

Alert(
    alertOnRetest and insideBullFVG and !insideBullFVG[1],
    "Price retesting Bullish FVG Demand Imbalance — watch for bounce!",
    Alert.BAR,
    Sound.Chimes
);

Alert(
    alertOnRetest and insideBearFVG and !insideBearFVG[1],
    "Price retesting Bearish FVG Supply Imbalance — watch for resistance!",
    Alert.BAR,
    Sound.Bell
);
