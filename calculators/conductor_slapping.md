
# Conductor Slapping

```yaml name=d
conductors: [6, 4, 2, 1, 1/0, 2/0, 3/0, 4/0, 250, 266.8, 300, 336.4, 350, 397.5, 450, 477, 500, 556.5, 700, 715.5, 750, 795, 874.5, 900, 954, 1000]
area: [0.0206, 0.0328, 0.0522, 0.0657, 0.0829, 0.1045, 0.1317, 0.1663, 0.1964, 0.2097, 0.2358, 0.2644, 0.2748, 0.3124, 0.3534, 0.3744, 0.3926, 0.4369, 0.5494, 0.5622, 0.5892, 0.6245, 0.6874, 0.7072, 0.7495, 0.7854]
wc: [0.0246, 0.0392, 0.0623, 0.0785, 0.0991, 0.1249, 0.1575, 0.1987, 0.2347, 0.2506, 0.2818, 0.316, 0.3284, 0.3734, 0.4224, 0.4475, 0.4692, 0.5221, 0.6566, 0.672, 0.7043, 0.7464, 0.821, 0.8452, 0.8958, 0.9387]
```

```yaml js=jsonForm
schema: 
  flti:
    type: number
    title: "Fault current, A"
    default: 5000
  fltt:
    type: number
    title: "Fault duration, cycles (60 Hz)"
    default: 20
  conductors: 
    type: string
    title: "Conductors"
    enum: [6, 4, 2, 1, 1/0, 2/0, 3/0, 4/0, 250, 266.8, 300, 336.4, 350, 397.5, 450, 477, 500, 556.5, 700, 715.5, 750, 795, 874.5, 900, 954, 1000]
  h0:
    type: number
    title: "Span length, feet"
    default: 300
  y0:
    type: number
    title: "Conductor sag, feet"
    default: 4.0
  x1:
    type: number
    title: "Horizontal position of conductor 2 relative to conductor 1, feet"
    default: 4.0
  y1:
    type: number
    title: "Vertical position of conductor 2 relative to conductor 1, feet"
    default: 0.0
form: 
  - "*"
```

## Results

```js output=markdown
flti = Number(flti)
fltt = Number(fltt)
h0 = Number(h0)
y0 = Number(y0)
x1 = Number(x1)
y1 = Number(y1)
idx = _.map(d.conductors, String).indexOf(conductors)
wc = d.wc[idx] 
area = d.area[idx] 

t = ficm(flti, fltt, h0, y0, x1, y1, wc, area)

if (t == 0.0)
    println("** No slapping")
else
    println("** Conductors slap at t = " + t + " secs.")
```
