## Lightning Performance of Overhead Lines with [EPRI-OpenETran](http://sourceforge.net/projects/epri-openetran/)

This app models the performance of overhead lines to direct strikes using
[EPRI-OpenETran](http://sourceforge.net/projects/epri-openetran/).
This is a work in progress with the aim of incorporating results into
[IEEE FLASH](http://sourceforge.net/projects/ieeeflash/), the work of the
[IEEE PES Lightning Performance of Overhead Lines Working Group](http://www.ewh.ieee.org/soc/pes/lpdl/).
Currently, you can include all features of OpenETran. For some
features, you may have to enter the raw input codes into the
appropriate location in th Advanced tab. This app does not (yet) do
any shielding or other electrogeometric model calculations.

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


```yaml script=scriptloader
- OpenETran.js
- //cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0/handlebars.js
- lib/emblem.min.js
```

```yaml script=dataloader
library: OpenETran_library.yaml
```

```js
if (typeof(firstrun) == "undefined") {
    fillcase = function(x, name) {
        // fill in the input tables with the case for object x
        $("#casename").val(name)
        $("#description").val(x.Description)
        $("#hdrtbl").handsontable('loadData', x.Header) 
        $("#srgtbl").handsontable('loadData', x.Surge) 
        $("#cndtbl").handsontable('loadData', x.Conductors) 
        $("#instbl").handsontable('loadData', x.Insulators) 
        $("#arrtbl").handsontable('loadData', x.Arresters) 
        $("#gndtbl").handsontable('loadData', x.Grounds) 
        $("#mtrtbl").handsontable('loadData', x.Meters)
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
            for (j = 0; j < x[0].length; j++) {
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
            Header:      $("#hdrtbl").handsontable('getData'),
            Surge:       $("#srgtbl").handsontable('getData'),
            Conductors:  $("#cndtbl").handsontable('getData'),
            Insulators:  $("#instbl").handsontable('getData'),
            Arresters:   $("#arrtbl").handsontable('getData'),
            Grounds:     $("#gndtbl").handsontable('getData'),
            Meters:      $("#mtrtbl").handsontable('getData'),
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
            console.log("here");
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
    firstrun = false;
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
```js output=markdown
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
```js id=locallist output=markdown
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
```yaml jquery=dform
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
<p>Surge</p>
```yaml jquery=handsontable outid=srgtbl
data: []
colHeaders: ["Pole", "N1", "N2", "Ipeak [A]", "Tfront [s]", "Ttail [s]", "Tstart [s]"]
columns: [{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'}]
width: 900
height: 55
colWidths: 100
contextMenu: ['undo', 'redo']
```
<br/>
<p>Simulation parameters</p>
```yaml jquery=handsontable outid=hdrtbl
data: []
colHeaders: ["Ncond", "Npole", "Span [m]", "lt [0/1]", "rt [0/1]", "dT [s]", "Tmax [s]", "CritI P1", "CritI P2"]
columns: [{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric'},{type: 'numeric'}]
width: 1100
height: 55
colWidths: 100
contextMenu: ['undo', 'redo']
```
  <br/>
  <br/>
  </div>


  <!-- Conductor pane -->
  <div class="tab-pane" id="cndinp">
```yaml jquery=handsontable outid=cndtbl
data: []
colHeaders: ["Conductor", "H [m]", "X [m]", "r [m]", "Vpf [V]"]
columns: [{type: 'numeric'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.0'},{type: 'numeric', format: '0.00000'},{type: 'numeric'}]
width: 600
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'hsep1', 'remove_row', 'hsep2', 'undo', 'redo']
```
  </div>

  <!-- Insulator pane -->
  <div class="tab-pane" id="insinp">
```yaml jquery=handsontable outid=instbl
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
```yaml jquery=handsontable outid=arrtbl
data: []
colHeaders: ["Poles", "N1", "N2", "Vgap [V]", "V10 [V]", "Uref [V]", "L [H/m]", "d [m]"]
columns: [{},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric'},{type: 'numeric', format: '0.000'},{type: 'numeric', format: '0.00'},{type: 'numeric', format: '0.0'}]
width: 900
height: 250
colWidths: 100
minSpareRows: 1
contextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'undo', 'redo']
```
  </div>

  <!-- Grounds pane -->
  <div class="tab-pane" id="gndinp">
```yaml jquery=handsontable outid=gndtbl
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
```yaml jquery=handsontable outid=mtrtbl
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
```yaml jquery=dform
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
cs = getcurrentcase()
cs.Surge[1] = 1       // kludge to add a fake row
h = cs.Header[0]
inputdata = h[0] + " " + h[1] + " " + h[2] + " " + h[3] + " " + h[4] + " " + h[5] + " " + h[6] + "\n" +
            cs.OEheader + "\n" +
            totextc(cs.Conductors) + "\n" +
            totext("insulator", cs.Insulators) + 
            totext("arrbez",    cs.Arresters) +
            totext("ground",    cs.Grounds) +
            totext("meter",     cs.Meters) +
            totext("surge",     cs.Surge) +
            cs.OEtrailer
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
ncond = +h[0]
p1 = +h[7] 
p2 = +h[8]
N = ncond * (p2 - p1 + 1)
critI = Array(N)
probI = Array(N)
poleN = Array(N)
condN = Array(N)
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
tbl = _.map(_.range(0, N), function(i) {return {pole: poleN[i], cond: condN[i], I: (critI[i]/1000).toFixed(1), prob: probI[i].toFixed(1)}})
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
  = tbl
    tr
      td.text-center = pole
      td.text-center = cond
      td.text-center = I
      td.text-center = prob
```
```js output=markdown
if (tbl.length > 0) {
    print(Emblem.compile(Handlebars, tabletemplate)(window))
}
```

## Notes

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

See [here](OpenETran.md) for the code with the user interface and
model input.

Then, [Emscripten](http://emscripten.org/) was used to compile the C
code to JavaScript. The user interface was created in
[mdpad](http://tshort.github.io/mdpad/). See
[OpenETran.md](OpenETran.md) for the Markdown code for this page. See
the complete OpenETran source [here](extras/openetran.zip).
