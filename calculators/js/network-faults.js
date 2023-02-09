/* 

Copyright 2021-2022 Electric Power Research Institute

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/


networkFaults = function() {

// var math = require("./math.min.js")
// mathjs utility functions and shortcuts

const M = math
const c = math.complex
const f = math.format
let {abs, sin, cos, tan, asin, acos, atan, atan2, exp, log, pi, pow, sqrt, add, subtract, multiply, divide, inv, re, im} = math
const ybig = c(1.e5)
const mu0 = 12.56637e-7 // hy/m
const e0 = 8.854e-12    // dielectric constant  F/m
const twopi = 2 * pi
const rhoTS = 2.3718e-8  // for copper tape shield

const negate = (x) => M.multiply(-1, x)

function sqr(x) {return x*x}

function mlen(x) {
    if (["number", "Complex"].includes(M.typeOf(x))) {
        return 0
    }
    return M.subset(M.size(x), M.index(0))
}

function setDiag(A, d) {
    for (i = 0; i < mlen(A); i++) {
        A = M.subset(A, M.index(i, i), d);
    }
    return A
}

function IX(A, ...idx) {
    // shortcut; also tried to maintain vectors / matrices where possible
    var res = M.subset(A, M.index(...idx))
    if (mlen(idx[0]) > 0 && mlen(res) == 0) {   // indexing with a vector, but res is a scalar
        return M.matrix([res])
    }
    return res
}

function assign(A, value, ...idx) {
    return M.subset(A, M.index(...idx), value)
}

function addSubset(A, value, ...idx) {
    var ix = M.index(...idx)
    return M.subset(A, ix, add(M.subset(A, ix), value))
}

function combine(A, B, C, D) {
    return M.concat(M.concat(A, B),
                    M.concat(C, D), 0)
}

mtoscalar = (x) => M.subset(x, M.index(0,0))
autoscalar = (x) => mlen(d.Yprim) == 1 ? mtoscalar(x) : x
unsqueeze = (x) => mlen(M.size(x)) > 1 ? x : M.reshape(x, [M.subset(M.size(x), M.index(0)), 1])

function ctostring(x, digits) {
    if (digits == undefined) {
        return f(abs(x), 4) + "∠" + f(ang(x), 3) + "°"
    }
    return abs(x).toFixed(digits) + "∠" + ang(x).toFixed(digits) + "°"
}


const uc = (x, y) => divide(c(x, y), abs(c(x, y)))
const pf = (x) => multiply(M.sign(x), c(x, sin(acos(x))))
const xr = (x) => uc(1.0, x)
const ang = (z) => atan2(im(z), re(z)) * 180 / pi
const an = (degrees) => exp(c(0.0, degrees * pi / 180))

function Bus(name, offset) {
    this.name = name 
    this.offset = offset
}

function Device(Yprim, nodes) {
    this.Yprim = Yprim 
    this.nodes = nodes
}

function ActiveDevice(Yprim, I, nodes) {
    this.Yprim = Yprim 
    this.I = I
    this.nodes = nodes
}

function Location(node, offset) {
    this.node = node
    this.offset = offset
}


function Source(bus, {V = 13200.0, I3p = 12500.0, I1p = 13125, XR = 15.0, X0R0 = 15.0} = {}) {
    var Vln = V / sqrt(3)
    var z1 = multiply(Vln / I3p, xr(XR))
    var zs = multiply(Vln / I1p, xr(X0R0))
    var z0 = subtract(multiply(3, zs), multiply(2, z1))
    var zm = divide(subtract(z0, z1), 3)
    var Zprim = setDiag(multiply(zm, M.ones(3, 3)), zs)
    var Yprim = inv(Zprim)
    var V = multiply(Vln, [an(0.0), an(-120.0), an(120.0)])
    var I =  multiply(Yprim, V)
    return new ActiveDevice(Yprim, I, [new Bus(bus, [0, 1, 2])])
}

function CurrentSource(bus, {I = 10000.0, nodes = [0,1,2]} = {}) {
    var n = nodes.length
    var Yprim = M.zeros(n, n)
    if (n == 3) {
        I = multiply(I, [an(0.0), an(-120.0), an(120.0)])
    } else if (typeof(I) === "number") {
        I = multiply([I], an(0.0))
    }
    return new ActiveDevice(Yprim, I, [new Bus(bus, nodes)])
}

function Fault(bus, node1, node2, node3) {
    if (Array.isArray(node1)) {
        var Yprim = M.matrix([[ybig, -ybig], [-ybig, ybig]])
        return new Device(Yprim, [new Bus(bus, [node1[0], node1[1]])])
    }
    var nodes = [node1, node2, node3].filter(x => x !== undefined)
    var n = nodes.length
    var Yprim = multiply(ybig, M.identity(n, n))
    return new Device(Yprim, [new Bus(bus, nodes)])
}

function Impedance(bus, {Z = 1, nodes = [0,1,2], tonodes = []} = {}) {
    var n = nodes.length
    if (tonodes.length > 0) {
        var allnodes = nodes.concat(tonodes)
        allnodes = allnodes.filter((item, pos) => allnodes.indexOf(item) === pos)  // remove duplicates
        n = allnodes.length
        var Yprim = M.zeros(n, n)
        for (var i = 0; i < nodes.length; i++) {
            var node = allnodes.findIndex((x)=> x == nodes[i])
            var tonode = allnodes.findIndex((x)=> x == tonodes[tonodes.length == 1 ? 0 : i])
            Yprim = addSubset(Yprim, M.inv(Z), node, node)
            Yprim = addSubset(Yprim, M.inv(Z), tonode, tonode)
            Yprim = addSubset(Yprim, M.inv(-Z), node, tonode)
            Yprim = addSubset(Yprim, M.inv(-Z), tonode, node)
        }
        return new Device(Yprim, [new Bus(bus, allnodes)])
    }
    var Yprim = multiply(inv(Z), M.identity(n, n))
    return new Device(Yprim, [new Bus(bus, nodes)])
}

function Switch(bus1, bus2, from = [0, 1, 2], to = from) {
    var n = from.length
    var Yp = M.zeros(n, n)
    Yp = setDiag(Yp, ybig)
    var Yprim = combine(Yp, negate(Yp), negate(Yp), Yp)
    return new Device(Yprim, [new Bus(bus1, from), new Bus(bus2, to)])
}  

function Load(bus, {V = 480, kVA = 1000, PF = 0.85, Z2Z1 = 1.0, Z0Z1 = 1.0, X2R2 = 0.619744, X0R0 = 0.619744} = {}) {
    var zbase = V * V / kVA / 1000
    var z1 = multiply(zbase, pf(PF))
    var z2 = multiply(Z2Z1, zbase, xr(X2R2))
    var z0 = multiply(Z0Z1, zbase, xr(X0R0))
    var zs = divide(add(z0, z1, z2), 3)
    var zm = divide(subtract(z0, z1), 3)
    var Yprim = M.inv(setDiag(multiply(zm, M.ones(3, 3)), zs))
    return new Device(Yprim, [new Bus(bus, [0,1,2])])
}

function Transformer(bus1, bus2, {kVA = 1000, conns = ["delta", "wye"], Vs = [13200, 480], Zgs = [1e-6, 1e-6], Z = 5.0, XR = 13.0} = {}) {
    var nw = 2
    var Zbase = 3 / kVA / 1000.0
    var Zb = [multiply(Zbase * Z / 100, xr(XR))]
    var A = M.zeros(nw - 1, nw)
    for (i = 0; i < nw - 1; i++) {
        A = assign(A,  1, i, i+1)
        A = assign(A, -1, i, 0)
    }
    var Y_1volt = multiply(unsqueeze(multiply(M.transpose(A), M.inv(Zb))), A)
    var B = M.zeros(nw, 2*nw)
    for (i = 0; i < nw; i++) {
        var Vbase = Vs[i] * (conns[i] == "wye" ? 1/sqrt(3) : 1)
        for (j = 0; j < 2*nw; j++) {
            if (j == 2*i) {
                B = assign(B, 1/Vbase, i, j)
            }
            if (j == 2*i + 1) {
                B = assign(B, -1/Vbase, i, j)
            }
        }
    }
    var Yterm = multiply(M.transpose(B), Y_1volt, B)
    if (conns[0] == "wye") {
        var nw1 = 4
        var idxs1 = [3, 3, 3]
    } else {
        var nw1 = 3
        var idxs1 = [2, 0, 1]
    }
    if (conns[1] == "wye") {
        var nw2 = 4
        var idxs2 = [3, 3, 3]
    } else {
        var nw2 = 3
        var idxs2 = [1, 2, 0]
    }
    var Yprim = M.zeros(nw1 + nw2, nw1 + nw2)
    for (iw = 0; iw < 3; iw++) {
        var idxs = [iw, idxs1[iw], nw1+iw, nw1+idxs2[iw]]
        Yprim = addSubset(Yprim, Yterm, idxs, idxs)
    }
    var idx1 = [0, 1, 2]
    var idx2 = [0, 1, 2]
    // Add in neutral impedances
    if (conns[0] == "wye") {
        Yprim = addSubset(Yprim, M.inv(Zgs[0]), 3, 3)
        idx1 = [0, 1, 2, 3]
    }
    if (conns[1] == "wye") {
        Yprim = addSubset(Yprim, M.inv(Zgs[1]), nw1+3, nw1+3)
        idx2 = [0, 1, 2, 3]
    }
    return new Device(Yprim, [new Bus(bus1, idx1), new Bus(bus2, idx2)])
}

var condtbl = {
"AAC #6 kcmil 7": {radius : 0.0023368, GMR : 0.00169164, Rdc : 0.002163058},
"AAC #4 kcmil 7": {radius : 0.0029464, GMR : 0.0021336, Rdc : 0.00135958},
"AAC #2 kcmil 7": {radius : 0.0037084, GMR : 0.002691384, Rdc : 0.000853675},
"AAC #1 kcmil 7": {radius : 0.0041656, GMR : 0.003020568, Rdc : 0.000677822},
"AAC 1/0 kcmil 7": {radius : 0.0046736, GMR : 0.00338328, Rdc : 0.000537402},
"AAC 2/0 kcmil 7": {radius : 0.0052578, GMR : 0.00381, Rdc : 0.000426181},
"AAC 3/0 kcmil 7": {radius : 0.0058928, GMR : 0.0042672, Rdc : 0.000338255},
"AAC 4/0 kcmil 7": {radius : 0.0066294, GMR : 0.00481584, Rdc : 0.000268045},
"AAC 250 kcmil 7": {radius : 0.0072009, GMR : 0.00521208, Rdc : 0.000226706},
"AAC 250 kcmil 19": {radius : 0.0072898, GMR : 0.00551688, Rdc : 0.000227362},
"AAC 266.8 kcmil 7": {radius : 0.0074422, GMR : 0.00539496, Rdc : 0.00021227},
"AAC 266.8 kcmil 19": {radius : 0.0075311, GMR : 0.00569976, Rdc : 0.000212598},
"AAC 300 kcmil 19": {radius : 0.0079883, GMR : 0.00603504, Rdc : 0.000188648},
"AAC 336.4 kcmil 19": {radius : 0.0084582, GMR : 0.0064008, Rdc : 0.000168307},
"AAC 350 kcmil 19": {radius : 0.0086233, GMR : 0.00652272, Rdc : 0.000162073},
"AAC 397.5 kcmil 19": {radius : 0.0091948, GMR : 0.00694944, Rdc : 0.000142717},
"AAC 450 kcmil 19": {radius : 0.0097663, GMR : 0.00740664, Rdc : 0.000125984},
"AAC 477 kcmil 19": {radius : 0.0100584, GMR : 0.00762, Rdc : 0.000119094},
"AAC 477 kcmil 37": {radius : 0.0100965, GMR : 0.00774192, Rdc : 0.000119094},
"AAC 500 kcmil 19": {radius : 0.0102997, GMR : 0.00780288, Rdc : 0.000113517},
"AAC 556.5 kcmil 19": {radius : 0.0108712, GMR : 0.0082296, Rdc : 0.000102034},
"AAC 556.5 kcmil 37": {radius : 0.0108966, GMR : 0.008382, Rdc : 0.000102034},
"AAC 600 kcmil 37": {radius : 0.0113157, GMR : 0.0086868, Rdc : 9.44882E-05},
"AAC 636 kcmil 37": {radius : 0.0116586, GMR : 0.00896112, Rdc : 8.92388E-05},
"AAC 650 kcmil 37": {radius : 0.0117856, GMR : 0.00905256, Rdc : 8.72703E-05},
"AAC 700 kcmil 37": {radius : 0.0122301, GMR : 0.00938784, Rdc : 8.10367E-05},
"AAC 715.5 kcmil 37": {radius : 0.0123698, GMR : 0.00950976, Rdc : 7.93963E-05},
"AAC 715.5 kcmil 61": {radius : 0.0123825, GMR : 0.00957072, Rdc : 7.93963E-05},
"AAC 750 kcmil 37": {radius : 0.0126619, GMR : 0.00972312, Rdc : 7.54593E-05},
"AAC 795 kcmil 37": {radius : 0.0130302, GMR : 0.00999744, Rdc : 7.11942E-05},
"AAC 795 kcmil 61": {radius : 0.0130556, GMR : 0.01008888, Rdc : 7.11942E-05},
"AAC 800 kcmil 37": {radius : 0.0130683, GMR : 0.01002792, Rdc : 7.08661E-05},
"AAC 874.5 kcmil 61": {radius : 0.0136779, GMR : 0.01048512, Rdc : 6.49606E-05},
"AAC 874.5 kcmil 61": {radius : 0.0136906, GMR : 0.01057656, Rdc : 6.49606E-05},
"AAC 900 kcmil 37": {radius : 0.0138684, GMR : 0.01063752, Rdc : 6.29921E-05},
"AAC 954 kcmil 37": {radius : 0.0142748, GMR : 0.0109728, Rdc : 5.93832E-05},
"AAC 954 kcmil 61": {radius : 0.0143002, GMR : 0.01103376, Rdc : 5.93832E-05},
"AAC 1000 kcmil 37": {radius : 0.0146177, GMR : 0.01121664, Rdc : 5.67585E-05},
"ACSR #6 kcmil 6/1": {radius : 0.0025146, GMR : 0.00073152, Rdc : 0.002105971},
"ACSR #4 kcmil 6/1": {radius : 0.003175, GMR : 0.00100584, Rdc : 0.001322835},
"ACSR #4 kcmil 7/1": {radius : 0.0032639, GMR : 0.0013716, Rdc : 0.001308727},
"ACSR #2 kcmil 6/1": {radius : 0.0040132, GMR : 0.00140208, Rdc : 0.000831365},
"ACSR #2 kcmil 7/1": {radius : 0.0041275, GMR : 0.0018288, Rdc : 0.000822179},
"ACSR #1 kcmil 6/1": {radius : 0.0045085, GMR : 0.00170688, Rdc : 0.000659777},
"ACSR 1/0 kcmil 6/1": {radius : 0.0050546, GMR : 0.00216408, Rdc : 0.000522638},
"ACSR 2/0 kcmil 6/1": {radius : 0.0056769, GMR : 0.00234696, Rdc : 0.000415026},
"ACSR 3/0 kcmil 6/1": {radius : 0.0063754, GMR : 0.0027432, Rdc : 0.000329068},
"ACSR 4/0 kcmil 6/1": {radius : 0.0071501, GMR : 0.0032004, Rdc : 0.000260827},
"ACSR 266.8 kcmil 18/1": {radius : 0.0077343, GMR : 0.00600456, Rdc : 0.000211286},
"ACSR 266.8 kcmil 26/7": {radius : 0.0081534, GMR : 0.00661416, Rdc : 0.00020899},
"ACSR 336.4 kcmil 18/1": {radius : 0.0086868, GMR : 0.00673608, Rdc : 0.000167323},
"ACSR 336.4 kcmil 26/7": {radius : 0.0091567, GMR : 0.00743712, Rdc : 0.000166011},
"ACSR 336.4 kcmil 30/7": {radius : 0.0094107, GMR : 0.0077724, Rdc : 0.000164698},
"ACSR 397.5 kcmil 18/1": {radius : 0.0094361, GMR : 0.0073152, Rdc : 0.000141732},
"ACSR 397.5 kcmil 26/7": {radius : 0.0099441, GMR : 0.0080772, Rdc : 0.00014042},
"ACSR 397.5 kcmil 30/7": {radius : 0.0102362, GMR : 0.00844296, Rdc : 0.000139436},
"ACSR 477 kcmil 18/1": {radius : 0.0103378, GMR : 0.00801624, Rdc : 0.00011811},
"ACSR 477 kcmil 24/7": {radius : 0.0107442, GMR : 0.00862584, Rdc : 0.000117454},
"ACSR 477 kcmil 26/7": {radius : 0.0108966, GMR : 0.0088392, Rdc : 0.000117126},
"ACSR 477 kcmil 30/7": {radius : 0.0112141, GMR : 0.0926592, Rdc : 0.000116142},
"ACSR 556.5 kcmil 18/1": {radius : 0.0111633, GMR : 0.00865632, Rdc : 0.000101378},
"ACSR 556.5 kcmil 24/7": {radius : 0.0116078, GMR : 0.00932688, Rdc : 0.000100722},
"ACSR 556.5 kcmil 26/7": {radius : 0.0117729, GMR : 0.00954024, Rdc : 0.000100066},
"ACSR 556.5 kcmil 30/7": {radius : 0.0121031, GMR : 0.00999744, Rdc : 9.84252E-05},
"ACSR 605 kcmil 24/7": {radius : 0.0121031, GMR : 0.00972312, Rdc : 9.25197E-05},
"ACSR 636 kcmil 36/1": {radius : 0.011811, GMR : 0.009144, Rdc : 8.75984E-05},
"ACSR 636 kcmil 18/1": {radius : 0.011938, GMR : 0.00917448, Rdc : 8.82546E-05},
"ACSR 636 kcmil 24/7": {radius : 0.0124079, GMR : 0.00996696, Rdc : 8.79265E-05},
"ACSR 636 kcmil 26/7": {radius : 0.012573, GMR : 0.0102108, Rdc : 8.75984E-05},
"ACSR 636 kcmil 30/19": {radius : 0.0129413, GMR : 0.01069848, Rdc : 8.72703E-05},
"ACSR 666.6 kcmil 24/7": {radius : 0.0127, GMR : 0.0102108, Rdc : 8.39895E-05},
"ACSR 715.5 kcmil 26/7": {radius : 0.0133477, GMR : 0.0108204, Rdc : 7.8084E-05},
"ACSR 715.5 kcmil 30/19": {radius : 0.0137287, GMR : 0.01133856, Rdc : 7.74278E-05},
"ACSR 795 kcmil 36/1": {radius : 0.013208, GMR : 0.0102108, Rdc : 7.11942E-05},
"ACSR 795 kcmil 45/7": {radius : 0.0135001, GMR : 0.01072896, Rdc : 7.08661E-05},
"ACSR 795 kcmil 24/7": {radius : 0.0138684, GMR : 0.01100328, Rdc : 7.05381E-05},
"ACSR 795 kcmil 54/7": {radius : 0.0138811, GMR : 0.01121664, Rdc : 7.05381E-05},
"ACSR 795 kcmil 26/7": {radius : 0.0140716, GMR : 0.01143, Rdc : 7.021E-05},
"ACSR 795 kcmil 30/19": {radius : 0.014478, GMR : 0.01194816, Rdc : 6.98819E-05},
"ACSR 900 kcmil 45/7": {radius : 0.0143637, GMR : 0.01139952, Rdc : 6.2664E-05},
"ACSR 900 kcmil 54/7": {radius : 0.0147574, GMR : 0.01194816, Rdc : 6.2336E-05},
"ACSR 954 kcmil 20/7": {radius : 0.0147955, GMR : 0.01152144, Rdc : 5.90551E-05},
"ACSR 954 kcmil 24/7": {radius : 0.0151892, GMR : 0.01207008, Rdc : 5.8727E-05},
"ACSR 954 kcmil 48/7": {radius : 0.0149225, GMR : 0.01191768, Rdc : 5.90551E-05},
"ACSR 954 kcmil 45/7": {radius : 0.0147955, GMR : 0.0117348, Rdc : 5.90551E-05},
"ACSR 954 kcmil 54/7": {radius : 0.0151892, GMR : 0.01231392, Rdc : 5.8727E-05},
"ACSR 1033.5 kcmil 45/7": {radius : 0.0154051, GMR : 0.01222248, Rdc : 5.479E-05},
"Cu #6 3": {radius: 0.0025527, GMR: 0.001731264, Rdc: 0.00137336},
"Cu #6 1": {radius: 0.0020574, GMR: 0.001603248, Rdc: 0.001354659},
"Cu #5 3": {radius: 0.0028702, GMR: 0.001944624, Rdc: 0.00108727},
"Cu #5 1": {radius: 0.00231013, GMR: 0.00179832, Rdc: 0.001076772},
"Cu #4 3": {radius: 0.0032258, GMR: 0.002185416, Rdc: 0.000862533},
"Cu #4 1": {radius: 0.0025908, GMR: 0.002020824, Rdc: 0.000853675},
"Cu #3 7": {radius: 0.003302, GMR: 0.002398776, Rdc: 0.000690945},
"Cu #3 3": {radius: 0.0036195, GMR: 0.00245364, Rdc: 0.000684055},
"Cu #3 1": {radius: 0.0029083, GMR: 0.00227076, Rdc: 0.000677165},
"Cu #2 7": {radius: 0.0037084, GMR: 0.002691384, Rdc: 0.000547572},
"Cu #2 3": {radius: 0.004064, GMR: 0.002752344, Rdc: 0.000542323},
"Cu #2 1": {radius: 0.0032766, GMR: 0.002548128, Rdc: 0.000536745},
"Cu #1 3": {radius: 0.004572, GMR: 0.003096768, Rdc: 0.000430118},
"Cu #1 7": {radius: 0.0041656, GMR: 0.003023616, Rdc: 0.000434383},
"Cu 1/0 7": {radius: 0.0046736, GMR: 0.003392424, Rdc: 0.000344816},
"Cu 2/0 7": {radius: 0.0052578, GMR: 0.003816096, Rdc: 0.000273294},
"Cu 3/0 12": {radius: 0.0062484, GMR: 0.004751832, Rdc: 0.000216864},
"Cu 3/0 7": {radius: 0.0058928, GMR: 0.004279392, Rdc: 0.000216864},
"Cu 4/0 19": {radius: 0.0067056, GMR: 0.005084064, Rdc: 0.000171588},
"Cu 4/0 12": {radius: 0.0070104, GMR: 0.005334, Rdc: 0.000171588},
"Cu 4/0 7": {radius: 0.0066294, GMR: 0.004812792, Rdc: 0.000171588},
"Cu 250 kcmil 19": {radius: 0.0072898, GMR: 0.005526024, Rdc: 0.000145341},
"Cu 250 kcmil 12": {radius: 0.00762, GMR: 0.005797296, Rdc: 0.000145341},
"Cu 300 kcmil 19": {radius: 0.0079883, GMR: 0.006056376, Rdc: 0.000121063},
"Cu 300 kcmil 12": {radius: 0.0083439, GMR: 0.00633984, Rdc: 0.000121063},
"Cu 350 kcmil 19": {radius: 0.0086233, GMR: 0.00652272, Rdc: 0.000103675},
"Cu 350 kcmil 12": {radius: 0.009017, GMR: 0.006858, Rdc: 0.000103675},
"Cu 400 kcmil 19": {radius: 0.0092202, GMR: 0.00697992, Rdc: 9.08793E-05},
"Cu 450 kcmil 19": {radius: 0.009779, GMR: 0.00740664, Rdc: 8.07087E-05},
"Cu 500 kcmil 37": {radius: 0.0103378, GMR: 0.0079248, Rdc: 7.28346E-05},
"Cu 500 kcmil 19": {radius: 0.0102997, GMR: 0.00780288, Rdc: 7.28346E-05},
"Cu 600 kcmil 37": {radius: 0.0113157, GMR: 0.0086868, Rdc: 6.06955E-05},
"Cu 700 kcmil 37": {radius: 0.0122301, GMR: 0.00938784, Rdc: 5.18373E-05},
"Cu 750 kcmil 37": {radius: 0.0126619, GMR: 0.00972312, Rdc: 4.85564E-05},
"Cu 800 kcmil 37": {radius: 0.0130683, GMR: 0.01002792, Rdc: 4.52756E-05},
"Cu 900 kcmil 37": {radius: 0.0138684, GMR: 0.01063752, Rdc: 4.03543E-05},
"Cu 1000 kcmil 37": {radius: 0.0146177, GMR: 0.01121664, Rdc: 3.64173E-05},
}
var cabletbl = {
"TS 1/0": {radius: 0.368/2*0.0254, GMR: 0.13320*0.0254, Rdc: 0.97/1.02/1609.34, epsR: 2.3, insLayer: 0.220*0.0254, diaIns: 0.82*0.0254, diaCable: 1.06*0.0254, diaShield: 0.88*0.0254, tapeLayer: 0.005*0.0254, tapeLap: 20},
"CN 1/0Al": {radius: 0.368/2*0.0254, GMR: 0.13320*0.0254, Rdc: 0.958/1.02/1609.34, epsR: 2.3, insLayer: 0.345*0.0254, diaIns: 1.0625*0.0254, diaCable: 1.29*0.0254, k: 6, diaStrand: 0.0641*0.0254, GMRstrand: 0.02496*0.0254, Rstrand: 14.8722/1609.34},
"CN 250": {radius: 0.567/2*0.0254, GMR: 0.2052*0.0254, Rdc: 0.41/1.02/1609.34, epsR: 2.3, insLayer: 0.220*0.0254, diaIns: 1.06*0.0254, diaCable: 1.26*0.0254, k: 13, diaStrand: 0.0641*0.0254, GMRstrand: 0.02496*0.0254, Rstrand: 14.8722/1609.34},
}

function getZint(line, conductors, i) {
    if (line.earthModel == "SimpleCarson" || line.earthModel == "FullCarson")
        return c(conductors[i].Rac, twopi * line.frequency * mu0 / (8 * pi))
    // Assume round conductor
    var alpha = multiply(c(1.0, 1.0), sqrt(line.frequency * mu0 / conductors[i].Rdc))
    // TODO: add Bessel functions; "Deri" won't work without these
    var I0I1 = (abs(alpha) > 35.0) ? c(1.0, 0.0) : divide(Bessel_I0(alpha), Bessel_I1(alpha))
    return multiply(multiply(c(1.0, 1.0), I0I1), sqrt(conductors[i].Rdc * line.frequency * mu0) / 2.0)
}

function getZe(line, conductors, i, j) {
    const b1 = 1.0/(3.0 * sqrt(2.0))
    const b2 = 1.0/16.0
    const b3 = b1/3.0/5.0
    const b4 = b2/4.0/6.0
    const d2 = b2 * pi / 4.0
    const d4 = b4 * pi / 4.0
    const c2 = 1.3659315
    const c4 = c2 + 1.0/4.0 + 1.0/6.0
    var w = twopi * line.frequency
    var yi = abs(conductors[i].y)
    var yj = abs(conductors[j].y)
    if (line.earthModel == "SimpleCarson")
        return c(w * mu0 / 8.0, line.frequency * mu0 * log(658.5 * sqrt(line.rhoearth / line.frequency)) )
    if (line.earthModel == "FullCarson") {
        // notation from Tleis book Power System Modelling and Fault Analysis
        if (i == j) {
            var Dij = 2.0 * yi
            var thetaij = 0.0
        } else {
            var Dij = sqrt(sqr(yi + yj) + sqr(conductors[i].x - conductors[j].x))
            var thetaij = acos((yi + yj) / Dij)
        }
        var mij = 2.8099e-3 * Dij * sqrt(line.frequency / line.rhoearth)
        var result = c(pi/8.0 - b1*mij*cos(thetaij) + b2*sqr(mij)*(log(exp(c2)/mij)*cos(2.0*thetaij) + thetaij*sin(2.0*thetaij)) +
                         b3*mij*mij*mij*cos(3.0*thetaij) - d4*mij*mij*mij*mij*cos(4.0*thetaij),
                       0.5*log(1.85138/mij) + b1*mij*cos(thetaij) - d2*sqr(mij)*cos(2.0*thetaij) + 
                         b3*mij*mij*mij*cos(3.0*thetaij) - b4*mij*mij*mij*mij*(log(exp(c4)/mij)*cos(4.0*thetaij) + thetaij*sin(4.0*thetaij)) + 0.5*log(Dij))
        return multiply(result, w * mu0 / pi)
    }
    if (line.earthModel == "Deri") {
        if (i == j) {
            var hterm  = add(c(yi, 0.0), M.inv(sqrt(c(0.0, w * mu0 / line.rhoearth))))
            return multiply(c(0.0, w * mu0 / twopi) , log(multiply(hterm, 2.0)))
        } else {
            var hterm  = add(c(yi + yj, 0.0), multiply(M.inv(sqrt(c(0.0, w * mu0 / line.rhoearth))), 2.0))
            var xterm  = c(conductors[i].x - conductors[j].x, 0.0)
            var logArg  = sqrt(add(multiply(hterm, hterm), multiply(xterm, xterm)))
            return multiply(c(0.0, line.frequency * mu0) , log(logArg))
        }
    }
}

function kronReduction(Z, ng) {
    var n = Z.size()[0]  
    var np = n - ng
    var idxp = M.range(0, np)
    var idxn = M.range(np, n)
    // console.log("n: " + n)
    // console.log("idxp: " + f(idxp))
    // console.log("idxn: " + f(idxn))
    // console.log("IX(Z, idxp, idxp): " + IX(Z, idxp, idxp))
    // console.log("IX(Z, idxp, idxn): " + IX(Z, idxp, idxn))
    // console.log("inv(IX(Z, idxn, idxn): " + inv(IX(Z, idxn, idxn)))
    // console.log("IX(Z, idxn, idxp): " + IX(Z, idxn, idxp))
    return subtract(unsqueeze(IX(Z, idxp, idxp)),
                    multiply(unsqueeze(IX(Z, idxp, idxn)), 
                             unsqueeze(inv(IX(Z, idxn, idxn))),
                             unsqueeze(IX(Z, idxn, idxp))))
}

function Line(bus1, bus2, {conductors = [{x: 0.0, y: 10.0, name: ""}], z1 = null, z0 = null, frequency = 60.0, earthModel = "FullCarson", rhoearth = 100.0, reduce = true, Ng = 0, len = 1.0, debug = false} = {}) {
    // Note that for cables, the phase conductors are stored first followed by the concentric neutrals
    if (z1) {
        var zs = multiply(len/3, add(z0, z1, z1))
        var zm = multiply(len/3, subtract(z0, z1))
        var Yp = inv(setDiag(multiply(zm, M.ones(3, 3)), zs))
        var Yprim = combine(Yp, negate(Yp), negate(Yp), Yp)
        return new Device(Yprim, [new Bus(bus1, [0, 1, 2]), new Bus(bus2, [0, 1, 2])])
    }
    var line = {frequency: frequency, earthModel: earthModel, rhoearth: rhoearth}
    var Lfactor = c(0.0, frequency * mu0)
    var isPowerFreq = (frequency > 40.0) && (frequency < 1000.0)
    var Nconductors = conductors.length
    for (var i = 0; i < Nconductors; i++) {
        if ("name" in conductors[i]) {
            if (conductors[i].name in condtbl) {
                conductors[i] = {...condtbl[conductors[i].name], ...conductors[i]}
            } else if (conductors[i].name in cabletbl) {
                conductors[i] = {...cabletbl[conductors[i].name], ...conductors[i]}
            } else {
                console.log("error: conductor not found: " + conductors[i].name)
            }
        }
        if (!("Rac" in conductors[i])) {
            conductors[i].Rac = 1.02 * conductors[i].Rdc
        }
        if (!("capradius" in conductors[i])) {
            conductors[i].capradius = conductors[i].radius
        }
    }
    var Ncables = conductors.filter(x => "epsR" in x).length
    var N = Nconductors + Ncables
    var Z = M.zeros(N, N)
    // Self impedances
    var ki = Nconductors
    for (var i = 0; i < Nconductors; i++) {
        var Zi = getZint(line, conductors, i)
        if (isPowerFreq) { // for less than 1 kHz, use published GMR
            Zi.im = 0.0
            Zspacing = multiply(Lfactor, log( 1.0 / conductors[i].GMR ))  // use GMR
        } else {
            Zspacing = multiply(Lfactor, log( 1.0 / conductors[i].radius ))
        }
        Z = assign(Z, add(Zi, Zspacing, getZe(line, conductors, i, i)), i, i)
        if ("epsR" in conductors[i]) {    // Concentric cable
            if ("diaStrand" in conductors[i]) {    // Concentric-neutral cable
                var R = conductors[i].Rstrand / conductors[i].k
                var radius = 0.5 * (conductors[i].diaCable - conductors[i].diaStrand)
                var GMR = pow(conductors[i].GMRstrand * conductors[i].k * pow(radius, conductors[i].k - 1.0),
                                1.0 / conductors[i].k)
            }
            if ("diaShield" in conductors[i]) {    // Tape-shield cable
                var R = 0.3183 * rhoTS / (conductors[i].diaShield*conductors[i].tapeLayer*sqrt(50.0/(100.0-conductors[i].tapeLap)))
                var GMR = 0.5 * (conductors[i].diaShield - conductors[i].tapeLayer)  // per Kersting, to center of TS
            }
            var Zspacing = multiply(Lfactor, log(1.0 / GMR))
            var Zi = c(R, 0.0)
            var Z = assign(Z, add(Zi, Zspacing, getZe(line, conductors, i, i)), ki, ki)
            ki += 1
        }
    }
    debug && console.log("conductors: " + f(conductors))
    // Mutual impedances
    var ki = Nconductors
    for (var i = 0; i < Nconductors; i++) {
        for (var j = 0; j < i; j++) {
            var Dij = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y - conductors[j].y))
            var Zij = add(multiply(Lfactor, log(1.0 / Dij)), getZe(line, conductors, i, j))
            Z = assign(Z, Zij, i, j)
            Z = assign(Z, Zij, j, i)
        }
        if ("epsR" in conductors[i]) {    // Concentric cable
            var kj = Nconductors
            for (var j = 0; j < i; j++) {  // CN to other CN
                if ("epsR" in conductors[j]) {    // Concentric cable
                    var Dij = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y - conductors[j].y))
                    var Zij = add(multiply(Lfactor, log(1.0 / Dij)), getZe(line, conductors, i, j))
                    Z = assign(Z, Zij, kj, ki)
                    Z = assign(Z, Zij, ki, kj)
                    kj += 1
                }
            }
            for (var j = 0; j < Nconductors; j++) {  // CN to other CN
                if ("diaStrand" in conductors[i]) {   // Concentric neutral
                    var radius = 0.5 * (conductors[i].diaCable - conductors[i].diaStrand)
                    if (i == j) {
                        var Dij = radius
                    } else {
                        var Dij = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y - conductors[j].y))
                        Dij = pow(pow(Dij, conductors[i].k) - pow(radius, conductors[i].k),
                              1.0 / conductors[i].k);
                    }
                } else {    // Tape-shield cable
                    if (i == j) {
                        var Dij = 0.5 * (conductors[i].diaShield - conductors[i].tapeLayer)  // per Kersting, to center of TS
                    } else {    // TS to another phase or bare neutral
                        var Dij = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y - conductors[j].y))
                    }
                }
                var Zij = add(multiply(Lfactor, log(1.0 / Dij)), getZe(line, conductors, i, j))
                Z = assign(Z, Zij, ki, j)
                Z = assign(Z, Zij, j, ki)
            }
            ki += 1
        }
    }
    debug && console.log("Z before kron (ohms/km): " + f(multiply(1000,Z)))
    debug && console.log("Z before kron (ohms/mi): " + f(multiply(1609,Z)))
    if (reduce && Ncables + Ng > 0) {
        Z = kronReduction(Z, Ncables + Ng)
    }
    debug && console.log("Z after kron")
    debug && console.log(f(multiply(1000,Z)))
    var Yp = multiply(1/len, M.inv(Z))

    if (Ncables > 0) {    // Cables
        var n = reduce ? N - Ncables - Ng : N
        var Yc = M.zeros(n, n)
        var ki = Nconductors
        for (var i = 0; i < Nconductors; i++) {
            if ("epsR" in conductors[i]) {   // Concentric cable
                var Yfactor = twopi * e0 * conductors[i].epsR * (twopi * frequency) // includes frequency so C==>Y
                var radiusOut = 0.5 * conductors[i].diaIns
                var radiusIn = radiusOut - conductors[i].insLayer
                var denom = log(radiusOut / radiusIn)
                Yc = assign(Yc, c(0.0, Yfactor / denom), i, i)
                if (!reduce) {
                    Yc = assign(Yc, c(0.0, -Yfactor / denom), i, ki)
                    Yc = assign(Yc, c(0.0, -Yfactor / denom), ki, i)
                    Yc = assign(Yc, c(0.0, Yfactor / denom), ki, ki)
                }
                ki += 1
            } 
        }
    } else {     // Overhead
        var Pfactor = -1.0 / twopi / e0 / (twopi * frequency)
        var P = M.zeros(N, N)
        for (var i = 0; i < Nconductors; i++) {
            debug && console.log("i" + i + " " + conductors[i].capradius)
            P = assign(P, c(0.0, Pfactor * log(2.0 * conductors[i].y / conductors[i].capradius)), i, i)
        }
        for (var i = 0; i < Nconductors - 1; i++) {
            for (var j = i + 1; j < Nconductors; j++) {
                var Dij = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y - conductors[j].y))
                var Dijp = sqrt(sqr(conductors[i].x - conductors[j].x) + sqr(conductors[i].y + conductors[j].y))  // distance to image j
                var Pij = c(0.0, Pfactor * log(Dijp / Dij))
                P = assign(P, Pij, i, j)
                P = assign(P, Pij, j, i)
            }
        }
        if (reduce && Ng > 0) {
            P = kronReduction(P, Ng)
        }
        var Yc = multiply(len/2, M.inv(P))
    }
    debug && console.log(f(P))
    var idx = Array(Yp.size()[0]).fill().map((_, i) => i)
    debug && console.log("Yp (mhos)")
    debug && console.log(f(Yp))
    debug && console.log("Yc (mhos)")
    debug && console.log(f(Yc))
    var Yprim = combine(add(Yp, Yc), negate(Yp), negate(Yp), add(Yp, Yc))
    return new Device(Yprim, [new Bus(bus1, idx), new Bus(bus2, idx)])
}

function indexes(bus, d) {
    var result = []
    for (kb in d.nodes) {
        var b = d.nodes[kb]
        var loc = bus[b.name]
        result = result.concat(add(loc.node, b.offset))
    }
    return result
}

function solve(devices) {
    // find all buses and the maximum size of each
    var maxOffsets = {}
    for (let kd in devices) {
        var d = devices[kd]
        for (let kn in d.nodes) {
            var n = d.nodes[kn]
            var mx = M.max(n.offset)
            var i = maxOffsets[n.name]
            if (i == undefined || mx > i) {
                maxOffsets[n.name] = mx
            }
        }
    }
    // Setup buses and Y
    var bus = {}
    var idx = 0
    for (let k in maxOffsets) {
        var offset = maxOffsets[k]
        bus[k] = new Location(idx, offset)
        idx += offset + 1
    }
    var N = idx
    var Y = M.zeros(N, N)
    var I = M.zeros(N)
    // Fill in Y and I, and solve for node voltages
    for (kd in devices) {
        var d = devices[kd]
        var idxs = indexes(bus, d)
        var id = M.index(idxs,idxs)
        var Y = assign(Y, M.squeeze(add(M.subset(Y, id), d.Yprim)), idxs, idxs)
        if ("I" in d) {
            var iid = M.index(idxs)
            var I = assign(I, M.squeeze(add(M.subset(I, iid), d.I)), idxs)
        }
    }
    var V = M.lusolve(Y, I)
    return {devices:devices,bus:bus,Y:Y,I:I,V:M.squeeze(V)}
    // return Result(Y, I, V)
}

busVoltages = (r, name) => 
    IX(r.V, M.range(r.bus[name].node, r.bus[name].node + r.bus[name].offset + 1))

deviceVoltages = (r, devicename) => 
    IX(r.V, indexes(r.bus, r.devices[devicename]))

function currents(r, devicename) {
    var d = r.devices[devicename]
    return subtract(multiply(d.Yprim, deviceVoltages(r, devicename)),
                    "I" in d ? d.I : 0.0)
}

function deviceResults(r, devicename)  {
    var d = r.devices[devicename]
    var i = currents(r, devicename) 
    var v = deviceVoltages(r, devicename)
    var s = divide(M.dotMultiply(v, M.conj(i)), 1000)
    var p = M.re(s)
    var q = M.im(s)
    var ix = 0
    var res = {}
    for (kn in d.nodes) {
        var n = d.nodes[kn]
        var len = n.offset.length
        res[n.name] = {
            v: IX(v, M.range(ix, ix + len)), 
            i: IX(i, M.range(ix, ix + len)),
            p: IX(p, M.range(ix, ix + len)), 
            q: IX(q, M.range(ix, ix + len)), 
        }
        ix += len
    }
    return res
}
return {
    // high-level components
    Bus:Bus,
    Device:Device,
    ActiveDevice:ActiveDevice,
    // specific components
    CurrentSource:CurrentSource,
    Fault:Fault,
    Impedance:Impedance,
    Line:Line,
    Load:Load,
    Source:Source,
    Switch:Switch,
    Transformer:Transformer,
    // main routines
    solve:solve,
    // utilities
    busVoltages:busVoltages,
    deviceVoltages:deviceVoltages,
    currents:currents,
    deviceResults:deviceResults,
    // data
    condtbl:condtbl,
    cabletbl:cabletbl,
    // mathjs utilities
    IX:IX,
    ang:ang,
    unsqueeze:unsqueeze,
    ctostring:ctostring,
}

}();

// console.log(networkFaults.Line("a", "b", {conductors: [{name:"Cu 250kcmil 19",x:0,y:10},{name:"Cu 250kcmil 19",x:1,y:10}]}))

// l = networkFaults.Line("a", "b", 
//                        {conductors: [{name:"AAC 336.4 kcmil 19",x:-1.25,y:8.8},
//                                      {name:"AAC 336.4 kcmil 19",x:0.42,y:8.8},
//                                      {name:"AAC 336.4 kcmil 19",x:1.25,y:8.8},
//                                      {name:"AAC 336.4 kcmil 19",x:-0.42,y:8.8},
//                                     ]})
// var math = require("./math.min.js")
// console.log(math.format(l.Yprim))

// math = require("./math.min.js")

// l606 = networkFaults.Line("a", "b", 
//      {earthModel: "SimpleCarson", conductors: [{name:"CN 250", x:-0.5/3.28, y:-4/3.28},
//                    {name:"CN 250", x: 0.0/3.28, y:-4/3.28},
//                    {name:"CN 250", x: 0.5/3.28, y:-4/3.28},
//                   ]})
// console.log(math.format(l606.Yprim))

// console.log("----------------- l606a")
// l606a = networkFaults.Line("a", "b", 
//      {earthModel: "SimpleCarson", conductors: [{name:"CN 1/0Al", x:-0.5/3.28, y:-4/3.28},
//                    {name:"CN 1/0Al", x: 0.0/3.28, y:-4/3.28},
//                    {name:"CN 1/0Al", x: 0.5/3.28, y:-4/3.28},
//                   ]})

// console.log("----------------- l606b")
// l606b = networkFaults.Line("a", "b", 
//      {earthModel: "SimpleCarson", conductors: [{name:"TS 1/0", x:-0.5/3.28, y:-4/3.28},
//                    {name:"TS 1/0", x: 0.0/3.28, y:-4/3.28},
//                    {name:"TS 1/0", x: 0.5/3.28, y:-4/3.28},
//                   ]})

// l607 = networkFaults.Line("a", "b", 
//      {conductors: [{name:"TS 1/0", x: 0.0/3.28, y:-4/3.28},
//                    {               x: 0.25/3.28, y:-4/3.28, radius: 0.368/2*0.0254, GMR: 0.13356*0.0254, Rdc: 0.607/1.02/1609.34, capradius: 0.368/2*0.0254, Rac: 0.607/1609.34},
//                   ]})

// l607a = networkFaults.Line("a", "b", 
//      {conductors: [{name:"CN 1/0Al", x: 0.0/3.28, y:-4/3.28},
//                    {               x: 0.25/3.28, y:-4/3.28, radius: 0.368/2*0.0254, GMR: 0.13356*0.0254, Rdc: 0.607/1.02/1609.34, capradius: 0.368/2*0.0254, Rac: 0.607/1609.34},
//                   ]})

// l607a1 = networkFaults.Line("a", "b", 
//      {conductors: [{name:"CN 1/0Al", x: 0.0/3.28, y:-4/3.28},
//                   ]})
// console.log(math.format(l607a1 .Yprim))

// console.log("----------------- l607a1")
// l607a1 = networkFaults.Line("a", "b", 
//      {earthModel: "SimpleCarson", 
//          conductors: [{name:"CN 1/0Al", x: 0.0/3.28, y:-4/3.28},
//                   ]})

