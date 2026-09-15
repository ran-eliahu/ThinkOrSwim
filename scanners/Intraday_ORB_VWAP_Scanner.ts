# ============================================================
# INTRADAY INSTITUTIONAL ORB + VWAP MOMENTUM SCANNER
# Author: Ran Eliahu (@ran-eliahu)
# Platform: TD Ameritrade / Schwab ThinkorSwim (TOS)
# Language: ThinkScript
# Timeframe: 5-minute or 15-minute Intraday Chart (Stock Hacker Native)
#
# Core Strategy & Intraday Edge:
#   Designed for morning momentum day traders (9:45 AM - 11:30 AM EST):
#   1. Opening Range Breakout (ORB): Detects price breaking out of the 
#      first 15-minute / 30-minute high.
#   2. Institutional VWAP Anchor: Price holds strictly above VWAP.
#   3. Relative Volume Ignition (RVOL): Current bar volume surges 
#      >= 2.0x above the 20-bar intraday average.
#   4. Anti-Chasing Safeguard: Price is within 1.5% of the breakout 
#      level to give tight, defined risk against VWAP / OR high.
# ============================================================

# ---- USER INPUTS ----
input orbMinutes = 15;            # Opening range duration (15 or 30 mins)
input rvolThreshold = 1.8;        # Intraday volume surge multiplier
input minPrice = 5.0;
input maxChasePct = 1.5;          # Maximum % above ORB High to avoid chasing
input minIntradayVol = 100000;    # Minimum volume accumulated today

# ---- TIME & SESSION METRICS ----
def isNewDay = GetDay() != GetDay()[1];
def marketOpenTime = 0930;
def orbEndTime = if orbMinutes == 30 then 1000 else 0945;

# Track Opening Range High
def isORBSession = SecondsFromTime(marketOpenTime) >= 0 and SecondsTillTime(orbEndTime) > 0;
def isPostORBSession = SecondsFromTime(orbEndTime) >= 0;

def orbHighTrack = if isNewDay then high else if isORBSession then Max(high, orbHighTrack[1]) else orbHighTrack[1];
def orbHigh = orbHighTrack;

# ---- VWAP CALCULATION ----
def vwapVal = reference VWAP()."VWAP";
def aboveVwap = close >= vwapVal;

# ---- INTRADAY RELATIVE VOLUME ----
def avgBarVol = Average(volume, 20);
def rvolSurge = volume >= (avgBarVol * rvolThreshold);

# ---- ORB BREAKOUT TRIGGER ----
# Price crossing above or recently breaking OR High in the post-ORB window
def crossesORBHigh = close crosses above orbHigh or (close > orbHigh and close[1] <= orbHigh);
def isHoldingBreakout = (close >= orbHigh) and (close <= orbHigh * (1 + maxChasePct / 100));

# ---- MOMENTUM CONFIRMATION ----
def fastEma = ExpAverage(close, 9);
def slowEma = ExpAverage(close, 21);
def intradayTrendUp = fastEma > slowEma and close >= fastEma;

# ---- COMBINED SCAN TRIGGER ----
plot IntradayORB_Signal = isPostORBSession 
                          and aboveVwap 
                          and isHoldingBreakout 
                          and rvolSurge 
                          and intradayTrendUp 
                          and (close >= minPrice);

# ---- FORMATTING ----
IntradayORB_Signal.AssignValueColor(Color.UPTICK);
IntradayORB_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
