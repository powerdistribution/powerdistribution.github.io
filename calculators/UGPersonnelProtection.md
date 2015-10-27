
# Personnel protection on underground systems: Adjacent fault

This page models touch voltages induced on a cut cable during a fault on a parallel
cable. This expands on material in Section 14.6.

<img src="UGPersonnelProtection.svg" style="width:100%" class="img-responsive"/>

<br/>

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
.btn-primary {
    background-color: #67849E;
    background-image: none;

}
.modal-lg {width:50em}
</style>

<!-- Load scripts -->

```yaml
         #: script=scriptloader
- lib/numeric-1.2.6.min.js
- lib/math.min.js
```

<!-- First input forms -->

```emblem
form.form
  .row
    .col-md-6
      .form-group
        label.control-label Name
        .input-group
          input.form-control#casename type="text" name="CASENAME" value="default case"
          span.input-group-btn
            button.btn.btn-primary type="button" data-toggle="modal" data-target="#libraryModal" Save / load ...
  .row
    .col-md-4
      .form-group
        label.control-label System voltage, kV (L-L)
        input.form-control#systemVoltage name="systemVoltage" type="number" step="5" min="0" value="12.47"
    .col-md-4
      .form-group
        label.control-label Available ground fault current, kA
        input.form-control#faultI name="faultI" type="number" step="1" min="0" value="10"
    .col-md-4
      .form-group
        label.control-label Line length, kfeet
        input.form-control#totalLength name="totalLength" type="number" step="1" min="0" value="5.28"
  .row
    .col-md-4
      .form-group
        label.control-label Sub ground resistance, ohms
        input.form-control#Rsub name="Rsub" type="number" step="0.1" min="0" value="0.5"
    .col-md-4
      .form-group
        label.control-label Earth resistivity, ohms
        input.form-control#rho name="rho" type="number" step="50" min="0" value="100"
    .col-md-4
      .form-group
        label.control-label Manhole ground resistance, ohms
        input.form-control#Rgrnd name="Rgrnd" type="number" step="5" min="0" value="10"
  .row
    .col-md-4
      .form-group
        label.control-label Duct spacing, in
        input.form-control#ductSpacing name="ductSpacing" type="number" step="1" min="0" value="7"
    .col-md-4
      .form-group
        .checkbox
          label Jumper shield at work site
          input#jumpershield name="jumpershield" type="checkbox" checked=false
      .form-group
        .checkbox
          label Connect phases together
          input#jumperphase name="jumperphase" type="checkbox" checked=false
```

<!-- Cable data -->

```yaml
         #: name=ac
name: ["250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield", "1/0 neutral"       , "250-kcmil neutral" , "500-kcmil neutral"]
R:    [0.0498,0.0254,0.0435,0.0229,0.0132,0.0435,0.0229,0.0132,0.0435,0.0229,0.0132,0,0,0]
GMR:  [0.21,0.297,0.216,0.305,0.435,0.216,0.305,0.435,0.216,0.305,0.435,0,0,0]
Rs:   [0.1699,0.1295,0.0435, 0.0229, 0.0132, 0.087, 0.0458, 0.0264, 0.174, 0.0916, 0.0528,0.102,0.0435,0.0229]
GMRs: [0.3975,0.5795,0.5075,0.6125,0.7825,0.5075,0.6125,0.7825,0.5075,0.6125,0.7825,0.139,0.216,0.305]
Xc:   [21648, 16368, 27135, 21056, 15900, 27135, 21056, 15900, 27135, 21056, 15900, 0, 0, 0]
n:    [1,1,3,3,3,3,3,3,3,3,3,0,0,0]
```

<!-- Set up data for manhole form elements -->

```js
       //: run="init"
z = {r1: _.range(1,11), r2: _.range(1,10), r3: _.range(11)}
z.g = _.map(_.range(1,11), function(x){return "g"+x})
z.b = _.map(_.range(1,11), function(x){return "b"+x})
z.bg = _.map(_.range(11), function(x){return "bg"+x})
```

<!-- Manhole form elements -->

```emblem
h3 Manhole information
table
  thead
    tr
      td
      td Sub
      each z.r1
        td = this
  tbody
    tr#workerrow
      td Worker location
      td
      each z.r2
        td
          input type="radio" name="wloc" value=this checked="checked"
    tr#faultrow
      td Fault location
      td
      each z.r1
        td
          input type="radio" name="floc" value=this checked="checked"
    tr#groundrow
      td Grounds
      td
        input type="checkbox" name="junk" checked="checked" disabled="disabled" readonly="readonly"
      each z.g
        td
          input type="checkbox" name=this checked="checked"
    tr#bondrow
      td Bonds
      td
        input type="checkbox" name="junk" checked="checked" disabled="disabled" readonly="readonly"
      each z.b
        td
          input type="checkbox" name=this checked="checked"
    tr#bracketrow
      td Bracket grounds
      each z.bg
        td
          input type="checkbox" name=this
```

<!-- Data for duct options -->

```yaml
        #: name=duct
worked: ["250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield"]
other: ["empty", "250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield", "1/0 neutral"       , "250-kcmil neutral" , "500-kcmil neutral"]
```

<!-- Select inputs for cables in each duct -->

