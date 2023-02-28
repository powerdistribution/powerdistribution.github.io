---
layout: default
title:  Fault Simulator
---

# Fault Simulator

This app models faults at different points on a power system with
different transformer connections. The line-to-ground voltages in per
unit are shown in blue, and the currents in kA are in green.

<div id="mdpad"></div>

{% include_relative fault_simulator.svg %} 

## Examples

Here are some examples to try:

* Apply a fault to point 1, and view the voltage sags at different
  points with different transformer connections.
  
* Use an ungrounded secondary connection on transformer 1, and apply a
  line-to-ground fault at point 2 ([link](?faultloc=2&tran1sn=High+impedance&tran1connection=Wye+Wye&tran2connection=Delta+Wye&tran1pn=High+impedance)).
  Note the currents and voltages. Now, change transformer 2 into a
  grounding transformer, and note what happens to the currents and
  voltages ([link](?faultloc=2&tran1sn=High+impedance&tran1connection=Wye+Wye&tran2connection=Wye+Delta&tran1pn=High+impedance)).

* Use a delta -- grounded-wye connection for transformer 1, and apply a
  line-to-ground fault at point 2 ([link](?tran1connection=Delta+Wye)).
  Note the currents on the high side. Repeat for a line-to-line fault
  and a line-to-line-to-ground fault.

* Use a delta -- grounded-wye connection for transformer 1, and apply
  a line-to-ground fault at point 2. Change from a solidly grounded
  neutral to a 1-ohm reactor. Is it still effectively grounded? Look
  at the voltages on the unfaulted phases.

## Assumptions

This model is a steady-state model. The transformers are "ideal" and
do not include any magnetizing or saturation effects. The impedances
also do not reflect winding configurations. The voltages and some of
the transformer and line characteristics can be adjusted. Click the 
"Toggle more..." links to see extra inputs.

It is possible to input transformer connections that you really
shouldn't use (see the discussion in section 5.4.5) with a floating
neutral. The bad effects won't be apparent because of the idealized
transformer models used.


## More detail

