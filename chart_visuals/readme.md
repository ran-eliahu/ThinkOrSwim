# 📦 ThinkorSwim Institutional Chart Visual Studies Suite

> **Author:** Ran Eliahu | [github.com/ran-eliahu](https://github.com/ran-eliahu)  
> **Platform:** TD Ameritrade / Schwab ThinkorSwim (TOS)  
> **Language:** ThinkScript  
> **Timeframes:** Daily, Weekly, Intraday (5m, 15m, 65m)

---

## 📁 Files in This Folder

| Study File | Type | Description |
| :--- | :--- | :--- |
| **`RS_Line_NewHigh_Study.ts`** | Upper / HUD | William O'Neil / Mark Minervini Relative Strength (RS) Line + **Blue Dot** RS New Highs vs SPY/QQQ. |
| **`Institutional_Trend_Ribbon_Study.ts`** | Upper / Clouds | Qullamaggie / Minervini 10/20 EMA ribbon cloud with **Dynamic Candle Colors** for Power Trends & Pullback Buy Zones. |
| **`KeyLevels_MultiTimeframe_Study.ts`** | Upper / Levels | Multi-Timeframe Structural Levels: Current Week Open, Prior Week High/Low (PWH/PWL), and Prior Month High/Low (PMH/PML). |
| **`FairValueGap_FVG_Study.ts`** | Upper / Shading | Smart Money Concepts (SMC) 3-bar liquidity imbalance voids with auto-mitigation and retest alerts. |
| **`Institutional_Volume_Footprint_Study.ts`** | Lower / Volume | Volume Spread Analysis (VSA) classifying Pocket Pivots (Emerald), Volume Dry-Up / VDU (Silver), Churn (Violet), and Climax (Magenta). |
| **`OrderBlock_Study.ts`** | Upper / Shading | Institutional Supply & Demand Order Blocks with mitigation tracking and alert triggers. |
| **`Multi_Timeframe_POC_Study.ts`** | Upper / Magnet | Multi-Timeframe Volume Profile Point of Control (POC) magnetic target levels (Daily, Weekly, Monthly). |

---

## 🧠 Study Overview & Visual Mechanics

### 1. 🟦 Relative Strength (RS) Line & Blue Dot New High Study
**File:** `RS_Line_NewHigh_Study.ts`  
**Core Logic:** Computes the direct alpha ratio (`Close / Benchmark_Close`). True institutional leaders print new RS highs **weeks or days before nominal price breaks out** of its consolidation base.

* **Visual Indicators:**
  - 🔵 **Cyan Dot (Blue Dot):** Plotted right above the candle when the RS line prints a new 20-, 50-, or 252-day high.
  - 🟡 **Yellow Arrow:** Signals **Alpha Divergence** (RS breaking out while price is still consolidating).
  - 🏷️ **HUD Label:** Displays Benchmark, RS Trend status, and 20D/60D Alpha Spread % in real time.

---

### 2. 🌊 Institutional Trend Ribbon & Pullback Engine
**File:** `Institutional_Trend_Ribbon_Study.ts`  
**Core Logic:** Synthesizes the moving average framework of Kristjan Qullamaggie and Mark Minervini (10 EMA, 20 EMA, 50 SMA, 200 SMA) into a zero-clutter trend ribbon and dynamic bar coloring system.

* **Visual Colors:**
  - 🟢 **Bright Green Bars:** **Power Trend** ($Price > 10\text{ EMA} > 20\text{ EMA} > 50\text{ SMA} > 200\text{ SMA}$).
  - 🟡 **Cyan Bars:** **Low-Risk Pullback Sweet Spot** (Price pulling back to test the 10/20 EMA shelf in an established uptrend).
  - 🟣 **Magenta Bars:** **Extended / Climax** ($> 2.5\text{ ATR}$ above 10 EMA — take profits, avoid FOMO).
  - 🔴 **Dark Red Bars:** **Stage 4 Distribution** (Price below 50 SMA and 10 EMA < 20 EMA).
  - ⚫ **Dark Gray Bars:** Neutral / Consolidation.

---

### 3. 🎯 Multi-Timeframe Key Structural Levels & Balance
**File:** `KeyLevels_MultiTimeframe_Study.ts`  
**Core Logic:** High-timeframe market balance boundaries govern institutional order flow, algo stops, and mean reversion without any secondary aggregation crashes.

* **Visual Lines & Clouds:**
  - 🟨 **Yellow Dashed Line:** **Current Week Open** (Above = Bullish weekly posture; Below = Bearish weekly posture).
  - 🟦 **Cyan Lines:** **Previous Week High (PWH)** & **Previous Week Low (PWL)** (Breakout vs. Turtle Soup false breakdown inflection levels).
  - 🟪 **Magenta Dashed Lines:** **Previous Month High (PMH)** & **Previous Month Low (PML)**.
  - ☁️ **Slate Cloud:** Shaded Previous Week Balance Area.

---

### 4. 🧲 Smart Money Fair Value Gap (FVG) Imbalance
**File:** `FairValueGap_FVG_Study.ts`  
**Core Logic:** Detects 3-bar price sequence imbalances where violent institutional displacement leaves unfilled liquidity voids.

* **Visual Features:**
  - 🟩 **Green Cloud:** Bullish FVG (Demand Imbalance — acts as magnetic bounce support).
  - 🟥 **Red Cloud:** Bearish FVG (Supply Imbalance — acts as dynamic overhead resistance).
  - ⚪ **Auto-Mitigation:** The moment price trades through and fills the imbalance, the zone is flagged as "Mitigated" and clears automatically.

---

### 5. 📊 Institutional Volume Footprint & VDU
**File:** `Institutional_Volume_Footprint_Study.ts`  
**Core Logic:** Replaces ordinary red/green volume with institutional volume intent classification.

* **Visual Colors:**
  - 🟩 **Emerald Green Bar + Dot:** **Pocket Pivot** (Volume exceeds highest down-volume of prior 10 days while riding 10 EMA or 50 SMA).
  - ⚪ **Silver / Light Gray Bar:** **Volume Dry-Up (VDU)** (Volume $\le 60\%$ of 50-day average — supply exhaustion).
  - 🟪 **Violet / Purple Bar:** **Institutional Churn / Absorption** (Massive volume with narrow price spread).
  - 🟥 **Magenta Bar:** **Selling Climax** (Excessive volume distribution).

---

### 6. 📦 Order Block Study (Bull & Bear OBs)
**File:** `OrderBlock_Study.ts`  
**Core Logic:** Detects the last down-candle before an impulsive rally (Bull OB) or last up-candle before an impulsive drop (Bear OB). Provides entry zones, retest alerts, and mitigation labels.

---

### 7. 🧲 Multi-Timeframe Point of Control (POC) Magnets
**File:** `Multi_Timeframe_POC_Study.ts`  
**Core Logic:** Plots the Volume Profile Point of Control for Daily (Cyan), Weekly (Magenta), and Monthly (Yellow) periods. High-volume nodes that act as institutional price magnets.

---

## 🚀 How to Install in ThinkorSwim

1. Open **ThinkorSwim** → Navigate to **Charts**.
2. Click the **Studies** beaker icon → **Edit Studies...**
3. Click **Create...** (bottom left).
4. Copy the entire contents of any `.ts` file in this folder and paste into the editor.
5. Name the study (e.g. `RS_Line_NewHigh_Study` or `Institutional_Trend_Ribbon_Study`) and click **OK**.
6. Apply to your chart layout and adjust input parameters to your preference!

---

*Part of the [ran-eliahu/ThinkOrSwim](https://github.com/ran-eliahu/ThinkOrSwim) repository*
