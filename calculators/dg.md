
# Distributed Generator Voltage Impacts

This app models the voltage profile along a circuit with a distributed
generator on the system. The circuit has **no other load**. The main
parameters that affect the voltage are the line impedances (based on
conductor type) and the power factor of the generator.

<!-- Load scripts -->

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

<div class="row">
<div class="col-md-4">
<br>

<!-- Input form -->

```yaml
         #:  jquery=dform
html:
  - name: kVA
    type: number
    step: 100
    bs3caption : "Generator kVA"
    value: 1000
  - name: pf
    type: number
    step: 0.05
    bs3caption : "Generator power factor"
    value: 1.0
  - name: V
    type: number
    step: 1.0
    bs3caption : "System voltage, LL, kV"
    value: 12.5
  - name: distance
    type: number
    step: 0.5
    bs3caption : "Distance from the sub, mi"
    value: 8.0
  - name: phases
    type: select
    bs3caption : "Phase conductors"
    selectvalue: 350 AAC
    choices: [6 AAC, 4 AAC, 2 AAC, 1 AAC, 1/0 AAC, 2/0 AAC, 3/0 AAC, 4/0 AAC, 250 AAC, 266.8 AAC, 300 AAC, 336.4 AAC, 350 AAC, 397.5 AAC, 450 AAC, 477 AAC, 500 AAC, 556.5 AAC, 700 AAC, 715.5 AAC, 750 AAC, 795 AAC, 874.5 AAC, 900 AAC, 954 AAC, 1000 AAC]
  - name: VsubBase
    type: number
    step: 1.0
    bs3caption : "Substation voltage, 120-V base"
    value: 123
```

</div>

<div class = "col-md-1">
</div>

<div class = "col-md-7">

<h3>Results</h3>

<!-- Main calculations -->

```js
xA = -4; xB = 0;  xC = 4;  xN = 0.3
yA = 35; yB = 36; yC = 35; yN = 33
rho = 100
condT = 100

sq= function(x) {
  return x * x;
}

pidx = _.map(d.conductors, String).indexOf(phases)

gmd = math.pow(math.sqrt(sq(xA - xB) + sq(yA - yB)) * math.sqrt(sq(xB - xC) + sq(yB - yC)) * math.sqrt(sq(xC - xA) + sq(yC - yA)), 0.33333333)

R = d.rac[pidx] * (1 + 0.00404 * (condT - 25)) * distance
X = 0.0529 * math.log10(gmd/d.gmr[pidx]) * 5.28 * distance
P = -kVA * math.abs(pf) * 1000 / 3
Q = -kVA * math.sign(pf) * math.sqrt(1 - pf*pf) * 1000 / 3

Vsub = VsubBase / 120 * V * 1000 / math.sqrt(3)

// Iterate to find the current using the Newton method
function fun(x) {
  a = R * x[0] * x[0] + R * x[1] * x[1] + P - x[0] * Vsub;
  b = X * x[0] * x[0] + X * x[1] * x[1] + Q + x[1] * Vsub;
  return math.abs(a) + math.abs(b);
}
function grad(x) {
  a = 2 * R * x[0] - Vsub;
  b = 2 * X * x[1] + Vsub;
  return [a,b];
}
initialguess = [P/Vsub, -Q/Vsub]  // Initial estimate
tol = 1e-10
//x = numeric.uncmin(fun, initialguess, tol, grad)
x = numeric.uncmin(fun, initialguess, tol)
I = math.complex(x.solution[0], x.solution[1])
Z = math.complex(R,X)
Vl = math.select(Vsub).subtract(math.select(Z).multiply(I))
Vgen = math.abs(Vl)/(V * 1000 / math.sqrt(3)) * 120
S = Vl.multiply(math.conj(I)).value
println("Voltage at the generator = " + math.format(Vgen) + " V")
pcnt = (VsubBase - Vgen) / VsubBase * 100
println("Percent change in voltage if the generator trips = " + math.format(pcnt) + "%")
```

<h3>Voltage vs. Distance</h3>

<!-- Make plot -->

```js
distances = math.range(0, .1, distance)
N = 50
distances = new Array(N)
vv = new Array(N)
for (i = 0; i < N; i++) {
    distances[i] = i * distance / N
    vv[i] = math.abs(math.select(Vsub).subtract(math.select(Z).multiply(distances[i]/distance).multiply(I)))/(V*1000/math.sqrt(3))*120
}
series1 = _.zip(distances,vv)
plot([series1]);
```
<br/>
<br/>

<!-- Write output -->

```js
println("|I| = " + math.format(math.abs(I)) + " A")
println("IR = " + math.format(I.re) + " A")
println("IX = " + math.format(I.im) + " A")
println("P = " + math.format(3*S.re/1000) + " kW")
println("Q = " + math.format(3*S.im/1000) + " kvar")
```
</div>
</div>



## Notes

A positive power factor means that the generator is acting as a
capacitor.

Operating at a lagging power factor is one way to counteract the
voltage rise caused by a generator. See if you can adjust the power
factor to cancel out the voltage rise.
