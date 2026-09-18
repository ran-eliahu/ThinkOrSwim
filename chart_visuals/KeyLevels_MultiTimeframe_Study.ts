# ============================================================
# MULTI-TIMEFRAME KEY STRUCTURAL LEVELS & BALANCE ENGINE
# Author: Ran Eliahu | github.com/ran-eliahu
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Chart Type: Upper Study (Horizontal Levels & HUD)
# Timeframe: Daily, Weekly, or Intraday (5m, 15m, 65m)
#
# Description:
#   Automatically tracks and plots critical institutional reference levels:
#     1. Previous Week High (PWH) & Previous Week Low (PWL)
#     2. Current Week Open (Weekly Bias Demarcation)
#     3. Previous Month High (PMH) & Previous Month Low (PML)
#     4. Optional Prior Week Balance Area Shading
#
#   Zero-lag mathematical formulation without TOS secondary aggregation
#   errors, working smoothly across all chart timeframes.
# ============================================================

declare upper;

# ─────────────────────────────────────────────
# INPUTS
# ─────────────────────────────────────────────
input showWeekOpen         = yes;       # Show Current Week Open line
input showPrevWeekLevels   = yes;       # Show Previous Week High / Low (PWH / PWL)
input showPrevMonthLevels  = yes;       # Show Previous Month High / Low (PMH / PML)
input showPrevWeekCloud    = yes;       # Shade the Previous Week Balance Area
input showHUDLabels        = yes;       # Display Weekly / Monthly posture HUD
input showBubbles          = yes;       # Show level name bubbles at transition bars

# ─────────────────────────────────────────────
# WEEKLY LEVEL CALCULATIONS
# ─────────────────────────────────────────────
def isNewWeek = GetWeek() != GetWeek()[1];

rec curWeekOpen = if isNewWeek then open else curWeekOpen[1];
rec curWeekHigh = if isNewWeek then high else if high > curWeekHigh[1] then high else curWeekHigh[1];
rec curWeekLow  = if isNewWeek then low  else if low < curWeekLow[1]   then low  else curWeekLow[1];

rec pwh = if isNewWeek then curWeekHigh[1] else pwh[1];
rec pwl = if isNewWeek then curWeekLow[1]  else pwl[1];
rec pwc = if isNewWeek then close[1]       else pwc[1];

# ─────────────────────────────────────────────
# MONTHLY LEVEL CALCULATIONS
# ─────────────────────────────────────────────
def isNewMonth = GetMonth() != GetMonth()[1];

rec curMonthHigh = if isNewMonth then high else if high > curMonthHigh[1] then high else curMonthHigh[1];
rec curMonthLow  = if isNewMonth then low  else if low < curMonthLow[1]   then low  else curMonthLow[1];

rec pmh = if isNewMonth then curMonthHigh[1] else pmh[1];
rec pml = if isNewMonth then curMonthLow[1]  else pml[1];

# ─────────────────────────────────────────────
# PLOTS — WEEKLY LEVELS
# ─────────────────────────────────────────────
plot WeekOpenLine = if showWeekOpen and curWeekOpen > 0 then curWeekOpen else Double.NaN;
WeekOpenLine.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
WeekOpenLine.SetDefaultColor(Color.YELLOW);
WeekOpenLine.SetLineWeight(2);
WeekOpenLine.SetStyle(Curve.LONG_DASH);
WeekOpenLine.HideBubble();
WeekOpenLine.HideTitle();

plot PWH_Line = if showPrevWeekLevels and pwh > 0 then pwh else Double.NaN;
PWH_Line.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
PWH_Line.SetDefaultColor(Color.CYAN);
PWH_Line.SetLineWeight(2);
PWH_Line.HideBubble();
PWH_Line.HideTitle();

plot PWL_Line = if showPrevWeekLevels and pwl > 0 then pwl else Double.NaN;
PWL_Line.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
PWL_Line.SetDefaultColor(Color.CYAN);
PWL_Line.SetLineWeight(2);
PWL_Line.HideBubble();
PWL_Line.HideTitle();

# ─────────────────────────────────────────────
# PLOTS — MONTHLY LEVELS
# ─────────────────────────────────────────────
plot PMH_Line = if showPrevMonthLevels and pmh > 0 then pmh else Double.NaN;
PMH_Line.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
PMH_Line.SetDefaultColor(Color.MAGENTA);
PMH_Line.SetLineWeight(1);
PMH_Line.SetStyle(Curve.SHORT_DASH);
PMH_Line.HideBubble();
PMH_Line.HideTitle();

plot PML_Line = if showPrevMonthLevels and pml > 0 then pml else Double.NaN;
PML_Line.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
PML_Line.SetDefaultColor(Color.MAGENTA);
PML_Line.SetLineWeight(1);
PML_Line.SetStyle(Curve.SHORT_DASH);
PML_Line.HideBubble();
PML_Line.HideTitle();

# ─────────────────────────────────────────────
# PRIOR WEEK BALANCE CLOUD
# ─────────────────────────────────────────────
DefineGlobalColor("PriorWeekBalance", CreateColor(30, 35, 45)); # Subtle Slate Navy
AddCloud(
    if showPrevWeekCloud then PWH_Line else Double.NaN,
    if showPrevWeekCloud then PWL_Line else Double.NaN,
    GlobalColor("PriorWeekBalance"),
    GlobalColor("PriorWeekBalance")
);

# ─────────────────────────────────────────────
# LABELS & BUBBLES
# ─────────────────────────────────────────────
AddChartBubble(
    showBubbles and isNewWeek,
    curWeekOpen,
    "Week Open",
    Color.YELLOW,
    no
);

AddChartBubble(
    showBubbles and isNewWeek and pwh > 0,
    pwh,
    "PWH: " + Round(pwh, 2),
    Color.CYAN,
    yes
);

AddChartBubble(
    showBubbles and isNewWeek and pwl > 0,
    pwl,
    "PWL: " + Round(pwl, 2),
    Color.CYAN,
    no
);

# ─────────────────────────────────────────────
# HUD DASHBOARD
# ─────────────────────────────────────────────
def pctFromWeekOpen = if curWeekOpen > 0 then ((close - curWeekOpen) / curWeekOpen) * 100 else 0;

AddLabel(
    showHUDLabels and curWeekOpen > 0,
    "Week Bias: " + (if close >= curWeekOpen then "BULLISH (" else "BEARISH (") + (if pctFromWeekOpen >= 0 then "+" else "") + Round(pctFromWeekOpen, 2) + "% vs W.Open)",
    if close >= curWeekOpen then Color.GREEN else Color.RED
);

AddLabel(
    showHUDLabels and pwh > 0 and pwl > 0,
    if close > pwh then "Above PWH (Expansion Breakout)"
    else if close < pwl then "Below PWL (Expansion Breakdown)"
    else "Inside Prior Week Balance",
    if close > pwh then Color.CYAN
    else if close < pwl then Color.ORANGE
    else Color.LIGHT_GRAY
);