```emblem
h3 Cables in each duct
table#ducttable
  tbody
    tr
      td
        select.form-control.input-sm name="d0"
          each duct.worked
            option value=this = this
      td
        select.form-control.input-sm name="d1"
          each duct.worked
            option value=this = this
      td
        select.form-control.input-sm name="d2"
          each duct.other
            option value=this = this
    tr
      td
        select.form-control.input-sm name="d3"
          each duct.other
            option value=this = this
      td
        select.form-control.input-sm name="d4"
          each duct.other
            option value=this = this
      td
        select.form-control.input-sm name="d5"
          each duct.other
            option value=this = this
    tr
      td
        select.form-control.input-sm name="d6"
          each duct.other
            option value=this = this
      td
        select.form-control.input-sm name="d7"
          each duct.other
            option value=this = this
      td
        select.form-control.input-sm name="d8"
          each duct.other
            option value=this = this
br
button.btn.btn-primary data-toggle="modal" data-target="#cableModal"
  | Edit cable data
```

<!-- Set up default inputs for manhole worker, fault, and brackets -->

```js
       //: run="init"
$("#workerrow input").eq(2).prop("checked", true)
$("#faultrow input").eq(4).prop("checked", true)
$("#bracketrow input").first().prop("checked", true)
$("#bracketrow input").last().prop("checked", true)
```

<!-- LOCAL LIBRARY Modal -->

```emblem
.modal.fade#libraryModal tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"
  .modal-dialog.modal-lg
    .modal-content
      .modal-header
        button.close type="button" data-dismiss="modal" aria-hidden="true" &times;
        h4.modal-title#myModalLabel Local library
      .modal-body#caselist
        ul
          #liblist
        br
      .modal-footer
        form#local-form
          button.btn.btn-primary#save-btn  type="button" data-toggle="tooltip" data-placement="top" title="Saves the current case to the local library" Save current case
          span.btn.btn-primary.btn-file#import-btn
            span Import...
            input type="file" name="files[]"
          button.btn.btn-primary#export-btn type="button" data-toggle="tooltip" data-placement="top" title="Export all local cases to a file" Export...
          button.btn.btn-primary#delete-btn type="button" data-toggle="tooltip" data-placement="top" title="Delete all local cases" Delete all
          button.btn.btn-default type="button" data-dismiss="modal" Close
```

<!-- Initialize local library -->

```js
       //: id=locallist outputid=liblist output=markdown

if (typeof(localStorage.UGPlocallib) == "undefined") {
    localStorage.UGPlocallib = JSON.stringify({});
}
var UGPlocallib = JSON.parse(localStorage.UGPlocallib)
ks = Object.keys(UGPlocallib)
for (var i = 0; i < ks.length; i++) {
    var k = ks[i];
    println("&lt;li&gt;&lt;a onclick='fillcase(JSON.parse(localStorage.UGPlocallib)[\"" + k + "\"], \"" + k + "\"); mdpad.calculate(); return false;'&gt;" + k + "&lt;/a&gt;&lt;/li&gt;")
}
```

<!-- EDITING CABLE LIBRARY Modal -->

```emblem
.modal.fade#cableModal tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"
  .modal-dialog.modal-lg
    .modal-content
      .modal-header
        button.close type="button" data-dismiss="modal" aria-hidden="true" &times;
        h4.modal-title#myModalLabel Cable data
      .modal-body style="overflow:auto"
        #cabletbl style="overflow:auto"
        br
        p
          | `R_p` and `R_n` are the resistances of the phase and neutral in ohms/1000 feet. Note that `R_n` is the total resistance, so for single-conductor cables, the value is 1/3 of the resistance of one of the cable neutrals. `GMR_p` and `GMR_n` are the GMR of the phase and neutral in inches. `Xc` is the capacitive reactance in ohms*1000 feet. `n` is the number of cables: use 1 for three-conductor cables, and 3 for single-conductor cables. Use 0 for separate neutrals run in a duct (no phases).
        p
          | Modify the data in the table by double-clicking a cell (or press F2). You can add or delete rows with the context menu (right click).
      .modal-footer
        form#local-form
          button.btn.btn-default type="button" data-dismiss="modal" Close
```

<!-- Cable data -->

```yaml
         #: name="cabletableinfo"
data: []
colHeaders: ["Name", "R_p", "GMR_p", "R_n", "GMR_n", "Xc", "n"]
columns: [{},{type: 'numeric', format: '0.0000'},{type: 'numeric', format: '0.0000'},{type: 'numeric', format: '0.0000'},{type: 'numeric', format: '0.0000'},{type: 'numeric'},{type: 'numeric'}]
colWidths: [270, 80, 80, 80, 80, 80, 50]
contextMenu: ["row_above", "row_below", "remove_row", "undo", "redo"]
minSpareRows: 1
height: 470
maxRows: 18
```

<!-- Initial code to set up modals  -->

