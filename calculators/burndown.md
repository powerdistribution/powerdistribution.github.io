# Coordination of Burndowns on Overhead Conductors

This app compares burndown curves of various overhead conductors to
the clearing times of relayed circuit breakers. See also section
2.9.2. 


```yaml script=scriptloader
- lib/numeric-1.2.6.min.js
```

<div class = "row">
<div class = "col-md-4">

<br/>
<br/>

```yaml jquery=dform name=frm
html: 
  - name: conductor
    type: select
    bs3caption: Conductor
    selectvalue: 336.4 kcmil Al covered
    choices:
      - "#4 ACSR bare"
      - "#2 ACSR bare"
      - 336.4 kcmil Al covered
      - 556.4 kcmil Al covered
  - name: relay
    type: select
    bs3caption: Relay type
    selectvalue: ANSI extremely inverse
    choices:
      - ANSI moderately inverse
      - ANSI short-time inverse
      - ANSI inverse
      - ANSI very inverse
      - ANSI extremely inverse
  - name: pickup
    type: number
    bs3caption: Pickup current, A
    step: 50
    value: 400
  - name: td
    type: number
    bs3caption: Time dial setting
    step: 0.5
    value: 2
  - name: breaker
    type: number
    bs3caption: Breaker time, cycles
    step: 1.0
    value: 6
```

```text name=relaydata
curve,A,B,p
"ANSI moderately inverse", 0.0104, 0.0226,  0.02
"ANSI inverse",            5.95,   0.18,    2.0
"ANSI very inverse",       3.88,   0.0963,  2.0 
"ANSI extremely inverse",  5.67,   0.0352,  2.0
"ANSI short-time inverse", 0.323,  0.00262, 2.0
```

```text name=burndowndata
curve,k1,q1,k2,q2
"#4 ACSR bare",           5074.3, 1.2772,     2682, 1.2110
"#2 ACSR bare",            185.1, 0.7407,   117.64, 0.7358
"336.4 kcmil Al covered",  24106, 1.3254,    22253, 1.3335
"556.4 kcmil Al covered",  41549, 1.3222,    26878, 1.2839
```


</div>
<div class = "col-md-8">


```js
function trim(arr) {
  var start = 0;
  for (; start < arr.length; start++) {
    if (arr[start] !== '') break;
  }
  var end = arr.length - 1;
  for (; end >= 0; end--) {
    if (arr[end] !== '') break;
  }
  if (start > end) return [];
  return arr.slice(start, end - start + 1);
}
console.log(trim("  A "))
function makeobj(x) {
    var res = {}
    for (i = 0; i < x[0].length; i++) {
        colname = trim(x[0][i])
        res[colname] = Array(x.length - 1)
        for (j = 1; j < x.length; j++) {
            res[colname][j-1] = x[j][i]
        }
    }
    return res
};
z = $.csv.toArrays(relaydata, {onParseValue: $.csv.hooks.castToScalar})
x = makeobj(z)
ridx = _.map(x.curve, String).indexOf(relay)
A = x.A[ridx]
B = x.B[ridx]
p = x.p[ridx]
z = $.csv.toArrays(burndowndata, {onParseValue: $.csv.hooks.castToScalar})
x = makeobj(z)
bidx = _.map(x.curve, String).indexOf(conductor)
k1 = x.k1[bidx]
q1 = x.q1[bidx]
k2 = x.k2[bidx]
q2 = x.q2[bidx]

pow = Math.pow

findrelay = function(I) {
   return +td * (A / pow(1000 * I / pickup, p) + B) + breaker / 60
}
findburndown1 = function(I) {
   return +k1 / pow(1000 * I, q1)
}
findburndown2 = function(I) {
   return +k2 / pow(1000 * I, q2)
}
console.log(1)
```




```yaml name=plotinfo
chart:
    type: line
    height: 700
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
    max: 20
    endOnTick: false
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

```js
currents = numeric.pow(10,numeric.linspace(-.5,1.5,100)) 
durations1 = _.map(currents, findburndown1)
series1 = _.zip(currents,durations1)
durations2 = _.map(currents, findburndown2)
series2 = _.zip(currents,durations2)
durations3 = _.map(currents, findrelay)
series3 = _.zip(currents,durations3)
plotinfo.series = [{name: "Burndown1", data: series1}, 
                   {name: "Burndown2", data: series2}, 
                   {name: "Relay curve", data: series3}] 
$active_element.highcharts(plotinfo)
console.log(3)
```
</div>
</div>


# Notes

The conductor burndown curves are from EPRI 1017839. These are based
on curvefits to datapoints from burndown tests on bare and covered
conductors. Two curves are provided:

* *Burndown1* -- This is a "typical" time to burndown.

* *Burndown2* -- This is a more conservative time to burndown for
  coordinating with clearing curves.

The relay clearing curves are based on equations from ANSI/IEEE
C37.112-1996 and from SEL relay instruction manuals. Relay curves for
electromechanical relays (like the CO or IAC relays) are not included.
If anyone has datasets or equations for these, I'd be happy to include
them. If you have curves for reclosers or other devices, those could
be included, too.

To enter an instantaneous element, you can use a curve with a time
dial of zero. this just leaves the breaker clearing time.

When checking curves, check both the phase relay element and the
ground element. Both elements should be below the burndown curves over
the range of fault current available.


# References

[EPRI 1017839](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=000000000001017839),
*Distribution Conductor Burndown Test Results: Small Bare and Large
Covered Conductor*, Electric Power Research Institute, Palo Alto, CA,
2009.

ANSI/IEEE C37.112-1996, *IEEE Standard Inverse-Time Characteristic
Equations for Overcurrent Relays*. 
