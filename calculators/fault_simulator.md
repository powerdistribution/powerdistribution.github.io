
# Fault Simulator

This app models faults at different points on a power system with
different transformer connections. The line-to-ground voltages in per
unit are shown in blue, and the currents in kA are in green.

<!-- Load scripts -->

```yaml  
         #: script=scriptloader
- lib/tinytimer.js
```

<!-- Load OpenModelica input file -->

```yaml
         #:  script=dataloader
xml: FaultSimulatorPackage.FaultSimulator_init.xml
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
          - name: faultloc
            type: select
            bs3caption : "Fault location"
            selectvalue: 2
            choices: ["1", "2", "3", "4"]
      - type: div
        class: col-md-3
        html:
          - name: faulttype
            type: select
            bs3caption : "Fault type"
            selectvalue: A
            choices: ["A", "B", "C", "AB", "BC", "CA", "ABg", "BCg", "CAg", "ABC"]
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: tran1connection
            type: select
            bs3caption : "Transformer 1 connection"
            selectvalue: "Wye Wye"
            choices: ["Wye Wye", "Delta Wye", "Wye Delta"]
      - type: div
        class: col-md-3
        html:
          - name: tran1pn
            type: select
            bs3caption : "Primary neutral"
            selectvalue: "Solidly grounded"
            choices: ["Solidly grounded", "High impedance"]
      - type: div
        class: col-md-3
        html:
          - name: tran1sn
            type: select
            bs3caption : "Secondary neutral"
            selectvalue: "Solidly grounded"
            choices: ["Solidly grounded", "1 ohm", "High impedance"]
  - type: div
    class: row
    html:
      - type: div
        class: col-md-3
        html:
          - name: tran2connection
            type: select
            bs3caption : "Transformer 2 connection"
            selectvalue: "Wye Wye"
            choices: ["Wye Wye", "Delta Wye", "Wye Delta"]
      - type: div
        class: col-md-3
        html:
          - name: tran2pn
            type: select
            bs3caption : "Primary neutral"
            selectvalue: "Solidly grounded"
            choices: ["Solidly grounded", "1 ohm", "High impedance"]
      - type: div
        class: col-md-3
        html:
          - name: tran2sn
            type: select
            bs3caption : "Secondary neutral"
            selectvalue: "Solidly grounded"
            choices: ["Solidly grounded", "High impedance"]
```

<br/>

<!-- In the SVG, need to zap width and height and add viewBox -->

<!-- http://demosthenes.info/blog/744/Make-SVG-Responsive -->
<!-- http://coding.smashingmagazine.com/2014/03/05/rethinking-responsive-svg/ -->
<!-- <div id="svgcontainer" style="display: inline-block; position: relative; width: 100%; padding-bottom: 30%; vertical-align: middle; overflow: hidden; "> -->
<!-- <object id="svg" type="image/svg+xml" data="fault_simulator2.svg" width="100%" height="100%" style=" display: inline-block; position: absolute; top: 0; left: 0;"> -->
<!-- </object> -->
<!-- </div> -->

<object id="svg" type="image/svg+xml" data="fault_simulator.svg" width="100%" >
</object>

<div id="status" style="text-align:center"><small><span id="statustext">
Simulation loading</span>. &nbsp Time: <span id="statustimer"> </span></small></div>


<!-- Adjust the SVG and the XML input file based on user inputs -->

