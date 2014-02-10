---
layout: quiz
title:  14. Grounding and Safety
---

# 14. Grounding and Safety

## Questions

1. Per the NESC, do all ground rods on multigrounded systems have to be below 25 ohms?
   
   1. Yes
   2. No
    
2. On an ungrounded system, what voltage will the phase-to-ground voltage rise to for a ground fault?
    
   1. 125%
   2. 150%
   3. 173%

3. Can you be killed by hand-to-hand contact across 20 V?

   1. Yes
   2. Probably
   3. Highly unlikely


    
4. Which soil has the lowest resistivity?

   1. Sand
   2. Clay
   3. Gravel
    
5. For an 8-ft rod in dry sand, what's the most likely resistance to ground?
   
   1. 5 ohms
   2. 50 ohms
   3. 500 ohms
    
6. What's the leading cause of electrical fatalities on distribution circuits?
   
   1. Missing ground
   2. Equipment failure
   3. Human error
    
7. For the top part of a tree touching a 12.5/7.2-kV line, is my life
   at danger with one hand touching the tree?
   
   1. Yes
   2. Probably
   3. Highly unlikely
    
8. If I'm up in a tree cutting a large branch, and it falls into a
   12.5/7.2-kV line, is my life in danger?
   
   1. Yes
   2. Probably
   3. Highly unlikely
    
9. You measure 10 V on a streetlight, and the total harmonic
   distortion is 2%, which is more likely?
   
   1. NEV
   2. Contact voltage
    
0. What's the leading cause of electrical fatalities on distribution
   circuits?
   
   1. Missing grounds
   2. Equipment failure
   3. Human error
    
0. Given two cases of contact voltage, one energized at 20 V and the
   other energized at 5 V, which is the most appropriate response?
    
   1. Both need to be repaired soon.
   2. The 20-V case is urgent; the other can be addressed
      later.
       
0. True/false: manhole events from a primary splice failure may be
   worse in a smaller manhole.
   
   1. True
   2. False
    
0. Why are lockout-tagout failures more of a concern on underground
   distribution?
   
   1. No work-site grounds
   2. Higher fault currents
   3. Confined space
       
0. True/false: vented manhole covers relieve pressures from
   explosions.
   
   1. True
   2. False
    
0. If the available fault current is twice as high, what happens to
   arc flash incident energy?    Assume a 0.2-sec clearing time.
   
   1. Stays the same
   2. About doubles
   3. Almost quadruples (I2t)
       
0. Comparing a 25-kV system to a 12.5-kV system. Which is true
   (assuming the same fault current).
   
   1. 25-kV energy is about 2 times the 12.5-kV energy
   2. 25-kV energy is about equal to the 12.5-kV energy
   3. None of the above
       
0. Which scenario has the worst arc flash hazard?

   1. 480-V transformer secondary compartment with 20 kA
      available fault current
   2. 480-V self-contained meter with 10 kA available fault
      current
       
## Problems

1. Calculate the resistance to ground for a ground rod with a diameter
   of 1/2 in and a length of 10 ft where the soil resistivity is 100
   ohm-m.

0. Calculate the arc flash incident energy using the IEEE 1584
   equations and assumptions for the following conditions:
   
   - 12\.5-kV switchgear
   - 0\.5-sec duration
   - 6-kA fault current
   - 24-in worker distance
    
0. Estimate the maximum duration allowed for arc flash at 12.5-kV with
   8 cal/cm^2 clothing for the following conditions:
   
   - ARCPRO, 2-in arc, 15-in working distance
   - ARCPRO, 15-in arc, 15-in working distance
   - IEEE 1584, 24-in working distance
   - Padmounted switch equation, 24-in working distance
    
0. Calculate the earth fault factor for faults in each of the
   unfaulted phases for both a L-G fault and a L-L-G fault at a
   location 6 miles from the substation for the following two cases:
   
   - 12\.5 kV, 5-MVA, 6% station transformer, 3/0 ACSR with
          a #2 neutral
   - 12\.5 kV, 5-MVA, 6% station transformer, 3/0 ACSR with a
          3/0 neutral
           
0. For the tree resistance diagram in Fig. 14.26, find the body current for these scenarios:
   
   - Case 1: 
     - Hand-to-foot body resistance = 1000 ohms
     - Foot-to-earth resistance = 2000 ohms
     - 25/14.4-kV single-phase contact at 10.8 m
     - Hand contact at 2 m
     - Bark resistance = 50 kohms
   - Case 2: 
     - Hand-to-foot body resistance = 1000 ohms
     - Foot-to-earth resistance = 2000 ohms
     - 25/14.4-kV single-phase contact at 10.8 m
     - Hand contact at 2 m
     - Bark resistance = 0 ohms
   - Case 3: 
     - Hand-to-foot body resistance = 1000 ohms
     - Foot-to-earth resistance = 2000 ohms
     - 25/14.4-kV single-phase contact at 7 m
     - Hand contact at 2 m
     - Bark resistance = 0 ohms
      
0. For a current of 100 mA, what's the duration required for the threshold of defibrillation?


## Projects

1. Ground-fault overvoltages

   Build a model in OpenDSS (or an equivalent tool) that models a
   three-phase mainline with each phase and the neutral modeled
   independently. Apply grounds periodically. Apply a fault near the
   substation. Plot current flows on the neutral and the grounds.
   Compare with idealized equations.
   
   Try these variations:
   - Vary the fault location.
   - Break the neutral connection.
   - Vary the neutral conductor size.
    
2. NEV

   Similar to the previous problem. Build a model in OpenDSS (or an
   equivalent tool) that models a three-phase mainline with each each
   phase and the neutral modeled independently. Apply grounds
   periodically. Apply unbalanced loads. Plot neutral voltages along
   the circuit.
   
   Try these variations:
   - Break the neutral connection.
   - Vary the neutral conductor size.
   - Vary the magnitudes of individual grounds.
   - Apply a L-G fault.
   - Add a capacitor bank, and try to create a resonance. See
     how high the voltage can be with reasonable assumptions.
      
3. Underground personnel protection

   Build a model in OpenDSS (or an equivalent tool) that
   models each cable phase and neutral. Break the cable at
   a splicing location. Install bracket grounds upstream and
   downstream. Apply faults at various locations and evaluate
   all touch potentials at the work site. 
   
   Try these variations:
   - Vary distances of bracket grounds.
   - Instead of bracket grounds, isolate the phases at
     bracket locations.
   - Jumper the neutrals together at the work site.
   - Jumper the neutrals to a ground mat at the work site.
    
4. Arc flash

   Implement an IEEE 1584 calculator in R, Octave, Matlab,
   JavaScript, a spreadsheet, or some other tool.
    
5. Tree contacts

   Build an impedance model of a tree and include various
   contact points to estimate body currents and risks.


