---
layout: quiz
title:  6. Voltage Regulation
---

# 6. Voltage Regulation

## Questions

0. On overhead distribution primaries, which of the following is
   responsible for the most voltage drop?
   
   1. Resistance
   2. Reactance
   
0. On overhead distribution secondaries, which of the following is
   responsible for the most voltage drop?
   
   1. Resistance
   2. Reactance
   
0. Mark any of the following that are ANSI C84 Range-A voltage violations.
   
   1. 120/240-V customer service voltage = 253 V
   1. 120/240-V customer service voltage = 115 V (on one leg)
   1. 480-V customer service voltage = 0.8 per unit for 10 cycles (a
      voltage sag)
   1. Primary voltage at the substation = 127 V on a 120-V base
   
0. Conservation voltage reduction provides the most energy savings in
   which season?
   
   1. Fall
   2. Winter
   3. Summer
   
0. Conservation voltage reduction provides energy savings for which of
   the following? Mark all that apply.
   
   1. Distribution transformer no-load losses
   1. Distribution transformer load losses
   2. Air conditioning load
   3. Utility line losses
   3. Lighting load
   
0. Conservation voltage reduction has most energy savings on which
   type of device?
   
   1. Compact fluorescents
   2. Computer power supplies
   3. LED lights
   
0. Which capacitor control should you avoid with conservation voltage
   reduction?
   
   1. Local voltage control
   2. Local var control
   3. Remote DMS control

0. Which line-drop compensation settings method works best with large
   switched capacitors downstream?

   1. Load-center compensation
   1. Voltage-spread compensation
   1. Zero-reactance compensation

0. For two regulators in series, which of the following do we want?

   1. A time delay on the upstream regulator that is slower than that
      on the downstream regulator
   1. Equal time delay settings
   1. A time delay on the upstream regulator that is faster than that
      on the downstream regulator

## Problems

0. For a voltage regulator in the following scenario, find the
controlled voltage from the regulator on a 120-V base.

   - V<sub>set</sub> = 122 V
   - R = 4 V
   - X = 8 V
   - Load = 600 kW and 300 kvar
   - Regulator rating = 200 A
   - V = 7.2 kV (line to ground)

0. Using the voltage-spread compensation method, find *R* and *X*
   settings for line drop compensation for the following situation:

   - Load power factor = 0.9
   - Regulator rating = 400 A
   - Voltage range = 119 to 126 V
   - lTC control *X*/*R* = 0.5
   - Minimum load current = 50 A
   - Maximum load current = 200 A

   Repeat using the zero reactance method.

0. Consider a circuit with a line *X*/*R* ratio = 2 and a load power
   factor = 0.8. For a load with a CVRf<sub>watts</sub> = 0.9 and a
   CVRf<sub>vars</sub> = 4.0, find the following for a 3% reduction in
   voltage at the load:

   - Percentage change in line losses
   - Percentage change in real power consumed by the load
   - Percentage change in reactive power consumed by the load

   Repeat all of the above assuming 50% constant-power load and 50%
   constant-impedance load.

0. Consider a 12.5-kV express circuit that is four miles long with
   350-kcmil AAC construction with Z<sub>1</sub> = 0.0557 + j 0.1242
   ohms/kfeet.

   - Find the voltage drop for a load of 300 A with a power factor =
     0.8.
   - Repeat after adding 2400-kvar of capacitance.
   - Find the amount of capacitance in kvar needed to have zero
     voltage drop.


## Projects

0. Using the
   [IEEE 8500-node test case](http://svn.code.sf.net/p/electricdss/code/trunk/Distrib/IEEETestCases/8500-Node/)
   in OpenDSS, plot the voltage drop profile (voltage along the line
   as a function of distance from the substation). Flatten the voltage
   profile using the following methods:

   1. Balance phases by re-phasing taps.
   1. Add or move capacitor banks. Use 600-kvar banks.
   1. Add voltage regulators.
   1. Reconductor up to 1 mile of line.
  
   Evaluate all options at peak load and 40% load. Make a table of the
   lowest voltage on the primary for each option.

   Implement a voltage reduction algorithm on the base case. Try two
   different approaches to controlling voltage:

   1. Add voltage feedback to each voltage regulator and LTC control
      to keep the most remote primary voltage at 119 V.

   1. Use line-drop compensation on each voltage regulator and LTC
      control to try to keep the most remote primary voltage at 119 V.

   Run an annual hourly (8760 hours) simulation. Use a
   voltage-dependent load with CVR-watts = 0.6 and CVR-vars = 3.0.
   Find the average consumption, line losses, and transformer load and
   no-load losses. Repeat for each of the flattening options
   identified above.