```js
//
$xml = $(xml)
//
var $x = $(document.getElementById("svg").contentDocument)
$x.find("#YD1").css("display", "none")
$x.find("#YY1").css("display", "none")
$x.find("#DY1").css("display", "none")
$x.find("#YD2").css("display", "none")
$x.find("#YY2").css("display", "none")
$x.find("#DY2").css("display", "none")
if (tran1connection == "Delta Wye") {
    $x.find("#DY1").css("display", "inline");
    $("select[name*='tran1pn']").parent().parent().toggle(false);
    $("select[name*='tran1sn']").parent().parent().toggle(true);
    $xml.find("ScalarVariable[name = 'conn1']").find("Integer").attr("start", 2)
} else if (tran1connection == "Wye Wye") {
    $x.find("#YY1").css("display", "inline");
    $("select[name*='tran1pn']").parent().parent().toggle(true);
    $("select[name*='tran1sn']").parent().parent().toggle(true);
    $xml.find("ScalarVariable[name = 'conn1']").find("Integer").attr("start", 1)
} else if (tran1connection == "Wye Delta") {
    $x.find("#YD1").css("display", "inline");
    $("select[name*='tran1pn']").parent().parent().toggle(true);
    $("select[name*='tran1sn']").parent().parent().toggle(false);
    $xml.find("ScalarVariable[name = 'conn1']").find("Integer").attr("start", 3)
}
if (tran2connection == "Delta Wye") {
    $x.find("#DY2").css("display", "inline");
    $("select[name*='tran2pn']").parent().parent().toggle(false);
    $("select[name*='tran2sn']").parent().parent().toggle(true);
    $xml.find("ScalarVariable[name = 'conn2']").find("Integer").attr("start", 2)
} else if (tran2connection == "Wye Wye") {
    $x.find("#YY2").css("display", "inline");
    $("select[name*='tran2pn']").parent().parent().toggle(true);
    $("select[name*='tran2sn']").parent().parent().toggle(true);
    $xml.find("ScalarVariable[name = 'conn2']").find("Integer").attr("start", 1)
} else if (tran2connection == "Wye Delta") {
    $x.find("#YD2").css("display", "inline");
    $("select[name*='tran2pn']").parent().parent().toggle(true);
    $("select[name*='tran2sn']").parent().parent().toggle(false);
    $xml.find("ScalarVariable[name = 'conn2']").find("Integer").attr("start", 3)
}
$x.find("#F1,#F2,#F3,#F4").css("display", "none")
$x.find("#1A,#1B,#1C,#1AB,#1BC,#1CA,#2A,#2B,#2C,#2AB,#2BC,#2CA,#3A,#3B,#3C,#3AB,#3BC,#3CA,#4A,#4B,#4C,#4AB,#4BC,#4CA").css("display", "none")
$x.find("#F"+faultloc).css("display", "inline")
faultid = "#" + faultloc + faulttype
$x.find(faultid).css("display", "inline")
if (faulttype == "ABC") {
    $x.find("#" + faultloc + "A").css("display", "inline");
    $x.find("#" + faultloc + "B").css("display", "inline");
    $x.find("#" + faultloc + "C").css("display", "inline");
} else if (faulttype == "ABg") {
    $x.find("#" + faultloc + "A").css("display", "inline");
    $x.find("#" + faultloc + "B").css("display", "inline");
} else if (faulttype == "BCg") {
    $x.find("#" + faultloc + "B").css("display", "inline");
    $x.find("#" + faultloc + "C").css("display", "inline");
} else if (faulttype == "CAg") {
    $x.find("#" + faultloc + "A").css("display", "inline");
    $x.find("#" + faultloc + "C").css("display", "inline");
}
xmlfaulttypelist = ["ABC", "A", "B", "C", "AB", "BC", "CA", "ABg", "BCg", "CAg"];
idx = xmlfaulttypelist.indexOf(faulttype);
for (loc = 1; loc <= 4; loc++)
    $xml.find("ScalarVariable[name = 'fault" + loc + ".faultType0']").find("Integer").attr("start", 99)
$xml.find("ScalarVariable[name = 'fault" + faultloc + ".faultType0']").find("Integer").attr("start", idx)

neutraloptions = {"Solidly grounded": 1e-7, "1 ohm": 1.0, "2 ohms": 2.0, "High impedance": 1e3}
$xml.find("ScalarVariable[name = 'transformer1.Xn1']").find("Real").attr("start", neutraloptions[tran1pn])
$xml.find("ScalarVariable[name = 'transformer1.Xn2']").find("Real").attr("start", neutraloptions[tran1sn])
$xml.find("ScalarVariable[name = 'transformer2.Xn1']").find("Real").attr("start", neutraloptions[tran2pn])
$xml.find("ScalarVariable[name = 'transformer2.Xn2']").find("Real").attr("start", neutraloptions[tran2sn])
```

<!-- Start the timer and launch the simulation -->

