---
layout: default
title:  Voltage Drop (or Rise) along a Line Section
---

# Voltage Drop (or Rise) along a Line Section

This app models the voltage drop or rise from unbalanced or balanced
load on an overhead distribution line. The load is constant throughout
the segment modeled. The voltages at the start of the segment are
balanced.

<div id="mdpad"></div>

## End-of-Line Results

<div id="mdpad-results"></div>

## Voltage-Drop Profiles
<div id="mdpad-vdropplot"></div>
<div id="mdpad-vdropplot2"></div>

## Notes

For the power factors, a positive value means an inductive load, and a
negative value means a capacitive load. You can also use a negative
current to indicate generation of real power. The line capacitance
is ignored.

If not "None", the "Regulator" input specifies the location along the
line of an ideal voltage regulator (no impedance and perfect regulation
to the setpoint).

For impedances, this app uses a simple implementation of the equations
outlined in section 2.4. The frequency is fixed at 60 Hz. For more
sophisticated line modeling and voltage drop calculations, see
[OpenDSS](http://www.smartgrid.epri.com/SimulationTool.aspx) or a
transient program like [EMTP-RV](http://emtp.com) or
[ATP](http://emtp.org).


<script src="https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.4/mithril.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js"></script>
<script src="https://cdn.plot.ly/plotly-basic-1.54.1.min.js"></script>
<script src="https://distribution.epri.com/js/mdpad.min.js"></script>
<script src="https://distribution.epri.com/js/mdpad-mithril.js"></script>
<script src="https://distribution.epri.com/js/math.min.js"></script>


<script>
const M = math
const c = math.complex
const f = math.format
sq = function(x) {
  return x * x;
}

function mlen(x) {
    if (["number", "Complex"].includes(M.typeOf(x))) {
        return 0
    }
    return M.subset(M.size(x), M.index(0))
}

const unsqueeze = (x) => mlen(M.size(x)) > 1 ? x : M.reshape(x, [M.subset(M.size(x), M.index(0)), 1])

function assign(A, value, ...idx) {
    return M.subset(A, M.index(...idx), value)
}

function IX(A, ...idx) {
    // shortcut; also tried to maintain vectors / matrices where possible
    var res = M.subset(A, M.index(...idx))
    if (mlen(idx[0]) > 0 && mlen(res) == 0) {   // indexing with a vector, but res is a scalar
        return M.matrix([res])
    }
    return res
}

const an = (degrees) => M.exp(c(0.0, degrees * M.pi / 180))
const pf = (x) => M.multiply(M.sign(x), c(x, -M.sin(M.acos(x))))
const ang = (z) => M.atan2(M.im(z), M.re(z)) * 180 / M.pi

function seq(x) {
    return [
        M.divide(M.sum(IX(x, 0), M.multiply(an(120), IX(x, 1)), M.multiply(an(-120), IX(x, 2))), 3),
        M.divide(M.sum(IX(x, 0), M.multiply(an(-120), IX(x, 1)), M.multiply(an(120), IX(x, 2))), 3),
        M.divide(M.sum(x), 3)
    ]
}

const rac = [3.551, 2.232, 1.402, 1.114, 0.882, 0.7, 0.556, 0.441, 0.373, 0.35, 0.311, 0.278, 0.267, 0.235, 0.208, 0.197, 0.188, 0.169, 0.135, 0.133, 0.127, 0.12, 0.109, 0.106, 0.101, 0.0963]
const gmr = [0.0055611962035177, 0.00700459393067038, 0.00882262274842038, 0.00990159326021141, 0.0111125174323268, 0.0124715326552536, 0.0139967498560307, 0.0157084948536593, 0.0171990576740366, 0.0177754680514267, 0.0197856043349646, 0.0209605660328388, 0.0214852445181602, 0.0227611387971986, 0.0243123406199979, 0.0249209197027924, 0.0255447325512619, 0.0270616982108416, 0.0308759703782212, 0.0311314761296609, 0.0319107497292355, 0.0327095298674806, 0.0343675751093677, 0.0349387277474913, 0.0361096666226405, 0.0367097709735484]
const conductors = ["6 AAC", "4 AAC", "2 AAC", "1 AAC", "1/0 AAC", "2/0 AAC", "3/0 AAC", "4/0 AAC", "250 AAC", "266.8 AAC", "300 AAC", "336.4 AAC", "350 AAC", "397.5 AAC", "450 AAC", "477 AAC", "500 AAC", "556.5 AAC", "700 AAC", "715.5 AAC", "750 AAC", "795 AAC", "874.5 AAC", "900 AAC", "954 AAC", "1000 AAC"]

function mdpad_init() {
    var layout =
      m(".form",
        m(".row",
          m(".col-md-3",
            mselect({ title:"Phases", mdpad:"phases", selected:"350 AAC", options:conductors })),
          m(".col-md-3",
            mselect({ title:"Neutral", mdpad:"neutral", selected:"4/0 AAC", options:conductors })),
          ),
        m("h3", "Phase and neutral positions in feet"),
        m(".row",
          m(".col-md-3",
            minput({ title:"xA", mdpad:"xA", value:-4.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"xB", mdpad:"xB", value: 0.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"xC", mdpad:"xC", value: 4.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"xN", mdpad:"xN", value: 0.0, step:0.2 })),
          ),
        m(".row",
          m(".col-md-3",
            minput({ title:"yA", mdpad:"yA", value:35.0, min: 0.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"yB", mdpad:"yB", value:36.0, min: 0.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"yC", mdpad:"yC", value:35.0, min: 0.0, step:0.2 })),
          m(".col-md-3",
            minput({ title:"yN", mdpad:"yN", value:30.0, min: 0.0, step:0.2 })),
          ),
        m(".row",
          m(".col-md-3",
            minput({ title:"Earth resistivity, ohm-m", mdpad:"rho", value:100.0, min: 0.0, step:50 })),
          m(".col-md-3",
            minput({ title:"Voltage (L-N), volts", mdpad:"Vbase", value:7200.0, min: 0.0, step:100 })),
          m(".col-md-3",
            minput({ title:"Voltage setpoints, pu", mdpad:"Vsetpoint", value:1.04, min: 0.0, step:0.01 })),
          m(".col-md-3",
            minput({ title:"Line length, miles", mdpad:"len", value:5.0, min: 0.0, step:1 })),
          ),
        m("h3", "Phase currents and power factors"),
        m(".row",
          m(".col-md-3",
            minput({ title:"Ia, A", mdpad:"Ia", value:100.0, min: 0.0, step:10.0 })),
          m(".col-md-3",
            minput({ title:"Ib, A", mdpad:"Ib", value:100.0, min: 0.0, step:10.0 })),
          m(".col-md-3",
            minput({ title:"Ic, A", mdpad:"Ic", value:100.0, min: 0.0, step:10.0 })),
          ),
        m(".row",
          m(".col-md-3",
            minput({ title:"pfA", mdpad:"pfA", value:1.0, min: -1.0, max: 1.0, step:0.01 })),
          m(".col-md-3",
            minput({ title:"pfB", mdpad:"pfB", value:1.0, min: -1.0, max: 1.0, step:0.01 })),
          m(".col-md-3",
            minput({ title:"pfC", mdpad:"pfC", value:1.0, min: -1.0, max: 1.0, step:0.01 })),
          ),
        m(".row",
          m(".col-md-3",
            mselect({ title:"Roll phases", mdpad:"rolling", options:["None", "A-B-C 🠖 B-C-A 🠖 C-A-B", "A-B-C 🠖 C-A-B 🠖 B-C-A"] })),
          m(".col-md-3",
            mselect({ title:"Regulator", mdpad:"vreg", options:["None", "50%", "75%", "100%"] })),
          ),
        )
    m.render(document.querySelector("#mdpad"), layout);
}

calcZ = function(cond) {
    var n = cond.R.length
    var Z = numeric.t(numeric.identity(n), numeric.identity(n))
    var f = 60     // Hz
    var k1 = 0.2794 * f / 60  // for answers in ohms/mi
    var Re = 0.0954 * f / 60
    var De = 2160 * math.sqrt(cond.rho / f)
    for (var i = 0; i < n; i++) {
        Z.x[i][i] = cond.R[i] + Re
        Z.y[i][i] = k1 * math.log10(De / cond.gmr[i])
        if (i < n)
            for (var k = i + 1; k < n; k++) {
                dik = math.sqrt(sq(cond.y[i] - cond.y[k]) + sq(cond.x[i] - cond.x[k]))
                Z.x[i][k] = Re
                Z.y[i][k] = k1 * math.log10(De / dik)
                Z.x[k][i] = Z.x[i][k]
                Z.y[k][i] = Z.y[i][k]
            }
    }
    // Eliminate grounded wires
    if ( cond.ngrnd > 0 ) {
      np = n - cond.ngrnd
      Z = Z.getBlock([0, 0], [np-1, np-1]).sub(
          Z.getBlock([0, np], [np-1, n-1]).dot(Z.getBlock([np, np], [n-1, n-1]).inv()).dot(Z.getBlock([np, 0], [n-1, np-1])))
    }
    return Z
}

calcZ = function(cond) {
    let n = cond.R.length
    let Z = M.zeros(n, n)
    let f = 60     // Hz
    let k1 = 0.2794 * f / 60  // for answers in ohms/mi
    let Re = 0.0954 * f / 60
    let De = 2160 * M.sqrt(cond.rho / f)
    for (var i = 0; i < n; i++) {
        Z = assign(Z, c(cond.R[i] + Re, k1 * M.log10(De / cond.gmr[i])), i, i)
        if (i < n)
            for (var k = i + 1; k < n; k++) {
                dik = M.sqrt(sq(cond.y[i] - cond.y[k]) + sq(cond.x[i] - cond.x[k]))
                Z = assign(Z, c(Re, k1 * M.log10(De / dik)), i, k)
                Z = assign(Z, c(Re, k1 * M.log10(De / dik)), k, i)
            }
    }
    // Eliminate grounded wires
    if ( cond.ngrnd > 0 ) {
        var np = n - cond.ngrnd
        var idxp = M.range(0, np)
        var idxn = M.range(np, n)
        Z = M.subtract(unsqueeze(IX(Z, idxp, idxp)),
                       M.multiply(unsqueeze(IX(Z, idxp, idxn)), 
                                  unsqueeze(M.inv(IX(Z, idxn, idxn))),
                                  unsqueeze(IX(Z, idxn, idxp))))
    }
    return Z
}

function mdpad_update() {
    pidx = _.map(conductors, String).indexOf(mdpad.phases)
    nidx = _.map(conductors, String).indexOf(mdpad.neutral)

    cond = {}
    cond.R = []
    cond.gmr = []
    cond.y = []
    cond.ngrnd = 1       // number of grounded conductors -- always the last conductors
    cond.rho = mdpad.rho
    cond.y = [mdpad.yA, mdpad.yB, mdpad.yC, mdpad.yN]        // ft
    cond.x = [mdpad.xA, mdpad.xB, mdpad.xC, mdpad.xN]
    for (var i = 0; i < 3; i++) {
        cond.R[i]   = rac[pidx]   // ac resistance, ohms/mi
        cond.gmr[i] = gmr[pidx]   // ft
    }
    cond.R[3]   = rac[nidx]   // ac resistance, ohms/mi
    cond.gmr[3] = gmr[nidx]   // ft
    I = [M.multiply(mdpad.Ia, pf(mdpad.pfA)), M.multiply(mdpad.Ib, pf(mdpad.pfB), an(-120)), M.multiply(mdpad.Ic, pf(mdpad.pfC), an(120))]
    Z = M.multiply(calcZ(cond), mdpad.len)
    Vsub = M.multiply(mdpad.Vbase * mdpad.Vsetpoint, [an(0), an(-120), an(120)])
    Vload = M.subtract(Vsub, M.multiply(Z, I))
    V = [Vsub]
    d = [0.0, 1/3, 1/2, 1/2, 2/3, 3/4, 3/4, 1, 1].map((x) => x*mdpad.len)
    V.push(M.subtract(V[V.length-1], M.multiply(Z, I, 1/3)))
    if (mdpad.rolling == "A-B-C 🠖 B-C-A 🠖 C-A-B") {
        Z = IX(Z, [1,2,0], [1,2,0])
    } else if (mdpad.rolling == "A-B-C 🠖 C-A-B 🠖 B-C-A") {
        Z = IX(Z, [2,0,1], [2,0,1])
    }
    V.push(M.subtract(V[V.length-1], M.multiply(Z, I, 1/6)))
    if (mdpad.vreg == "50%") {
        ratio = M.multiply(M.abs(V[V.length-1]), 1/mdpad.Vbase, 1/mdpad.Vsetpoint)
        I = M.dotMultiply(I, ratio)
        V.push(M.dotDivide(V[V.length-1], ratio))
    } else {
        V.push(V[V.length-1])
    }
    V.push(M.subtract(V[V.length-1], M.multiply(Z, I, 1/6)))
    if (mdpad.rolling == "A-B-C 🠖 B-C-A 🠖 C-A-B") {
        Z = IX(Z, [1,2,0], [1,2,0])
    } else if (mdpad.rolling == "A-B-C 🠖 C-A-B 🠖 B-C-A") {
        Z = IX(Z, [2,0,1], [2,0,1])
    }
    V.push(M.subtract(V[V.length-1], M.multiply(Z, I, 1/12)))
    if (mdpad.vreg == "75%") {
        ratio = M.multiply(M.abs(V[V.length-1]), 1/mdpad.Vbase, 1/mdpad.Vsetpoint)
        I = M.dotMultiply(I, ratio)
        V.push(M.dotDivide(V[V.length-1], ratio))
    } else {
        V.push(V[V.length-1])
    }
    V.push(M.subtract(V[V.length-1], M.multiply(Z, I, 1/4)))
    if (mdpad.vreg == "100%") {
        ratio = M.multiply(M.abs(V[V.length-1]), 1/mdpad.Vbase, 1/mdpad.Vsetpoint)
        I = M.dotMultiply(I, ratio)
        V.push(M.dotDivide(V[V.length-1], ratio))
    } else {
        V.push(V[V.length-1])
    }
    Vload = V[V.length-1]
    Vabs = M.abs(Vload)
    Vseq = seq(Vload)
    Vll = M.subtract(Vload, IX(Vload, [1, 2, 0]))
    Vllabs = M.abs(Vll)
    fmt0 = (x) => f(x, 0)
    series = function(name, x) {
        var z = M.zeros(6)
        for (const i of [0,2,4]) {
            z = assign(z, IX(x, i/2), i+1)
        }
        return {x: M.re(z)._data, y: M.im(z)._data, name: name}
    }
    var phasorplot = mplotly([
                              series("Vsub",  Vsub),
                              series("Vload", Vload),
                              series("I",     I),
                             ], 
                    { width: 300, height: 300, margin: { l: 00, r: 00, t: 00, b: 00}, 
                      yaxis: {scaleanchor: 'x', scaleratio: 1, visible: false}, 
                      xaxis: {visible: false}, 
                      hovermode: 'closest',
                      legend: {x:0.9, y:0.9},
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    },
                    { displayModeBar: false })
    var layout = m("div",
      m(".row",
        m(".col-md-3",
          m("h3", "Line-to-neutral voltages"),
          mdatatable({"": ["A", "B", "C"],
                      "V": Vabs.map((x) => x.toFixed())._data, 
                      "angle": Vload.map((x) => f(ang(x), 3) + "°")._data,
                      "per unit": Vabs.map((x) => (x/mdpad.Vbase).toFixed(4))._data,
                      // "120-V base": Vabs.map((x) => (x/mdpad.Vbase*120).toFixed(1))._data,
                      }),
        ),
        m(".col-md-2",
          m("h3", "Sequence V"),
          mdatatable({"": ["1", "2", "0"],
                      "per unit": Vseq.map((x) => (M.abs(x)/mdpad.Vbase).toFixed(4)),
                      }),
        ),
        m(".col-md-3",
          m("h3", "Line-to-line voltages"),
          mdatatable({"": ["A-B", "B-C", "C-A"],
                      "V": Vllabs.map((x) => x.toFixed())._data, 
                      "angle": Vll.map((x) => f(ang(x), 3) + "°")._data,
                      "per unit": Vllabs.map((x) => (x/mdpad.Vbase/M.sqrt(3)).toFixed(4))._data,
                      // "120-V base": Vllabs.map((x) => (x/mdpad.Vbase*120/M.sqrt(3)).toFixed(1))._data,
                      }),
        ),
        m(".col-md-2", phasorplot)
      )
    )
    m.render(document.querySelector("#mdpad-results"), layout);
    var vdropplot = mplotly([
                              {x: d, y:V.map((x) => M.abs(IX(x, 0)) / mdpad.Vbase), name: "Va", mode: 'lines'},
                              {x: d, y:V.map((x) => M.abs(IX(x, 1)) / mdpad.Vbase), name: "Vb", mode: 'lines'},
                              {x: d, y:V.map((x) => M.abs(IX(x, 2)) / mdpad.Vbase), name: "Vc", mode: 'lines'},
                             ], 
                    { width: 850, height: 350, margin: { l: 60, r: 10, t: 20, b: 50}, hovermode: 'closest',
                      xaxis: {title: "Distance, mi"},
                      yaxis: {title: "Voltage, pu"},
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    })
    m.render(document.getElementById("mdpad-vdropplot"), vdropplot)
    var vdropplot2 = mplotly([
                              {x: d, y:V.map((x) => M.abs(seq(x)[1]) / mdpad.Vbase), name: "V2", mode: 'lines'},
                              {x: d, y:V.map((x) => M.abs(seq(x)[2]) / mdpad.Vbase), name: "V0", mode: 'lines'},
                             ], 
                    { width: 850, height: 350, margin: { l: 60, r: 10, t: 20, b: 50}, hovermode: 'closest',
                      xaxis: {title: "Distance, mi"},
                      yaxis: {title: "Voltage, pu"},
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    })
    m.render(document.getElementById("mdpad-vdropplot2"), vdropplot2)
}



</script>


