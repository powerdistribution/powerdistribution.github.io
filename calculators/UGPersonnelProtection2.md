
# Personnel protection on underground systems

This page models touch voltages induced on a cut cable during a fault on a parallel
cable. This expands on material in Section 14.6.

<img src="UGPersonnelProtection.svg" style="width:100%" class="img-responsive"/>

<br/>

```yaml script=scriptloader
- lib/numeric-1.2.6.min.js
- lib/math.min.js
```


```yaml jquery=dform
class : form
html: 
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: systemVoltage
            type: number
            step: 5
            min: 0.0
            bs3caption: System voltage, kV (L-L)
            value: 25
      - type: div
        class: col-md-4
        html:
          - name: faultI
            type: number
            step: 1
            min: 0.0
            bs3caption: Available ground fault current, kA
            value: 10.0
      - type: div
        class: col-md-4
        html:
          - name: totalLength
            type: number
            step: 1
            min: 0.0
            bs3caption : Line length, kfeet
            value: 10
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: Rsub
            type: number
            step: 0.1
            min: 0.0
            bs3caption : Sub ground resistance, ohms
            value: 0.36
      - type: div
        class: col-md-4
        html:
          - name: rho
            type: number
            step: 50
            min: 0.0
            bs3caption : Earth resistivity, ohms
            value: 100.0
      - type: div
        class: col-md-4
        html:
          - name: Rgrnd
            type: number
            step: 5
            min: 0.0
            bs3caption : Manhole ground resistance, ohms
            value: 1.56
  - type: div
    class: row
    html:
      - type: div
        class: col-md-4
        html:
          - name: ductSpacing
            type: number
            step: 1
            min: 0.0
            bs3caption : Duct spacing, in
            value: 9.0
      - type: div
        class: col-md-4
        html:
          - name: jumpershield
            type: checkbox
            bs3caption: Jumper shield at work site
            checked: false
```

```yaml name=ac
name: ["1/0 Al EPR", "250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield", "1/0 neutral"       , "250-kcmil neutral" , "500-kcmil neutral"]
R:    [0.168, 0.0498,0.0254,0.0435,0.0229,0.0132,0.0435,0.0229,0.0132,0.0435,0.0229,0.0132,0,0,0]
GMR:  [0.139, 0.21,0.297,0.216,0.305,0.435,0.216,0.305,0.435,0.216,0.305,0.435,0,0,0]
Rs:   [0.136, 0.1699,0.1295,0.0435, 0.0229, 0.0132, 0.087, 0.0458, 0.0264, 0.174, 0.0916, 0.0528,0.102,0.0435,0.0229]
GMRs: [0.405, 0.3975,0.5795,0.5075,0.6125,0.7825,0.5075,0.6125,0.7825,0.5075,0.6125,0.7825,0.139,0.216,0.305]
n:    [3,     1,1,3,3,3,3,3,3,3,3,3,0,0,0]
```

```text name=z  script=eval
(function () {
z = {r1: _.range(1,11), r2: _.range(1,10), r3: _.range(11)}
z.g = _.map(_.range(1,11), function(x){return "g"+x})
z.b = _.map(_.range(1,11), function(x){return "b"+x})
z.bg = _.map(_.range(11), function(x){return "bg"+x})
return z
})()
```

```text script="(function (x) {$active_element.append(Emblem.compile(Handlebars, x)(z))})"
h3 Manhole information

table
  thead
    tr
      td 
      td Sub
      each r1
        td = this
  tbody
    tr#workerrow
      td Worker location
      td
      each r2
        td
          input type="radio" name="wloc" value=this checked=checked
    tr#faultrow
      td Fault location
      td
      each r1
        td
          input type="radio" name="floc" value=this checked=checked
    tr#groundrow
      td Grounds
      td
        input type="checkbox" name="junk" checked="checked" disabled="disabled" readonly="readonly"
      each g
        td
          input type="checkbox" name=this  checked=checked
    tr#bondrow
      td Bonds
      td
        input type="checkbox" name="junk" checked="checked" disabled="disabled" readonly="readonly"
      each b
        td
          input type="checkbox" name=this checked=checked
    tr#bracketrow
      td Bracket grounds
      each bg
        td
          input type="checkbox" name=this
         
```

