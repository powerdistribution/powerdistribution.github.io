## Arrester Modeling with [OpenETran](http://sourceforge.net/projects/openetran/)

This example models a horizontal three-phase overhead distribution
line with a neutral. The lightning strike is to an outer phase.
Arresters are on every other pole, and the lightning strike is to a
pole without arresters. See [here](OpenETran_critI.md) for the code
with the user interface and
[OpenETran](http://sourceforge.net/projects/openetran/) model input.

The plot shows the line-to-neutral voltage on the three phases at the
pole struck by lightning.

This version also calculates the critical current to the pole.

```yaml script=scriptloader
- OpenETran.js
```

```text name=inputtemplate
4 31 30.0 1 1 0.02e-6 5.0e-6

conductor 1 10.0 -1.5 0.00715   3854.0
conductor 2 10.5  0.0 0.00715 -11097.0
conductor 3 10.0  1.5 0.00715   7243.0
conductor 4  8.0  0.0 0.00715      0.0

labelphase 0 G
labelphase 1 A
labelphase 2 B
labelphase 3 C
labelphase 4 N

ground RG 250.0 400.0e3 0.5e-6 10.0
pairs 4 0
poles all

arrester 42.4e3 36.8e3 0.28 1.0e-6 0.0
pairs 1 4 2 4 3 4
poles odd

insulator CFO 0.0 5.42434 8.4265e21
pairs 1 4 2 4 3 4
poles 16

surge -SURGE 1.0e-6 100.0e-6 0.0e-6
pairs 1 0
poles 16

meter
pairs 1 4 2 4 3 4
poles 16
```
```yaml jquery=dform
class : form
html: 
  - name: SURGE
    type: number
    step: 1.0
    bs3caption : "I, kA"
    value: 30.0
    css:
      width: 13em
  - name: CFO 
    type: number
    step: 25.0
    bs3caption : "Insulator CFO, kV"
    value: 300.0
    css:
      width: 13em
  - name: RG
    type: number
    step: 25.0
    bs3caption : "Ground resistance, ohms"
    value: 75.0
    css:
      width: 13em
```

```js
    inputdata = inputtemplate.replace("RG", RG)
    inputdata = inputdata.replace("CFO", 1000.0 * CFO)
    inputdata = inputdata.replace("SURGE", 1000.0 * SURGE)
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

```js
    // read the csv file with the simulation results
    x = $.csv.toArrays(csv, {onParseValue: $.csv.hooks.castToScalar})
    // `header` has the column names. The first is the time, and the rest
    // of the columns are the variables.
    header = x.slice(0,1)[0]
    // pick out the column to plot
    series1 = x.slice(1).map(function(x) {return [x[0]*1e6, x[1]/1000];});
    series2 = x.slice(1).map(function(x) {return [x[0]*1e6, x[2]/1000];});
    series3 = x.slice(1).map(function(x) {return [x[0]*1e6, x[3]/1000];});
    series4 = x.slice(1).map(function(x) {return [x[0]*1e6, x[4]/1000];});
    plot([series1, series2, series3]);
```


```js
    Module.FS_createDataFile("/", "overhead.dat", inputdata, true, true)
    Module["arguments"] = ["-icrit", "16", "16", "1", "overhead"]
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
[OpenETran.md](OpenETran.md) for the Markdown code for this page.