```js
       //: run="init"
$("#cabletbl").handsontable(cabletableinfo)
$("#cabletbl").handsontable('loadData', _.unzip(_.values(ac)))
fillselect = function($select, options) {
    $select.empty()
    _.map(options, function(x) {
            $select.append(new Option(x, x))
          })
}
$('#cableModal').on('shown.bs.modal', function() {
    $(document).off('focusin.bs.modal');    // https://github.com/handsontable/handsontable/issues/937
    $("#cabletbl").handsontable('render');  // https://github.com/handsontable/handsontable/issues/2779
});
updateductselects = function() {
    // update the duct options
    var cabledata = $("#cabletbl").handsontable('getData')
    var ac = _.object(["name", "R", "GMR", "Rs", "GMRs", "Xc", "n"], _.unzip(cabledata))
    var cablelist = []
    for (var i = 0; i < ac.name.length; i++) {
        if (ac.n[i] > 0) {cablelist.push(ac.name[i])}
    }
    var otherlist = _.without(["empty"].concat(ac.name), null)
    var $ds = $("#ducttable select")
    var oldductcables = ductcables
    fillselect($ds.eq(0), cablelist)
    fillselect($ds.eq(1), cablelist)
    _.map(_.range(2,10), function(i){fillselect($ds.eq(i), otherlist)})
    // reset cables in ducts
    _.map(_.range(9), function(i){$ds.eq(i).val(oldductcables[i])})
}
$('#cableModal').on('hidden.bs.modal', updateductselects);
```

<h2>Results</h2>

<!-- JS functions defined for saving/loading and for calcs -->

```js
       //: run="init"
function setchecks($i, checks, offset) {
    _.map(_.range(0, checks.length), function(x){$i.eq(x+offset).prop("checked", checks[x])})
}

fillcase = function(x, name) {
    // fill in the input tables with the case for object x
    $("#casename").val(name)
    $("#systemVoltage").val(x.systemVoltage)
    $("#faultI").val(x.faultI)
    $("#totalLength").val(x.totalLength)
    $("#Rsub").val(x.Rsub)
    $("#rho").val(x.rho)
    $("#Rgrnd").val(x.Rgrnd)
    $("#ductSpacing").val(x.ductSpacing)
    $("#jumpershield").prop("checked", x.jumpershield)
    $("#jumperphase").prop("checked", x.jumperphase)
    $("#workerrow input").eq(x.wloc-1).prop("checked", true)
    $("#faultrow input").eq(x.floc-1).prop("checked", true)
    setchecks($("#bondrow input"),    x.bonds, 1)
    setchecks($("#groundrow input"),  x.grounds, 1)
    setchecks($("#bracketrow input"), x.brackets, 0)
    $("#cabletbl").handsontable('loadData', x.cablelibrary)
    updateductselects()
    $ds = $("#ducttable select")
    _.map(_.range(0, x.ductcables.length), function(i){$ds.eq(i).val(x.ductcables[i])})
}
getcurrentcase = function() {
    return {
        Name:          $("#casename").val(),
        systemVoltage: +$("#systemVoltage").val(),
        faultI:        +$("#faultI").val(),
        totalLength:   +$("#totalLength").val(),
        Rsub:          +$("#Rsub").val(),
        rho:           +$("#rho").val(),
        Rgrnd:         +$("#Rgrnd").val(),
        ductSpacing:   +$("#ductSpacing").val(),
        jumpershield:  $("#jumpershield").prop("checked"),
        jumperphase:   $("#jumperphase").prop("checked"),
        wloc:          +$("input[name=wloc]:checked").val(),
        floc:          +$("input[name=floc]:checked").val(),
        bonds:         _.rest($("#bondrow input:checkbox").map(function(){return $(this).prop("checked")}).get()),
        grounds:       _.rest($("#groundrow input:checkbox").map(function(){return $(this).prop("checked")}).get()),
        brackets:      $("#bracketrow input:checkbox").map(function(){return $(this).prop("checked")}).get(),
        ductcables:    $("#ducttable select").map(function(){return $(this).val()}).get(),
        cablelibrary:  $("#cabletbl").handsontable('getData')
    };
}
localsave = function() {
    var cs = getcurrentcase();
    var name = cs.Name;
    delete cs.Name;
    var UGPlocallib = JSON.parse(localStorage.UGPlocallib);
    UGPlocallib[name] = cs;
    localStorage.UGPlocallib = JSON.stringify(UGPlocallib);
    $("#locallist").calculate();
}
localexport = function(evt) {
    var content = "# UGPersonnelProtection app input file in JSON format\n\n" + localStorage.UGPlocallib;
    var link = document.createElement("a");
    link.download = "UGPersonnelProtection-export.yaml";
    link.href = "data:text/plain," + encodeURIComponent(content);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
localimport = function(evt) {
    var file = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onload = function(f) {
        var UGPlocallib = JSON.parse(localStorage.UGPlocallib);
        var filecontents = jsyaml.load(f.target.result);
        ks = Object.keys(filecontents);
        for (var i = 0; i < ks.length; i++) {
            var k = ks[i];
            UGPlocallib[k] = filecontents[k];
        }
        localStorage.UGPlocallib = JSON.stringify(UGPlocallib);
        $("#local-form")[0].reset();
        $("#locallist").calculate();
    }
    reader.readAsText(file);
}
localdelete = function() {
    localStorage.UGPlocallib = JSON.stringify({});
    $("#locallist").calculate();
}
$('#save-btn').click(localsave);
$('#delete-btn').click(localdelete);
$('#export-btn').click(localexport);
$('#import-btn').change(localimport);

sq = function(x) {
  return x * x;
}

Yaddline = function(Y, Zseries, from, to) {
    var n = Zseries.x.length - 1;
    var Yseries = Zseries.inv();
    Y.setBlock([from,from], [from+n,from+n], Y.getBlock([from,from], [from+n,from+n]).add(Yseries));   // diagonal
    Y.setBlock([to,to],     [to+n,to+n],     Y.getBlock([to,to],     [to+n,to+n]).add(Yseries));
    Y.setBlock([from,to],   [from+n,to+n], Y.getBlock([from,to], [from+n,to+n]).sub(Yseries));   // off diagonal
    Y.setBlock([to,from],   [to+n,from+n], Y.getBlock([to,from], [to+n,from+n]).sub(Yseries));
    return Y;
}

Yaddshort = function(Y, i, j) {
    var Ybig = 1e5
    Y.x[i][i] = Y.x[i][i] + Ybig
    Y.x[j][j] = Y.x[j][j] + Ybig
    Y.x[i][j] = Y.x[i][j] - Ybig
    Y.x[j][i] = Y.x[j][i] - Ybig
    return Y;
}

YaddlineX = function(Y, X, i, j) {
    Y.y[i][i] = Y.y[i][i] - 1/X
    Y.y[j][j] = Y.y[j][j] - 1/X
    Y.y[i][j] = Y.y[i][j] + 1/X
    Y.y[j][i] = Y.y[j][i] + 1/X
    return Y;
}

YaddlineR = function(Y, R, i, j) {
    Y.x[i][i] = Y.x[i][i] + 1/R
    Y.x[j][j] = Y.x[j][j] + 1/R
    Y.x[i][j] = Y.x[i][j] - 1/R
    Y.x[j][i] = Y.x[j][i] - 1/R
    return Y;
}

YaddlineRX = function(Y, R, X, i, j) {
    var k = sq(R) + sq(X)
    Y.x[i][i] = Y.x[i][i] + R/k
    Y.x[j][j] = Y.x[j][j] + R/k
    Y.x[i][j] = Y.x[i][j] - R/k
    Y.x[j][i] = Y.x[j][i] - R/k
    Y.y[i][i] = Y.y[i][i] - X/k
    Y.y[j][j] = Y.y[j][j] - X/k
    Y.y[i][j] = Y.y[i][j] + X/k
    Y.y[j][i] = Y.y[j][i] + X/k
    return Y;
}

YaddshuntR = function(Y, Rshunt, i) {
    Y.x[i][i] = Y.x[i][i] + 1/Rshunt
    return Y;
}

```

