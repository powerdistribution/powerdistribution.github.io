
# Stray voltages (NEV) from unbalanced current

This app models the neutral-to-earth voltage (NEV) from unbalanced load on an overhead
distribution line. The circuit modeled is illustrated below.

<img src="StrayVoltage.svg" style="width:100%" class="img-responsive"/>

<br/>

<!-- Script loader -->

```yaml
         #:  script=scriptloader
- lib/numeric-1.2.6.min.js
- lib/math.min.js
```

<!-- Conductor data  -->

```yaml 
         #: name=d
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
        class: col-md-4
        html:
          - name: neutral
            type: select
            bs3caption : Neutral
            selectvalue: 2/0 AAC
            choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
      - type: div
        class: col-md-4
        html:
          - name: groundsPerKFeet
            type: number
            step: 1
            min: 0.0
            bs3caption : Grounds per 1000 feet
            value: 2.0
      - type: div
        class: col-md-4
        html:
          - name: averageGround
            type: number
            step: 5
            min: 0.0
            bs3caption : Average ground resistance, ohms
            value: 20.0
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: Zsub
            type: number
            step: 0.1
            min: 0.0
            bs3caption : Substation ground resistance, ohms
            value: 1.2
      - type: div
        class: col-md-4
        html:
          - name: rho
            type: number
            step: 50
            min: 0.0
            bs3caption : Earth resistivity, ohms
            value: 100.0
      - type: div
        class: col-md-4
        html:
          - name: totalLengthMi
            type: number
            step: 1
            min: 0.0
            bs3caption : Line length, miles
            value: 6.0
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: UnbalanceI
            type: number
            step: 5
            min: 0.0
            bs3caption : Unbalanced current, A
            value: 20.0
      - type: div
        class: col-md-4
        html:
          - name: harmonicSelect
            type: select
            bs3caption : Harmonic
            selectvalue: Fundamental
            choices: ["Fundamental", "Third"]
      - type: div
        class: col-md-4
        html:
          - name: loadType
            type: select
            bs3caption : Load type
            selectvalue: Lumped at end
            choices: ["Lumped at end", "Evenly distributed", "On another circuit"]
```


<h2>Results</h2>

<!-- Main calculations -->

