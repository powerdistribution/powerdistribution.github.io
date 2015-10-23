
# Circulating Currents in Cable Neutrals

This page models circulating currents on the neutrals of single-conductor cables
used in a three-phase circuit. The circulating current is driven by the voltage
induced on the neutral from the phase conductor. Circulating currents are worse
with larger conductors and with wider separation between cables. Two
configurations are given: (1) cables in separate ducts and (2) all three cables
in the same duct. An optional neutral can also be given.

<img src="CableCirculatingCurrents.svg" style="width:100%" class="img-responsive"/>

<br/>

<!-- Script loader -->

```yaml
          #: script=scriptloader
- lib/numeric-1.2.6.min.js
- lib/math.min.js
```

<!-- Input form -->

```yaml
          #: jquery=dform
class : form
html:
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: cable
            type: select
            bs3caption : Cable
            selectvalue: 1000 kcmil
            choices: [250 kcmil, 500 kcmil , 1000 kcmil]
      - type: div
        class: col-md-4
        html:
          - name: shield
            type: select
            bs3caption : Concentric neutral conductivity
            selectvalue: 1/6
            choices: [1/3, 1/6, 1/12]
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: ductSpacing
            type: number
            step: 1
            min: 0.0
            bs3caption : Duct spacing, in
            value: 7.0
      - type: div
        class: col-md-4
        html:
          - name: neutral
            type: select
            bs3caption : Separate neutral
            selectvalue: none
            choices: [none, 250 kcmil, 500 kcmil , 1000 kcmil]
      - type: div
        class: col-md-4
        html:
          - name: neutralLocation
            type: select
            bs3caption : Neutral location
            selectvalue: "2"
            choices: ["1", "2", "3", "4"]
```

<!-- Conductor data -->

```yaml
          #: name=ac
name: [250 kcmil, 500 kcmil , 1000 kcmil]
R:    [0.0435,0.0229,0.0132]
GMR:  [0.216,0.305,0.435]
GMRs: [0.5075,0.6125,0.7825]
```

<!-- Main calculations -->

