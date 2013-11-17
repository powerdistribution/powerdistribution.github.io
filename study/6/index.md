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
   
0. Conservation voltage reduction provides the most energy savings in
   which season?
   
   1. Fall
   2. Winter
   3. Summer
   
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

0. Where must a 100-A lumped load be placed on a line to cause the
   same losses as a 100-A uniformly distributed load?
   1. 1/3
   1. 1/2
   1. 2/3
   1. End of feeder


## Problems

1. LDC settings problem

2. Regulator sizing problem

3. Regulator locating problem
          
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