```yaml name=duct
worked: ["1/0 Al EPR", "250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield"]
other: ["empty", "1/0 Al EPR", "250-kcmil PILC"       , "500-kcmil PILC"       , "250-kcmil EPR, 1/3 shield"        , "500-kcmil EPR, 1/3 shield"        , "1000-kcmil EPR, 1/3 shield"       , "250-kcmil EPR, 1/6 shield"        , "500-kcmil EPR, 1/6 shield"        , "1000-kcmil EPR, 1/6 shield"       , "250-kcmil EPR, 1/12 shield"        , "500-kcmil EPR, 1/12 shield"        , "1000-kcmil EPR, 1/12 shield", "1/0 neutral"       , "250-kcmil neutral" , "500-kcmil neutral"]
```

```text script="(function (x) {$active_element.append(Emblem.compile(Handlebars, x)(duct))})"
h3 Cables in each duct

table#ducttable
  tbody
    tr
      td
        select.form-control.input-sm name="d0"
          each worked
            option value=this = this
      td
        select.form-control.input-sm name="d1"
          each worked
            option value=this = this
      td
        select.form-control.input-sm name="d2"
          each other
            option value=this = this
    tr
      td
        select.form-control.input-sm name="d3"
          each other
            option value=this = this
      td
        select.form-control.input-sm name="d4"
          each other
            option value=this = this
      td
        select.form-control.input-sm name="d5"
          each other
            option value=this = this
    tr
      td
        select.form-control.input-sm name="d6"
          each other
            option value=this = this
      td
        select.form-control.input-sm name="d7"
          each other
            option value=this = this
      td
        select.form-control.input-sm name="d8"
          each other
            option value=this = this
```


```text name=junk script=eval
(function () {
$("#workerrow input").eq(5).prop("checked", true)
$("#faultrow input").eq(6).prop("checked", true)
$("#bracketrow input").first().prop("checked", true)
$("#bracketrow input").last().prop("checked", true)
})()
```


<h2>Results</h2>