<!-- MAIN CALCULATIONS -->

```js
II = getcurrentcase()
ac = _.object(["name", "R", "GMR", "Rs", "GMRs", "Xc", "n"], _.unzip(II.cablelibrary))

ductcables = $("#ducttable select").map(function(){return $(this).val()}).get()
bonds    = _.rest($("#bondrow input:checkbox").map(function(){return $(this).prop("checked")}).get())
grounds  = _.rest($("#groundrow input:checkbox").map(function(){return $(this).prop("checked")}).get())
brackets = $("#bracketrow input:checkbox").map(function(){return $(this).prop("checked")}).get()
workmh = Number(wloc)
faultmh = Number(floc) - 1


Nsections = 11  // includes the phantom section for the work location
Nbus = Nsections + 1
subBus = 1
sectionLength = totalLength/(Nsections-1) // kfeet


De= 25920*math.sqrt(rho/60)
r_e= 0.01807


//nidx = _.map(d.conductors, String).indexOf(neutral)

// Layout of the Y matrix:
//   1. Worked cable phase
//   2. Faulted cable phase
//   3. Worked cable shield - repeats a total of three times for single-conductor cables
//   4. Faulted cable shield - repeats a total of three times for single-conductor cables
//   5. First parallel cable shield
//      ...
//   NC. Last parallel cable shield
// This pattern repeats for each segment in the line.

widx = _.indexOf(ac.name, ductcables[0])
fidx = _.indexOf(ac.name, ductcables[1])
Nworked = ac.n[widx]
Nfaulted = ac.n[fidx]
Nc = _.reduce(ductcables, function(num,x){return num+Number(x!="empty")}, 0) + Nfaulted + Nworked
Nextras = Nc - Nfaulted - Nworked - 2

calcs = function(workmh, faultmh) {

    fromNodes = _.flatten([_.range(0, Nc*workmh, Nc), _.range((workmh+1) * Nc, Nc*(Nsections), Nc)])
    toNodes = _.flatten([_.range(Nc, Nc*(workmh+1), Nc), _.range((workmh+2) * Nc, Nc*(Nsections+1), Nc)])
    workNode = toNodes[workmh-1]

    // Fill in arrays of conductor positions
    // Fill in an array of distances
    x = numeric.rep([Nc], 0.0)
    y = numeric.rep([Nc], 0.0)
    // Duct position 1 extra shields, worked cables
    if (Nworked > 1) {
        d = ac.GMRs[widx] / math.sqrt(2) * 2 * 1.1  // the 1.1 factor is to adjust for the outside cable dia vs. dia of shield
        x[3] =  d; y[3] = d
        x[4] = -d; y[4] = d
    }
    // Duct position 2, faulted cables
    x[1] = x[2+Nworked] = ductSpacing
    // Duct position 2 extra shields
    if (Nfaulted > 1) {
        d = ac.GMRs[fidx] / math.sqrt(2) * 2 * 1.1
        x[3+Nworked] =  d + ductSpacing; y[3+Nworked] = d
        x[4+Nworked] = -d + ductSpacing; y[4+Nworked] = d
    }
    pos = 2 + Nfaulted + Nworked
    for (var i = 2; i < ductcables.length; i++) {
        if (ductcables[i] != "empty") {
            x[pos] =  (i % 3) * ductSpacing
            y[pos] = -(Math.floor(i / 3)) * ductSpacing
            pos = pos + 1
        }
    }

    dist = function(i,j){return math.sqrt(sq(x[i] - x[j]) + sq(y[i] - y[j]))}

    // Fill the cable impedance matrix
    Zc = numeric.t(numeric.identity(Nc), numeric.identity(Nc))
    // worked phase
    Zc.x[0][0] = ac.R[widx] + r_e
    Zc.y[0][0] = 0.0529 * math.log10(De/ac.GMR[widx])
    // faulted phase
    Zc.x[1][1] = ac.R[fidx] + r_e
    Zc.y[1][1] = 0.0529 * math.log10(De/ac.GMR[fidx])
    // worked shields
    for (var i = 2; i < Nworked+2; i++) {
        Zc.x[i][i] = ac.Rs[widx]*Nworked + r_e
        Zc.y[i][i] = 0.0529 * math.log10(De/ac.GMRs[widx])
    }
    // faulted shields
    for (var i = 2+Nworked; i < Nworked+Nfaulted+2; i++) {
        Zc.x[i][i] = ac.Rs[fidx]*Nfaulted + r_e
        Zc.y[i][i] = 0.0529 * math.log10(De/ac.GMRs[fidx])
    }
    // other shields
    for (var i = 0; i < Nextras; i++) {
        name = _.slice(_.filter(ductcables, function(x){return x!="empty"}), 2)[i]
        eidx = _.indexOf(ac.name, name)
        Zc.x[Nc-Nextras+i][Nc-Nextras+i] = ac.Rs[eidx] + r_e
        Zc.y[Nc-Nextras+i][Nc-Nextras+i] = 0.0529 * math.log10(De/ac.GMRs[eidx])
    }
    // fill in the off diagonals
    for (var j = 0; j < Nc-1; j++) {
        for (var k = j+1; k < Nc; k++) {
            Zc.x[j][k] = Zc.x[k][j] = r_e
            Zc.y[j][k] = Zc.y[k][j] = 0.0529 * math.log10(De/dist(j,k))
        }
    }
    // fix up the phase-to-neutral diagonals
    Zc.x[2][0] = Zc.x[0][2] = r_e
    Zc.y[2][0] = Zc.y[0][2] = 0.0529 * math.log10(De/ac.GMRs[widx])
    Zc.x[Nworked+2][1] = Zc.x[1][Nworked+2] = r_e
    Zc.y[Nworked+2][1] = Zc.y[1][Nworked+2] = 0.0529 * math.log10(De/ac.GMRs[fidx])

    Zc = Zc.mul(sectionLength )  // actual ohms

    Y = numeric.t(numeric.rep([Nc*Nbus,Nc*Nbus], 0.0), numeric.rep([Nc*Nbus,Nc*Nbus], 0.0))

    // make the Ybus from the impedances
    for (var i = 0; i < fromNodes.length; i++) {
        Y = Yaddline(Y,Zc,from=fromNodes[i],to=toNodes[i])
    }
    // add the shunt grounds
    for (var i = 0; i < toNodes.length; i++) {
        if (grounds[i]) {
            Y = YaddshuntR(Y,Rgrnd,toNodes[i] + 2)
        }
    }
    // add the sub ground
    Y = YaddshuntR(Y,Rsub,2)

    // add the sub bonds
    for (var i = 3; i < Nc; i++) {
        Y = Yaddshort(Y, 2, i)
    }
    // Add the line bonds
    for (var i = 0; i < toNodes.length; i++) {
        for (var j = 3; j < Nc; j++) {
            if (grounds[i] || bonds[i]) {
                Y = Yaddshort(Y, toNodes[i] + 2, toNodes[i] + j)
            }
        }
    }
    // Add the jumpers across the work site
    Y = Yaddshort(Y, workNode + 1, workNode + 1 + Nc) // Faulted phase
    if (jumpershield) {
        for (var i = 0; i < Nworked; i++) {
            Y = Yaddshort(Y, workNode + 2 + i, workNode + 2 + i + Nc)
        }
    }
    if (jumperphase) {
        Y = Yaddshort(Y, workNode, workNode + Nc) // Worked phase
    }
    for (var i = workNode + 2 + Nworked; i < workNode+Nc; i++) {  // jumper the faulted phase shields
        Y = Yaddshort(Y, i, i + Nc)
    }
    // Add bracket grounds
    allNodes = _.flatten([0, toNodes])
    for (var i = 0; i < allNodes.length; i++) {
        if (brackets[i]) {
            Y = Yaddshort(Y, allNodes[i], allNodes[i] + 2)
        }
    }
    // Add the jumpers across the fault
    Y = Yaddshort(Y, toNodes[faultmh] + 1, toNodes[faultmh] + Nworked + 2)

    // Add the source impedance
    Y = YaddlineRX(Y, 0.0546 * systemVoltage/Math.sqrt(3) / faultI,  0.9985 * systemVoltage/Math.sqrt(3) / faultI, 1, 3)

    // Add the cable capacitance to the shield on the worked phase; split 1/2 on each end of a section
    for (var i = 0; i < toNodes.length; i++) {
        Y = YaddlineX(Y, -ac.Xc[widx]*2/sectionLength, toNodes[i],   toNodes[i] + 2)
        Y = YaddlineX(Y, -ac.Xc[widx]*2/sectionLength, fromNodes[i], fromNodes[i] + 2)
    }

    // Add a 1000-ohm resistance of a worker across phases and from a phase to the shield
    Y = YaddlineR(Y, 1000, workNode, workNode + Nc)
    Y = YaddlineR(Y, 1000, workNode, workNode + 2)

    // make I
    Isrc = numeric.t(numeric.rep([Nc*Nbus], 0), numeric.rep([Nc*Nbus], 0))
    Isrc.y[1] = -1000*faultI
    Isrc.y[3] =  1000*faultI

    // Find the voltages:
    V = Y.inv().dot(Isrc)
    workV = numeric.t([[V.x[workNode]].concat(V.x.slice(workNode+2, workNode+Nc)),
                       [V.x[workNode+Nc]].concat(V.x.slice(workNode+2+Nc, workNode+2*Nc))],
                      [[V.y[workNode]].concat(V.y.slice(workNode+2, workNode+Nc)),
                       [V.y[workNode+Nc]].concat(V.y.slice(workNode+2+Nc, workNode+2*Nc))])   // Voltages on either side of the cut cable
    V = numeric.t(_.chunk(V.x, Nc), _.chunk(V.y, Nc))
    // Find the line currents:
    I = numeric.t(numeric.rep([Nsections, Nc], 0), numeric.rep([Nsections, Nc], 0))
    Yc = Zc.inv()
    for (i = 0; i < Nsections; i++) {
        I.setBlock([i,0], [i,Nc-1], V.getBlock([i,0],[i,Nc-1]).sub(V.getBlock([i+1,0],[i+1,Nc-1])).dot(Yc))
    }
    return {V: V, workV: workV, I: I, Zc:Zc, Y:Y}
}

findmax = function(x) { // maximum difference of all values
    x = numeric.t(_.flatten(x.x), _.flatten(x.y))
    var res = 0
    for (var i = 0; i < x.x.length - 1; i++) {
        for (var j = i + 1; j < x.x.length; j++) {
        var diff = x.get([i]).sub(x.get([j]))
            diff = Math.sqrt(sq(diff.x) + sq(diff.y))
            if (diff > res) {
                res = diff
            }
        }
    }
    return ("     " + String(Math.round(res))).slice(-5)
}

a = calcs(workmh, faultmh)

// Find critical distance between the closest bracket ground
//    and the farthest bracket ground (or fault point)
lowerbracket = -1
for (var i = workmh - 1; i >= 0; i--) {
    if (brackets[i]) {
        lowerbracket = i
        break
    }
}
upperbracket = -1
for (var i = lowerbracket + 1; i < 11; i++) {
    if (brackets[i] || faultmh + 1 == i) {
        upperbracket = i
        break
    }
}
hasupperbracket = false 
for (var i = workmh + 1; i < 11; i++) {
    if (brackets[i]) {
        hasupperbracket = true
        break
    }
}
ppV = findmax(a.workV.getBlock([0,0], [1,0]))
d = (upperbracket - lowerbracket) * sectionLength
criticalbracketdist = (upperbracket - lowerbracket) * sectionLength * 100 * 1000 / ppV
isgoodcritdist = hasupperbracket && lowerbracket >= 0 && !jumperphase

txt = ""
txt += "Fault current = " + Math.round(a.I.abs().x[0][1]) + " A\n"
txt += "Maximum touch voltages\n"
txt += "  - all         = " + findmax(a.workV) + " V (" + findmax(a.workV.getBlock([0,1],[1,Nc-2])) + " V without the phases)\n"
txt += "  - source side = " + findmax(a.workV.getBlock([0,0],[0,Nc-2])) + " V (" + findmax(a.workV.getBlock([0,1],[0,Nc-2])) + " V without the phases)\n"
txt += "  - load side   = " + findmax(a.workV.getBlock([1,0],[1,Nc-2])) + " V (" + findmax(a.workV.getBlock([1,1],[1,Nc-2])) + " V without the phases)\n"
txt += "Maximum shield voltage to remote earth = " + Math.round(_.max(_.flatten(a.workV.getBlock([0,1],[1,Nc-2]).abs().x))) + " V"
if (isgoodcritdist) {
    txt += "\nApproximate critical bracket-to-bracket spacing for a voltage across phases of 100 V = " + Math.round(criticalbracketdist) + " ft"
}
$("#outsummary").html(converter.makeHtml(txt));
```

