## Conductor Slapping App

This app models slapping between two conductors for a line-to-line
fault involving these conductors. Enter the conductor and line
characteristics, the fault information, and the relative conductor
positions. The critical clearing time is the fault duration at which
conductors swing enough to (nearly) touch.

<!-- Script loader -->

```yaml
          #: script=scriptloader
- FICM.js
```

<!-- Conductor data  -->

```yaml 
          #: name=d
conductors: ["#6 AAC", "#4 AAC", "#2 AAC", "#1 AAC", 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC, "#6 ACSR", "#4 ACSR", "#2 ACSR", "#1 ACSR", 1/0 ACSR, 2/0 ACSR, 3/0 ACSR, 4/0 ACSR, 336.4 ACSR, 397.5 ACSR, 477 ACSR, "#6 Cu", "#5 Cu", "#4 Cu", "#3 Cu", "#2 Cu", "#1 Cu", "1/0 Cu", "2/0 Cu", "3/0 Cu", "4/0 Cu", "250 Cu", "350 Cu", "500 Cu"]
area: [0.0206, 0.0328, 0.0522, 0.0657, 0.0829, 0.1045, 0.1317, 0.1663, 0.1964, 0.2097, 0.2358, 0.2644, 0.2748, 0.3124, 0.3534, 0.3744, 0.3926, 0.4369, 0.5494, 0.5622, 0.5892, 0.6245, 0.6874, 0.7072, 0.7495, 0.7854, 0.0206, 0.0328, 0.0522, 0.0657, 0.0829, 0.1045, 0.1317, 0.1663, 0.2644, 0.3124, 0.3744, 0.02061675, 0.02599674, 0.032782596, 0.041335602, 0.052126998, 0.065887206, 0.0828597, 0.10453674, 0.13179012, 0.16619064, 0.19635, 0.27489, 0.3927]
wc: [0.0246, 0.0392, 0.0623, 0.0785, 0.0991, 0.1249, 0.1575, 0.1987, 0.2347, 0.2506, 0.2818, 0.316, 0.3284, 0.3734, 0.4224, 0.4475, 0.4692, 0.5221, 0.6566, 0.672, 0.7043, 0.7464, 0.821, 0.8452, 0.8958, 0.9387, 0.036, 0.0574, 0.0912, 0.115, 0.145, 0.183, 0.23, 0.291, 0.462, 0.546, 0.517, 0.08, 0.101, 0.128, 0.161, 0.203, 0.258, 0.326, 0.411, 0.518, 0.653, 0.772, 1.081, 1.544]
```

<br/>
<br/>

<!-- Input form -->

```yaml
          #: jquery=dform outputid=inputform
class : form-horizontal
col1class : col-sm-8
col2class : col-sm-4
html:
  - name: flti
    type: number
    step: 1000.0
    bs3caption: "Fault current, A"
    value: 5000
  - name: fltt
    type: number
    step: 5.0
    bs3caption: "Fault duration, cycles (60 Hz)"
    value: 20
  - name: conductors
    type: select
    bs3caption: "Conductors"
    selectvalue: 336.4 AAC
    choices: ["#6 AAC", "#4 AAC", "#2 AAC", "#1 AAC", 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC, "#6 ACSR", "#4 ACSR", "#2 ACSR", "#1 ACSR", 1/0 ACSR, 2/0 ACSR, 3/0 ACSR, 4/0 ACSR, 336.4 ACSR, 397.5 ACSR, 477 ACSR, "#6 Cu", "#5 Cu", "#4 Cu", "#3 Cu", "#2 Cu", "#1 Cu", "1/0 Cu", "2/0 Cu", "3/0 Cu", "4/0 Cu", "250 Cu", "350 Cu", "500 Cu"]
  - name: h0
    type: number
    step: 50.0
    bs3caption: "Span length, feet"
    value: 300
  - name: y0
    type: number
    bs3caption: "Conductor sag, feet"
    value: 5.75
  - name: x1
    type: number
    bs3caption: "Horizontal conductor separation, feet"
    value: 3.67
  - name: y1
    type: number
    bs3caption: "Vertical conductor separation, feet"
    value: 0.0
```

<div class = "row">
<div class = "col-md-7">
<div id = "inputform">
</div>
</div>
<div class = "col-md-1">
</div>