```js
if (typeof(isRunning) == "undefined") isRunning = false

if (typeof(timer) != "undefined") {clearInterval(timer.interval); timer = null};


// Write out the initialization file
xmlstring = new XMLSerializer().serializeToString(xml)

$("#statustext").html('Simulation running')
$("#statustimer").html("");
$('#statustimer').tinyTimer({ from: Date.now() });

timer = $("#statustimer").data("tinyTimer")

// Start the simulation!
basename = "FaultSimulatorPackage.FaultSimulator"

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
    y = $.csv.toObjects(e.data.csv, {onParseValue: $.csv.hooks.castToScalar})[5]

    $("#plotdiv").calculate();

}, false);

```

<!-- Plot results -->

```js
         //:  id=plotdiv
sq= function(x) {
  return x * x;
}
if (typeof(y) != "undefined") {
    //
    // update voltages annotations on the SVG
    //
    var $x = $(document.getElementById("svg").contentDocument)
    phases = ["a","b","c"]
    for (loc = 1; loc <= 4; loc++)
        for (phase = 0; phase < 3; phase++) {
            name = "v" + loc + phases[phase]
            re = y[name + ".re"]
            im = y[name + ".im"]
            mag = Math.sqrt(sq(re) + sq(im)).toFixed(2)
            ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
            $x.find("#" + name).children().text(mag+"∠"+ang+"°")
        }
    //
    // update currents on the SVG
    //
    $x.find("#i2").toggle(faultloc == "1")
    $x.find("#i4").toggle(faultloc == "2" || faultloc == "3")
    $x.find("#i5").toggle(faultloc == "4")
    for (loc = 1; loc <= 5; loc++)
        for (phase = 0; phase < 3; phase++) {
            name = "i" + loc + phases[phase]
            re = y[name + ".re"]
            im = y[name + ".im"]
            mag = Math.sqrt(sq(re) + sq(im)).toPrecision(2)
            ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
            $x.find("#" + name).children().text(mag+"∠"+ang+"°")
            // hide small currents
            $x.find("#" + name).toggle(mag >= 0.01)
        }
    for (loc = 1; loc <= 4; loc++) {
        name = "in" + loc
        re = y[name + ".re"]
        im = y[name + ".im"]
        mag = Math.sqrt(sq(re) + sq(im)).toPrecision(2)
        ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
        $x.find("#" + name).children().text(mag+"∠"+ang+"°")
        // hide small currents
        $x.find("#" + name).toggle(mag >= 0.01)
    }
}
```

## Examples

Here are some examples to try:

* Apply a fault to point 1, and view the voltage sags at different
  points with different transformer connections.

* Use an ungrounded secondary connection on transformer 1, and apply a
  line-to-ground fault at point 2. Note the currents and voltages.
  Now, change transformer 2 into a grounding transformer, and note
  what happens to the currents and voltages.

* Use a delta -- grounded-wye connection for transformer 1, and apply
  a line-to-ground fault at point 2. Note the currents on the high
  side. Repeat for a line-to-line fault and a line-to-line-to-ground
  fault.

* Use a delta -- grounded-wye connection for transformer 1, and apply
  a line-to-ground fault at point 2. Change from a solidly grounded
  neutral to a 1-ohm reactor. Is it still effectively grounded? Look
  at the voltages on the unfaulted phases.

## Assumptions

This model is a steady-state model. The transformers are "ideal" and
do not include any magnetizing or saturation effects. The impedances
also do not reflect winding configurations. The line between points 2
and 3 has Z<sub>1</sub> = 1 + j2 ohms and Z<sub>0</sub> = 2 + j4 ohms.
The voltages on the system are hard coded (138, 12.47, and 0.48 kV).
It would be possible to allow the user to enter more parameters, but
the number of inputs will grow fast.

Each "zone" has a small amount of line-to-ground capacitance to fix
the line-to-ground voltages for cases of floating connections.

It is possible to input transformer connections that you really
shouldn't use (see the discussion in section 5.4.5) with a floating
neutral. The bad effects won't be apparent because of the idealized
transformer models used.


## Background

This simulation model is from a [Modelica](http://modelica.org) model.
See [FaultSimulator.mo](FaultSimulator.mo) for the Modelica file you
can run in [OpenModelica](http://openmodelica.org), a free and
open-source modeling tool with a model compiler and graphical
interface. Use OpenModelica (or another Modelica tool) if you want to
change modeling components and explore in more detail.
[OpenDSS](http://www.smartgrid.epri.com/SimulationTool.aspx) is
another tool that's useful for this type of analysis.
