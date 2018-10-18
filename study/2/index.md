---
layout: quiz
title:  2. Overhead Lines
---

# 2. Overhead Lines

## Questions

0. Which of the following has the largest resistance?

   1. Spacer cable, 500 kcmil Al
   2. Crossarm construction, 300 kcmil Al
   3. XLPE cable, 1/0 Al
   
0. Which of the following has the largest reactance?

   1. Spacer cable, 500 kcmil Al
   2. Crossarm construction, 300 kcmil Al
   3. XLPE cable, 1/0 Al
   
0. True/false: Conductor resistance increases as temperature decreases.
   
   1. True
   2. False

0. To protect against burndown on covered conductors, arc protective
   devices should be placed where? Mark all that apply.
   
   1. Over the insulation just past the opening on the source side
   2. Butted up against the insulation on the load side
   3. Butted up against the insulation on the source side

0. Which type of fault is most likely to cause conductor slapping.

   1. Line to ground
   2. Line to line
   3. Three phase

0. Mark which of the following are true for conductor slapping?

   1. Problems generally occur downstream of faults, past reclosers.
   2. Higher fault current is worst.
   3. Slack spans may have issues.
   4. Longer spans are worse.
   5. Faster relaying may help.

0. Which has the larger diameter?
   
   1. \#4
   2. \#2

0. Which has the larger diameter?
   
   1. 4/0
   2. 1/0

0. Which has the higher ampacity?
   
   1. 4/0 copper
   2. 4/0 aluminum

0. Which has the lower weight?
   
   1. 4/0 copper
   2. 4/0 aluminum

0. Which of the following may cause radio frequency interference? Mark
   all that apply.

   1. Incorrect conductor tie
   2. Loose crossarm screw
   3. Overloaded transformer
   4. Harmonic resonance
   5. Contaminated insulator

0. True/false: Increased phase separation increases the zero-sequence
   reactance.
   
   1. True
   2. False

0. For a conductor temperature of 90C and an ambient temperature of
   25C, which of the following is true for 336 AAC conductor?
   
   1. Covered conductor has higher ampacity.
   2. Bare conductor has higher ampacity.
   3. Bare and covered have equal ampacity.

0. True/false: Conductor annealing from faults is a function of I<sup>2</sup>t.
   
   1. True
   2. False

0. True/false: Conductor burndown from faults is a function of I<sup>2</sup>t.
   
   1. True
   2. False

0. Mark which of the following are true related to burndowns?

   1. Problems generally occur downstream of faults, past reclosers.
   2. Conductor line hose can protect against burndown.
   3. Fusing taps helps.
   4. Covered wire is worse than bare wire.
   5. Faster relaying may help.
   6. Automatics are susceptable to burndowns.

0. A typical overhead feeder mains positive sequence impedances per mile is:

   1. 0.2 + 0.6j ohms/mile
   1. 0.6 + 0.2j ohms/mile
   1. 0.6 + 0.6j ohms/mile
   1. 0.6 + 2.0j ohms/mile

## Problems

0. If Va = 1.02 &ang;0&deg;, Vb = 1.0 &ang;-119&deg;, and Vc =
   1.01&ang;119&deg;, find V<sub>1</sub>, V<sub>2</sub>, and
   V<sub>0</sub>. Which is larger, V<sub>0</sub> or V<sub>1</sub>?

0. Calculate the current needed for the "typical burndown" case to
   burn down 556 AAC in 0.5 sec.

0. Calculate the current needed to anneal 556 AAC in 0.5 sec.

0. Find the critical conductor slapping times for both 44- and 56-in
   spacings for a span length of 300 ft and a fault current of 4 kA.

0. For 350-kcmil Al conductor with an ampacity of 361 A at an ambient
   temperature of 25C and a conductor temperature of 75C, find the
   ampacity at an ampient temp of 30C and a conductor temperature of 90C.

0. For the following overhead line, find Z<sub>1</sub>, Z<sub>0</sub>, Z<sub>s</sub>, and Z<sub>m</sub> in ohms/1000ft:

   - 4/0 AAC covered phase conductors; x = -2ft, 0ft, 2ft; y = -30ft, 31ft, 30ft
   - 2/0 AAC neutral conductor, x = -0ft, y = -26ft
   - span length = 200 ft
   - conductor temp = 40C
   - earth resistivity = 1000 ohm-m

0. For the parameters in the problem above, find the complete 4x4
   impedance matrix of the circuit in ohms/1000ft. 

0. Using these same line characteristics, calculate the phase voltages
   and the sequence voltages at the load for the following:
   
   - 12.5-kV source with an infinite bus
   - Single load, 8 miles from the substation
   - Load = 300 A per phase
   - Load power factor = 0.9
   - Untransposed line

0. **[OpenDSS]** Repeat the previous question using OpenDSS.
   
0. Consider a double-circuit line with the following characteristics:

```
   a1            b1            c1
   
   
   a2            b2            c2
   
   
   
   
   
                  n
```

   The vertical distance between the phase conductors is 3 ft. The
   horizontal distance between conductors is 4 ft. The neutral is 8 ft
   below b2. 
   
   For an a1-to-n fault that's 4 miles from the substation that draws
   4 kA, calculate the voltage at the fault location on phase a2.
   Assume that circuit 2 is a 12.5-kV circuit, and that circuits 1 and
   2 have the same phasing. Assume no other loading on either circuit.
      

## Projects

0. Ampacity

   Write an ampacity program in R, Matlab, Octave, a spreadsheet, or
   other tool.

0. Impedances

   Write a program to calculate overhead impedances in R, Matlab,
   Octave, a spreadsheet, or other tool.

0. Conductor slapping (challenging)

   Write a program to dynamically model conductor slapping.