<div class = "col-md-4">
<div id="graph" style='width:300px; height:300px;'></div>
</div>
</div>

<!-- Main animation/calculation -->

```js
          //: output=markdown
idx = _.map(d.conductors, String).indexOf(conductors)
wc = d.wc[idx]
area = d.area[idx]

t = ficm(flti, fltt, h0, y0, x1, y1, wc, area, 0)
wirelocs = ficm(flti, fltt, h0, y0, x1, y1, wc, area, 1)
//console.log(wirelocs)
// animate the conductor movement
nstep = 0
z = wirelocs[nstep]
var startpos = [[z[1], z[2]], [z[3], z[4]]]
plot = $.plot($('#graph'),
              [{ data: [[0.0, y0], [x1, y0 + y1]],
                 points: { show: true } },
               { data: [[z[1], z[2]], [z[3], z[4]]],
                 points: { show: true, radius: 4, lineWidth: 4, fill: true, fillColor: false } },
              ],
              { colors: ["#ecb204", "rgba(#087fdd, 0.83)"],
                xaxis: { min: -y0 - 1, max: x1 + y0 + 1},
                yaxis: { min: -2, max: Math.max(2*y0 + x1) }});
$('#graph').animate( {tabIndex: 0}, {
   duration: 5000,
   step: function ( now, fx ) {
      nstep = nstep + 1
      var z = wirelocs[nstep]
      plot.setData( 
              [{ data: [[0.0, y0], [x1, y0 + y1]],
                 points: { show: true } },
               { data: [[z[1], z[2]], [z[3], z[4]]],
                 points: { show: true, radius: 4, lineWidth: 4, fill: true, fillColor: false } },
              ])
      plot.draw();
   }
});
if (t == 0.0)
    println("**No slapping**")
else
    println("Conductors slap at t = **" + t.toFixed(2) + " secs** for fault duration = **" + fltt.toFixed(1) + " cycles**.")
```

<div style="line-height: 0.6em; ">
<small>
<div id="output2"></div>
</small>
</div>

<!-- Conductor position calculations -->

```js 
       //: output=markdown outputid=output2

function sq(x) {
    return x * x;
}
c1peak1idx = -1;
c1peak2idx = -1;
c2peak1idx = -1;
c2peak2idx = -1;
c1reverse = false;
c2reverse = false;
for (var k = 1; k < wirelocs.length; k++) {
    z1 = wirelocs[k]
    z0 = wirelocs[k-1]
    d11 = sq(z1[1] - z[1]) + sq(z1[2] - z[2])
    d10 = sq(z0[1] - z[1]) + sq(z0[2] - z[2])
    d21 = sq(z1[3] - z[3]) + sq(z1[4] - z[4])
    d20 = sq(z0[3] - z[3]) + sq(z0[4] - z[4])
    // Conductor 1
    if (c1peak1idx > 0 && c1peak2idx < 0) {
        if (!c1reverse) { // reverse found
            if (d11 > d10) {
                c1reverse = true;
            };
        } else if (d11 < d10) {
            c1peak2idx = k - 1;
        };
    }
    if (c1peak1idx < 0) {
        if (d11 < d10) { // peak found
            c1peak1idx = k - 1;
        }
    }
    // Conductor 2
    if (c2peak1idx > 0 && c2peak2idx < 0) {
        if (!c2reverse) { // reverse found
            if (d21 > d20) {
                c2reverse = true;
            };
        } else if (d21 < d20) {
            c2peak2idx = k - 1;
        };
    }
    if (c2peak1idx < 0) {
        if (d21 < d20) { // peak found
            c2peak1idx = k - 1;
        }
    }
}


println("\n\n")
println(" Left/bottom conductor, 1st swing, X = " + (wirelocs[c1peak1idx][1]).toFixed(1) + " ft, Y = " + (wirelocs[c1peak1idx][2]).toFixed(1) + " ft @ " + Math.round(60*wirelocs[c1peak1idx][0]) + " cycles\n");
println(" Left/bottom conductor, 2nd swing, X = " + (wirelocs[c1peak2idx][1]).toFixed(1) + " ft, Y = " + (wirelocs[c1peak2idx][2]).toFixed(1) + " ft @ " + Math.round(60*wirelocs[c1peak2idx][0]) + " cycles\n\n");
println(" Right/top conductor, 1st swing, X = " + ((wirelocs[c2peak1idx][3] - z[3])).toFixed(1) + " ft, Y = " + ((wirelocs[c2peak1idx][4] - z[4])).toFixed(1) + " ft @ " + Math.round(60*wirelocs[c2peak1idx][0]) + " cycles\n\n");
println(" Right/top conductor, 2nd swing, X = " + ((wirelocs[c2peak2idx][3] - z[3])).toFixed(1) + " ft, Y = " + ((wirelocs[c2peak2idx][4] - z[4])).toFixed(1) + " ft @ " + Math.round(60*wirelocs[c2peak2idx][0]) + " cycles\n\n");
```