<!-- Calculations for graphs and output tables -->

```js
Vmax_f = numeric.rep([Nsections-1], 0.0)
Vmax_f2 = numeric.rep([Nsections-1], 0.0)
Vmaxremote_f = numeric.rep([Nsections-1], 0.0)
for (var i = 0; i < Nsections-1; i++) {
    af = calcs(workmh,i)
    Vmax_f[i] = findmax(af.workV)
    Vmax_f2[i] = findmax(af.workV.getBlock([0,1],[1,Nc-2]))
    Vmaxremote_f[i] = _.max(_.flatten(af.workV.getBlock([0,1],[1,Nc-2]).abs()))
}

seriesv1 = _.zip(_.range(1, Vmax_f.length+1), Vmax_f)
$.plot($('#graph1'), [{data: seriesv1, points: {show: true}}])
seriesv2 = _.zip(_.range(1, Vmax_f2.length+1), Vmax_f2)
$.plot($('#graph2'), [{data: seriesv2, points: {show: true}}])

Vmax_w = numeric.rep([Nsections-2], 0.0)
Vmax_w2 = numeric.rep([Nsections-2], 0.0)
Vmaxremote_w = numeric.rep([Nsections-2], 0.0)
for (var i = 0; i < Nsections - 2; i++) {
    aw = calcs(i+1, faultmh)
    Vmax_w[i] = findmax(aw.workV)
    Vmax_w2[i] = findmax(aw.workV.getBlock([0,1],[1,Nc-2]))
    Vmaxremote_w[i] = _.max(_.flatten(aw.workV.getBlock([0,1],[1,Nc-2]).abs().x))
}
seriesv3 = _.zip(_.range(1, Vmax_w.length+1), Vmax_w)
$.plot($('#graph3'), [{data: seriesv3, points: {show: true}}])
seriesv4 = _.zip(_.range(1, Vmax_w2.length+1), Vmax_w2)
$.plot($('#graph4'), [{data: seriesv4, points: {show: true}}])

// Fix up voltage and current tables for output
rep = function(x, n){return _.fill(Array(n),x)}
colnames = _.map(_.range(a.V.x.length), function(x){return "m"+x})
rownames = _.flatten(["Worked phase", "Faulted phase", rep("Worked shield",Nworked), rep("Faulted shield",Nfaulted), rep("Other",Nextras)])
Vout = _.map(_.range(a.V.x[0].length), function(j) {return _.extend({row: rownames[j]}, _.object(colnames, _.map(_.range(a.V.x.length), function(i) {
    return math.round(Math.sqrt(sq(a.V.x[i][j]) + sq(a.V.y[i][j]))) + "∠" +
           math.round(Math.atan2(a.V.y[i][j], a.V.x[i][j]) * 180 / Math.PI) + "°";
})))})
colnamesV = _.map(_.range(workmh+1).concat(_.range(workmh,Nsections)), function(x){return "m"+x})
colnamesV[0] = "sub"; colnamesV[workmh] += "a"; colnamesV[workmh+1] += "b"
$("#Vout").html(Emblem.compile(Handlebars, tabletemplate)({colnames: colnamesV, tbl: Vout}))

Iout = _.map(_.range(Nc), function(j) {return _.extend({row: rownames[j]}, _.object(colnames, _.map(_.range(workmh).concat(_.range(workmh+1,Nsections)), function(i) {
    return math.round(Math.sqrt(sq(a.I.x[i][j]) + sq(a.I.y[i][j]))) + "∠" +
           math.round(Math.atan2(a.I.y[i][j], a.I.x[i][j]) * 180 / Math.PI) + "°";
})))})
colnamesI = _.map(_.range(Nsections-1), function(x){return "m"+x+"-m"+(x+1)})
colnamesI[0] = "sub-m1"
$("#Iout").html(Emblem.compile(Handlebars, tabletemplate)({colnames: colnamesI, tbl: Iout}))
```

