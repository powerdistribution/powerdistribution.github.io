---
layout: quiz
title:  15. Distributed Generation
---

# 15. Distributed Generation

## Questions

1. True/false: A three-phase synchronous generator will not supply
   fault current when the interface transformer is grounded-wye
   grounded-wye.
   
   1. True
   2. False
    
1. For distribution efficiency, adding distributed generation will do
   which of the following (pick the best answer):
    
   1. Increase losses by 5%
   2. Decrease losses by 5%
   3. Not much difference

1. For a rotating machine, which impedance is most different from the others?
    
   1. X<sub>0</sub>
   1. X<sub>d</sub>''
   1. X<sub>2</sub>

1. For a rotating machine, which impedance is the smallest?
    
   1. X<sub>0</sub>
   1. X<sub>d</sub>
   1. X<sub>d</sub>''
   1. X<sub>2</sub>

1. For a rotating machine, which impedance is the largest?
    
   1. X<sub>0</sub>
   1. X<sub>d</sub>
   1. X<sub>d</sub>''
   1. X<sub>2</sub>

1. True/false: Even if a generator on a distribution system follows
   IEEE 1547-2003, it can affect distribution voltages.
    
   1. True
   1. False

1. True/false: If an interface transformer is grounded-wye
   grounded-wye, effective grounding is assured.
   
   1. True
   2. False
    
1. According to IEEE 1584-2003 criteria, should a generator trip for a
   voltage sag to 60% of nominal on just one phase (line-to-neutral
   measurements) for 0.4 sec?
   
   1. Yes
   2. No
    
1. For a 1-MW generator eight miles out on a 12.5-kV distribution
   system, what option is the most appropriate for reducing voltage
   problems on the distribution circuit?

   1. Operate the generator in a leading power factor
   1. Operate the generator in a lagging power factor
   1. Operate the generator in a voltage regulating mode

1. Which options or changes are sometimes needed for large generators on
   distribution circuits? Mark all that apply.

   1. Transfer trip at the generator for utility breaker operations
   2. Dedicated interface transformer
   3. Auxiliary grounding transformer
   4. Utility voltage regulator changes
   5. Delay reclosing on utility interrupters


## Problems

1. For a 1 MVA generator (Z0 = 5%, Z1 = Zd" = 20%) and a 1.5 MVA
   transformer (Yg - Yg, Z = 6%, X/R = 10) on a 12.5-kV system, find
   the largest size neutral reactor (in ohms) on the generator that
   will still maintain effective grounding.
   
1. Find the fault current at the substation and at the generator for a
   line-to-ground fault on a distribution system with and without a
   distributed generator using the following assumptions:

   - V = 12.5 kV
   - Generator location = 6 mi from the source
   - Fault location = 5 mi from the source
   - Line Z0 = 0.17 + j0.37 ohms/kfeet
   - Line Z1 = 0.09 + j0.13 ohms/kfeet
   - Substation Z1 = Z0 = j0.9 ohms
   - Interconnection transformer:
     - 1500 kVA
     - Z = 6%
     - Grounded wye -- grounded wye
   - Synchronous generator:
     - 1500 kVA
     - Xd" = 25%
     - X2 = 25%
     - X0 = 5%

   Next, try each of these variations separately:

   - Swap the generator and fault locations.
   - Change the transformer interconnection to a grounded wye -- delta.

1. For the generator and transformer characteristics in the previous
   problem, consider the case where one phase opens with a fault
   downstream of the open point. Find the line-to-ground voltage on
   the faulted phase along with the fault current. Find these for the
   following conditions: (1) R<sub>F</sub> = 0.5 ohms and (2)
   R<sub>F</sub> = 5000 ohms.

1. For the circuit and generator characteristics in the problem above
   (#2), determine the ratio of X<sub>C</sub> / X<sub>L</sub> for two
   1200-kvar capacitors one mile from the generator. Will there be
   self excitation in this case?

## Projects

1. opendss - impact on voltage drop and line regulators; 
