## Lightning Performance of Overhead Lines with [EPRI-OpenETran](http://sourceforge.net/projects/epri-openetran/)

This app models the performance of overhead lines to direct strikes using
[EPRI-OpenETran](http://sourceforge.net/projects/epri-openetran/).
This is a work in progress with the aim of incorporating results into
[IEEE FLASH](http://sourceforge.net/projects/ieeeflash/), the work of the
[IEEE PES Lightning Performance of Overhead Lines Working Group](http://www.ewh.ieee.org/soc/pes/lpdl/).
Currently, you can include all features of OpenETran. For some
features, you may have to enter the raw input codes into the
appropriate location in the Advanced tab.

Modify the input tables by double-clicking (or press F2). On most of
the tables, you can add or delete rows with the context menu (right
click). You can save modified cases in a local library and import and
export them. Note that the saved file format may change as this app
evolves. See [here](OpenETran.pdf) for documentation on the OpenETran
table inputs.

<style>
.btn-file {
    position: relative;
    overflow: hidden;
}
.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    font-size: 999px;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    background: white;
    cursor: inherit;
    display: block;
}
.modal-lg {width:50em}
</style>


```yaml
        #: script=scriptloader
- OpenETran.js
- lib/handsontable.full.min.js
```

```yaml
        #: script=dataloader
library: OpenETran_library.yaml
```

```js
if (typeof(firstrun) == "undefined") {
    fillcase = function(x, name) {
        // fill in the input tables with the case for object x
        $("#casename").val(name)
        $("#description").val(x.Description)
        $("#hdrtbl").find(".mdresult").handsontable('loadData', x.Header)
        $("#hd2tbl").find(".mdresult").handsontable('loadData', x.Header2)
        $("#srgtbl").find(".mdresult").handsontable('loadData', x.Surge)
        $("#cndtbl").find(".mdresult").handsontable('loadData', x.Conductors)
        $("#sldtbl").find(".mdresult").handsontable('loadData', x.Shielding)
        $("#gsltbl").find(".mdresult").handsontable('loadData', x.GroundSlope)
        $("#instbl").find(".mdresult").handsontable('loadData', x.Insulators)
        $("#arrtbl").find(".mdresult").handsontable('loadData', x.Arresters)
        $("#gndtbl").find(".mdresult").handsontable('loadData', x.Grounds)
        $("#mtrtbl").find(".mdresult").handsontable('loadData', x.Meters)
        $("#oeheader").val(x.OEheader)
        $("#oetrailer").val(x.OEtrailer)
    }
    totext = function(name, x) {
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
    totextc = function(x) {
        s = "";
        for (i = 0; i < x.length - 1; i++) {
            s = s + "conductor ";
            for (j = 0; j < x[0].length - 1; j++) {
                s = s + x[i][j] + " ";
            }
            s = s + "\n";
        }
        return s;
    }
    getcurrentcase = function() {
        return {
            Name: $("#casename").val(),
            Description: $("#description").val(),
            Header:      $("#hdrtbl").find(".mdresult").handsontable('getData'),
            Header2:     $("#hd2tbl").find(".mdresult").handsontable('getData'),
            Surge:       $("#srgtbl").find(".mdresult").handsontable('getData'),
            Conductors:  $("#cndtbl").find(".mdresult").handsontable('getData'),
            Shielding:   $("#sldtbl").find(".mdresult").handsontable('getData'),
            GroundSlope: $("#gsltbl").find(".mdresult").handsontable('getData'),
            Insulators:  $("#instbl").find(".mdresult").handsontable('getData'),
            Arresters:   $("#arrtbl").find(".mdresult").handsontable('getData'),
            Grounds:     $("#gndtbl").find(".mdresult").handsontable('getData'),
            Meters:      $("#mtrtbl").find(".mdresult").handsontable('getData'),
            OEheader:    $("#oeheader").val(),
            OEtrailer:   $("#oetrailer").val()
        };
    }
    localsave = function() {
        var cs = getcurrentcase();
        var name = cs.Name;
        delete cs.Name;
        var locallib = JSON.parse(localStorage.locallib);
        locallib[name] = cs;
        localStorage.locallib = JSON.stringify(locallib);
        $("#locallist").calculate();
    }
    localdelete = function() {
        localStorage.locallib = JSON.stringify({});
        $("#locallist").calculate();
    }
    localexport = function(evt) {
        <!-- var content = jsyaml.dump(JSON.parse(localStorage.locallib)); -->
        var content = "# OpenETran input file in JSON format\n\n" + localStorage.locallib;
        var link = document.createElement("a");
        link.download = "openetran-export.yaml";
        link.href = "data:text/plain," + encodeURIComponent(content);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    localimport = function(evt) {
        var file = evt.target.files[0]; // FileList object
        var reader = new FileReader();
        reader.onload = function(f) {
            var locallib = JSON.parse(localStorage.locallib);
            var filecontents = jsyaml.load(f.target.result);
            ks = Object.keys(filecontents);
            for (var i = 0; i < ks.length; i++) {
                var k = ks[i];
                locallib[k] = filecontents[k];
            }
            localStorage.locallib = JSON.stringify(locallib);
            $("#local-form")[0].reset();
            $("#locallist").calculate();
        }
        reader.readAsText(file);
    }
    localdelete = function() {
        localStorage.locallib = JSON.stringify({});
        $("#locallist").calculate();
    }
    $('#save-btn').click(localsave);
    $('#delete-btn').click(localdelete);
    $('#export-btn').click(localexport);
    $('#import-btn').change(localimport);
    k = Object.keys(library)[0]
    fillcase(library[k], k)
    firstrun = false  
    pow = Math.pow
    P = function(I) {return 1/(1 + pow((I-.5)/31, 2.6)) - 1/(1 + pow((I+.5)/31, 2.6));}
    sq = function(x) {return x * x}
    egm = function(x, y) {
        var n = x.length
        var exposure = _.map(y, function(y) {return 0.0})
        for ( I = 3; I < 200; I++ ) {
            Rc = 10 * pow(I, 0.65)
            beta = 0.9
            exposure1 = _.map(_.range(n), function(k) {return x[k] - 14 * pow(y[k], 0.6)}) // I think how TEM did it
            exposure2 = _.map(_.range(n), function(k) {return x[k] + 14 * pow(y[k], 0.6)})
            exposure1 = _.map(_.range(n), function(k) {return x[k] - Math.sqrt(sq(Rc) - sq(beta * Rc - y[k]))})
            exposure2 = _.map(_.range(n), function(k) {return x[k] + Math.sqrt(sq(Rc) - sq(beta * Rc - y[k]))})
            // redo exposures for angled ground
            fx = function(x, y, angle, sgn) {
                kk = Math.tan(Math.PI * angle / 180)
                hx = beta * Rc - y + sgn * x * kk
                a = 1 + sq(kk)
                b = - 2 * kk * hx
                c = sq(hx) - sq(Rc)
                return (-b + Math.sqrt(sq(b) - 4 * a * c)) / 2 / a
            }
            exposure1 = _.map(_.range(n), function(k) {return x[k] - fx(x[k], y[k],  leftangle,  1)})
            exposure2 = _.map(_.range(n), function(k) {return x[k] + fx(x[k], y[k], rightangle, -1)})
            for ( i = 0; i < n-1; i++ ) {
                    for ( j = i + 1; j < n; j++ ) {
                         if (x[i] < x[j]) {
                             leftidx = i
                             rightidx = j
                         } else {
                             leftidx = j
                             rightidx = i
                         }
                         // http://2000clicks.com/mathhelp/GeometryConicSectionCircleIntersection.aspx
                         c2 = sq(x[i] - x[j]) + sq(y[i] - y[j])  // distance squared between conductors
                         K = 0.25 * Math.sqrt(c2*(4*Rc*Rc - c2))
                         if (!(K >= 0.0)) continue
                         X = 0.5 * (x[i] + x[j]) + 2 * (y[leftidx] - y[rightidx]) * K / c2
                         X2 = 0.5 * (x[i] + x[j]) - 2 * (y[i] - y[j]) * K / c2
                         exposure2[leftidx] = Math.min(X, exposure2[leftidx])
                         if (X <= exposure1[leftidx]) exposure1[leftidx] = X
                         exposure1[rightidx] = Math.max(X, exposure1[rightidx])
                         if (X >= exposure2[rightidx]) exposure2[rightidx] = X
                    }
            }
            exposure = _.map(_.range(n), function(k) {return exposure[k] + (exposure2[k] - exposure1[k]) * P(I) / 10})
        }
        return(exposure)
    }
    Handsontable.PluginHooks.add('afterChange', function() {
        $("#loadtables").calculate();
        $("#condcalc").calculate();
    });
    <!-- Handsontable.PluginHooks.add('afterRemoveRow', function() { -->
    <!--     $("#loadtables").calculate(); -->
    <!--     $("#condcalc").calculate(); -->
    <!-- }); -->
}
```

<!-- DEFAULT LIBRARY -->
<!-- Button trigger modal -->
<button data-toggle="modal" data-target="#myModal">
  Open default library
</button>
<!-- Button trigger modal -->
<button data-toggle="modal" data-target="#myModal2">
  Open local library
</button>

<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">Built-in library</h4>
      </div>
      <div id="caselist" class="modal-body">
        <ul>

```js
        //: output=markdown
ks = Object.keys(library)
for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    println("&lt;li&gt;&lt;a onclick='fillcase(library[\"" + k + "\"], \"" + k + "\"); return false;'&gt;" + k + "&lt;/a&gt;&lt;/li&gt;")
}
```
        </ul>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- LOCAL LIBRARY -->

<h2> Input tables</h2>

<!-- Modal -->
<div class="modal fade" id="myModal2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">Local library</h4>
      </div>
      <div id="caselist" class="modal-body">
        <ul>
```js
        //: id=locallist output=markdown
if (typeof(localStorage.locallib) == "undefined") {
    localStorage.locallib = JSON.stringify({});
}
var locallib = JSON.parse(localStorage.locallib)
ks = Object.keys(locallib)
for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    println("&lt;li&gt;&lt;a onclick='fillcase(JSON.parse(localStorage.locallib)[\"" + k + "\"], \"" + k + "\"); return false;'&gt;" + k + "&lt;/a&gt;&lt;/li&gt;")
}
```
        </ul>
        </br>
      </div>
      <div class="modal-footer">
        <form id="local-form">
          <button id="save-btn"   type="button" class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Saves the current case to the local library">Save current case</button>
          <span   id="import-btn" class="btn btn-primary btn-file"> Import... <input type="file" name="files[]"> </span>
          <!-- <a      id="export-btn" class="btn btn-primary btn-file" href="data:text/plain," + jsyaml. + "&#10;"> Export... </a> -->
          <button id="export-btn" type="button" class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Export all local cases to a file">Export...</button>
          <button id="delete-btn" type="button" class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Delete all local cases">Delete all</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </form>
      </div>
    </div>
  </div>
</div>

<ul class="nav nav-tabs" id="mytab">
  <li class="active"><a href="#cseinp" data-toggle="tab">Case</a></li>
  <li><a href="#siminp" data-toggle="tab">Parameters</a></li>
  <li><a href="#cndinp" data-toggle="tab">Conductors</a></li>
  <li><a href="#insinp" data-toggle="tab">Insulators</a></li>
  <li><a href="#arrinp" data-toggle="tab">Arresters</a></li>
  <li><a href="#gndinp" data-toggle="tab">Grounds</a></li>
  <li><a href="#mtrinp" data-toggle="tab">Meters</a></li>
  <li><a href="#advinp" data-toggle="tab">Advanced</a></li>
</ul>

<!-- Tab panes -->
<div class="tab-content">
  <!-- Case pane -->
  <div class="tab-pane active" id="cseinp">

```yaml
         #: jquery=dform
class : form
html:
  - name: CASENAME
    id: casename
    type: input
    bs3caption : "Name"
    value: ""
  - name: DESCRIPTION
    id: description
    type: textarea
    bs3caption : "Description"
    rows: 4
    value: ""
```

  </div>

  <!-- Parameters pane -->
  <div class="tab-pane" id="siminp">

```yaml
         #: jquery=handsontable id=hdrtbl
data: []
colHeaders: ["Ncond", "Npole", "Span [m]", "lt [0/1]", "rt [0/1]", "dT [s]", "Tmax [s]"]
columns: [{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'}]
width: 990
height: 55
colWidths: 110
contextMenu: ['undo', 'redo']
```

```yaml
         #: jquery=handsontable id=hd2tbl
data: []
colHeaders: ["GFD /km2/yr", "Altitude [m]", "CritI P1", "CritI P2"]
columns: [{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'}]
width: 600
height: 55
colWidths: 110
contextMenu: ['undo', 'redo']
```

<p>Surge</p>

```yaml
         #: jquery=handsontable id=srgtbl
data: []
colHeaders: ["Pole", "N1", "N2", "Ipeak [A]", "Tfront [s]", "Ttail [s]", "Tstart [s]"]
columns: [{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'}]
width: 990
height: 55
colWidths: 110
contextMenu: ['undo', 'redo']
```

  <br/>
  <br/>
  </div>


  <!-- Conductor pane -->
  <div class="tab-pane" id="cndinp">
<div class = "row">
<div class = "col-md-7">
```yaml
         #: jquery=handsontable id=cndtbl
data: []
colHeaders: ["Conductor", "H [m]", "X [m]", "r [m]", "Vpf [V]"]
columns: [{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.00000'},{type: 'numeric'}]
width: 600
height: 220
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'hsep1', 'remove_row', 'hsep2', 'undo', 'redo']
```
<div class = "row">
<div class = "col-md-5">
<p>Environmental shielding</p>
```yaml
         #: jquery=handsontable id=sldtbl
data: []
colHeaders: ["H [m]", "X [m]"]
columns: [{type: 'numeric'},{type: 'numeric'}]
width: 300
height: 100
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'hsep1', 'remove_row', 'hsep2', 'undo', 'redo']
```
</div>
<div class = "col-md-5">
<p>Ground slope [degrees]</p>
```yaml
         #: jquery=handsontable id=gsltbl
data: []
colHeaders: ["Left", "Right"]
columns: [{type: 'numeric'},{type: 'numeric'}]
width: 300
height: 100
colWidths: 100
contextMenu: ['undo', 'redo']
```
</div>
</div>
</div>
<div class = "col-md-2">
<div id="conductor-layout" style='width:180px; height:180px';/>
</div>
<div class = "col-md-2">
<div id="conductor-layout2" style='width:180px; height:180px';/>
</div>
</div>
  </div>

  <!-- Insulator pane -->
  <div class="tab-pane" id="insinp">
```yaml
         #: jquery=handsontable id=instbl
data:
  - ["all", 4, 0, 25.0, 250.0, 400e3, 5e-7, 10.0]
colHeaders: ["Poles", "N1", "N2", "CFO [V]", "Vb", "Beta", "DE"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.000'},{type: 'numeric', format: '0.0'}]
width: 800
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Arrester pane -->
  <div class="tab-pane" id="arrinp">
```yaml
         #: jquery=handsontable id=arrtbl
data: []
colHeaders: ["Poles", "N1", "N2", "Vgap [V]", "V10 [V]", "Uref [V]", "L [H/m]", "d [m]", "Plot: 1/0"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.000'},{type: 'numeric', format: '0.00'},{type: 'numeric', format: '0.0'},{type: 'numeric'}]
width: 1000
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Grounds pane -->
  <div class="tab-pane" id="gndinp">
```yaml
         #: jquery=handsontable id=gndtbl
data: []
colHeaders: ["Poles", "N1", "N2", "R60 [&Omega;]", "&rho; [&Omega;-m]", "E0 [V/m]", "L [H/m]", "d [m]"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'}]
width: 900
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Meter pane -->
  <div class="tab-pane" id="mtrinp">
```yaml
         #: jquery=handsontable id=mtrtbl
data: []
colHeaders: ["Poles", "N1", "N2"]
columns: [{},{type: 'numeric'},{type: 'numeric'}]
width: 400
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Advanced pane -->
  <div class="tab-pane" id="advinp">
```yaml
         #: jquery=dform
class : form
html:
  - name: oeheader
    id: oeheader
    type: textarea
    bs3caption: OpenETran header
    value: ""
  - name: oetrailer
    id: oetrailer
    type: textarea
    bs3caption: OpenETran trailer
    value: ""
```
    <br/>
    <br/>
  </div>


</div>


```js
        //: id=loadtables
cs = getcurrentcase()
cs.Surge[1] = 1       // kludge to add a fake row
leftangle = cs.GroundSlope[0][0]
rightangle = cs.GroundSlope[0][1]
h = cs.Header[0]
h2 = cs.Header2[0]
inputdata = h[0] + " " + h[1] + " " + h[2] + " " + h[3] + " " + h[4] + " " + h[5] + " " + h[6] + "\n" +
            cs.OEheader + "\n" +
            totextc(cs.Conductors) + "\n" +
            totext("insulator", cs.Insulators) +
            totext("arrbez",    cs.Arresters) +
            totext("ground",    cs.Grounds) +
            totext("meter",     cs.Meters) +
            totext("surge",     cs.Surge) +
            cs.OEtrailer
ncond = +h[0]
GFD = +h2[0]
p1 = +h2[2]
p2 = +h2[3]
N = ncond * (p2 - p1 + 1)
```


```js
try {
    Module.FS_createDataFile("/", "overhead.dat", inputdata, true, true)
    Module["arguments"] = ["-plot", "csv", "overhead"]
    Module['calledRun'] = false;
    shouldRunNow = true;
    Module.run();
    out = intArrayToString(FS.findObject("/overhead.out").contents);
    csv = intArrayToString(FS.findObject("/overhead.csv").contents);
    $("#oeoutput-content").text(out);
    $("#oeinput-content").text(inputdata);
}
finally {
    FS.unlink("/overhead.dat");    // delete the input file
    FS.unlink("/overhead.out");    // delete the output files
    FS.unlink("/overhead.csv");
}
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
```js
        //: id="condcalc"
cnd = cs.Conductors.slice(0, ncond)
xc = _.map(cnd, function(x) {return x[2]})
yc = _.map(cnd, function(x) {return x[1]})
xmin = _.reduce(xc, function(min, x) { if (x < min) {return x} else {return min} }, xc[0])
xmax = _.reduce(xc, function(max, x) { if (x > max) {return x} else {return max} }, xc[0])
ymin = _.reduce(yc, function(min, x) { if (x < min) {return x} else {return min} }, yc[0])
ymax = _.reduce(yc, function(max, x) { if (x > max) {return x} else {return max} }, yc[0])
if (ymax - ymin > xmax - xmin) { // keep the aspect ratio constant
    delta = (ymax - ymin - xmax + xmin) / 2
    xmax += delta
    xmin -= delta
} else {
    delta = (xmax - xmin - ymax + ymin) / 2
    ymax += delta
    ymin -= delta
}
$.plot($('#conductor-layout'),
       [{ data: _.map(cnd, function(x) {return [x[2],x[1]]}),
          points: { show: true }}],
        { grid: { show: true, borderWidth: 0 },
          xaxis: { tickLength: 5, ticks: 3, min: xmin, max: xmax, font: {size: 11, color: "#000"} },
          yaxis: { tickLength: 5, ticks: 3, min: ymin, max: ymax,
          font: {size: 11, color: "#000"} }})
env = cs.Shielding.slice(0, cs.Shielding.length)
xa = xc.concat( _.map(env, function(x) {return x[1]}) )
ya = yc.concat( _.map(env, function(x) {return x[0]}) )
xmin = _.reduce(xa, function(min, x) { if (x < min) {return x} else {return min} }, xc[0])
xmax = _.reduce(xa, function(max, x) { if (x > max) {return x} else {return max} }, xc[0])
if (ymax - ymin > xmax - xmin) { // keep the aspect ratio constant
    delta = (ymax - ymin - xmax + xmin) / 2
    xmax += delta
    xmin -= delta
} else {
    delta = (xmax - xmin - ymax + ymin) / 2
    ymax += delta
    ymin -= delta
}
yleft = xmin * Math.tan( Math.PI * leftangle / 180 )
yright = -xmax * Math.tan( Math.PI * rightangle / 180 )
ymin = _.reduce(ya, function(min, x) { if (x < min) {return x} else {return min} }, Math.min(ya[0], 0, yleft, yright))
ymax = _.reduce(ya, function(max, x) { if (x > max) {return x} else {return max} }, Math.max(ya[0], yleft, yright))
if (ymax - ymin > xmax - xmin) { // keep the aspect ratio constant
    delta = (ymax - ymin - xmax + xmin) / 2
    xmax += delta
    xmin -= delta
} else {
    delta = (xmax - xmin - ymax + ymin) / 2
    ymax += delta
    ymin -= delta
}
yleft = xmin * Math.tan( Math.PI * leftangle / 180 )
yright = -xmax * Math.tan( Math.PI * rightangle / 180 )
ymin = _.reduce(ya, function(min, x) { if (x < min) {return x} else {return min} }, Math.min(ya[0], 0, ymin, yleft, yright))
ymax = _.reduce(ya, function(max, x) { if (x > max) {return x} else {return max} }, Math.max(ya[0], ymax, yleft, yright))
$.plot($('#conductor-layout2'),
       [{ data: _.map(cnd, function(x) {return [x[2],x[1]]}),
          points: { show: true }},
        { data: _.map(env, function(x) {return [x[1],x[0]]}),
          points: { show: true }},
        { data: [[xmin, yleft], [0,0], [xmax, yright]] }
        ],
        { grid: { show: true, borderWidth: 0 },
          xaxis: { tickLength: 5, ticks: 3, min: xmin, max: xmax, font: {size: 11, color: "#000"} },
          yaxis: { tickLength: 5, ticks: 3, min: ymin, max: ymax, font: {size: 11, color: "#000"} }})
```
<div class = "row">
<div class = "col-md-8">
<div id="yaxisform"/>
```js
        //: id=plotdiv
if (typeof(header) != "undefined") {
    series = [];
    for (var i = 0; i < header.length; i++) {
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

<!-- INPUT modal -->
<a data-toggle="modal" data-target="#output-modal">
  OpenETran output file
</a> | <!-- OUTPUT modal --> <a data-toggle="modal" data-target="#input-modal">
  OpenETran input file
</a>


<!-- Modal -->
<div class="modal fade" id="output-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel2">OpenETran output</h4>
      </div>
      <div class="modal-body">
         <pre id="oeoutput-content" style="width:100%;height:80%">
         </pre>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal -->
<div class="modal fade" id="input-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel3" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel3">OpenETran raw input</h4>
      </div>
      <div class="modal-body">
         <pre id="oeinput-content" style="width:100%;height:80%">
         </pre>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


```js
critI = Array(N)
probI = Array(N)
poleN = Array(N)
condN = Array(N)
flashes = Array(N)
flashovers = Array(N)
k = 0
for (p = p1; p <= p2; p++) {
    try {
        Module.FS_createDataFile("/", "overhead.dat", inputdata, true, true)
        // TODO: make this right for ncond
        args = ["-icrit", p, p]
        for (j = 0; j < ncond; j++) {
            args.push(1);
            poleN[k*ncond + j] = p;
            condN[k*ncond + j] = j + 1;
        }
        args.push("overhead");
        Module["arguments"] = args;
        Module['calledRun'] = false;
        shouldRunNow = true;
        Module.run();
        out2 = intArrayToString(FS.findObject("/overhead.out").contents);
    }
    finally {
        FS.unlink("/overhead.dat");    // delete the input file
        FS.unlink("/overhead.out");    // delete the output file
    }
    for (j = 0; j < ncond; j++) {
        cI = +out2.match(new RegExp("wire  " + (j+1) + ": (.*)"))[1];
        critI[k*ncond + j] = cI
        probI[k*ncond + j] = 100 / (1 + Math.pow(cI / 31000, 2.6))
    }
    k++
}
flashes = egm(xa, ya)
totalflashes = (GFD * _.reduce(_.range(ncond), function(sum, i) { return sum += flashes[i] }, 0)).toFixed(2)
totalflashovers = (GFD * _.reduce(_.range(N), function(sum, i) { j = i % ncond; return sum += flashes[j] * probI[i]/100 }, 0) / (p2 - p1 + 1)).toFixed(2)
tbl = _.map(_.range(0, N), function(i) {j = i % ncond;
    return {
        pole: poleN[i],
        cond: condN[i],
        I: (critI[i]/1000).toFixed(1),
        prob: probI[i].toFixed(1),
        flashes: (GFD * flashes[j]).toFixed(2),
        flashovers: (GFD * flashes[j] * probI[i]/100).toFixed(2)
}})
```
```text name=tabletemplate
br
h4 Flashover probabilities
br
table.table
  tr
    th.text-center Pole
    th.text-center Conductor
    th.text-center Critical current [kA]
    th.text-center Percent flashovers
    th.text-center Flashes/100 km/yr
    th.text-center Flashovers/100 km/yr
  = tbl
    tr
      td.text-center = pole
      td.text-center = cond
      td.text-center = I
      td.text-center = prob
      td.text-center = flashes
      td.text-center = flashovers
p
  em Note that the implementation of the electrogeometric model in
     this app has not been peer reviewed or rigorously checked (the
     last two columns).
h4 Overall hits and flashovers
br
div
  strong = totalflashes
  span  flashes/100 km/yr for GFD =
  span =  GFD
  span  fl&frasl;km
  sup 2
  span &frasl;yr
div
  strong = totalflashovers
  span  flashovers/100 km/yr for GFD =
  span =  GFD
  span  fl&frasl;km
  sup 2
  span &frasl;yr
br
```
```js
        //: output=markdown
if (tbl.length > 0) {
    print(Emblem.compile(Handlebars, tabletemplate)(window))
}
```

## Notes

* This app does not consider induced voltages from nearby strokes.

* Many of the tables contain a pole number. This can be a single
  number, a set of numbers separated by spaces, or the keywords "all",
  "even", or "odd".

* The input tables are translated into a raw OpenETran input file
  documented in the OpenETran users manual. For components not given
  in the input tables, you can enter raw input in the Advanced tab.
  The "OpenETran header" is entered just after the simulation control
  parameter line. The "OpenETran trailer" is appended to the end of
  the input file.

* The Arresters tab is based on the `arrbez` component. If you would
  like to use the `arrester` component, you can use the raw OpenETran
  input format in the Advanced tab. Likewise, the Insulators tab is
  based on the `insulator` component (the `lpm` component is also
  available in OpenETran).

* See [here](OpenETran_library.yaml) for the default library file.
  This is in [YAML](http://www.yaml.org/) format. This is the same
  format that the local library is imported and exported in. Note that
  JSON is a subset of YAML, so either format should work fine.

* The local library is specific to the browser session that you are
  using. If you switch to another browser (from Chrome to Firefox for
  example), your local library won't be available. You will have to
  export then import the library to make those cases available.

* This app includes an electrogeometric model to estimate hits to
  different conductors. It uses Rc = 10 I<sup>0.65</sup> for the
  attractive radius mentioned in IEEE 1410 and IEEE 1243. A &beta; of
  0.9 is used for the attractiveness of ground. This comes reasonably
  close to Eriksson's equation for flash incidence. One can use this to
  estimate shielding failures on lines with an overhead shield wire.
  It can also be use to estimate the effect of environmental shielding
  from nearby objects (tree lines, parallel lines, etc).


## References

IEEE Std. 1243-1997, Guide for Improving the Lightning Performance of Transmission Lines.

IEEE Std. 1410-2010, IEEE Guide for Improving the Lightning Performance of Electric Power Overhead Distribution Lines.

[OpenETran Users Manual: An Open-Source Electromagnetic Transients Program](OpenETran.pdf),
Electric Power Research Institute, Palo Alto, CA, 2012.

EPRI 1022001,
[Open-Source Distribution Lightning Transients Software](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=000000000001022001),
Electric Power Research Institute, Palo Alto, CA, 2011.

McDermott, T.E.; Short, T.A.; Velez, F.G.; McDaniel, J.S., "Open
source lightning protection and electromagnetic transients software,"
IEEE Power and Energy Society General Meeting (PES), July 2013.


## Background

OpenETran is an open-source transient tool focused on modeling
lightning to overhead distribution lines. It was open-sourced by
[EPRI](http://www.epri.com). It was originally used in EPRI's Lightning
Protection Design Workstation (LPDW). Tom McDermott is the primary
developer/engineer behind OpenETran.

OpenETran and the GNU GSL library (an OpenETran dependency) are
distributed under the
[GNU GPL version 3.0 license](https://www.gnu.org/copyleft/gpl.html).
The source codes are available as follows:
[OpenETran](https://svn.code.sf.net/p/openetran/code/) and
[GNU GSL](http://ftpmirror.gnu.org/gsl/gsl-1.15.tar.gz).

See [here](OpenETran.md) for the code with the user interface and
model input.

OpenETran is written in C. [Emscripten](http://emscripten.org/) was
used to compile the C code to JavaScript. The user interface was
created in [mdpad](http://tshort.github.io/mdpad/). See
[OpenETran.md](OpenETran.md) for the Markdown code for this page. See
the complete OpenETran source [here](extras/openetran.zip).
