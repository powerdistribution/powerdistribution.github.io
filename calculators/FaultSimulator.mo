model FaultSimulatorPackage

  model Source
    parameter Modelica.SIunits.Voltage kV = 138.0 "Primary-side L-L voltage, kV";
    parameter Modelica.SIunits.ApparentPower MVA = 2000.0 "Short-circuit MVA";
    parameter Real XRratio = 5.0 "X/R ratio";
    parameter Modelica.SIunits.Frequency f = 60.0 "Source frequency";
    Modelica.Electrical.QuasiStationary.MultiPhase.Interfaces.PositivePlug positiveplug1 annotation(Placement(visible = true, transformation(origin = {0, 80}, extent = {{-10, -10}, {10, 10}}, rotation = 0), iconTransformation(origin = {0, 80}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  protected
    parameter Modelica.SIunits.Resistance R = sqrt((kV ^ 2 / MVA) ^ 2 / (1 + XRratio ^ 2));
    parameter Modelica.SIunits.Resistance X = R * XRratio;
    Modelica.Electrical.QuasiStationary.SinglePhase.Basic.Ground ground1 annotation(Placement(visible = true, transformation(origin = {-60, -40}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Star star1 annotation(Placement(visible = true, transformation(origin = {-60, -10}, extent = {{-10, -10}, {10, 10}}, rotation = -90)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Sources.VoltageSource voltagesource1(f = 60.0, V = fill(kV / sqrt(3), 3)) annotation(Placement(visible = true, transformation(origin = {-60, 20}, extent = {{-10, -10}, {10, 10}}, rotation = -90)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Resistor resistor1(R_ref = fill(R, 3)) annotation(Placement(visible = true, transformation(origin = {-30, 40}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Inductor inductor1(L = fill(X / 2 / Modelica.Constants.pi / f, 3)) annotation(Placement(visible = true, transformation(origin = {10, 40}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  equation
    connect(inductor1.plug_n, positiveplug1) annotation(Line(points = {{20, 40}, {27.5466, 40}, {27.5466, 80.3443}, {0, 80.3443}, {0, 80.3443}}));
    connect(resistor1.plug_n, inductor1.plug_p) annotation(Line(points = {{-20, 40}, {-9.93544, 40.4161}, {-5.55112e-16, 40.2337}, {-5.55112e-16, 40}}));
    connect(voltagesource1.plug_p, resistor1.plug_p) annotation(Line(points = {{-60, 30}, {-59.8139, 40.2337}, {-39.9654, 40.2337}, {-40.152, 39.8177}}));
    connect(voltagesource1.plug_n, star1.plug_p) annotation(Line(points = {{-60, 10}, {-59.8139, 0.09686989999999999}, {-59.6019, 0.09686989999999999}, {-59.788, -0.3192}}));
    connect(star1.pin_n, ground1.pin) annotation(Line(points = {{-60, -20}, {-59.8139, -29.3561}, {-59.8899, -29.3561}, {-60.076, -29.7722}}));
    annotation(Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1})), experiment(StartTime = 0, StopTime = 0.1, Tolerance = 0.0001, Interval = 0.05), Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2}), graphics = {Ellipse(origin = {1.86514, -5.30846}, extent = {{-49.2109, 49.4978}, {49.2109, -49.4978}}, endAngle = 360), Line(origin = {0, 63.2712}, points = {{0, 17.0732}, {0, -17.0732}, {0, -17.0732}}), Line(origin = {0.487805, -53.0273}, points = {{0, -3.5868}, {0, -17.0732}, {0, -17.0732}}), Line(origin = {0.430416, -70.3013}, points = {{-27.6901, 0}, {24.2468, 0}, {24.2468, 0}}), Line(origin = {-3.73027, -82.7834}, points = {{-12.0516, 1.86514}, {20.66, 1.86514}}), Line(origin = {5.6528, -92.91249999999999}, points = {{-12.0516, 1.86514}, {2.00861, 1.86514}}), Text(origin = {0.569211, -0.00311334}, extent = {{-41.32, 40.17}, {41.32, -40.17}}, textString = "~")}));
  end Source;

  model Fault
    parameter Integer faultType0 = 99 "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    Integer faultType(start = -1) "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    Modelica.Electrical.QuasiStationary.MultiPhase.Interfaces.PositivePlug plug annotation(Placement(visible = true, transformation(origin = {-15, 155}, extent = {{-15, -15}, {15, 15}}, rotation = 0), iconTransformation(origin = {-10, 160}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  equation
    when time > 0.001 then
      faultType = faultType0;
    end when;
    if faultType == 1 then
      plug.pin[1].v = Complex(0.0);
      plug.pin[2].i = Complex(0.0);
      plug.pin[3].i = Complex(0.0);
    elseif faultType == 2 then
      plug.pin[1].i = Complex(0.0);
      plug.pin[2].v = Complex(0.0);
      plug.pin[3].i = Complex(0.0);
    elseif faultType == 3 then
      plug.pin[1].i = Complex(0.0);
      plug.pin[2].i = Complex(0.0);
      plug.pin[3].v = Complex(0.0);
    elseif faultType == 4 then
      plug.pin[1].v = plug.pin[2].v;
      plug.pin[1].i = -plug.pin[2].i;
      plug.pin[3].i = Complex(0.0);
    elseif faultType == 5 then
      plug.pin[2].v = plug.pin[3].v;
      plug.pin[2].i = -plug.pin[3].i;
      plug.pin[1].i = Complex(0.0);
    elseif faultType == 6 then
      plug.pin[3].v = plug.pin[1].v;
      plug.pin[3].i = -plug.pin[1].i;
      plug.pin[2].i = Complex(0.0);
    elseif faultType == 7 then
      plug.pin[1].v = Complex(0.0);
      plug.pin[2].v = Complex(0.0);
      plug.pin[3].i = Complex(0.0);
    elseif faultType == 8 then
      plug.pin[1].i = Complex(0.0);
      plug.pin[2].v = Complex(0.0);
      plug.pin[3].v = Complex(0.0);
    elseif faultType == 9 then
      plug.pin[1].v = Complex(0.0);
      plug.pin[2].i = Complex(0.0);
      plug.pin[3].v = Complex(0.0);
    elseif faultType == 0 then
      plug.pin[1].v = Complex(0.0);
      plug.pin[2].v = Complex(0.0);
      plug.pin[3].v = Complex(0.0);
    else
      plug.pin[1].i = Complex(0.0);
      plug.pin[2].i = Complex(0.0);
      plug.pin[3].i = Complex(0.0);
    end if;
    // no fault
    annotation(Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1})), Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1}), graphics = {Line(origin = {-8.488659999999999, 68.01009999999999}, points = {{-1.00756, 91.6876}, {-1.00756, -70.529}}), Line(origin = {-12.6, -0.76}, points = {{-31.2343, 34.005}, {39.2947, -40.5541}}, color = {255, 0, 0}, thickness = 4), Line(origin = {-11.66, -2.35}, points = {{31.7384, 31.9899}, {-31.2343, -37.531}}, color = {255, 0, 0}, thickness = 4)}));
  end Fault;

  model Line "Three-phase distribution line model"
    extends Modelica.Electrical.QuasiStationary.MultiPhase.Interfaces.OnePort;
    parameter Modelica.SIunits.Resistance R1 = 1.0 "Positive-sequence resistance";
    parameter Modelica.SIunits.Resistance X1 = 2.0 "Positive-sequence reactance";
    parameter Modelica.SIunits.Resistance R0 = 2.0 "Zero-sequence resistance";
    parameter Modelica.SIunits.Resistance X0 = 4.0 "Zero-sequence reactance";
  protected
    parameter Modelica.SIunits.ComplexImpedance Zs = (Complex(R0, X0) + 2.0 * Complex(R1, X1)) / 3.0;
    parameter Modelica.SIunits.ComplexImpedance Zm = (Complex(R0, X0) - Complex(R1, X1)) / 3.0;
  equation
    v[1] = Zs * i[1] + Zm * i[2] + Zm * i[3];
    v[2] = Zm * i[1] + Zs * i[2] + Zm * i[3];
    v[3] = Zm * i[1] + Zm * i[2] + Zs * i[3];
    annotation(Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})), Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2}), graphics = {Line(origin = {1.17, -0.23}, points = {{-81.7757, 0}, {81.7757, 0}}, thickness = 4, color = {85, 170, 255}), Line(origin = {0.842897, 19.3027}, points = {{-81.7757, 0}, {81.7757, 0}}, thickness = 4, color = {85, 170, 255}), Line(origin = {1.21673, -20.5104}, points = {{-81.7757, 0}, {81.7757, 0}}, thickness = 4, color = {85, 170, 255})}));
  end Line;

  model Transformer "Three-phase transformer model"
    parameter Integer conn0 = 2 "Transformer connection (1=YY, 2=DY, or 3=YD)";
    Integer conn(start = 1) "Transformer connection (1=YY, 2=DY, or 3=YD)";
    parameter Modelica.SIunits.ApparentPower kVA = 20000.0 "Three-phase bank base rating, kVA";
    parameter Modelica.SIunits.Voltage kV1 = 138.0 "Primary-side rated L-L voltage, kV";
    parameter Modelica.SIunits.Voltage kV2 = 12.47 "Secondary-side rated L-L voltage, kV";
    parameter Real Zpcnt = 6.0 "Impedance, percent";
    parameter Real XRratio = 10.0 "X/R ratio";
    parameter Modelica.SIunits.Resistance Xn1 = 1e-05 "Primary-side neutral reactance, ohms";
    parameter Modelica.SIunits.Resistance Xn2 = 1e-05 "Secondary-side neutral reactance, ohms";
    parameter Modelica.SIunits.Frequency f = 60.0 "Source frequency";
    Modelica.SIunits.ComplexVoltage n1v "Primary-side neutral voltage";
    Modelica.SIunits.ComplexCurrent n1i "Primary-side neutral current";
    Modelica.SIunits.ComplexVoltage n2v "Secondary-side neutral voltage";
    Modelica.SIunits.ComplexCurrent n2i "Secondary-side neutral current";
  protected
    parameter Complex j = Complex(0.0, 1.0);
    parameter Modelica.SIunits.Resistance R = Zpcnt / 100.0 * kV2 ^ 2 / kVA * 1000.0 / sqrt(1 + XRratio ^ 2);
    parameter Modelica.SIunits.Resistance X = R * XRratio;
    Modelica.Electrical.QuasiStationary.MultiPhase.Interfaces.PositivePlug plug1 annotation(Placement(visible = true, transformation(origin = {-100, 10}, extent = {{-10, -10}, {10, 10}}, rotation = 0), iconTransformation(origin = {-100, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Interfaces.NegativePlug plug2 annotation(Placement(visible = true, transformation(origin = {100, 10}, extent = {{-10, -10}, {10, 10}}, rotation = 0), iconTransformation(origin = {100, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    parameter Real ratio = kV1 / kV2 "Turns ratio";
  equation
    Connections.branch(plug1.reference, plug2.reference);
    plug1.reference.gamma = plug2.reference.gamma;
    Connections.potentialRoot(plug1.reference);
    Connections.potentialRoot(plug2.reference);
    when time > 0.001 then
      conn = conn0;
    end when;
    if conn == 1 then
      for i in 1:3 loop
        plug1.pin[i].v - n1v = ratio * (plug2.pin[i].v - n2v - Complex(R, X) * plug2.pin[i].i);
        plug1.pin[i].i = -plug2.pin[i].i / ratio;
      end for;
      n1i = plug1.pin[1].i + plug1.pin[2].i + plug1.pin[3].i;
      n1v = n1i * Xn1 * j;
      n2i = plug2.pin[1].i + plug2.pin[2].i + plug2.pin[3].i;
      n2v = n2i * Xn2 * j;
    elseif conn == 2 then
      plug1.pin[2].v - plug1.pin[1].v = ratio * sqrt(3) * (plug2.pin[2].v - n2v - Complex(R, X) * plug2.pin[2].i);
      plug1.pin[3].v - plug1.pin[2].v = ratio * sqrt(3) * (plug2.pin[3].v - n2v - Complex(R, X) * plug2.pin[3].i);
      plug1.pin[1].v - plug1.pin[3].v = ratio * sqrt(3) * (plug2.pin[1].v - n2v - Complex(R, X) * plug2.pin[1].i);
      plug1.pin[1].i = -(plug2.pin[1].i - plug2.pin[2].i) / ratio / sqrt(3);
      plug1.pin[2].i = -(plug2.pin[2].i - plug2.pin[3].i) / ratio / sqrt(3);
      plug1.pin[3].i = -(plug2.pin[3].i - plug2.pin[1].i) / ratio / sqrt(3);
      n1i = Complex(0.0);
      n1v = Complex(0.0);
      n2i = plug2.pin[1].i + plug2.pin[2].i + plug2.pin[3].i;
      n2v = n2i * Xn2 * j;
    else
      plug1.pin[3].v - n1v - Complex(R, X) * ratio ^ 2 * plug1.pin[3].i = ratio / sqrt(3) * (plug2.pin[3].v - plug2.pin[1].v);
      plug1.pin[1].v - n1v - Complex(R, X) * ratio ^ 2 * plug1.pin[1].i = ratio / sqrt(3) * (plug2.pin[1].v - plug2.pin[2].v);
      plug1.pin[2].v - n1v - Complex(R, X) * ratio ^ 2 * plug1.pin[2].i = ratio / sqrt(3) * (plug2.pin[2].v - plug2.pin[3].v);
      plug2.pin[1].i = -(plug1.pin[1].i - plug1.pin[3].i) * ratio / sqrt(3);
      plug2.pin[2].i = -(plug1.pin[2].i - plug1.pin[1].i) * ratio / sqrt(3);
      plug2.pin[3].i = -(plug1.pin[3].i - plug1.pin[2].i) * ratio / sqrt(3);
      n1i = plug1.pin[1].i + plug1.pin[2].i + plug1.pin[3].i;
      n1v = n1i * Xn1 * j;
      n2i = Complex(0.0);
      n2v = Complex(0.0);
    end if;
    annotation(Diagram(coordinateSystem(extent = {{-200, -200}, {200, 200}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1})), Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1}), graphics = {Ellipse(origin = {-23.93, -0.5}, lineColor = {85, 170, 255}, extent = {{-44.84, 45.84}, {44.84, -45.84}}, endAngle = 360), Ellipse(origin = {24.11, -2.34}, lineColor = {85, 170, 255}, extent = {{-44.84, 45.84}, {44.84, -45.84}}, endAngle = 360), Line(origin = {-84.8866, -0.125945}, points = {{-14.8615, -0.125945}, {14.8615, -0.125945}, {14.8615, 0.125945}}), Line(origin = {85.063, -0.70529}, points = {{-14.8615, -0.125945}, {14.8615, -0.125945}, {14.8615, 0.125945}})}));
  end Transformer;

  model FaultSimulator "Fault simulator with two transformers"
    parameter Modelica.SIunits.Voltage kV1 = 138.0 "Transmission rated L-L voltage, kV";
    parameter Modelica.SIunits.Voltage kV2 = 12.47 "Primary rated L-L voltage, kV";
    parameter Modelica.SIunits.Voltage kV3 = 0.48 "Secondary rated L-L voltage, kV";
    //  parameter Integer faultType1 = 3 "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    //  parameter Integer faultType2 = 3 "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    //  parameter Integer faultType3 = 3 "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    //  parameter Integer faultType4 = 3 "Fault Type (A, B, C, AB, BC, CA, ABg, BCg, CAg, ABC)";
    parameter Integer conn1 = 2 "Transformer connection (1=YY, 2=DY, or 3=YD)";
    parameter Integer conn2 = 2 "Transformer connection (1=YY, 2=DY, or 3=YD)";
    FaultSimulatorPackage.Transformer transformer1(conn0 = conn1, kV1 = kV1, kV2 = kV2, Zpcnt = 11, kVA = 20000.0) annotation(Placement(visible = true, transformation(origin = {-40, 20}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Transformer transformer2(conn0 = conn2, kV1 = kV2, kV2 = kV3, Zpcnt = 7, kVA = 1000.0) annotation(Placement(visible = true, transformation(origin = {60, 20}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Source source1(kV = kV1) annotation(Placement(visible = true, transformation(origin = {-80, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Fault fault1 annotation(Placement(visible = true, transformation(origin = {-60, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Fault fault2 annotation(Placement(visible = true, transformation(origin = {-20, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Fault fault3 annotation(Placement(visible = true, transformation(origin = {40, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Fault fault4 annotation(Placement(visible = true, transformation(origin = {90, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    FaultSimulatorPackage.Line line1 annotation(Placement(visible = true, transformation(origin = {10, 20}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Capacitor capacitor2(C = fill(1e-08, 3));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Star star2;
    Modelica.Electrical.QuasiStationary.SinglePhase.Basic.Ground ground1;
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Capacitor capacitor3(C = fill(1e-08, 3));
    Modelica.Electrical.QuasiStationary.MultiPhase.Basic.Star star3;
    Complex v1a = fault1.plug.pin[1].v / kV1 * sqrt(3);
    Complex v1b = fault1.plug.pin[2].v / kV1 * sqrt(3);
    Complex v1c = fault1.plug.pin[3].v / kV1 * sqrt(3);
    Complex v2a = fault2.plug.pin[1].v / kV2 * sqrt(3);
    Complex v2b = fault2.plug.pin[2].v / kV2 * sqrt(3);
    Complex v2c = fault2.plug.pin[3].v / kV2 * sqrt(3);
    Complex v3a = fault3.plug.pin[1].v / kV2 * sqrt(3);
    Complex v3b = fault3.plug.pin[2].v / kV2 * sqrt(3);
    Complex v3c = fault3.plug.pin[3].v / kV2 * sqrt(3);
    Complex v4a = fault4.plug.pin[1].v / kV3 * sqrt(3);
    Complex v4b = fault4.plug.pin[2].v / kV3 * sqrt(3);
    Complex v4c = fault4.plug.pin[3].v / kV3 * sqrt(3);
    Complex i1a = -source1.voltagesource1.i[1];
    Complex i1b = -source1.voltagesource1.i[2];
    Complex i1c = -source1.voltagesource1.i[3];
    Complex i2a =  transformer1.plug1.pin[1].i;
    Complex i2b =  transformer1.plug1.pin[2].i;
    Complex i2c =  transformer1.plug1.pin[3].i;
    Complex i3a = -transformer1.plug2.pin[1].i;
    Complex i3b = -transformer1.plug2.pin[2].i;
    Complex i3c = -transformer1.plug2.pin[3].i;
    Complex i4a =  transformer2.plug1.pin[1].i;
    Complex i4b =  transformer2.plug1.pin[2].i;
    Complex i4c =  transformer2.plug1.pin[3].i;
    Complex i5a = -transformer2.plug2.pin[1].i;
    Complex i5b = -transformer2.plug2.pin[2].i;
    Complex i5c = -transformer2.plug2.pin[3].i;
    Complex in1 =  transformer1.n1i;
    Complex in2 = -transformer1.n2i;
    Complex in3 =  transformer2.n1i;
    Complex in4 = -transformer2.n2i;
  equation
    connect(fault2.plug, capacitor2.plug_p);
    connect(capacitor2.plug_n, star2.plug_p);
    connect(star2.pin_n, ground1.pin);
    connect(fault4.plug, capacitor3.plug_p);
    connect(capacitor3.plug_n, star3.plug_p);
    connect(star3.pin_n, ground1.pin);
    connect(line1.plug_n, transformer2.plug1) annotation(Line(points = {{20, 20}, {50.2336, 20}, {50.2336, 19.8598}, {50.2336, 19.8598}}));
    connect(line1.plug_p, fault2.plug) annotation(Line(points = {{-1.49012e-07, 20}, {-21.2617, 20}, {-21.2617, 15.6542}, {-21.2617, 15.6542}}));
    connect(transformer1.plug1, source1.positiveplug1) annotation(Line(points = {{-50, 20}, {-79.7704, 20}, {-79.7704, 8.03443}, {-79.7704, 8.03443}}));
    connect(transformer1.plug1, fault1.plug) annotation(Line(points = {{-50, 20}, {-60.8321, 20}, {-60.8321, 15.7819}, {-60.8321, 15.7819}}));
    connect(transformer1.plug2, fault2.plug) annotation(Line(points = {{-30, 20}, {-21.2339, 20}, {-21.2339, 16.0689}, {-21.2339, 16.0689}}));
    connect(transformer2.plug1, fault3.plug) annotation(Line(points = {{50, 20}, {39.3113, 20}, {39.3113, 15.7819}, {39.3113, 15.7819}}));
    connect(transformer2.plug2, fault4.plug) annotation(Line(points = {{70, 20}, {89.5265, 20}, {89.5265, 15.208}, {89.5265, 15.208}}));
    annotation(Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})), Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {1, 1})), experiment(StartTime = 0, StopTime = 0.1, Tolerance = 0.0001, Interval = 0.05));
  end FaultSimulator;

end FaultSimulatorPackage;