[OpenDSS](http://www.smartgrid.epri.com/SimulationTool.aspx) is
another tool that's useful for this type of analysis if you want 
to do custom analyses.

<script src="https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.4/mithril.min.js"></script>
<script src="../js/math.min.js"></script>
<script src="../js/mdpad.min.js"></script>
<script src="../js/mdpad-mithril.js"></script>
<script src="../js/network-faults.js"></script>


<script>
const M = math
const N = networkFaults
const c = math.complex
const f = math.format

const an = (degrees) => M.exp(c(0.0, degrees * M.pi / 180))

sq= function(x) {
  return x * x;
}

const faultmap = {"A": [0], "B": [1], "C": [2], "ABg": [0, 1], "BCg": [1, 2], "CAg": [2, 0], "AB": [[0, 1]], "BC": [[1, 2]], "CA": [[2, 0]], "ABC": [0, 1, 2]}
const faulttypes = Object.keys(faultmap)

function mdpad_init() {
    var layout =
      m(".form",
        m(".row",
          m(".col-md-3",
            mselect({ title:"Fault location", mdpad:"faultloc", selected:"2", options:["1", "2", "3", "4"] })),
          m(".col-md-3",
            mselect({ title:"Fault type", mdpad:"faulttype", selected:"A", options: faulttypes})),
          ),
        m(".row",
          m(".col-md-3",
            mselect({ title:"Transformer 1 connection", mdpad:"tran1connection", selected:"Wye Wye", options:["Wye Wye", "Delta Wye", "Wye Delta"] })),
          m(".col-md-3",
            mselect({ title:"Primary neutral", mdpad:"tran1pn", selected:"Solidly grounded", options:["Solidly grounded", "High impedance"] })),
          m(".col-md-3",
            mselect({ title:"Secondary neutral", mdpad:"tran1sn", selected:"Solidly grounded", options:["Solidly grounded", "1 ohm", "High impedance"] })),
          m(".col-md-3",
            m("a", {href: "#collapseOne", "data-toggle": "collapse", "role": "button", "aria-expanded": "false", "aria-controls": "collapseOne"}, "Toggle more...")),
          ),
        m(".collapse#collapseOne", 
          m(".row", 
            m(".col-md-2",
              minput({ title:"kVA", mdpad:"tran1kVA", value:20000, min: 0.0, step:1000 })),
            m(".col-md-2",
              minput({ title:"Z, %", mdpad:"tran1Z", value:11, min: 0.0, step:1 })),
            m(".col-md-2",
              minput({ title:"X/R", mdpad:"tran1XR", value:10, min: 0.0, step:1 })),
            m(".col-md-2",
              minput({ title:"V₁, V", mdpad:"V1", value:138000, min: 0.0, step:10000 })),
            m(".col-md-2",
              minput({ title:"V₂, V", mdpad:"V2", value:12470, min: 0.0, step:1000 })),
            ),
          m(".row", 
            m(".col-md-2",
              minput({ title:"Line len", mdpad:"linelen", value:5, min: 0.0, step:1 })),
            m(".col-md-2",
              minput({ title:"R1, Ω/len", mdpad:"R1", value: 0.206976, min: 0.0, step:0.1 })),
            m(".col-md-2",
              minput({ title:"X1, Ω/len", mdpad:"X1", value: 0.634656, min: 0.0, step:0.1 })),
            m(".col-md-2",
              minput({ title:"R0, Ω/len", mdpad:"R0", value: 0.6204, min: 0.0, step:0.1 })),
            m(".col-md-2",
              minput({ title:"X0, Ω/len", mdpad:"X0", value: 1.90344, min: 0.0, step:0.1 })),
            ),
          ),
        m(".row",
          m(".col-md-3",
            mselect({ title:"Transformer 2 connection", mdpad:"tran2connection", selected:"Wye Wye", options:["Wye Wye", "Delta Wye", "Wye Delta"] })),
          m(".col-md-3",
            mselect({ title:"Primary neutral", mdpad:"tran2pn", selected:"Solidly grounded", options:["Solidly grounded", "1 ohm", "High impedance"] })),
          m(".col-md-3",
            mselect({ title:"Secondary neutral", mdpad:"tran2sn", selected:"Solidly grounded", options:["Solidly grounded", "High impedance"] })),
          m(".col-md-3",
            m("a", {href: "#collapseTwo", "data-toggle": "collapse", "role": "button", "aria-expanded": "false", "aria-controls": "collapseTwo"}, "Toggle more...")),
          ),
        m(".row.collapse#collapseTwo", 
          m(".col-md-2",
            minput({ title:"kVA", mdpad:"tran2kVA", value:1000, min: 0.0, step:500 })),
          m(".col-md-2",
            minput({ title:"Z, %", mdpad:"tran2Z", value:7, min: 0.0, step:1 })),
          m(".col-md-2",
            minput({ title:"X/R", mdpad:"tran2XR", value:10, min: 0.0, step:1 })),
          m(".col-md-2",
            minput({ title:"V₃, V", mdpad:"V3", value:480, min: 0.0, step:100 })),
          ),
      )
    m.render(document.querySelector("#mdpad"), layout);
}

function mdpad_update() {
    // Adjust the SVG based on user inputs
    //
    var x = $("svg")
    x.find("#V1txt").text((mdpad.V1/1000).toFixed(1) + " / " + (mdpad.V1/1000/1.7320508075688772).toFixed(1) + " kV")
    x.find("#V2txt").text((mdpad.V2/1000).toFixed(2) + " / " + (mdpad.V2/1000/1.7320508075688772).toFixed(2) + " kV")
    x.find("#V3txt").text((mdpad.V3).toFixed()       + " / " + (mdpad.V3/1.7320508075688772).toFixed() + " V")
    x.find("#T1txt").text((mdpad.tran1kVA/1000).toFixed(1) + " MVA, Z = " + mdpad.tran1Z + "%")
    x.find("#T2txt").text((mdpad.tran2kVA)                 + " kVA, Z = " + mdpad.tran2Z + "%")
    x.find("#YD1").css("display", "none")
    x.find("#YY1").css("display", "none")
    x.find("#DY1").css("display", "none")
    x.find("#YD2").css("display", "none")
    x.find("#YY2").css("display", "none")
    x.find("#DY2").css("display", "none")
    if (mdpad.tran1connection == "Delta Wye") {
        x.find("#DY1").css("display", "inline");
        $("select[mdpad*='tran1pn']").parent().toggle(false);
        $("select[mdpad*='tran1sn']").parent().toggle(true);
    } else if (mdpad.tran1connection == "Wye Wye") {
        x.find("#YY1").css("display", "inline");
        $("select[mdpad*='tran1pn']").parent().toggle(true);
        $("select[mdpad*='tran1sn']").parent().toggle(true);
    } else if (mdpad.tran1connection == "Wye Delta") {
        x.find("#YD1").css("display", "inline");
        $("select[mdpad*='tran1pn']").parent().toggle(true);
        $("select[mdpad*='tran1sn']").parent().toggle(false);
    }
    if (mdpad.tran2connection == "Delta Wye") {
        x.find("#DY2").css("display", "inline");
        $("select[mdpad*='tran2pn']").parent().toggle(false);
        $("select[mdpad*='tran2sn']").parent().toggle(true);
    } else if (mdpad.tran2connection == "Wye Wye") {
        x.find("#YY2").css("display", "inline");
        $("select[mdpad*='tran2pn']").parent().toggle(true);
        $("select[mdpad*='tran2sn']").parent().toggle(true);
    } else if (mdpad.tran2connection == "Wye Delta") {
        x.find("#YD2").css("display", "inline");
        $("select[mdpad*='tran2pn']").parent().toggle(true);
        $("select[mdpad*='tran2sn']").parent().toggle(false);
    }
    x.find("#F1,#F2,#F3,#F4").css("display", "none")
    x.find("#F"+mdpad.faultloc).css("display", "inline")
    x.find("#1A,#1B,#1C,#1AB,#1BC,#1CA,#2A,#2B,#2C,#2AB,#2BC,#2CA,#3A,#3B,#3C,#3AB,#3BC,#3CA,#4A,#4B,#4C,#4AB,#4BC,#4CA").css("display", "none")
    x.find("#" + mdpad.faultloc + mdpad.faulttype).css("display", "inline")
    if (mdpad.faulttype == "ABC") {
        x.find("#" + mdpad.faultloc + "A").css("display", "inline");
        x.find("#" + mdpad.faultloc + "B").css("display", "inline");
        x.find("#" + mdpad.faultloc + "C").css("display", "inline");
    } else if (mdpad.faulttype == "ABg") {
        x.find("#" + mdpad.faultloc + "A").css("display", "inline");
        x.find("#" + mdpad.faultloc + "B").css("display", "inline");
    } else if (mdpad.faulttype == "BCg") {
        x.find("#" + mdpad.faultloc + "B").css("display", "inline");
        x.find("#" + mdpad.faultloc + "C").css("display", "inline");
    } else if (mdpad.faulttype == "CAg") {
        x.find("#" + mdpad.faultloc + "A").css("display", "inline");
        x.find("#" + mdpad.faultloc + "C").css("display", "inline");
    }

    //
    // run the case
    //
    buses = ["t1","t1x","t2","t2x"]
    busbaseV = [mdpad.V1,mdpad.V2,mdpad.V2,mdpad.V3]
    phases = ["A","B","C"]
    transtype = {"Wye Wye": ["wye", "wye"], }
    neutraloptions = {"Solidly grounded": 1e-7, "1 ohm": 1.0, "2 ohms": 2.0, "High impedance": 1e3}
    devices = {
        SRC:  N.Source("t1", {V: mdpad.V1, I3p: 8400, I1p: 8400, XR: 5, X0R0: 5}),
        FLT:  N.Fault(buses[Number(mdpad.faultloc) - 1], ...(faultmap[mdpad.faulttype])),
        T1:   N.Transformer("t1", "t1x", {kVA: 20000, conns: mdpad.tran1connection.toLowerCase().split(" "), 
                                          Vs: [138000, 12470], Z: 11, XR: 10, Zgs: [1e7, 1e7]}),
        TN1:  N.Impedance("t1", {Z: c(0, neutraloptions[mdpad.tran1pn]), nodes: [3]}),
        TN2:  N.Impedance("t1x", {Z: c(0, neutraloptions[mdpad.tran1sn]), nodes: [3]}),
        LINE: N.Line("t1x", "t2", {z1: c(mdpad.r1 * mdpad.linelen, mdpad.x1 * mdpad.linelen),  
                                   z0: c(mdpad.r0 * mdpad.linelen, mdpad.x0 * mdpad.linelen)}),
        T2:   N.Transformer("t2", "t2x", {kVA: mdpad.tran2kVA, conns: mdpad.tran2connection.toLowerCase().split(" "),                               
                                          Vs: [mdpad.V2, mdpad.V3], Z: mdpad.tran2Z, 
                                          XR: mdpad.tran2XR, Zgs: [1e7, 1e7]}),
        TN3:  N.Impedance("t2", {Z: c(0, neutraloptions[mdpad.tran2pn]), nodes: [3]}),
        TN4:  N.Impedance("t2x", {Z: c(0, neutraloptions[mdpad.tran2sn]), nodes: [3]}),
        XTRA: N.Impedance("t2x", {Z: 1e7}),
    }
    r = N.solve(devices)

    //
    // update voltages annotations on the SVG
    //
    for (bus = 0; bus < 4; bus++) {
        busV = N.busVoltages(r, buses[bus])
        for (phase = 0; phase < 3; phase++) {
            name = buses[bus] + phases[phase]
            re = busV._data[phase].re / busbaseV[bus] * 1.7320508075688772
            im = busV._data[phase].im / busbaseV[bus] * 1.7320508075688772
            mag = Math.sqrt(sq(re) + sq(im)).toFixed(2)
            ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
            jQuery("svg #" + name).text(mag+"∠"+ang+"°")
        }
    }
    //
    // update currents on the SVG
    //
    devices = ["SRC", "T1", "T1", "T2", "T2"]
    buses = ["t1", "t1", "t1x", "t2", "t2x"]
    x.find("#i2").toggle(mdpad.faultloc == "1")
    x.find("#i4").toggle(mdpad.faultloc == "2" || mdpad.faultloc == "3")
    x.find("#i5").toggle(mdpad.faultloc == "4")
    for (loc = 0; loc < 5; loc++)
        for (phase = 0; phase < 3; phase++) {
            name = "i" + (loc+1) + phases[phase].toLowerCase()
            idev = M.multiply(N.deviceResults(r, devices[loc])[buses[loc]].i._data[phase], loc % 2 == 0 ? -1 : 1)
            re = idev.re / 1000
            im = idev.im / 1000
            mag = Math.sqrt(sq(re) + sq(im)).toPrecision(2)
            ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
            x.find("#" + name).children().text(mag+"∠"+ang+"°")
            // hide small currents
            x.find("#" + name).toggle(mag >= 0.01)
        }
    for (loc = 1; loc < 5; loc++) {
        name = "in" + loc
        idev = M.multiply(N.currents(r, "TN" + loc)._data[0], loc % 2 == 0 ? -1 : 1)
        re = idev.re / 1000
        im = idev.im / 1000
        mag = Math.sqrt(sq(re) + sq(im)).toPrecision(2)
        ang = (Math.atan2(im, re) * 180 / Math.PI).toFixed()
        x.find("#" + name).children().text(mag+"∠"+ang+"°")
        // hide small currents
        x.find("#" + name).toggle(mag >= 0.01)
   }
}


</script>


