## Ferroresonance on a Five-Legged Core Transformer

<!-- Script loader -->

```yaml
         #:  script=scriptloader
- lib/tinytimer.js
```

<!-- Load OpenModelica input file -->

```yaml
         #:  script=dataloader
xml: FerroModule.Ferro_init.xml
```

<!-- Emblem template for input and results -->

```emblem
#status style="text-align:center"
  span#statustext Simulation loading
  span &nbsp;&nbsp;Time: 
  span#statustimer
br
br
.row
  .col-md-5
    #inputform
  .col-md-7
    ul.nav.nav-tabs#mytab
      li.active
        a href="#model" data-toggle="tab" Model
      li
        a href="#results" data-toggle="tab" Results
    .tab-content
      .tab-pane.active#model
        img src="Ferro.svg" style="width:100%; background-color:#ffffff; border:2px solid gray"     
      .tab-pane#results
        #mdresults
```
        
<!-- Input form -->

```yaml
         #:  jquery=dform name=frm outputid=inputform
class : form-horizontal
col1class : col-sm-7
col2class : col-sm-5
html:
  - name: stopTime
    type: number
    step: 0.1
    bs3caption: Stop time, sec
    value: 0.3
  - name: V
    type: number
    step: 5.0
    bs3caption: Source voltage, LL, kV
    value: 24.94
  - name: cableLen
    type: number
    step: 50.0
    bs3caption: Cable length, feet
    value: 200.0
  - name: cableT
    type: number
    step: 10.0
    bs3caption: Insulation thickness, mils
    value: 260.0
  - name: cableD
    type: number
    step: 10.0
    min: 0.0001
    bs3caption: Conductor diameter, mils
    value: 528
  - name: trankVA
    type: number
    step: 10.0
    min: 0.0001
    bs3caption: Transformer kVA
    value: 75
  - name: tranLosses
    type: number
    step: 0.1
    min: 0.0001
    bs3caption: No-load losses, percent
    value: 0.2
  - name: load
    type: number
    step: 0.1
    min: 0.0001
    bs3caption: Resistive load, percent
    value: 0.0001
  <!-- - name: isClosedA -->
  <!--   type: checkbox -->
  <!--   bs3caption: Phase A closed -->
  <!--   value: true -->
  <!-- - name: isClosedB -->
  <!--   type: checkbox -->
  <!--   bs3caption: Phase B closed -->
  <!--   value: false -->
  <!-- - name: isClosedC -->
  <!--   type: checkbox -->
  <!--   bs3caption: Phase C closed -->
  <!--   value: false -->
```

<!-- Adjust the XML input file based on user inputs and launch the simulation -->

```js
if (typeof(isRunning) == "undefined") isRunning = false

if (typeof(timer) != "undefined") {clearInterval(timer.interval); timer = null};
$xml = $(xml)

// Set the default simulation parameters
defex = $xml.find("DefaultExperiment")
defex.attr("stopTime", stopTime)
defex.attr("stepSize", +stopTime / 500)

// Set some model parameters
$xml.find("ScalarVariable[name = 'threePhaseSource.V']").find("Real").attr("start", V * 1000.0)
<!-- $xml.find("ScalarVariable[name = 'switch.isClosedA']").find("Boolean").attr("start", isClosedA) -->
<!-- $xml.find("ScalarVariable[name = 'switch.isClosedB']").find("Boolean").attr("start", isClosedB) -->
<!-- $xml.find("ScalarVariable[name = 'switch.isClosedC']").find("Boolean").attr("start", isClosedC) -->
$xml.find("ScalarVariable[name = 'cableCapacitance.length']").find("Real").attr("start", cableLen / 3.28)
$xml.find("ScalarVariable[name = 'cableCapacitance.d']").find("Real").attr("start", cableD * 2.54e-5)
$xml.find("ScalarVariable[name = 'cableCapacitance.l']").find("Real").attr("start", cableT * 2.54e-5)
$xml.find("ScalarVariable[name = 'fiveleggedcoretransformer1.tran_VA']").find("Real").attr("start", trankVA * 1000)
$xml.find("ScalarVariable[name = 'fiveleggedcoretransformer1.tran_prim_V']").find("Real").attr("start", V * 1000.0)
$xml.find("ScalarVariable[name = 'fiveleggedcoretransformer1.tran_core_loss']").find("Real").attr("start", tranLosses)
$xml.find("ScalarVariable[name = 'fiveleggedcoretransformer1.resistive_load']").find("Real").attr("start", load)

console.log($xml.find("ScalarVariable[name = 'switch.isClosedA']").find("Boolean").attr("start"))

// Write out the initialization file
xmlstring = new XMLSerializer().serializeToString(xml)

$("#statustext").html('Simulation running')
$("#statustimer").html("");
$('#statustimer').tinyTimer({ from: Date.now() });

timer = $("#statustimer").data("tinyTimer")

// Start the simulation!
basename = "FerroModule.Ferro"

if (typeof(wworker) != "undefined" && isRunning) wworker.terminate()
if (typeof(wworker) == "undefined" || isRunning) wworker = new Worker(basename + ".js")
isRunning = true

wworker.postMessage({basename: basename, xmlstring: xmlstring})
wworker.addEventListener('error', function(event) {
});


```