<!-- Template for detailed voltage and current tables -->

```emblem
           \: name=tabletemplate
table.table
  tr
    td
    = colnames
      td.text-center style="white-space:nowrap;"  = this
  = tbl
    tr
      td style="white-space:nowrap;" = row
      td.text-center = m0
      td.text-center = m1
      td.text-center = m2
      td.text-center = m3
      td.text-center = m4
      td.text-center = m5
      td.text-center = m6
      td.text-center = m7
      td.text-center = m8
      td.text-center = m9
      td.text-center = m10
      td.text-center = m11
```

<!-- HTML for the output section -->

```emblem
.panel-group
  .panel.panel-default
    .panel-heading
      .panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse1" Summary
    .panel-collapse.collapse.in#collapse1
      .panel-body
        pre.jsplain#outsummary
  .panel.panel-default
    .panel-heading
      .panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse2a" Detailed voltages
    .panel-collapse.collapse#collapse2a style="overflow:auto"
      #Vout.panel-body
  .panel.panel-default
    .panel-heading
      .panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse2b" Detailed conductor currents
    .panel-collapse.collapse#collapse2b style="overflow:auto"
      #Iout.panel-body
  .panel.panel-default
    .panel-heading
      .panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse3" Variations in fault location
    .panel-collapse.collapse.in#collapse3
      .panel-body
        .row
          .col-md-6
            div Touch voltages, V
            #graph1 style='width:100%; height:25em;'
            .text-center Faulted manhole number
          .col-md-6
            div Touch voltages, not including phases, V
            #graph2 style='width:100%; height:25em;'
            .text-center Faulted manhole number
  .panel.panel-default
    .panel-heading
      .panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse4" Variations in work location
    .panel-collapse.collapse.in#collapse4
      .panel-body
        .row
          .col-md-6
            div Touch voltages, V
            #graph3 style='width:100%; height:25em;'
            .text-center Work manhole number
          .col-md-6
            div Touch voltages, not including phases, V
            #graph4 style='width:100%; height:25em;'
            .text-center Work manhole number
```

