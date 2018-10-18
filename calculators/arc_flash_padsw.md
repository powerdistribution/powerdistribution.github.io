# Arc flash in a padmounted switch

<!-- Script loader -->

```yaml
         #: script=scriptloader
- lib/numeric-1.2.6.min.js
```

<!-- Emblem structure for input and results -->

```emblem
.row
  .col-md-3
    br
    br
    #inputform
  .col-md-1
  .col-md-8
    h3 Results
    #results
    #plot
```

<!-- Input form -->

```yaml
         #:  jquery=dform name=frm outputid=inputform
html:
  - name: D
    type: number
    step: 5.0
    bs3caption: "Working distance, in"
    value: 36
  - name: clothing
    type: number
    bs3caption:
      html:
        - html: Clothing rating, cal/cm
          type: span
        - type: sup
          html: 2
    value: 8.0
  - name: I
    type: number
    bs3caption: "Bolted current, kA"
    value: 6.0
  - name: t
    type: number
    step: 0.1
    bs3caption: "Duration, sec"
    value: 1.0
  - name: k
    type: number
    step: 0.1
    bs3caption: "Safety multiplier"
    value: 1.15
  - name: graphextras
    type: select
    bs3caption: Plotting extras
    choices:
      - Vary working distance
      - Vary clothing
      - None
```

<!-- Define main calculation functions -->

```js

pow = Math.pow

findcals = function(I, t, d, k) {
   return k * 3547 * pow(I, 1.5) * pow(t, 1.35) / pow(d, 2.1);
}
findduration = function(E, I, d, k) {
   return pow(E * pow(d, 2.1) / (k * 3547 * pow(I, 1.5)), 1/1.35);
}
```

<!-- Run and print results -->

```js
        //: output=markdown outputid=results
cals = findcals(I, t, D, k)
duration = findduration(clothing, I, D, k)

println()
println("Incident energy for the given current and duration = **" + cals.toFixed(2) + " cal/cm^2**")
println()
println("Duration limit for the given current and clothing = **" + duration.toFixed(2) + " secs**")

```

<!-- Plot info -->

```yaml
         #:  name=plotinfo
chart:
    type: line
    width: 500
    height: 500
    spacingRight: 20
title:
    text: Time-current curve

plotOptions:
    series:
        marker:
            enabled: false
xAxis:
    type: 'logarithmic'
    min: 1
    max: 100
    endOnTick: true
    tickInterval: 1
    minorTickInterval: 0.1
    gridLineWidth: 1
    title:
        text: "Current, kA"

yAxis:
    type: 'logarithmic'
    min: .02
    max: 10
    tickInterval: 1
    minorTickInterval: 0.1
    title:
        text: "Time, sec"

legend:
    align: right
    verticalAlign: middle
    layout: vertical
    borderWidth: 0
```

<!-- Plot -->

```js
currents = numeric.pow(10,numeric.linspace(0,2,100))
durations1 = _.map(currents, function(I) {return findduration(clothing, I, D, k)})
series1 = _.zip(currents,durations1)
if (graphextras == "Vary clothing") {
    durations0 = _.map(currents, function(I) {return findduration(clothing * 2, I, D, k)})
    series0 = _.zip(currents,durations0)
    durations2 = _.map(currents, function(I) {return findduration(clothing / 2, I, D, k)})
    series2 = _.zip(currents,durations2)
    plotinfo.series = [{name: clothing*2 + " cals at " + D + '"', data: series0},
                       {name: clothing   + " cals at " + D + '"', data: series1},
                       {name: clothing/2 + " cals at " + D + '"', data: series2}]
} else if (graphextras == "Vary working distance") {
    durations0 = _.map(currents, function(I) {return findduration(clothing, I, D * 2, k)})
    series0 = _.zip(currents,durations0)
    durations2 = _.map(currents, function(I) {return findduration(clothing, I, D / 2, k)})
    series2 = _.zip(currents,durations2)
    plotinfo.series = [{name: clothing + " cals at " + D*2 + '"', data: series0},
                       {name: clothing + " cals at " + D + '"', data: series1},
                       {name: clothing + " cals at " + D/2 + '"', data: series2}]
} else {
    plotinfo.series = [{name: clothing + " cals at " + D + '"', data: series1}]
}
//plotinfo.series = [{data: series1}]
$("#plot").highcharts(plotinfo)
```

# Notes

This app models the arc flash incident energy based on tests of PMH
padmounted switches by EPRI and PG&E. For more information, see
section 14.8 and EPRI 1022697 [2011], and Short and Eblen [2012].

The incident energy in this equipment is higher than predicted by
[IEEE 1584](mdpad.html?1584.md) because of horizontal busbars.
Magnetic fields from the arc current push the arcs and arc energy out
of the enclosure towards the worker. This equipment is also unusual in
that the incident energy is not linear with duration--the heat rate
increases with increasing duration. Here is a picture of the
horizontal busbars along with a video frame from an arc flash test:

<!-- Emblem structure for displaying pictures -->

```emblem
.row
  .col-md-4
    img.img-responsive src="img/padmount2.png"
  .col-md-4
    img.img-responsive src="img/padmount1.png"
```

# References

[EPRI 1022697](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=000000000001022697),
*Distribution Arc Flash: Phase II Test Results and Analysis*, Electric
Power Research Institute, Palo Alto, CA, 2011.

Short, T. A. and Eblen, M. L., "Medium-Voltage Arc Flash in Open Air
and Padmounted Equipment," *IEEE Transactions on Industry Applications*,
vol. 48, no. 1, pp. 245-253, Jan.-Feb. 2012.
[Approved version](../papers/ieee_repc_arc_flash_tshort_meblen_2011_IAS_submission.pdf)
