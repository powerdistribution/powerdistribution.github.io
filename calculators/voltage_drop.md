# Voltage Drop (or Rise) along a Line Section

This app models the voltage drop or rise from unbalanced or balanced
load on an overhead distribution line. The load is constant throughout
the segment modeled. The voltages at the start of the segment are
balanced.

<!-- Script loader -->

```yaml
         #:  script=scriptloader
- lib/numeric-1.2.6.min.js
- lib/math.min.js
```

<!-- Conductor data -->

```yaml
         #:  name=d
rac: [3.551, 2.232, 1.402, 1.114, 0.882, 0.7, 0.556, 0.441, 0.373, 0.35, 0.311, 0.278, 0.267, 0.235, 0.208, 0.197, 0.188, 0.169, 0.135, 0.133, 0.127, 0.12, 0.109, 0.106, 0.101, 0.0963]
gmr: [0.0055611962035177, 0.00700459393067038, 0.00882262274842038, 0.00990159326021141, 0.0111125174323268, 0.0124715326552536, 0.0139967498560307, 0.0157084948536593, 0.0171990576740366, 0.0177754680514267, 0.0197856043349646, 0.0209605660328388, 0.0214852445181602, 0.0227611387971986, 0.0243123406199979, 0.0249209197027924, 0.0255447325512619, 0.0270616982108416, 0.0308759703782212, 0.0311314761296609, 0.0319107497292355, 0.0327095298674806, 0.0343675751093677, 0.0349387277474913, 0.0361096666226405, 0.0367097709735484]
conductors: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
```

<!-- Input form -->

```yaml
         #:  jquery=dform
class : form
html:
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: phases
            type: select
            bs3caption : "Phase"
            selectvalue: 350 AAC
            choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
      - type: div
        class: col-md-3
        html:
          - name: neutral
            type: select
            bs3caption : "Neutral"
            selectvalue: 4/0 AAC
            choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
  - type: h6
    html: Phase and neutral positions in feet
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: xA
            type: number
            step: 0.2
            bs3caption : "xA"
            value: -4.0
      - type: div
        class: col-md-3
        html:
          - name: xB
            type: number
            step: 0.2
            bs3caption : "xB"
            value: 0.0
      - type: div
        class: col-md-3
        html:
          - name: xC
            type: number
            step: 0.2
            bs3caption : "xC"
            value: 4.0
      - type: div
        class: col-md-3
        html:
          - name: xN
            type: number
            step: 0.2
            bs3caption : "xN"
            value: 0.0
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: yA
            type: number
            bs3caption : "yA"
            value: 30.0
      - type: div
        class: col-md-3
        html:
          - name: yB
            type: number
            bs3caption : "yB"
            value: 31.0
      - type: div
        class: col-md-3
        html:
          - name: yC
            type: number
            bs3caption : "yC"
            value: 30.0
      - type: div
        class: col-md-3
        html:
          - name: yN
            type: number
            bs3caption : "yN"
            value: 25.0
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: rho
            type: number
            step: 25.0
            min: 0.0
            bs3caption : Earth resistivity, ohm-m
            value: 100.0
      - type: div
        class: col-md-3
        html:
          - name: Vbase
            type: number
            step: 100
            min: 0.0
            bs3caption : Voltage (L-N), volts
            value: 7200
      - type: div
        class: col-md-3
        html:
          - name: len
            type: number
            step: 1.0
            min: 0.0
            bs3caption : Line length, miles
            value: 5.0
  - type: h6
    html: Phase currents and power factors
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: Ia
            type: number
            step: 10.0
            bs3caption : "Ia"
            value: 100.0
      - type: div
        class: col-md-3
        html:
          - name: Ib
            type: number
            step: 10.0
            bs3caption : "Ib"
            value: 0.0
      - type: div
        class: col-md-3
        html:
          - name: Ic
            type: number
            step: 10.0
            bs3caption : "Ic"
            value: 0.0
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: pfA
            type: number
            step: 0.1
            bs3caption : "pfA"
            value: 1.0
      - type: div
        class: col-md-3
        html:
          - name: pfB
            type: number
            step: 0.1
            bs3caption : "pfB"
            value: 1.0
      - type: div
        class: col-md-3
        html:
          - name: pfC
            type: number
            step: 0.1
            bs3caption : "pfC"
            value: 1.0
```



## Results

<!-- Main calculations -->