## Notes

Defaults and assumptions include:

* The worked cable is always in the top left duct location. The faulted cable is
  in the top middle position. The fault is from the phase to the shield.

* EPR cables are all single-conductor cables in a triplex arrangement. PILC are
  three-conductor cables. For single-conductor cables, all three are cut at the
  work site. For three-conductor cables, only one of the phase conductors is
  modeled (all three phases should have the same voltage). For single-conductor
  cables in ducts other than the ducts for the worked cable and the faulted
  cable, the shields are lumped into one impedance that's approximately
  equivalent to modeling them as individual cables.

* "Bonds" checked at a manhole means that all of the shields are tied together.
  "Grounds" means bond all of the shields together and tie them to ground
  through a ground resistance. For bonds applied at the work site, these are on
  the source side.

* "Bracket grounds" are locations where the worked phase is bonded to the worked
  shield.

* "Jumper shield at work site" means that the shield on the worked cable is
  jumpered across the cut cable.

* The option "Connect phases together" connects the phase of the worked cable to
  help evaluate touch voltages once the phases have been joined back together.
  
* The system voltage and substation ground resistance have no effect on this
  model because the model is driven by the GPR voltage. The system voltage,
  fault current available, and substation ground resistance will all affect
  how high the GPR can go.

* The manhole grounds should also include customer grounds. The customer grounds
  are often better than utility grounds.

