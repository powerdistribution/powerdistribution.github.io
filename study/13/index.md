---
layout: quiz
title:  13. Lightning Protection
---

# 13. Lightning Protection

## Questions

1. Which of the following can cause damage to distribution equipment?
   Mark all that apply.

   1. Negative cloud-to-ground direct stroke
   2. Positive cloud-to-ground direct stroke
   3. Negative cloud-to-ground stroke 40 ft from a line
   4. Positive cloud-to-ground stroke 40 ft from a line
   5. Intracloud lightning, 2000 ft up

1. Lowering the pole ground resistance at a capacitor bank will help with which of the following (mark all that apply)?

   1. Damage to the capacitor cans
   2. Damage to the capacitor controller
   3. Damage to the capacitor switches
   1. Damage to the arrester

2. Lowering the pole ground resistance at a transformer will help with which of the following (mark all that apply)?

   1. Damage to the transformer
   1. Damage to the arrester
   1. Damage to customer equipment

0. Which is better for transformer protection?
   1. Tank mounted lightning arrester
   1. Arrester on the crossarm
   1. No arrester
   
   
0. Which of the following will be improved with better grounding? Mark
   all that apply.
   
   1. Line flashovers
   1. Transformer failures
   1. Induced voltage flashovers
   1. Fuse operations
   
   
0. On which factor do you select the surge arrester rating? Mark all
   that apply.
   
   1. Surge duty
   1. Grounding
   1. Nominal system voltage
   
0. Better line insulation helps with which of the following? Mark all
   that apply.
   
   1. Induced voltage flashovers
   1. Direct strike flashovers
   1. Lines with a shield wire
   1. Underbuilt circuits
   1. Lines with line-protection arresters 


0. External gaps are recommended to help reduce arrester failures.

   1. True
   1. False

0. Per IEEE C62.22-2009, what is the minimum MCOV for an arrester used
   on a 13.8-kV multigrounded system?
   
   1. 7.65 kV
   2. 8.4 kV
   3. 10.1 kV
   4. 12.7 kV
   4. 15.3 kV

0. Which type of insulation is most dependent on the voltage waveshape
   and duration?
   
   1. Air 
   2. Oil
   3. Cable insulation

0. Which type of insulation is least dependent on the voltage waveshape
   and duration?
   
   1. Air 
   2. Oil
   3. Cable insulation

0. For arresters at the open point of a cable, which type of surge
   rise time is most damaging to the cable system?

   1. Slow rise time
   1. Fast rise time

0. On a three-phase line recloser, how many arresters are needed on
   the structure for adequate protection?

   1. 3
   1. 6


## Problems

0. What is the probability of a negative first stroke that is greater
   than 45 kA? Use the EPRI (1992) approximation on p. 664.

0. What is the probability of a negative first stroke that is greater
   than 45 kA? Use the Anderson-Eriksson model in Table 13.1 on p. 664.

0. In open ground, find the average strikes to an overhead line using
   the Eriksson model. Assume 5 flashes/km^2/year and a line height of
   40 ft.

0. For an underground cable in open ground, find the average strikes
   that attach to that cable per year using the Sunde model. Assume 5
   flashes/km^2/year and 1000 ohm-m soil.

0. On a distribution transformer, calculate the protective margins for
   both BIL and CWW for the following parameters: system voltage =
   12.5 kV, transformer size = 50 kVA, lead length = 4 ft, arrester
   duty cycle rating = 10 kV, arrester LPL = 34 kV. Assume 8 kV/ft of
   lead length.

0. On a distribution transformer with the following parameters,
   calculate the lead length necessary to maintain a protective margin
   for BIL of 50%: system voltage = 34.5 kV, transformer size = 50
   kVA, lead length = 4 ft, arrester duty cycle rating = 10 kV,
   arrester LPL = 34 kV. Assume 8 kV/ft of lead length.

0. Using the enhanced version of the Rusck model proposed by
   Darveniza, find the induced voltage on an overhead line based on
   the following parameters: line height = 40 ft, lightning current =
   25 kA, distance from the line = 50 ft, and earth resistivity = 1000
   ohm-m.


## Projects

0. Visit overhead distribution lines in your area. Find and photograph
   five examples of lightning protection issues, possibly including
   the following:

   - Weak links with lower-than-normal insulation
   - Long arrester lead lengths
   - Other arrester issues like blown disconnects

0. Use EMTP or another transient program to model a lightning strike
   to a distribution line as in Figure 13.38. Evaluate the impact
   on a pole-mounted controller. Include the following:

   - Model both first strokes and subsequent strokes
   - Model results as a function of the distance between the
     controller and the power transformer (vary between 50 and 500
     ft).
   - Evaluate the impact of both grounds.
   - Evaluate the impact of secondary arresters at the controller.
   - Evaluate the impact of secondary arresters at the control power
     transformer.

0. Write a spreadsheet that calculates protective margins for overhead
   and underground systems. Include all appropriate inputs needed.