```js
neutralLocation = neutralLocation - 1
shieldMultiplier = Number(shield.substring(2))
rho = 100
Rshort = 1e-5

sq = function(x) {
  return x * x;
}

Yaddline = function(Y, Zseries, from, to) {
    var n = Zseries.x.length - 1;
    var Yseries = Zseries.inv();
    Y.setBlock([from,from], [from+n,from+n], Y.getBlock([from,from], [from+n,from+n]).add(Yseries));   // diagonal
    Y.setBlock([to,to],     [to+n,to+n],     Y.getBlock([to,to],     [to+n,to+n]).add(Yseries));
    Y.setBlock([from,to],   [from+n,to+n], Y.getBlock([from,to], [from+n,to+n]).sub(Yseries));   // off diagonal
    Y.setBlock([to,from],   [to+n,from+n], Y.getBlock([to,from], [to+n,from+n]).sub(Yseries));
    return Y;
}

Yaddshunt = function(Y, Rshunt, i) {
    Y.set([i, i], Y.get([i, i]).add(numeric.t(1/Rshunt, 0.0)))
    return Y;
}

De= 25920*math.sqrt(rho/60)
r_e= 0.01807

cidx = _.indexOf(ac.name, cable)
nidx = _.indexOf(ac.name, neutral)

findZc = function(x,y) {
    var dist = function(i,j){return math.sqrt(sq(x[i] - x[j]) + sq(y[i] - y[j]))}
    var Zc = numeric.t(numeric.identity(7), numeric.identity(7))
    // fill in the off diagonals
    for (var j = 0; j < 6; j++) {
        for (var k = j+1; k < 7; k++) {
            if (dist(j,k) != 0.0) {
                Zc.x[j][k] = Zc.x[k][j] = r_e
                Zc.y[j][k] = Zc.y[k][j] = 0.0529 * math.log10(De/dist(j,k))
            }
        }
    }
    // phases
    for (var i = 0; i < 3; i++) {
        Zc.x[i][i] = ac.R[cidx] + r_e
        Zc.y[i][i] = 0.0529 * math.log10(De/ac.GMR[cidx])
        // phase-to-concentrics
        Zc.x[i][i+3] = Zc.x[i+3][i] = r_e
        Zc.y[i][i+3] = Zc.y[i+3][i] = 0.0529 * math.log10(De/ac.GMR[cidx])
    }
    // concentrics
    for (var i = 3; i < 6; i++) {
        Zc.x[i][i] = shieldMultiplier * ac.R[cidx] + r_e
        Zc.y[i][i] = 0.0529 * math.log10(De/ac.GMR[cidx])
    }
    // neutral
    if (nidx >= 0) {
        Zc.x[6][6] = ac.R[nidx] + r_e
        Zc.y[6][6] = 0.0529 * math.log10(De/ac.GMR[nidx])
    } else {
        Zc.x[6][6] = 1e7
    }
    return Zc
}

findY = function(Zc) {
    // make the Ybus from the impedances
    var Y = numeric.t(numeric.rep([14,14], 0.0), numeric.rep([14,14], 0.0))
    Y = Yaddline(Y,Zc,0,7)
    // add the shunt grounds
    for (var i = 3; i < 7; i++) {
        Y = Yaddshunt(Y,Rshort,i)
        Y = Yaddshunt(Y,Rshort,i+7)
    }
    // connections to phases to avoid numeric problems
    for (var i = 0; i < 3; i++) {
        Y = Yaddshunt(Y,1/Rshort,i)
        Y = Yaddshunt(Y,1/Rshort,i+7)
    }
    return Y
}

// make I
Isrc = numeric.t(numeric.rep([14], 0), numeric.rep([14], 0))
Isrc.x[0] =  100; Isrc.y[0] =    0
Isrc.x[1] =  -50; Isrc.y[1] =  -86.6
Isrc.x[2] =  -50; Isrc.y[2] =   86.6
Isrc.x[7] = -100; Isrc.y[7] =    0
Isrc.x[8] =   50; Isrc.y[8] =   86.6
Isrc.x[9] =   50; Isrc.y[9] =  -86.6

// Flat config
// Fill the cable impedance matrix

l = ac.GMR[cidx]
if (nidx >= 0) {
    l2 = ac.GMR[nidx]
} else {
    l2 = 5
}
x = [0,ductSpacing,2*ductSpacing,0,ductSpacing,2*ductSpacing,neutralLocation*ductSpacing+l+l2]
y = numeric.rep([7], 0)

Zc = findZc(x,y)
Y = findY(Zc)

// Find the voltages:
V = Y.inv().dot(Isrc)
// Find the line currents:
Yc = Zc.inv()
I = V.getBlock([0],[6]).sub(V.getBlock([7],[13])).dot(Yc)
Iabs = I.abs().x

// Triangular config
// Fill the cable impedance matrix
x2 = [-l, l,       0, -l, l,   0,  0]
y2 = [ 0, 0, 1.73*l,  0, 0, 1.73*l, -l-l2]

Zc2 = findZc(x2,y2)
Y2 = findY(Zc2)

// Find the voltages:
V2 = Y2.inv().dot(Isrc)
// Find the line currents:
Yc2 = Zc2.inv()
I2 = V2.getBlock([0],[6]).sub(V2.getBlock([7],[13])).dot(Yc2)
Iabs2 = I2.abs().x
```

## Flat construction results

<!-- Results -->

```js
println("Concentric neutral currents = " + _.map(_.range(3,6), function(i){return Math.round(Iabs[i])}) + " %")
println("Seperate neutral current = " + Math.round(Iabs[6]) + " %")
```


## Results with all cables in one duct (triplex)

<!-- Results in one duct -->

```js
println("Concentric neutral currents = " + _.map(_.range(3,6), function(i){return Math.round(Iabs2[i])}) + " %")
println("Seperate neutral current = " + Math.round(Iabs2[6]) + " %")
```

## Assumptions

* All conductors are copper.

* Cables are 100% insulation, 15-kV class.

* The loading on each phase is balanced.

* The earth resistivity is 100 ohm-m.

* Neutrals at each end of the cable are perfectly grounded.

* For the case with cables in separate ducts, the optional neutral can be placed
  in any of the cable ducts or in a separate duct (location 4).
