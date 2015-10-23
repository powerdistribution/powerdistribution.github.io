## Lightning protection of underground cables

This example models a single-phase underground cable fed by an
overhead line. Scout arresters, placed on poles on either side of the
riser pole, are optional. These have the same discharge voltage as the
riser-pole arrester.

The plot shows the cable voltages at the riser pole, 75% down the
cable, and at the cable open point.

<img src="cable_riser.svg" style="width:100%" />

<!-- Script loader -->

```yaml
         #: script=scriptloader
- OpenETran.js
```

<!-- Input data template -->

```text
         #: name=inputtemplate
* adapted from openetran/Test/scout.dat
time 2 0.01e-6 14.0e-6

* overhead line geometry
span 1
conductor 1 10.0  0.0 0.00715 -11097.0
conductor 2  8.0  0.0 0.00715      0.0

* single-phase underground attached to upper phase
span 2
cable 1 30.0 1.5e8 -11097.0
end
end

* overhead line spans
line 1 2 1 SPAN 1 0
line 2 3 1 SPAN 0 0
line 3 4 1 SPAN 0 0
line 4 5 1 SPAN 0 1
* underground spans
line 3 6 2 CABLELEN1 0 0
line 6 7 2 CABLELEN2 0 0
end

labelphase 0 G
labelphase 1 A
labelphase 2 B
labelphase 3 C
labelphase 4 N

labelpole 3 riser
labelpole 6 xfmr
labelpole 7 opntie

* riser pole and scout arresters
arrester 0.0e3 RISERVOLTAGE 0.28 0.4e-6 LEADLEN
pairs 1 0
poles RISERLOCATIONS

* open-tie arresters
arrbez 0.0e3 ELBOWVOLTAGE 0.0 0.0 0.0 0
pairs 1 0
poles 7

surge -10.0e3 1.0e-6 50.0e-6 0.0e-6
pairs 1 0
poles SURGEPOLE

meter
pairs 1 0
poles 3 6 7
```

<div class = "row">
<div class = "col-md-5">

<!-- Input form -->

```yaml
         #: jquery=dform
class : form
html:
  - name: LEADLEN
    type: number
    step: 1.0
    bs3caption : "Lead length at the riser pole, ft"
    value: 3.0
    css:
      width: 13em
  - name: arresteratopen
    type: checkbox
    bs3caption: Use an open-point arrester
  - name: scouts
    type: checkbox
    bs3caption: Use scout arresters
  - name: RISERVOLTAGE
    type: number
    step: 5.0
    bs3caption : "Riser-pole arrester discharge voltage, kV"
    value: 40.0
    css:
      width: 13em
  - name: ELBOWVOLTAGE
    type: number
    step: 5.0
    bs3caption : "Open-point arrester discharge voltage"
    value: 50.0
    css:
      width: 13em
  - name: CABLELEN
    type: number
    step: 50.0
    bs3caption : "Cable length, ft"
    value: 800.0
    css:
      width: 13em
  - name: SPAN
    type: number
    step: 50.0
    bs3caption : "Distance between poles, ft"
    value: 200.0
    css:
      width: 13em
```
  <!-- - name: SURGEPOLE -->
  <!--   type: select -->
  <!--   bs3caption: Lightning strike location -->
  <!--   choices:  -->
  <!--     - "1" -->
  <!--     - "2" -->
  <!--     - "3" -->
  <!--   css: -->
  <!--     width: 13em -->

</div>
<div class = "col-md-7">

<!-- Generate input file and run the simulation -->

```js
    if (!arresteratopen) ELBOWVOLTAGE = 10000.0
    if (scouts) {RISERLOCATIONS = "2 3 4"} else {RISERLOCATIONS = "3"}
    inputdata = inputtemplate.replace("RISERVOLTAGE", 1000.0 * RISERVOLTAGE)
    SURGEPOLE = 1
    inputdata = inputdata.replace("SURGEPOLE", SURGEPOLE)
    inputdata = inputdata.replace("LEADLEN", LEADLEN)
    inputdata = inputdata.replace("ELBOWVOLTAGE", 1000.0 * ELBOWVOLTAGE)
    inputdata = inputdata.replace("CABLELEN1", 0.75 * 1/3.28 * CABLELEN)
    inputdata = inputdata.replace("CABLELEN2", 0.25 * 1/3.28 * CABLELEN)
    inputdata = inputdata.replace(/SPAN/g, 1/3.28 * SPAN)
    inputdata = inputdata.replace("RISERLOCATIONS", RISERLOCATIONS)
    inputdata = inputdata.replace("SURGEPOLE", SURGEPOLE)
    Module.FS_createDataFile("/", "file.dat", inputdata, true, true)
    Module["arguments"] = ["-plot", "csv", "file"]
    Module['calledRun'] = false;
    shouldRunNow = true;
    Module.run();
    out = intArrayToString(FS.findObject("/file.out").contents);
    csv = intArrayToString(FS.findObject("/file.csv").contents);
    FS.unlink("/file.dat");    // delete the input file
    FS.unlink("/file.out");    // delete the output files
    FS.unlink("/file.csv");
```

<h2>Results</h2>

<!-- Read the csv file with the simulation results -->

```js

    x = $.csv.toArrays(csv, {onParseValue: $.csv.hooks.castToScalar})

    // `header` has the column names. The first is the time, and the rest
    // of the columns are the variables.
    header = x.slice(0,1)[0]

    // Select graph variables with a select box based on the header values
    if (typeof(graphvar) == "undefined") graphvar = header[1];

```

Cable voltages, kV

<!-- Plot results -->

```js
    yidx = header.indexOf(graphvar);
    xidx = 0;
    // pick out the column to plot
    series = [{label: "Riser",
               data: x.slice(1).map(function(x) {return [x[0]*1e6, x[1]/1e3];})},
              {label: "75% to end",
               data: x.slice(1).map(function(x) {return [x[0]*1e6, x[2]/1e3];})},
              {label: "End",
               data: x.slice(1).map(function(x) {return [x[0]*1e6, x[3]/1e3];})}];
    plot(series, {legend: {noColumns: 3, container: $("#legend")}});
```
<div class="text-center">Time, &mu;sec</div>
<div id="legend"/>

</div>
</div>


## Discussions

This app uses
[EPRI OpenETran](http://sourceforge.net/projects/epri-openetran/) to
simulate the transients on the underground cable system.

Note that this app simplifies some aspects, particularly:

* Ground-potential effects are not included.
* Attenuation on the cables is not included.
* Effects of flashovers on the overhead line are not included.
* The ac voltage effect is included, but it is hard-coded into the model.
* The lightning current injection is hard coded at -10 kA with a 1-usec risetime.
* The arresters use a simplified, piecewise-linear model.

Also, this app does not consider cable BIL nor does it calculate
protective margins.

## Background

[Emscripten](http://emscripten.org/) was used to compile OpenETran's
code to JavaScript. The user interface was created in
[mdpad](http://tshort.github.io/mdpad/). See
[here](lightning-cable.md) for the code with the user interface and
[OpenETran](http://sourceforge.net/projects/openetran/) model input.
OpenETran and the GNU GSL library (an OpenETran dependency) are
distributed under the
[GNU GPL version 3.0 license](https://www.gnu.org/copyleft/gpl.html).
The source codes are available as follows:
[OpenETran](https://svn.code.sf.net/p/openetran/code/) and
[GNU GSL](http://ftpmirror.gnu.org/gsl/gsl-1.15.tar.gz).