```js
systemVoltage = Number(systemVoltage); faultI = Number(faultI); totalLength = Number(totalLength)
Rsub = Number(Rsub); Rgrnd = Number(Rgrnd); rho = Number(rho)
ductSpacing = Number(ductSpacing)

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
    var Yseries = numeric.t(1e5, 0.0)
    Y.set([i, i], Y.get([i, i]).add(Yseries))
    Y.set([j, j], Y.get([j, j]).add(Yseries))
    Y.set([i, j], Y.get([i, j]).sub(Yseries))
    Y.set([j, i], Y.get([j, i]).sub(Yseries))
    return Y;
}

Yaddline1 = function(Y, X, i, j) {
    var Yseries = numeric.t(0, -1/X)
    Y.set([i, i], Y.get([i, i]).add(Yseries))
    Y.set([j, j], Y.get([j, j]).add(Yseries))
    Y.set([i, j], Y.get([i, j]).sub(Yseries))
    Y.set([j, i], Y.get([j, i]).sub(Yseries))
    return Y;
}

Yaddshunt = function(Y, Rshunt, i) {
    Y.set([i, i], Y.get([i, i]).add(numeric.t(1/Rshunt, 0.0)))
    return Y;
}

ductcables = $("#ducttable select").map(function(){return $(this).val()}).get()
bonds    = _.rest($("#bondrow input:checkbox").map(function(){return $(this).prop("checked")}).get())
grounds  = _.rest($("#groundrow input:checkbox").map(function(){return $(this).prop("checked")}).get())
brackets = $("#bracketrow input:checkbox").map(function(){return $(this).prop("checked")}).get()
workmh = Number(wloc)
faultmh = Number(floc) - 1

// ductcables = ["500-kcmil EPR, 1/3 shield", "500-kcmil EPR, 1/3 shield", "250-kcmil Cu neutral", "empty", "empty", "empty", "empty", "empty", "empty"]
// ductcables = ["500-kcmil PILC", "500-kcmil PILC", "empty", "empty", "empty", "empty", "empty", "empty", "empty"]
// bonds = numeric.rep([12], true)
// grounds = numeric.rep([12], true)
// brackets = _.flatten([true, numeric.rep([9], false), true])
// workmh = 3 - 1
// faultmh = 5 - 1


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
        d = ac.GMRs[widx] * math.sqrt(2) * 2
        x[3] =  d; y[3] = d
        x[4] = -d; y[4] = d
    }
    // Duct position 2, faulted cables
    x[1] = x[2+Nworked] = ductSpacing
    // Duct position 2 extra shields
    if (Nfaulted > 1) {
        d = ac.GMRs[fidx] * math.sqrt(2) * 2
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
            Y = Yaddshunt(Y,Rgrnd,toNodes[i] + 2) 
        }
    }
    // add the sub ground
    Y = Yaddshunt(Y,Rsub,2) 

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
        Y = Yaddshort(Y, workNode + 2, workNode + 2 + Nc)
    }

// cut all three phases
//    for (var i = workNode + 3; i < workNode+Nc; i++) {  // cut only one phase
    for (var i = workNode + 2 + Nworked; i < workNode+Nc; i++) {  // cut all three phases
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
    Y = Yaddline1(Y, systemVoltage/Math.sqrt(3) / faultI, 1, 3)

    // make I
    Isrc = numeric.t(numeric.rep([Nc*Nbus], 0), numeric.rep([Nc*Nbus], 0))
    Isrc.y[1] =  1000*faultI
    Isrc.y[3] = -1000*faultI

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
    return {V: V, workV: workV, I: I, Zc:Zc}
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
    return res
}

a = calcs(workmh, faultmh)

txt = ""
txt += "Fault current = " + math.format(a.I.abs().x[0][1]) + " A\n"
txt += "Maximum touch voltage involving phases       = " + math.format(findmax(a.workV)) + " V\n"
txt += "Maximum touch voltage just involving shields = " + math.format(findmax(a.workV.getBlock([0,1],[1,Nc-2]))) + " V\n"
txt += "Maximum shield voltage to remote earth       = " + math.format(_.max(_.flatten(a.workV.getBlock([0,1],[1,Nc-2]).abs().x))) + " V"
$("#outsummary").html(converter.makeHtml(txt));
```


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
           math.round(Math.atan2(a.V.x[i][j], a.V.y[i][j]) * 180 / Math.PI) + "°"; 
})))})
colnamesV = _.map(_.range(workmh+1).concat(_.range(workmh,Nsections)), function(x){return "m"+x})
colnamesV[0] = "sub"; colnamesV[workmh] += "a"; colnamesV[workmh+1] += "b"
$("#Vout").html(Emblem.compile(Handlebars, tabletemplate)({colnames: colnamesV, tbl: Vout}))

Iout = _.map(_.range(Nc), function(j) {return _.extend({row: rownames[j]}, _.object(colnames, _.map(_.range(workmh).concat(_.range(workmh+1,Nsections)), function(i) {
    return math.round(Math.sqrt(sq(a.I.x[i][j]) + sq(a.I.y[i][j]))) + "∠" +
           math.round(Math.atan2(a.I.x[i][j], a.I.y[i][j]) * 180 / Math.PI) + "°"; 
})))})
colnamesI = _.map(_.range(Nsections-1), function(x){return "m"+x+"-m"+(x+1)})
colnamesI[0] = "sub-m1"
$("#Iout").html(Emblem.compile(Handlebars, tabletemplate)({colnames: colnamesI, tbl: Iout}))
```

```text name=tabletemplate
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

