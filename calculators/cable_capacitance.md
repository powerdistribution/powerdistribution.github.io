
# Cable Capacitance

This simple app calculates the capacitance and reactive power of
single-conductor cables.

<!-- Script loader -->

```yaml
         #: script=scriptloader
- lib/math.min.js
```

<!-- Cable data -->

```yaml 
         #: name=c
dia: [0.355, 0.395, 0.435, 0.48, 0.53, 0.59, 0.645, 0.755, 0.885, 1.08, 1.235]
cables: ["#2", "#1", "1/0", "2/0", "3/0", "4/0","250 kcmil", "350 kcmil", "500 kcmil", "750 kcmil", "1000 kcmil"]
```

<!-- Input form -->

```yaml 
         #: jquery=dform
html: 
  - name: cable 
    type: select
    bs3caption : "Cable size"
    selectvalue: "500 kcmil"
    choices: ["#2", "#1", "1/0", "2/0", "3/0", "4/0","250 kcmil", "350 kcmil", "500 kcmil", "750 kcmil", "1000 kcmil"]
    css:
      width: 13em
  - name: len 
    type: number
    step: 100.0
    bs3caption : "Cable length, ft"
    value: 1000
    css:
      width: 13em
  - name: ins
    type: number
    step: 10.0
    bs3caption : "Insulation thickness, mils"
    value: 220
    css:
      width: 13em
  - name: k
    type: number
    step: 0.1
    bs3caption : "Dielectric constant, k (PILC: 3.6, XLPE: 2.3, TR-XLPE: 2.4, EPR: 2.7-3.3)"
    value: 2.4
    css:
      width: 13em
  - name: kV
    type: number
    step: 1.0
    bs3caption : "Voltage (L-L), kV"
    value: 12.47
    css:
      width: 13em
  - name: f
    type: number
    step: 10.0
    bs3caption : "Frequency, Hz"
    value: 60.0
    css:
      width: 13em
```


<h3>Results</h3>

<!-- Main calculations -->

```js
kVlg = kV / Math.sqrt(3)

idx = _.map(c.cables, String).indexOf(cable)

d = c.dia[idx]
D = d + 2 * ins / 1000
C = 0.00736 * k / math.log10(D / d) * len / 1000
ohms = 1 / (2 * Math.PI * f * C)
vars = 2 * Math.PI * f * C * kVlg * kVlg

println("Cable capacitance per phase = " + math.format(C) + " uF")
println("Capacitive impedance = " + math.format(1000*ohms) + " kohms")
println("Reactive power per phase = " + math.format(vars / 1000) + " kvar")
```
