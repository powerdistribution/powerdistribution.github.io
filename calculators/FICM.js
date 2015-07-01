// Copyright © 2015 Electric Power Research Institute, Inc. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without 
//  modification, are permitted provided that the following conditions are met: 
//  * Redistributions of source code must retain the above copyright notice, 
//    this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// * Neither the name of the EPRI nor the names of its contributors may be 
//    used to endorse or promote products derived from this software without 
//    specific prior written permission.
//
//   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
//   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
//   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR 
//   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL EPRI BE LIABLE FOR ANY DIRECT, 
//   INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
//   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
//   SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
//   CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
//   LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY 
//   OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF 
//   SUCH DAMAGE.



function tanh (arg) {
  // http://kevin.vanzonneveld.net
  // + original by: Onno Marsman
  // * example 1: tanh(5.4251848798444815);
  // * returns 1: 0.9999612058841574
  return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}

function ficm(flti, fltt, h0, y0, x1, y1, wc, area, ret) {
// flti = fault current, A
// fltt = fault duration, cycles
// h0 = span length, ft
// y0 = conductor sag, ft
// x1 = horizontal position of conductor 2 relative to conductor 1, ft
// y1 = vertical position of conductor 2 relative to conductor 1, ft
// wc = conductor weight, lbs per ft?
// area = conductor cross sectional area, in^2
// ret = type of return. 0 = normal, 1 = return arrays with [t, x0, y0, x1, y1, d]
    var fmr = new Float64Array(3), fms = new Float64Array(3), x = new Float64Array(3), y = new Float64Array(3), xt = new Float64Array(3), yt = new Float64Array(3), ys = new Float64Array(3), tht = new Float64Array(3), acr = new Float64Array(3), vr = new Float64Array(3);
    var acs = new Float64Array(3), vs = new Float64Array(3), x23 = new Float64Array(3), y23 = new Float64Array(3), sang = new Float64Array(3), tens = new Float64Array(3), fstr = new Float64Array(3), fgs = new Float64Array(3), yin = new Float64Array(3);
    var asol = new Float64Array(3), arol = new Float64Array(3), vsol = new Float64Array(3), vrol = new Float64Array(3), fr = new Float64Array(3), fs = new Float64Array(3), sten = new Float64Array(3), fmgx = new Float64Array(3), fmgy = new Float64Array(3);
    var yr = new Float64Array(3), ysol = new Float64Array(3), omega = new Float64Array(3), fgr = new Float64Array(3);
    var frx = new Float64Array(3), fry = new Float64Array(3), dels = new Float64Array(3), tenst = new Float64Array(3), delal = new Float64Array(3), alp = new Float64Array(3), fstrt = new Float64Array(3), dely = new Float64Array(3);
    var xtsv = new Float64Array(3), ytsv = new Float64Array(3);
	var hdelt, delt, time, f0, su, tstop, d12, d12m;
	var d1223, cal12, cbt12, fm12, arg, hyratio, dw, tcrit, swmax, swmin;
	var d12sv, flttadd;
	var i, nphs, npts, n, ncond, cc, faif, nconfig;

    // console.log(flti, fltt, h0, y0, x1, y1, wc, area);

    nphs = 2;     //  number of phases
    // ncond = 5;    //1-1/0 al  2-246.9 al  3-4/0 Cu  4-336 al  5-477 al  6-556.5 ACSR
    // nconfig = 1;  // 1= 8 ft crossarm; 2= 10 ft crossarm; 3= armless; 4=36" spacing; 5= 24" V spacing
    // h0 = 300.;   //  horizontal span
    // flti = 5000.;  // fault current
    // fltt = 10.;    // cycles of fault
    flttadd = 0.1;  // cycles increment
    ela = 10.e6;// modulus of elasticity in psi *10e6
    npts = 5400;  // points of output
    delt = 0.001;  // timestep
    hdelt = 0.5*delt;
    tstop = npts*delt;   // # pts * timestep
    swmax = 0.33;   // feet max
    swmin = 0.0;
    faif = 0;
    tcnt = fltt / 60.;
    utopi = 2./(1.e7);
    fcon = utopi*flti*flti / 4.448;
    fc12 = fcon;
    
    if (ret == 1) 
        var res = [];

    tmass = wc / 32.17;
    x[0] = 0.;   // center of rotation coordinates x, y for cond
    y[0] = y0;
    x[1] = x1;
    y[1] = y0 + y1;

    time = 0.;
    d12m = 99999.;
    d12sv = 0.;
    tcrit = 0.;

    for (var i = 0; i<nphs; i++) {
        yin[i] = y[i];
	    ys[i] = y0;
    }

    ea = ela*area;
    hyratio = h0/y0;
    f0 = .5*wc*h0*Math.sqrt(1. + hyratio*hyratio/16.);
    arg = wc*h0 /(2.* f0);
    su = f0/wc*(Math.exp(arg) - Math.exp(-arg));
    dw = wc*h0/f0;
    y0 = wc*h0*h0 /(8.*f0) + Math.pow(dw, 3.) * h0/384.;    // was y0t

    for (var n = 0; n<npts; n++) {
        //c - - - - - start iterative process
        for (var i = 0; i<nphs; i++)
            {
            //c - - - - - locate coordinates of low point of sag
                xt[i] = x[i] + ys[i]*Math.sin(tht[i]);
                yt[i] = y[i] - ys[i]*Math.cos(tht[i]);
                  //        printf(" x, y at low sag   %5.2f,  %5.2f\n", xt[i], yt[i]);
            //c - - - - - locate coordinates of 2 / 3 point of sag
                x23[i] = x[i] + 2./3.*ys[i]*Math.sin(tht[i]);          
                y23[i] = y[i] - 2./3.*ys[i]*Math.cos(tht[i]);
                xtsv[i] = xt[i];
                ytsv[i] = yt[i];
                }

            //c - - - - - locate distance between low points and 2 / 3 pts
            d12 = Math.sqrt((xt[1]-xt[0])*(xt[1]-xt[0]) + (yt[1]-yt[0])*(yt[1]-yt[0]));
            if (d12 < d12m)
                {
                d12m = d12;
                if (d12 < swmax & tcrit < 0.0001) tcrit = time;
                }
                d12sv = d12;

         if (time <= tcnt)   // no magnetic forces after # of cycles
            {
            d1223 = Math.sqrt((x23[1]-x23[0])*(x23[1]-x23[0]) + (y23[1]-y23[0])*(y23[1]-y23[0]));
            //c - - - - - determine direction cosines between dxx23 and x&y axes
            cal12 = (x23[1] - x23[0])/d1223;
            cbt12 = (y23[1] - y23[0])/d1223;
            //c - - - - - determine magnetic force
            fm12 = fc12/d1223;
            fmgx[0] = -fm12*cal12;
            fmgy[0] = -fm12*cbt12;
            fmgx[1] = fm12*cal12;
            fmgy[1] = fm12*cbt12;
            //c - - - - - resolve magnetic force into components for each conductor
            //c - - - - - s = stretch,  r = rotate
            for (i = 0; i<nphs; i++)
                {
                fmr[i] =  fmgx[i]*Math.cos(tht[i]) + fmgy[i]*Math.sin(tht[i]);
                fms[i] = -fmgy[i]*Math.cos(tht[i]) + fmgx[i]*Math.sin(tht[i]);
                }
        }

        if (time > tcnt)
          {
            for (i = 0; i<nphs; i++)
                {
                fmr[i] = 0.;
                fms[i] = 0.;
                }
          }
        //c - - - - - resolve gravity force into components for each conductor
        for (var i = 0; i<nphs; i++)
            {
            fgr[i] = wc*Math.sin(tht[i]);
            fgs[i] = wc*Math.cos(tht[i]);
            }
        //c - - - - - compute force for each conductor due to stretch
        for (var i = 0; i<nphs; i++)
            {
            sten[i] = 8./(3.*h0)*(ys[i]-y0)*(ys[i]+y0);
            tens[i] = f0 + ea*sten[i]/su;
            sang[i] = tanh(4.*ys[i]/h0);
            fstr[i] = 2.*tens[i]*sang[i]/su;
            }
        //c - - - - - compute net accelerating force for each conductor
        for (var i = 0; i<nphs; i++)
            {
            fr[i] = fmr[i] - fgr[i];
            fs[i] = fms[i] + fgs[i] - fstr[i];
            }
        //c - - - - - compute velocity and new position
        for (var i = 0; i<nphs; i++)
            {
            asol[i] = acs[i];
            arol[i] = acr[i];
            vsol[i] = vs[i];
            vrol[i] = vr[i];
            ysol[i] = ys[i];
            acr[i] = fr[i]/tmass;
            acs[i] = fs[i]/tmass;
            vs[i] = vsol[i] + hdelt*(asol[i] + acs[i]);
            vr[i] = vrol[i] + hdelt*(arol[i] + acr[i]);
            omega[i] = 1.5*vr[i]/ys[i];
            yr[i] = hdelt*(vrol[i] + vr[i]);
            tht[i] = tht[i] + 1.5*yr[i]/ys[i];
            ys[i] = ysol[i] + hdelt*(vsol[i] + vs[i]);
            }

        //c - - - - - increment time and go to start of loop,  if needed
        faif = 1000 * time;
        if (ret == 1 && (n % 10) == 0) {
            res.push([time, xtsv[0], ytsv[0], xtsv[1], ytsv[1], d12sv]);
        }
        // console.log(time, xtsv[0], ytsv[0], xtsv[1], ytsv[1],d12sv);
        //if ((n % 100) == 0) {
        //    console.log(" minimum distance= %5.3f at time= %5.3f, d12m = %5.3f at time= %5.3f", d12, time, d12m, tcrit);
        //}
        time = time + delt;

        if (time > tstop) break;

    } // n < npts
    
    // console.log(" fault amps= " + flti + "    cycles= " + fltt + "   distance= " + d12m + "   time= " + tcrit);
    
    if (ret == 1) return res;

    if((d12m < swmax)&&(d12m > swmin))
    {
      return tcrit;
    }
    return 0.0;

}

//ficm(flti, fltt, h0, y0, x1, y1, wc, area)
// flti = fault current, A
// fltt = fault duration, cycles
// h0 = span length, ft
// y0 = conductor sag, ft
// x1 = horizontal position of conductor 2 relative to conductor 1, ft
// y1 = vertical position of conductor 2 relative to conductor 1, ft
// wc = conductor weight, lbs per ft?
// area = conductor cross sectional area, in^2

// // example for 477 Al, 300' span, 69-in sag, 44-in phase separation
// ficm(5000.0, 10.0, 300.0, 69.0/12.0, 44.0/12.0, 0.0, 0.4478, 0.3744)
// ficm(5000.0, 9.0, 300.0, 69.0/12.0, 44.0/12.0, 0.0, 0.4478, 0.3744)

// // example for 556 ACSR, 300' span, 69-in sag, 24-in phase separation
// ficm(2400.0, 58.0, 300.0, 52.0/12.0, 24.0/12.0, 0.0, 0.766, 0.5083)
