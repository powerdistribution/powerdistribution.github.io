# Overhead Distribution Line Impedances

<!-- Script loader -->

```yaml
         #:  script=scriptloader
- lib/math.min.js
```

<!-- Conductor data -->

```yaml
         #:  name=d
rac: [3.551, 2.232, 1.402, 1.114, 0.882, 0.7, 0.556, 0.441, 0.373, 0.35, 0.311, 0.278, 0.267, 0.235, 0.208, 0.197, 0.188, 0.169, 0.135, 0.133, 0.127, 0.12, 0.109, 0.106, 0.101, 0.0963]
gmr: [0.0055611962035177, 0.00700459393067038, 0.00882262274842038, 0.00990159326021141, 0.0111125174323268, 0.0124715326552536, 0.0139967498560307, 0.0157084948536593, 0.0171990576740366, 0.0177754680514267, 0.0197856043349646, 0.0209605660328388, 0.0214852445181602, 0.0227611387971986, 0.0243123406199979, 0.0249209197027924, 0.0255447325512619, 0.0270616982108416, 0.0308759703782212, 0.0311314761296609, 0.0319107497292355, 0.0327095298674806, 0.0343675751093677, 0.0349387277474913, 0.0361096666226405, 0.0367097709735484]
conductors: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
```

<div class="row">
<div class="col-md-6">

<!-- Input form -->

```yaml
         #:  jquery=dform
class : form-inline
html:
  - type: h2
    html: Phase conductors
  - name: phases
    type: select
    css:
      width: 10em
    bs3caption : ""
    selectvalue: 350 AAC
    choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
  - type: h6
    html: Conductor positions in feet
  - name: xA
    type: number
    step: 0.2
    bs3caption : "xA"
    value: -4.0
  - name: yA
    type: number
    bs3caption : "yA"
    value: 30.0
  - name: xB
    type: number
    step: 0.2
    bs3caption : "xB"
    value:  0.0
  - name: yB
    type: number
    bs3caption : "yB"
    value: 31.0
  - name: xC
    type: number
    step: 0.2
    bs3caption : "xC"
    value: 4.0
  - name: yC
    type: number
    bs3caption : "yC"
    value: 30.0
```
</div>

<div class="col-md-6">

<!-- Second input form -->

```yaml
         #:  jquery=dform
class : form-inline
html:
  - type: h2
    html: Neutral conductor
  - name: neutral
    type: select
    css:
      width: 10em
    bs3caption : ""
    selectvalue: 4/0 AAC
    choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
  - type: h6
    html: &nbsp;
  - name: xN
    type: number
    step: 0.2
    bs3caption : "xN"
    value: 0.0
  - name: yN
    type: number
    bs3caption : "yN"
    value: 25.0
```

<br/>
<br/>

<div class="col-md-1">
</div>

<div class="col-md-7">

<!-- Third input form -->

```yaml
         #:  jquery=dform
html:
  - name: rho
    type: number
    step: 25.0
    min: 0.0
    bs3caption : Earth resistivity, ohm-m
    value: 100.0
  - name: condT
    type: number
    step: 5.0
    bs3caption : Conductor temperature, &deg;C
    value: 25.0

```
</div>
</div>
</div>



## Results

<!-- Main calculations -->

```js

sq= function(x) {
  return x * x;
}

pidx = _.map(d.conductors, String).indexOf(phases)
nidx = _.map(d.conductors, String).indexOf(neutral)

gmd = math.pow(math.sqrt(sq(xA - xB) + sq(yA - yB)) * math.sqrt(sq(xB - xC) + sq(yB - yC)) * math.sqrt(sq(xC - xA) + sq(yC - yA)), 0.33333333)

gmdpn = math.pow(math.sqrt(sq(xA - xN) + sq(yA - yN)) * math.sqrt(sq(xB - xN) + sq(yB - yN)) * math.sqrt(sq(xC - xN) + sq(yC - yN)), 0.33333333)


r = d.rac[pidx] * (1 + 0.00404 * (condT - 25))
rn = d.rac[nidx] * (1 + 0.00404 * (condT - 25))

z1 = math.complex(r / 5.28,
                  0.0529 * math.log10(gmd/d.gmr[pidx]))

znn = math.complex(rn / 5.28 + .01807,
                   0.0529 * math.log10(278.9 * Math.sqrt(rho) / d.gmr[nidx]))

zpn = math.complex(0.01807, 0.0529 * math.log10(278.9 * math.sqrt(rho) / gmdpn))

z0 = math.complex(r / 5.28 + 3 * .01807,
                  3 * 0.0529 * math.log10(278.9 * math.sqrt(rho) / math.pow(d.gmr[pidx] * gmd * gmd, 1./3)))
zz = math.select(3).multiply(zpn).multiply(zpn).divide(znn).done()
z0 = math.subtract(z0,zz)

zg = math.select(2).multiply(z1).add(z0).divide(3).done()

println("Z1 = " + math.format(z1) + " ohms/1000ft");
println("Z0 = " + math.format(z0) + " ohms/1000ft");
println("Zg = " + math.format(zg) + " ohms/1000ft");


```


## Notes

This app is a simple implementation of the equations outlined in
section 2.4. The code is hard wired for a 60 Hz calculation, and the
equations become less accurate at higher frequencies. For more
sophisticated line modeling, see
[OpenDSS](http://www.smartgrid.epri.com/SimulationTool.aspx) or a
transient program like [EMTP-RV](http://emtp.com) or
[ATP](http://emtp.org).