<!-- Read the csv file with the simulation results -->

```js

wworker.addEventListener("message", function(e) {
    $("#statustext").html(e.data.status)
    timer.stop();
    isRunning = false
    x = $.csv.toArrays(e.data.csv, {onParseValue: $.csv.hooks.castToScalar})

    // `header` has the column names. The first is the time, and the rest
    // of the columns are the variables.
    header = x.slice(0,1)[0]

    $("#plotdiv").calculate();

}, false);

```


<!-- Plot results -->

```js
         //:  id=plotdiv outputid=mdresults
if (typeof(header) != "undefined") {
    console.log(header);
    $("#mytab a:last").tab("show"); // Select last tab
    y1idx = header.indexOf("v[1]");
    y2idx = header.indexOf("v[2]");
    y3idx = header.indexOf("v[3]");
    xidx = 0;
    // pick out the column to plot
    series1 = x.slice(1).map(function(x) {return [x[xidx], x[y1idx] / 1000];});
    series2 = x.slice(1).map(function(x) {return [x[xidx], x[y2idx] / 1000];});
    series3 = x.slice(1).map(function(x) {return [x[xidx], x[y3idx] / 1000];});
    plot([series1, series2, series3]);
}
```



## Description

This simulation shows line-to-ground voltages when one phase is
disconnected upstream of a three-phase five-legged core transformer.
For more information, see section 5.10.2 in the handbook. The key
parameters are transformer losses, resistive load, and the cable
length (because it determines circuit capacitance). System voltage and
transformer size are also important. Note that this model does not
include surge arresters.

This model uses a rather crude transformer saturation model used by
Walling [1994], mainly to increase simulation speed for faster display
in a browser. As noted by Walling, this is an acceptable
approximation. For more on modeling of ferroresonance, see Walling et
al. [1993] and Iravani et al. [2000].

## References

Iravani, M. R., Chaudhary, A. K. S., Giesbrecht, W. J., Hassan, I. E.,
Keri, A. J. F., Lee, K. C., Martinez, J. A., Morched, A. S., Mork, B.
A., Parniani, M., Sharshar, A., Shirmohammadi, D., Walling, R. A., and
Woodford, D. A., "Modeling and analysis guidelines for slow
transients. III. The study of ferroresonance," *IEEE Transactions on
Power Delivery*, vol. 15, no. 1, pp. 255-265, Jan 2000.

Walling, R. A., "Ferroresonant Overvoltages in Today's Loss-Evaluated
Distribution Transformers," IEEE/PES Transmission and Distribution
Conference, 1994.

Walling, R. A., Barker, K. D., Compton, T. M., and Zimmerman, L. E.,
"Ferroresonant Overvoltages in Grounded Wye-Wye Padmount Transformers
with Low-Loss Silicon Steel Cores," *IEEE Transactions on Power
Delivery*, vol. 8, no. 3, pp. 1647-60, July 1993.

## Background

This simulation model is from a [Modelica](http://modelica.org) model.
See [Ferro.mo](Ferro.mo) for the Modelica file you can
run in [OpenModelica](http://openmodelica.org), a free and open-source
modeling tool with a model compiler and graphical interface. Use
OpenModelica (or another Modelica tool) if you want to change modeling
components and explore in more detail. Modelica is a descriptive
language with component and system libraries for simulating
electrical, thermal, and mechanical systems.