<!-- Find critical clearing times -->

```js
       //:  output=markdown

function bisect(flti) {
    hi = 2.0*60
    hiorig = hi
    lo = 0.0
    do {
        delta = (hi - lo)/2.0
        t = ficm(flti, lo + delta, h0, y0, x1, y1, wc, area, 0)
        if (t == 0.0) { // no slapping
            lo = lo + delta
            //console.log("lo =", lo)
        } else {
            hi = hi - delta
            //console.log("hi =", hi)
        }
    } while ((hi - lo) > 0.01)    
    if (hi != hiorig)
        return lo
    else
        return -hi
}
critt = bisect(flti)

if (critt > 0.0)
    println("\n**Critical fault clearing time = " + critt.toFixed(2) + " cycles**.")
else
    println("\n**Critical fault clearing time > " + -critt.toFixed(2) + " cycles**.")

currents = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000]    
durations = _.map(currents, bisect)
series = _.zip(currents,durations)
series = _.filter(series,function(x) {return x[1] > 0.0})
```

<!-- Plotting info -->

```yaml
          #: name=plotinfo
chart:
    type: line
    width: 500
    height: 500
    spacingRight: 20
yAxis:
    type: 'logarithmic'
    title:
        text: "Time, cycles"
xAxis:
    type: 'logarithmic'
    title:
        text: "Current, A"
title:
    text: Time-current curve
legend:
    enabled: false
```

<!-- Make the plot -->

```js
plotinfo.series = [{data: series}]
$active_element.highcharts(plotinfo)
```

## Credits

This app was adapted from C++ code by D. J. Ward [1] which in turn was
adapted from FORTRAN code by J. R. Stewart [2].

[1] Ward, D. J., "Overhead distribution conductor motion due to
short-circuit forces," *IEEE Transactions on Power Delivery*, vol. 18,
no. 4, pp. 1534-1538, 2003.

[2] EPRI, *Transmission Line Reference Book: 115 - 138 kV Compact Line
Design*, Second ed, Electric Power Research Institute, Palo Alto,
California, 1978.

## Notes

The magnetic field from fault current produces forces between
conductors all along the circuit from the substation to the initial
fault location. These forces can cause conductors to swing. If they
swing together, a second fault can occur upstream of the initial
fault. The main scenario that causes the most issues is where the
initial fault is downstream of a recloser, and a follow-on fault
occurs upstream of the recloser and trips the circuit breaker.

The animation at the right is a view along the length of the line. The two
stationary conductor positions at the pole are shown in yellow. The two blue
circles that move are the conductor positions at the center of the span.

Conductor motion is a function of fault current, fault duration, phase
spacings, span lengths, and conductor sag. A line-to-line fault causes
the most force between two conductors. This app only models
line-to-line faults. The force from fault current pushes conductors
away from each other. Once the fault is cleared, the conductors can
swing into each other.

You can get some crazy answers with large forces (high fault currents
and/or long durations), especially for smaller conductors. The
conductor animations should show this.

This model is likely to be most accurate with horizontal spacings.
Vertical clearance definitely helps as you will see from the
animations and the critical clearing curves. However, there are some
cases with vertical spacing that show no slapping that probably would
touch in real life. Again, use your judgement, and review the
animations. EPRI laboratory testing has shown cases where longer
clearing times reduce slapping on vertical designs. This effect means
that the calculations for critical currents with the existing
algorithm are incorrect for vertical designs. The physics of motion is
still in the ballpark of being correct for vertical designs.

To see the code that does the majority of the calculations, see
[here](https://github.com/powerdistribution/powerdistribution.github.io/blob/master/calculators/FICM.js). To
see the user interface, page calculation code, see
[here](conductor_slapping.md).
