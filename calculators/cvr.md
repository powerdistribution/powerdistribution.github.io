# Conservation Voltage Reduction
## Customer-Side versus Utility-Side Savings

This app models the energy savings from CVR on the customer side and
the utility side based on various parameters.


<link href="http://loopj.com/jquery-simple-slider/css/simple-slider.css" rel="stylesheet" type="text/css" media="screen, projection" />

<style media="screen" type="text/css">
.slider {width:80%;}
</style>

<br/>
<br/>
<br/>
<br/>

<div class = "row">
<div class = "col-md-4">

<br/>
<br/>

<!-- Input form -->

```yaml
         #:  jquery=dform name=frm
html:
  - name: CVRf
    type: number
    step: 0.1
    bs3caption: CVR factor
    value: 0.7
  - name: LL
    type: number
    step: 0.2
    bs3caption: "Load losses, percent"
    value: 1.8
  - name: NLL
    type: number
    step: 0.2
    bs3caption: "No-load losses, percent"
    value: 1.6
  - name: lighting
    type: number
    step: 0.2
    bs3caption: "Unmetered lighting, percent"
    value: 0.0
```

</div>
<div class = "col-md-1">
</div>
<div class = "col-md-7">

<!-- Main calculations -->

```js
energy = {nll: NLL/100, ll: LL/100, lighting: lighting/100, customer: 1 - LL/100 - NLL/100 - lighting/100}
component = {nll: 5.6 / 100, ll: 0.6 / 100, lighting: 2.3 / 100, customer: 2.3 / 100 * CVRf / 0.8}
savings = {}
$.each(energy, function(k,v) {savings[k] = v * component[k]})
sum = 0.0
$.each(savings, function(k,v) {sum += v})
overall = {}
$.each(savings, function(k,v) {overall[k] = v/sum})
rowtitles = ["No-load losses", "Load losses", "Unmetered lighting", "Behind the meter"]
tbl1 = {rowtitles: rowtitles, energy: energy, component: component, overall: overall}
tbl = [energy, component, overall]
tbl = _.zip(rowtitles,
            _.map(energy, function(v) {return (100*v).toFixed(1) + "%"}),
            _.map(component, function(v) {return (100*v).toFixed(1) + "%"}),
            _.map(overall, function(v) {return (100*v).toFixed(1) + "%"}))
tbl = _.map(tbl, function(row) {return _.object(["rowname","energy","component","overall"],row)})
ans = (100 * overall.customer).toFixed(1)
```

```js output = "markdown"
println("Customer-side savings = **" + (100 * overall.customer).toFixed(1)+ "%**")
```

<br/>

<!-- Plot options -->

```yaml
         #:  name=options
legend:
    show: false
bars:
    show: true
    barWidth: 0.7
    align: center
    horizontal: true
yaxis:
    mode: categories
    tickLength: 2
    autoscaleMargin: 0.5
    ticks: [[0, "Customer side"], [1, "Utility side"]]
    font:
      size: 18
      weight: bold
      color: black
xaxis:
    autoscaleMargin: 0.1
    min: 0
    max: 100
    ticks: 2
```

<!-- Generate plot -->

```js
$.plot("#graph1", [[[100*overall.customer, 0], [100*(1-overall.customer), 1]]], options, "20em", "5em")
```

<div style="width:400px; height:100px" id = "graph1"/>

<!-- Generate a table with the results -->
<!-- Uses an emblem template -->

```emblem
           \: run=normal
br
br
table.table
  tr
    th style="width: 30%"
    th.text-center Consumption by component
    th.text-center Savings per component
    th.text-center Overall savings by component
  = tbl
    tr
      th style="width: 35%" = rowname
      td.text-center = energy
      td.text-center = component
      td.text-center = overall
```


</div>
</div>

# Discussion

With Conservation Voltage Reduction, energy is saved on the utility
side and on the customer side. This app estimates the split of energy
savings on either side of the meter. Results are based on the EPRI
Green Circuits project:

[EPRI 1023518](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=000000000001023518),
*Green Circuits: Distribution Efficiency Case Studies*, Electric Power
Research Institute, Palo Alto, CA, 2011.

As part of the Green Circuits project, 66 circuits were modeled. Each
was analyzed using an annual profile, 8760-hours-per-year approach.
Almost all models were verified using measurement data. Voltage
reduction was evaluated on almost all circuits. Table 2-6 in the
report summarizes the impact on losses and customer energy based on
these voltage reduction cases. This app uses this table as a baseline
to examine how the split of energy savings varies with several
important variables: customer CVR factor, no-load losses, load losses,
and unmetered lighting.

The no-load losses from distribution transformers are strongly
dependent on voltage. This is the major component of loss reduction
from reducing voltage.

The load losses on the distribution circuit includes the primary line
losses, load losses in distribution transformers, and secondary line
losses. These are a function of the current squared
(*I*<sup>2</sup>*R*). Depending on the circuit loads, when voltage is
reduced, the current can either increase or decrease, depending on CVR
factors for both watts and vars and the load power factor. Constant
energy loads (lower CVR factors) will cause current to increase. A
major factor here is reactive power. If the load has low power factor,
current will tend to increase because CVR factors for vars are much
higher than CVR factors for real power. Overall, in the Green Circuits
project, load losses (and currents) tended to decrease somewhat when
voltage is reduced. These dependencies on CVR factors and power factor
are not considered in this app. This app uses the Green Circuit
summary results as the baseline.

Lighting load is often unmetered. This load normally is quite
sensitive to voltage, so voltage reduction leads to significant
savings in lighting load.