* The earth resistivity has a small effect in the app because the substation and
  manhole ground resistances are specified separately. These resistances are
  directly influenced by the earth resistivity.

* You can model floating phases as a protection option. To float the phase of
  the entire length of cable, remove all bracket grounds. Voltage still couples
  to the worked cable's phase through the cable's capacitance.

* The "Approximate critical bracket-to-bracket spacing" output is an estimate of
  the critical distance between bracket grounds needed to keep the touch voltage
  across the cut phases below 100 V. Results should scale linearly, so if you
  choose a 200-V limit, the critical distance between bracket grounds is twice that 
  shown. This critical distance applies to the configuration and fault current
  entered.

* The resistance of the worker is included in the model. The worker is modeled
  as a 1000-ohm resistance. One 1000-ohm resistor is placed across the cut
  phases, and another is placed between the phase and the shield on the cut
  cable on the source side. These resistances are only important for the
  floating phase case, because in this case, the capacitive coupling offers a
  weak driving voltage.

* The cables are 15-kV cables. The EPR cables have 220-mil insulation. The main
  effect of the insulation is on the cable capacitance.

* For impedance models, this app uses the equations outlined in section 4.4.2.
  The frequency is fixed at 60 Hz. This app only models the voltage between
  conductors. It does not model the voltage to the manhole floor. That would
  require more advanced modeling using finite elements. For detailed simulations
  that can model manhole potentials, consider a tool like
  [CDEGS](http://www.sestech.com/products/softpackages/cdegs.htm) or
  [WinIGS](http://www.ap-concepts.com/win_igs.htm). The touch voltages to the
  manhole floor involve a voltage divider of the voltage from the conductor to
  remote earth.

* The saved cases are specific to the browser session that you are using. If you
  switch to another browser (from Chrome to Firefox for example), your cases
  won't be available. You will have to export from your original session then
  import the cases into the new session to make those cases available.

## Reducing touch potentials

To protect against these touch voltages, two approaches are available: bonding
and isolation/insulation. Touch voltages involving the shields can be remedied
by bonding the shields together and then bonding these to the manhole rebar and
any local ground rod. An equipotential ground mat can also be used as an
alternative to attaching to the rebar. Work practices for bonding the shields
are feasible, but work practices for keeping the phase conductor bonded would be
quite challenging.

Using isolation or insulation is another option that can be used. Insulation can
include boots, gloves, and rubber mats. Using isolation or insulation is
particularly appropriate for phase conductors. Floating the phases is a good
option in many cases. The voltage built up in this case is a function of the
capacitance of the cables and the length of cable being floated. Floating the
phases is most effective with the shields/neutrals jumpered at the work site. An
alternative to floating the phases is to keep an insulated cap to cover the
phase, or use insulated gloves when working with the phase.

The results on this page can help determine the level of insulation needed. They
also show which touch voltages are the highest. The phase-to-phase touch voltage
across the cut cable is often the highest voltage. Generally, touch voltages are
worse across the open point (whether involving phases or shields), so when work
is being performed on one side, workers could cover the other side with an
insulating blanket.

This app only models one induction hazard. Another scenario that can cause touch
potentials is a ground potential rise in the substation. This can happen for a
high-side fault or for a fault on another distribution circuit not along the
worked cable. Protection approaches identified here are appropriate protections
against touch voltages transferred from a substation ground potential rise.
Another hazard for underground workers is inadvertent energization. That is
difficult to protect against in underground work without fully-rated insulation.

## References

For more information on personnel protection and grounding in underground
scenarios, see the following references:

* [EPRI 3002003242](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=3002003242),
  *Grounding for Personnel Protection on Underground Distribution: Simulations for Solid-Dielectric Cable Systems*, Electric
  Power Research Institute, Palo Alto, CA, 2015.

* [EPRI 3002001289](http://www.epri.com/abstracts/Pages/ProductAbstract.aspx?ProductId=3002001289),
  *Distribution Grounding of Underground Facilities*, Electric
  Power Research Institute, Palo Alto, CA, 2013.

* IEEE ESMOL Subcommittee 15.07, "Worker protection while working de-energized
  underground distribution systems," *IEEE Transactions on Power Delivery*, vol.
  19, no. 1, pp. 298-302, January 2004.

* Rajotte, Y., Bergeron, R., Chalifoux, A., and Gervais, Y., "Touch Voltages on
  Underground Distribution Systems During Fault Conditions," *IEEE Transactions on
  Power Delivery*, vol. 5, no. 2, pp. 1026–33, April 1990.