```js

if (harmonicSelect == "Fundamental") {
    var harmonic = 1
} else {
    var harmonic = 3
}


sq = function(x) {
  return x * x;
}

nidx = _.map(d.conductors, String).indexOf(neutral)

Yaddline = function(Y, Zseries, from, to) {
    var n = Zseries.x.length - 1;
    var Yseries = Zseries.inv();
    Y.setBlock([from,from], [from+n,from+n], Y.getBlock([from,from], [from+n,from+n]).add(Yseries));   // diagonal
    Y.setBlock([to,to],     [to+n,to+n],     Y.getBlock([to,to],     [to+n,to+n]).add(Yseries));
    Y.setBlock([from,to],   [from+n,to+n], Y.getBlock([from,to], [from+n,to+n]).sub(Yseries));   // off diagonal
    Y.setBlock([to,from],   [to+n,from+n], Y.getBlock([to,from], [to+n,from+n]).sub(Yseries));
    return Y;
}

Yaddshunt = function(Y, Zshunt, busnum) {
    var n = Zshunt.x.length;
    var Yshunt = Zshunt.inv();
    Y.setBlock([busnum,busnum], [busnum+n,busnum+n], Y.getBlock([busnum,busnum], [busnum+n,busnum+n]).add(Yshunt));   // diagonal
    return Y;
}

numberOfSections = 50
subBus = 1
totalLength = totalLengthMi * 5.28  // ohms/kfeet
sectionLength = totalLength/numberOfSections  // kfeet
Zgrnd = averageGround/(groundsPerKFeet * totalLength) * numberOfSections  // ohms (average ground per section)
d_ab = 6  // feet (distance between the phase and neutral)

r = 0.0001  // ohms per 1000 feet
gmr = 0.04  // feet
r_n = d.rac[nidx]/5.28  // ohms per 1000 feet
gmr_n = d.gmr[nidx]     // feet

Z = numeric.t(numeric.identity(2), numeric.identity(2))
Z.x[0][0] = r + 0.01807 * harmonic
Z.y[0][0] = harmonic * 0.0529 * math.log10(278.9 * math.sqrt(rho/harmonic) / gmr)
Z.x[1][1] = r_n + 0.01807 * harmonic
Z.y[1][1] = harmonic * 0.0529 * math.log10(278.9 * math.sqrt(rho/harmonic) / gmr_n)
Z.x[0][1] = Z.x[1][0] = 0.01807 * harmonic
Z.y[0][1] = Z.y[1][0] = harmonic * 0.0529 * math.log10(278.9 * math.sqrt(rho/harmonic) / d_ab)
Zcond = Z.mul(sectionLength)   // actual ohms
numberOfConductors = 2

// preallocate the Ybus
n = (numberOfSections + 1) * numberOfConductors
Y = numeric.t(numeric.rep([n,n], 0.0), numeric.rep([n,n], 0.0))

// make the Ybus from the impedances
for (var i = 0; i < n - numberOfConductors - 1; i = i + numberOfConductors) {
    Y = Yaddline(Y, Zcond, i, i+numberOfConductors);
}

// add the shunt grounds
for (var i = 2*numberOfConductors - 1; i < n - 1; i = i + numberOfConductors) {
    Y.set([i, i], Y.get([i, i]).add(numeric.t(1/Zgrnd, 0.0)))
}

// add the sub ground
var i = 1
Y.set([i, i], Y.get([i, i]).add(numeric.t(1/Zsub, 0.0)))

// ground the phase wire at the sub
var i = 0
var j = 1
Ylarge = numeric.t(100000,0.0)
Y.set([i, i], Y.get([i, i]).add(Ylarge))
Y.set([j, j], Y.get([j, j]).add(Ylarge))
Y.set([i, j], Y.get([i, j]).sub(Ylarge))
Y.set([j, i], Y.get([j, i]).sub(Ylarge))

// make current injections (Isrc)
Isrc = numeric.t(numeric.rep([n], 0.0), numeric.rep([n], 0.0))
// inject evenly distributed loads
if (loadType == "Evenly distributed") {
    for (var i = numberOfConductors*subBus; i < n; i = i + numberOfConductors) {
        // phase A
        Isrc.set([i],   numeric.t( UnbalanceI/(numberOfSections-subBus), 0.0)) // amperes
        // neutral
        Isrc.set([i+1], numeric.t(-UnbalanceI/(numberOfSections-subBus), 0.0)) // amperes
    }
} else if (loadType == "Lumped at end") {
    // inject isolated load at the end
    Isrc.set([n-2], numeric.t(-UnbalanceI, 0.0)) // amperes
    Isrc.set([n-1], numeric.t( UnbalanceI, 0.0)) // amperes
} else {  // substation injection
    Isrc.set([1], numeric.t(UnbalanceI, 0.0)) // amperes
}

// Find the voltages:
V = Y.inv().dot(Isrc)

// Find the voltage drops and conductor currents
Vdrops = numeric.t(numeric.rep([2,numberOfSections], 0.0), numeric.rep([2,numberOfSections], 0.0))
for (var i = 0; i < numberOfSections; i++) {
    Vdrops.set([0,i], V.get([i * 2    ]).sub(V.get([i * 2 + 2])))
    Vdrops.set([1,i], V.get([i * 2 + 1]).sub(V.get([i * 2 + 3])))
}
Ycond = Zcond.inv()
I = Ycond.dot(Vdrops)

vn = V.abs().x.filter(function(num,idx){ if( idx % 2 ) return num;})

println("Substation NEV = " + math.format(V.abs().x[1]) + " V")
println("Maximum NEV = " + math.format(_.max(vn)) + " V")

```

<br/>
<div class = "row">
<div class = "col-md-6">
    Neutral-to-earth voltages, V
    <div id="graph1" style='width:100%; height:25em;'></div>
    <div class="text-center">Distance from the substation, miles</div>
</div>
<div class = "col-md-6">
    Currents, A
    <div id="graph2" style='width:100%; height:25em;'></div>
    <div class="text-center">Distance from the substation, miles</div>
</div>
</div>

<!-- Graphs -->

```js
    x = _.range(0, (numberOfSections+1) * sectionLength / 5.28, sectionLength / 5.28)
    seriesvn = _.zip(x,vn)
    $.plot($('#graph1'), [seriesvn]);
    
    seriesI = [{label: "Phase",
                data: _.zip(x,I.abs().x[0])},
               {label: "Neutral",
                data: _.zip(x,I.abs().x[1])},
               {label: "Ground",
                data: _.zip(x,I.getRow(0).add(I.getRow(1)).abs().x)}
               ]
    $.plot($('#graph2'), seriesI);
```



## Notes

For more information on NEV, see section 14.5.3. Also, the IEEE PES Stray &
Contact Voltage Working Group has a draft guide that is in ballot:

* IEEE P1695™/D2, Draft Guide to Understanding, Diagnosing and Mitigating Stray and
  Contact Voltage, April 2015.

This app can approximate coupling on two- or three-phase lines if you use
the unbalanced current (vector sum of all phases) as input for the
conductor.

The line ground resistances also include customer grounds. The customer grounds
can have a larger impact than the utility grounds.

Also note that the earth resistivity only has a small effect. In the
calculations, this only really affects the line impedances. Of course, earth
resistivity will affect the line and substation ground resisitances, but those
are entered separately.

This app does include some fixed assumptions. The distance from the neutral to
the phase is fixed at 6 ft. For impedance models, this app uses a simple
implementation of the equations outlined in section 2.4. The frequency is fixed
at 60 Hz. For more sophisticated line modeling and voltage drop calculations,
see [OpenDSS](http://smartgrid.epri.com/SimulationTool.aspx) or a transient
program like [EMTP-RV](http://emtp.com) or [ATP](http://emtp.org).
