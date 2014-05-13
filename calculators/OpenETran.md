## Lightning Performance of Overhead Lines with [OpenETran](http://sourceforge.net/projects/openetran/)

The current example models a vertical three-phase overhead distribution
line with an overhead shield wire. The plan is to extend this to
support other configurations and to support saving and loading.

See [here](OpenETran.md) for the code with the user interface and
[EPRI-OpenETran](http://sourceforge.net/projects/epri-openetran/)
model input.

## Input tables


```yaml script=scriptloader
- OpenETran.js
```

<ul class="nav nav-tabs" id="mytab">
  <li class="active"><a href="#cndinp" data-toggle="tab">Conductors</a></li>
  <li><a href="#insinp" data-toggle="tab">Insulators</a></li>
  <li><a href="#arrinp" data-toggle="tab">Arresters</a></li>
  <li><a href="#gndinp" data-toggle="tab">Grounds</a></li>
  <li><a href="#mtrinp" data-toggle="tab">Meters</a></li>
  <li><a href="#advinp" data-toggle="tab">Advanced</a></li>
  <li><a href="#ntsinp" data-toggle="tab">Notes</a></li>
</ul>

<!-- Tab panes -->
<div class="tab-content">
  <!-- Conductor pane -->
  <div class="tab-pane active" id="cndinp">
```yaml jquery=handsontable outid=cndtbl
data:
  - [1, 11.76, -0.75, 0.00715,   3854.0]
  - [2, 11.76,  0.00, 0.00715, -11097.0]
  - [3, 10.54,  0.75, 0.00715,   7243.0]
  - [4, 12.13,  0.00, 0.00715,      0.0]
colHeaders: ["Conductor", "H [m]", "X [m]", "r [m]", "Vpf [V]"]
columns: [{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.00000'},{type: 'numeric'}]
width: 600
height: 200
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'hsep1', 'remove_row', 'hsep2', 'undo', 'redo']
```
  </div>

  <!-- Insulator pane -->
  <div class="tab-pane" id="insinp">
```yaml jquery=handsontable outid=instbl
data:
  - ["all", 1, 4, 418e3, 0.0, 5.42434, 8.4265e21]
  - ["all", 2, 4, 418e3, 0.0, 5.42434, 8.4265e21]
  - ["all", 3, 4, 325e3, 0.0, 5.42434, 8.4265e21]
colHeaders: ["Poles", "N1", "N2", "CFO [V]", "Vb", "Beta", "DE"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.000'},{type: 'numeric', format: '0.0'}]
width: 800
height: 200
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Arrester pane -->
  <div class="tab-pane" id="arrinp">
```yaml jquery=handsontable outid=arrtbl
data: []
colHeaders: ["Poles", "N1", "N2", "Vgap [V]", "V10 [V]", "Uref [V]", "L [H/m]", "d [m]"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.000'},{type: 'numeric', format: '0.00'},{type: 'numeric', format: '0.0'}]
width: 900
height: 200
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Grounds pane -->
  <div class="tab-pane" id="gndinp">
```yaml jquery=handsontable outid=gndtbl
data:
  - ["all", 4, 0, 25.0, 250.0, 400e3, 5e-7, 10.0]
colHeaders: ["Poles", "N1", "N2", "R60 [&Omega;]", "&rho; [&Omega;-m]", "E0 [V/m]", "L [H/m]", "d [m]"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'}]
width: 900
height: 200
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Meter pane -->
  <div class="tab-pane" id="mtrinp">
```yaml jquery=handsontable outid=mtrtbl
data:
  - ["6", 1, 4]
  - ["6", 2, 4]
  - ["6", 3, 4]
  - ["7", 1, 4]
  - ["7", 2, 4]
  - ["7", 3, 4]
colHeaders: ["Poles", "N1", "N2"]
columns: [{},{type: 'numeric'},{type: 'numeric'}]
width: 400
height: 200
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Advanced pane -->
  <div class="tab-pane" id="advinp">
<p>OpenETran header</p>
    <textarea name=oeheader style="width:100%">
4 11 30.0 1 1 0.02e-6 5.0e-6
    </textarea>
<p>OpenETran trailer</p>
    <textarea name=oetrailer style="width:100%">
surge -30.0e3 1.0e-6 100.0e-6 0.0e-6
pairs 4 0
poles 6
    </textarea>
    <br/>
    <br/>
  </div>


  <!-- Notes pane -->
  <div class="tab-pane" id="ntsinp">
    <br/>
    <textarea name=notes style="width:100%" rows="7">
This case shows example #2 from IEEE Std. 1410-2010, "35 kV distribution line with an OHGW".
The construction is vertical with post insulators and a fiberglass standoff to run the ground 
from the shield wire around the insulators.
    </textarea>
    <br/>
    <br/>
  </div>


</div>


```js
function totext(name, x) {
    s = "";
    for (i = 0; i < x.length - 1; i++) {
        s = s + name + " ";
        for (j = 3; j < x[0].length; j++) {
            s = s + x[i][j] + " ";
        }
        s = s + "\npairs " + x[i][1] + " " + x[i][2];
        s = s + "\npoles " + x[i][0] + "\n";
    }
    return s;
}
function totextc(x) {
    s = "";
    for (i = 0; i < x.length - 1; i++) {
        s = s + "conductor ";
        for (j = 0; j < x[0].length; j++) {
            s = s + x[i][j] + " ";
        }
        s = s + "\n";
    }
    return s;
}
inputdata = oeheader +
            totextc($("#cndtbl").handsontable('getData')) + 
            totext("insulator", $("#instbl").handsontable('getData')) + 
            totext("arrbez",    $("#arrtbl").handsontable('getData')) + 
            totext("ground",    $("#gndtbl").handsontable('getData')) + 
            totext("meter",     $("#mtrtbl").handsontable('getData')) +
            oetrailer
```


```js
    Module.FS_createDataFile("/", "overhead.dat", inputdata, true, true)
    Module["arguments"] = ["-plot", "csv", "overhead"]
    Module['calledRun'] = false;
    shouldRunNow = true;
    Module.run();
    out = intArrayToString(FS.findObject("/overhead.out").contents);
    csv = intArrayToString(FS.findObject("/overhead.csv").contents);
    FS.unlink("/overhead.dat");    // delete the input file
    FS.unlink("/overhead.out");    // delete the output files
    FS.unlink("/overhead.csv");
```

<input type="button" value="Calculate" onclick="mdpad.calculate()">
<br/>
<br/>

```js
    // read the csv file with the simulation results
    x = $.csv.toArrays(csv, {onParseValue: $.csv.hooks.castToScalar})
    // `header` has the column names. The first is the time, and the rest
    // of the columns are the variables.
    header = x.slice(0,1)[0]
    if (typeof(graphvar) == "undefined") graphvar = header[1];
    polelist = _.map(header, function(x) {if (/P[0-9]/.test(x)) return Number(x.replace(/P([0-9]*):.*/, "$1"))})
    polelist = _.uniq(_.filter(polelist, function(x) {return typeof(x) != "undefined";}))
    if (typeof(polenum) == "undefined") polenum = polelist[0]
    var jsonform = {
      html: {
        type: "select",
        bs3caption: "Pole number for voltage plots [kV]",
        name: "polenum",
        selectvalue: polenum,
        choices: _.map(polelist, String),
        css: {width: "10em"}
    }};
    updatefun = function (evt) {
        calculate_forms();
        $("#plotdiv").calculate();
    }
    
    $("#yaxisform").html("");
    $("#yaxisform").dform(jsonform);
    $("#yaxisform").change(updatefun);
```
<div class = "row">
<div class = "col-md-8">
<div id="yaxisform"/>
```js id=plotdiv
if (typeof(header) != "undefined") {
    series = [];
    for (var i = 0; i < header.length - 1; i++) {
        if ((new RegExp("P" + polenum + ":")).test(header[i])) {
            series.push({label: header[i],
                         data: x.slice(1).map(function(x) {return [x[0]*1e6, x[i]/1000];})});
        }
    }
    plot(series);
}
```
<div class="text-center">Time [&mu;sec]</div>
</div>
</div>

```js
    Module.FS_createDataFile("/", "overhead.dat", inputdata, true, true)
    Module["arguments"] = ["-icrit", "6", "6", 0, 0, 0, 1, "overhead"]
    Module['calledRun'] = false;
    shouldRunNow = true;
    Module.run();
    out2 = intArrayToString(FS.findObject("/overhead.out").contents);
    FS.unlink("/overhead.dat");    // delete the input file
    FS.unlink("/overhead.out");    // delete the output file
    println(out2)
```

## Description

## Background


Then, [Emscripten](http://emscripten.org/) was used to compile the C
code to JavaScript. The user interface was created in
[mdpad](http://tshort.github.io/mdpad/). See
[OpenETran.md](OpenETran.md) for the Markdown code for this page. See
the complete OpenETran source [here](extras/openetran.zip).