```js

sq = function(x) {
  return x * x;
}

pidx = _.map(d.conductors, String).indexOf(phases)
nidx = _.map(d.conductors, String).indexOf(neutral)

cond = {}
cond.R = []
cond.gmr = []
cond.y = []
cond.ngrnd = 1       // number of grounded conductors -- always the last conductors
cond.y = [yA, yB, yC, yN]        // ft
cond.x = [xA, xB, xC, xN]
for (var i = 0; i < 3; i++) {
    cond.R[i]   = d.rac[pidx]   // ac resistance, ohms/mi
    cond.gmr[i] = d.gmr[pidx]   // ft
}
cond.R[3]   = d.rac[nidx]   // ac resistance, ohms/mi
cond.gmr[3] = d.gmr[nidx]   // ft


calcZ = function(cond) {
    n = cond.R.length
    Z = numeric.t(numeric.identity(n), numeric.identity(n))
    f = 60     // Hz
    k1 = 0.2794 * f / 60  // for answers in ohms/mi
    Re = 0.0954 * f / 60
    De = 2160 * math.sqrt(rho / f)
    for (var i = 0; i < n; i++) {
        Z.x[i][i] = cond.R[i] + Re
        Z.y[i][i] = k1 * math.log10(De / cond.gmr[i])
        if (i < n)
            for (var k = i + 1; k < n; k++) {
                dik = math.sqrt(sq(cond.y[i] - cond.y[k]) + sq(cond.x[i] - cond.x[k]))
                Z.x[i][k] = Re
                Z.y[i][k] = k1 * math.log10(De / dik)
                Z.x[k][i] = Z.x[i][k]
                Z.y[k][i] = Z.y[i][k]
            }
    }
    // Eliminate grounded wires
    if ( cond.ngrnd > 0 ) {
      np = n - cond.ngrnd
      Z = Z.getBlock([0, 0], [np-1, np-1]).sub(
          Z.getBlock([0, np], [np-1, n-1]).dot(Z.getBlock([np, np], [n-1, n-1]).inv()).dot(Z.getBlock([np, 0], [n-1, np-1])))
    }
    return Z
}
Z = calcZ(cond).mul(len)
qfA = -math.sign(pfA) * math.sqrt(1 - sq(pfA))
qfB = -math.sign(pfB) * math.sqrt(1 - sq(pfB))
qfC = -math.sign(pfC) * math.sqrt(1 - sq(pfC))
pfA = math.sign(Ia) * math.abs(pfA)
pfB = math.sign(Ib) * math.abs(pfB)
pfC = math.sign(Ic) * math.abs(pfC)
Ia = math.abs(Ia)
Ib = math.abs(Ib)
Ic = math.abs(Ic)
I = numeric.t([Ia,       -0.5 * Ib,      -0.5 * Ic],
              [ 0, -0.8660254 * Ib, 0.8660254 * Ic]).mul(numeric.t([pfA, pfB, pfC], [qfA, qfB, qfC]))
Vsub = numeric.t([1.0,       -0.5,      -0.5],
                 [0.0, -0.8660254, 0.8660254]).mul(Vbase)
Vload = Vsub.sub(Z.dot(I))
console.log(Z)
console.log(Vsub)
console.log(Vload)
console.log(numeric.prettyPrint(Z))
console.log(numeric.prettyPrint(Vsub.abs().x))
console.log(numeric.prettyPrint(Vload.abs().x))
println("Load-side voltages (L-N) = " + numeric.prettyPrint(Vload.abs().x) + " V")
println("                         = " + numeric.prettyPrint(Vload.abs().div(Vbase).x) + " pu")
println("                         = " + numeric.prettyPrint(Vload.abs().div(Vbase).mul(120).x) + " V on a 120-V base")
```

<!-- Plot -->

```js
seriesVsub = [];
[0,1,2].map(function(i) {seriesVsub.push([0.,0.]); seriesVsub.push([Vsub.x[i], Vsub.y[i]]);})
seriesVload = [];
[0,1,2].map(function(i) {seriesVload.push([0.,0.]); seriesVload.push([Vload.x[i], Vload.y[i]]);})
seriesI = [];
[0,1,2].map(function(i) {seriesI.push([0.,0.]); seriesI.push([10*I.x[i], 10*I.y[i]]);})
// The aspect ratio is 35x25
x0 = -Vbase * 1.36
x1 =  Vbase * 1.3
y0 = -Vbase * 0.95
y1 =  Vbase * 0.95
plot([{label: "Vsub", data: seriesVsub}, {label: "Vload", data: seriesVload}, {label: "10*I", data: seriesI}],
     {xaxis: {show: false, min: x0, max: x1}, yaxis: {show: false, min: y0, max: y1}, grid: {show: false}, legend: {show: true}})
```


## Notes

For the power factors, a positive value means an inductive load, and a
negative value means a capacitive load. You can also use a negative
current to indicate generation of real power. The line capacitance
is ignored.

For impedances, this app uses a simple implementation of the equations
outlined in section 2.4. The frequency is fixed at 60 Hz. For more
sophisticated line modeling and voltage drop calculations, see
[OpenDSS](http://www.smartgrid.epri.com/SimulationTool.aspx) or a
transient program like [EMTP-RV](http://emtp.com) or
[ATP](http://emtp.org).
