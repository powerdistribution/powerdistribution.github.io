---
layout: quiz
title:  10. Reliability
---

# 10. Reliability

## Questions

1. SAIFI on a grid network is most likely to be:

   1. 1\.5/year
   2. 0\.15/year
   3. 0\.015/year
   
1. Given a circuit with a permanent fault rate of 0.2 faults/mi/year,
   which configuration would have the fewest average interruptions
   (assume that the customers are evenly distributed by line length):
   
   1. Mains = 10 miles, 10 laterals each 1-mile long
   2. Mains = 15 miles, 10 laterals each 0.5-mile long
   3. Mains = 10 miles, 20 laterals each 0.5-mile long
   4. Mains = 5 miles, 15 laterals each 1-mile long
   5. Mains = 5 miles, 30 laterals each 0.5-mile long
   
1. If SAIDI excluding storms is 90 minutes/year, what is it most
   likely to be when storms are included?
   
   1. 120 minutes
   2. 300 minutes
   3. 800 minutes
   
1. Adding one midpoint recloser to a circuit without other reclosers
   will reduce SAIFI to what percentage of the original? Assume
   customers and exposure are equal on both halves.
   
   1. 50%
   2. 75%
   3. 66%
   
1. “Riding the line” is an effective way to identify where faults
   occur.
   
   1. True
   2. False
   
1. A utility that classifies an average of 10 days per year as a storm
   for reliability reporting purposes:
   
   1. Is not playing fair
   1. Has good lawyers
   1. Is fudging the data
   1. Can occur with the IEEE beta method

1. Which outage cause is most likely to have repeated operations at a
   location?
   
   1. Lightning
   1. Tree
   1. Animal
   1. Equipment failure

1. Which outage cause is least likely to have repeated operations at a
   location, meaning it's the most random?
   
   1. Lightning
   1. Tree
   1. Animal
   1. Equipment failure

1. What approaches will help avoid issues with regression to the mean
   when evaluating worst circuits or other reliability-centered
   programs? Mark all that apply.

   1. Use a control set to normalize the target data set
   1. Use a longer observation period for the target data set
   1. Exclude the "selection years" from before/after comparisons


## Problems

0. If a customer is fed from two distribution sources, find SAIFI and
   SAIDI for the customer if one circuit has SAIFI = 1.2/yr and SAIDI
   = 200 minutes/yr and the other has SAIFI = 2.0/yr and SAIDI = 400
   minutes/yr.

0. Now repeat the previous problem and include the reliability of the
   transfer switch feeding the facility which has an annual failure
   rate of 1% and a repair time of 24 hours. Also assume that failure
   of the switch leads to a facility outage.

0. Now repeat the previous problem and include the reliability of the
   transfer switch feeding the facility, but this time, assume that 5%
   of the time, the switch fails to operate when called upon.

0. If the distribution of daily SAIDI follows a lognormal
   distribution, what portion of annual average SAIDI (without
   exclusions) occurs in the worst 20 days? Assume that the average of
   the log of daily SAIDI (in minutes) is alpha = -1.5 and the
   standard deviation of the log of daily SAIDI is beta = 1.9.

0. Using the regression formulas for prediction of reliability,
   compare SAIFI without major events for the following two cases:

   1. 1,000,000 customers, 10,000 overhead line miles, and 20,000
      underground line miles
   1. 1,000,000 customers, 100,000 overhead line miles, and 20,000
      underground line miles

0. Consider a single mainline with two switches with line exposure and
   customers evenly split between the three line sections. Assume 
   repair time = 4 hours and switch time = 1 hour. Find CAIDI.

0. Repeat the previous example, but now, assume that 50% of customers
   are on the middle section, 25% are on the first section, and 25%
   are on the last section. 

0. Using [this daily CMI data](example_CMI_data.csv), calculate SAIDI
   excluding major events with the following beta values: 1.8, 2, and
   2.5. Also, note the average number of days excluded with each beta
   value. There are 800,000 customers served in this example.


