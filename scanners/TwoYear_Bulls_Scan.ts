# ============================================================
# 2-YEAR BULLS SCAN
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: Weekly (W) (Stock Hacker Custom Filter)
#
# Strategy:
#   Filters for secular long-term bull market leaders that have 
#   appreciated by at least 50% over a 2-year (104-week) lookback period.
# ============================================================

input lookbackWeeks = 104; # 52 weeks x 2 = 2 calendar years
input minPercentGain = 50.0;

def pastPrice = close[lookbackWeeks];
def pctGain = if pastPrice > 0 then ((close - pastPrice) / pastPrice) * 100 else 0;

plot Signal = pastPrice > 0 and pctGain >= minPercentGain;

Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_POINTS);
Signal.SetDefaultColor(Color.UPTICK);
Signal.HideBubble();
Signal.HideTitle();
