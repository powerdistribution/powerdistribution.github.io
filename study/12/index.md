---
layout: quiz
title:  12. Other Power Quality Issues
---

# 12. Other Power Quality Issues

## Questions

1. If you have customer equipment damage, and damage appears to be in
   surge protectors, what's a likely cause?

   1. Temporary overvoltages
   2. Inrush into electronics
   3. Reclose transients

2. If you have customer equipment damage, and damage appears to be in
   fuses, what's a likely cause?

   1. Temporary overvoltages
   2. Inrush into electronics
   3. Reclose transients

0.	Capacitor banks:

    1. Cause voltage flicker
    1. Help reduce voltage flicker caused by other loads
    1. Neither

0. A voltage flicker between 123 and 120 V once per second may cause
   complaints.
   
   1. True
   1. False

2. If you have customer equipment damage, and damage appears to be in
   fuses, what's a likely cause?

   1. Temporary overvoltages
   2. Inrush into electronics
   3. Reclose transients

0. Which of the following is most sensitive to temporary overvoltages?
   
   1. Incandescent bulbs
   1. Computers
   1. Clock radios
   1. Surge suppressors

0. Which of the following is least sensitive to temporary overvoltages?
   
   1. Incandescent bulbs
   1. Computers
   1. Clock radios
   1. Surge suppressors

0. Will a series capacitor help reduce voltage flicker from a large
   photovoltaic installation?

   1. Yes
   1. No
   1. It depends on the line impedances

0. Will a static var compensator help reduce voltage flicker from a
   large photovoltaic installation?

   1. Yes
   1. No
   1. It depends on the line impedances

0. Switching surges tend to be worse on higher-voltage distribution systems.

   1. True
   1. False



## Problems

0. On a 12.5-kV system, for a 1200-kvar capacitor bank 5 miles from
   the substation, find the natural switching frequency of the bank in
   hertz. Assume that the line has a positive-sequence reactance of
   0.6 ohms/mi, and the substation has a reactance of 1.0 ohms.

0. For a 900-kvar bank on a 12.5-kV system, how far from the
   substation would the capacitor be to resonate at the seventh
   harmonic? Assume the line has a positive-sequence reactance of 0.6
   ohms per mile and a zero-sequence reactance of 2.1 ohms/mile.

0. For the same assumptions in the previous problem, find the location
   for the capacitor bank to resonate at the ninth harmonic.

0. For a voltage that bounces between 120 and 118 V, find the
   threshold in the time between dips for the flicker to go above the
   GE flicker curve.

0. For each of the following sets of line-to-ground voltages, find the
   percent voltage unbalance and the percent negative-sequence
   voltage:

   1. 120&ang;0&deg;, 118&ang;-120&deg;, 117&ang;120&deg;
   1. 120&ang;5&deg;, 120&ang;-125&deg;, 120&ang;125&deg;
   1. 120&ang;5&deg;, 118&ang;-125&deg;, 117&ang;125&deg;


## Projects

0. Using R, Matlab, Excel, or some other tool, write a routine to
   generate a graph of the resonant frequency of a circuit as a
   function of distance from the substation based on the system
   voltage, the size of the capacitor bank, and the substation and
   line impedances.

0. Using ATP, EMTP-RV, OpenModelica, or another transient tool, model
   the switching of a capacitor bank for the following scenario:

   - Three-phase mainline with 336-kcmil AAC in a horizontal crossarm
     configuration on an 8-ft arm
   - Neutral = 3/0 AAC, 4-ft below the crossarm.
   - Pole height = 40 ft
   - 1200-kvar switched bank, 3 miles from the substation
   - Energize each phase separately

   Find the peak magnitude and predominant frequency for the worst
   switching case.

   Next, repeat the simulation, but put another fixed 1200-kvar bank
   300 ft from the switched bank on the source side.