```text script="(function (x) {$active_element.append(Emblem.compile(Handlebars, x)(duct))})"
div.panel-group
  div.panel.panel-default
    div.panel-heading
      div.panel-title
        a.accordion-toggle data-toggle="collapse" href="#collapse1" Summary
    div.panel-collapse.collapse.in#collapse1
      div.panel-body
        pre.jsplain#outsummary
  div.panel.panel-default
    div.panel-heading
      div.panel-title 
        a.accordion-toggle data-toggle="collapse" href="#collapse2a" Detailed voltages
    div.panel-collapse.collapse#collapse2a style="overflow:auto"
      div#Vout.panel-body 
  div.panel.panel-default
    div.panel-heading
      div.panel-title 
        a.accordion-toggle data-toggle="collapse" href="#collapse2b" Detailed conductor currents
    div.panel-collapse.collapse#collapse2b style="overflow:auto"
      div#Iout.panel-body 
  div.panel.panel-default
    div.panel-heading
      div.panel-title 
        a.accordion-toggle data-toggle="collapse" href="#collapse3" Variations in fault location
    div.panel-collapse.collapse.in#collapse3
      div.panel-body 
        div.row
          div.col-md-6
            div Touch voltages, V
            div#graph1 style='width:100%; height:25em;'
            div.text-center Faulted manhole number
          div.col-md-6
            div Touch voltages, not including phases, V
            div#graph2 style='width:100%; height:25em;'
            div.text-center Faulted manhole number
  div.panel.panel-default
    div.panel-heading
      div.panel-title 
        a.accordion-toggle data-toggle="collapse" href="#collapse4" Variations in work location
    div.panel-collapse.collapse.in#collapse4
      div.panel-body 
        div.row
          div.col-md-6
            div Touch voltages, V
            div#graph3 style='width:100%; height:25em;'
            div.text-center Work manhole number
          div.col-md-6
            div Touch voltages, not including phases, V
            div#graph4 style='width:100%; height:25em;'
            div.text-center Work manhole number
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
  shield. For now, there must be at least one bracket ground on each side of the
  work site.

* "Jumper shield at work site" means that the shield on the worked cable is
  jumpered across the cut cable.

* The manhole grounds should also include customer grounds. The customer grounds
  are often better than utility grounds.

* The earth resistivity has a small effect in the app because the substation and
  manhole ground resistances are specified seperately. These resistances are
  directly influenced by the earth resistivity.

* For impedance models, this app uses the equations outlined in section 4.4.2.
  The frequency is fixed at 60 Hz. This app only models the voltage between
  conductors. It does not model the voltage to the manhole floor. That would
  require more advanced modeling using finite elements. For detailed simulations
  that can model manhole potentials, consider a tool like
  [CDEGS](http://www.sestech.com/products/softpackages/cdegs.htm) or
  [WinIGS](http://www.ap-concepts.com/win_igs.htm). The touch voltages to the
  manhole floor involve a voltage divider of the voltage from the conductor to
  remote earth.

## Reducing touch potentials

To protect against these touch voltages, two approaches are available: bonding
and isolation/insulation. Touch voltages involving the shields can be remedied
by bonding the shields together and then bonding these to the manhole rebar and
any local ground rod. An equipotential ground mat can also be used as an
alternative to attaching to the rebar. Work practices for bonding the shields
are feasible, but keeping the phase conductor bonded would be quite challenging.

Using isolation or insulation is another option that can be used. Insulation can
include boots, gloves, and rubber mats. Using isolation or insulation is
particularly appropriate for phase conductors. Floating the phases is a good
option in many cases. The voltage built up in this case is a function of the
capacitance of the cables and the length of cable being floated. *Floating the
phases is not currently modeled.* An alternative to floating the phases is to
keep an insulated cap on the phase, or use insulated gloves when working with
the phase. 

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
against touch voltages transfered from a substation ground potential rise.
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


