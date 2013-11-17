package FerroModule
  model Breakout3 "for breaking out a 3-phase Multiphase plug to its pins"
    Modelica.Electrical.Analog.Interfaces.NegativePin pin_n annotation(Placement(transformation(extent = {{10,30},{30,50}})));
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug plug_p(m = 3) annotation(Placement(transformation(extent = {{-50,30},{-30,50}})));
    Modelica.Electrical.Analog.Interfaces.NegativePin pin_n1 annotation(Placement(transformation(extent = {{10,-10},{30,10}})));
    Modelica.Electrical.Analog.Interfaces.NegativePin pin_n2 annotation(Placement(transformation(extent = {{10,-50},{30,-30}})));
  equation
    connect(pin_n,plug_p.pin[1]);
    connect(pin_n1,plug_p.pin[2]);
    connect(pin_n2,plug_p.pin[3]);
    annotation(Icon(coordinateSystem(extent = {{-100,-100},{100,100}}), graphics = {Line(points = {{-24,40},{2,40}}),Line(points = {{-20,-40},{2,-40}}),Line(points = {{-20,-40},{-40,0},{-40,20}}),Line(points = {{2,0},{-20,0},{-30,24}})}));
  end Breakout3;
  model ThreePhaseSource "A three-phase wye-connected voltage source"
    import Modelica.Math.sin;
    import Modelica.Math.cos;
    import Modelica.Constants.pi;
    parameter Modelica.SIunits.Voltage V = 12500.0 "RMS voltage, line to line";
    parameter Modelica.SIunits.Frequency freqHz = 60.0 "Frequency";
    Modelica.Electrical.Analog.Interfaces.NegativePin pin_n annotation(Placement(transformation(extent = {{-10,-50},{10,-30}}), iconTransformation(extent = {{-10,-50},{10,-30}})));
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug positivePlug annotation(Placement(transformation(extent = {{-10,70},{10,90}}), iconTransformation(extent = {{-10,70},{10,90}})));
    Breakout3 breakout3_1 annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-4,56})));
    //initial equation
    //  di_dq0 = {0,0,0};
    Modelica.Electrical.Analog.Sources.SineVoltage V3(V = V / sqrt(3 / 2), freqHz = freqHz, phase = 0) annotation(Placement(visible = true, transformation(origin = {-40.663,0.828729}, extent = {{-10,-10},{10,10}}, rotation = 270)));
    Modelica.Electrical.Analog.Sources.SineVoltage V2(V = V / sqrt(3 / 2), freqHz = freqHz, phase = -2 * pi / 3) annotation(Placement(visible = true, transformation(origin = {-0.662983,0.828729}, extent = {{-10,-10},{10,10}}, rotation = 270)));
    Modelica.Electrical.Analog.Sources.SineVoltage V1(V = V / sqrt(3 / 2), freqHz = freqHz, phase = 2 * pi / 3) annotation(Placement(visible = true, transformation(origin = {39.337,0.828729}, extent = {{-10,-10},{10,10}}, rotation = 270)));
    Modelica.Electrical.Analog.Basic.Resistor r1(R = 0.5) annotation(Placement(visible = true, transformation(origin = {-40.663,27.4033}, extent = {{-10,-10},{10,10}}, rotation = -90)));
    Modelica.Electrical.Analog.Basic.Resistor r2(R = 0.5) annotation(Placement(visible = true, transformation(origin = {-0.994475,27.9558}, extent = {{-10,-10},{10,10}}, rotation = -90)));
    Modelica.Electrical.Analog.Basic.Resistor r3(R = 0.5) annotation(Placement(visible = true, transformation(origin = {39.116,28.0663}, extent = {{-10,-10},{10,10}}, rotation = -90)));
  protected
    //  Real w = 2 * pi * freqHz;
    //  Real P[3,3] = sqrt(2 / 3) * [sin(w * time),sin(w * time + 2 * pi / 3),sin(w * time + 4 * pi / 3);cos(w * time),cos(w * time + 2 * pi / 3),cos(w * time + 4 * pi / 3);1 / sqrt(2),1 / sqrt(2),1 / sqrt(2)] "Park Transformation matrix";
    Modelica.SIunits.Current i_abc[3] = {V1.i,V2.i,V3.i};
    //  Real i_dq0[3];
    //  Real di_dq0[3] = 2 * pi * {i_dq0[2],-i_dq0[1],0} + P * der(i_abc);
  equation
    connect(r3.p,breakout3_1.pin_n) annotation(Line(points = {{39.116,38.0663},{39.116,50.1657},{0.220994,50.1657},{0.220994,53.7017},{0.220994,53.7017}}));
    connect(r2.p,breakout3_1.pin_n1) annotation(Line(points = {{-0.994475,37.9558},{-0.994475,48.6188},{-4.1989,48.6188},{-4.1989,52.8177},{-4.1989,52.8177}}));
    connect(r1.p,breakout3_1.pin_n2) annotation(Line(points = {{-40.663,37.4033},{-40.663,48.1768},{-7.9558,48.1768},{-7.9558,54.1436},{-7.9558,54.1436}}));
    connect(r3.n,V1.p) annotation(Line(points = {{39.116,18.0663},{39.116,10.1657},{39.558,10.1657},{39.558,10.1657}}));
    connect(r2.n,V2.p) annotation(Line(points = {{-0.994475,17.9558},{-0.994475,9.94475},{-0.662983,9.94475},{-0.662983,9.94475}}));
    connect(r1.n,V3.p) annotation(Line(points = {{-40.663,17.4033},{-40.663,11.0497},{-40.884,11.0497},{-40.884,11.0497}}));
    connect(V1.n,V2.n) annotation(Line(points = {{39.337,-9.17127},{-0.662983,-9.17127}}, color = {0,0,255}, smooth = Smooth.Bezier));
    connect(V2.n,pin_n) annotation(Line(points = {{-0.662983,-9.17127},{-0.662983,-9.17127},{0,-10},{0,-40}}, color = {0,0,255}, smooth = Smooth.Bezier));
    connect(V3.n,V2.n) annotation(Line(points = {{-40.663,-9.17127},{-0.662983,-9.17127}}, color = {0,0,255}, smooth = Smooth.Bezier));
    //  i_dq0 = P * i_abc;
    connect(positivePlug,breakout3_1.plug_p) annotation(Line(points = {{0,80},{0,70},{0,60},{0.000000000000000888178,60}}, color = {0,0,255}, smooth = Smooth.None));
    annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 0)), Diagram(graphics), Icon(coordinateSystem(extent = {{-100,-100},{100,100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2,2}), graphics = {Ellipse(fillColor = {255,255,255}, fillPattern = FillPattern.Solid, extent = {{-40,60},{40,-20}}, endAngle = 360),Text(origin = {0,4.82574}, lineColor = {95,95,95}, fillColor = {95,95,95}, fillPattern = FillPattern.Solid, lineThickness = 0.5, extent = {{-40,60},{40,-20}}, textString = "~"),Line(points = {{0,-20},{0,-40}}, color = {0,0,255}, smooth = Smooth.Bezier),Line(points = {{0,60},{0,80}}, color = {0,0,255}, smooth = Smooth.Bezier)}));
  end ThreePhaseSource;
  model TransformerCore "Simple core model with linear resistor and nonlinear inductor"
    //extends Modelica.Electrical.Analog.Interfaces.OnePort;
    parameter Modelica.SIunits.Current Inom(start = 1) "Nominal current";
    parameter Modelica.SIunits.Inductance Lnom(start = 1) "Nominal inductance at Nominal current";
    parameter Modelica.SIunits.Inductance Lzer(start = 2 * Lnom) "Inductance near current=0";
    parameter Modelica.SIunits.Inductance Linf(start = Lnom / 2) "Inductance at large currents";
    parameter Modelica.SIunits.Resistance R(start = 1) "Core resistance";
    Modelica.Electrical.Analog.Interfaces.PositivePin p "Positive pin (potential p.v > n.v for positive voltage drop v)" annotation(Placement(transformation(extent = {{-110,-10},{-90,10}}, rotation = 0), iconTransformation(extent = {{-110,-10},{-90,10}})));
    Modelica.Electrical.Analog.Interfaces.NegativePin n "Negative pin" annotation(Placement(transformation(extent = {{110,-10},{90,10}}, rotation = 0), iconTransformation(extent = {{110,-10},{90,10}})));
  protected
    //Modelica.Electrical.Analog.Basic.SaturatingInductor L(Inom = Inom, Lnom = Lnom, Lzer = Lzer, Linf = Linf) annotation(Placement(visible = true, transformation(origin = {-4.2857,13.7434}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    SimpleSaturatingInductor L(Inom = Inom, Lnom = Lnom, Lzer = Lzer, Linf = Linf) annotation(Placement(visible = true, transformation(origin = {-4.2857,13.7434}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    // Modelica.Electrical.Analog.Basic.Inductor L(L = Lnom) annotation(Placement(visible = true, transformation(origin = {-4.2857,13.7434}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    Modelica.Electrical.Analog.Basic.Resistor Rc(R = R) annotation(Placement(visible = true, transformation(origin = {-4.2857,-14.0735}, extent = {{-12,-12},{12,12}}, rotation = 0)));
  equation
    connect(p,L.p) annotation(Line(points = {{-100,0},{-62,0},{-62,13.7434},{-16.2857,13.7434}}, color = {0,0,255}, smooth = Smooth.None));
    connect(p,Rc.p) annotation(Line(points = {{-100,0},{-62,0},{-62,-14.0735},{-16.2857,-14.0735}}, color = {0,0,255}, smooth = Smooth.None));
    connect(n,L.n) annotation(Line(points = {{100,0},{50,0},{50,13.7434},{7.7143,13.7434}}, color = {0,0,255}, smooth = Smooth.None));
    connect(n,Rc.n) annotation(Line(points = {{100,0},{50,0},{50,-14.0735},{7.7143,-14.0735}}, color = {0,0,255}, smooth = Smooth.None));
    annotation(Diagram(graphics), Icon(graphics = {Ellipse(extent = {{-60,-15},{-30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{-30,-15},{0,15}}, lineColor = {0,0,255}),Ellipse(extent = {{0,-15},{30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{30,-15},{60,15}}, lineColor = {0,0,255}),Rectangle(extent = {{-60,-20},{62,0}}, lineColor = {255,255,255}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid),Line(points = {{60,0},{96,0}}, color = {0,0,255}),Line(points = {{-96,0},{-60,0}}, color = {0,0,255}),Line(points = {{-44,38},{-40,18},{40,-2},{44,-22}}, color = {95,95,95}, smooth = Smooth.None)}), experiment(StartTime = 0, StopTime = 0.3, Tolerance = 0.000001));
  end TransformerCore;
  model CableCapacitance "Line-to-ground cable capacitance"
    parameter Modelica.SIunits.Length length = 100 "Cable length";
    parameter Modelica.SIunits.Length d = 0.01 "Conductor diameter";
    parameter Modelica.SIunits.Length l = 0.01 "Insulation thickness";
    parameter Modelica.SIunits.RelativePermittivity e_r = 2.4 "Insulation permittivity";
    Modelica.Electrical.Analog.Basic.Ground ground annotation(Placement(transformation(extent = {{-50,-40},{-30,-20}})));
    Modelica.Electrical.MultiPhase.Basic.Star star annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-40,-4})));
    Modelica.Electrical.MultiPhase.Basic.Capacitor capacitor(C = {c,c,c}) annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-40,30})));
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug positivePlug annotation(Placement(transformation(extent = {{-50,70},{-30,90}})));
  protected
    parameter Modelica.SIunits.Capacitance c = length * 2 * Modelica.Constants.pi * Modelica.Constants.epsilon_0 * e_r / Modelica.Math.log((d + 2 * l) / d) "Line-to-ground cable capacitance";
  equation
    connect(star.pin_n,ground.p) annotation(Line(points = {{-40,-14},{-40,-14},{-40,-20}}, color = {0,0,255}, smooth = Smooth.Bezier));
    connect(capacitor.plug_n,star.plug_p) annotation(Line(points = {{-40,20},{-40,20},{-40,6}}, color = {0,0,255}, smooth = Smooth.Bezier));
    connect(capacitor.plug_p,positivePlug) annotation(Line(points = {{-40,40},{-40,80}}, color = {0,0,255}, smooth = Smooth.None));
    annotation(Icon(graphics = {Rectangle(extent = {{34,88},{46,-30}}, fillColor = {227,227,227}, fillPattern = FillPattern.VerticalCylinder, pattern = LinePattern.None, lineColor = {170,85,255}),Line(points = {{-40,78},{-40,40}}, color = {0,0,255}, smooth = Smooth.None),Line(points = {{-80,40},{0,40}}, color = {0,0,255}, smooth = Smooth.None, thickness = 0.5),Line(points = {{-60,10},{-56,14},{-50,18},{-40,20},{-30,18},{-24,14},{-20,10}}, color = {0,0,255}, smooth = Smooth.Bezier, thickness = 0.5),Line(points = {{-40,20},{-40,0},{-40,-20}}, color = {0,0,255}, smooth = Smooth.Bezier),Line(points = {{-80,-20},{0,-20}}, color = {0,0,255}, smooth = Smooth.Bezier),Line(points = {{-60,-40},{-20,-40}}, color = {0,0,255}, smooth = Smooth.Bezier),Rectangle(extent = {{22,70},{58,-50}}, fillColor = {191,159,127}, fillPattern = FillPattern.VerticalCylinder, pattern = LinePattern.None, lineColor = {0,0,0}),Rectangle(extent = {{20,60},{60,-60}}, fillColor = {98,98,98}, fillPattern = FillPattern.VerticalCylinder, pattern = LinePattern.None, lineColor = {0,0,0}),Line(points = {{-48,-60},{-34,-60}}, color = {0,0,255}, smooth = Smooth.Bezier)}), Diagram(graphics));
  end CableCapacitance;
  model ThreePhaseSwitch "Simple three-phase switch with independently switched phases"
    parameter Boolean isClosedA = true "Switch A closed";
    parameter Boolean isClosedB = false "Switch B closed";
    parameter Boolean isClosedC = false "Switch C closed";
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug plug_p(final m = 3) annotation(Placement(transformation(extent = {{-110,-10},{-90,10}}, rotation = 0), iconTransformation(extent = {{-100,0},{-80,20}})));
    Modelica.Electrical.MultiPhase.Interfaces.NegativePlug plug_n(final m = 3) annotation(Placement(transformation(extent = {{92,-12},{112,8}}, rotation = 0), iconTransformation(extent = {{100,0},{120,20}})));
  equation
    if isClosedA then
      plug_p.pin[1].v = plug_n.pin[1].v;
      plug_p.pin[1].i = -plug_n.pin[1].i;
    else
      plug_p.pin[1].i = 0;
      plug_n.pin[1].i = 0;
    end if;
    if isClosedB then
      plug_p.pin[2].v = plug_n.pin[2].v;
      plug_p.pin[2].i = -plug_n.pin[2].i;
    else
      plug_p.pin[2].i = 0;
      plug_n.pin[2].i = 0;
    end if;
    if isClosedC then
      plug_p.pin[3].v = plug_n.pin[3].v;
      plug_p.pin[3].i = -plug_n.pin[3].i;
    else
      plug_p.pin[3].i = 0;
      plug_n.pin[3].i = 0;
    end if;
    annotation(Placement(transformation(extent = {{110,-10},{90,10}}, rotation = 0), iconTransformation(extent = {{120,0},{100,20}})), Diagram(graphics), Icon(graphics = {Line(points = {{-80,10},{-34,10}}, color = {0,0,255}),Ellipse(extent = {{-34,14},{-26,6}}, lineColor = {0,0,255}),Line(points = {{-27,12},{50,60}}, color = {0,0,255}),Line(points = {{50,10},{100,10}}, color = {0,0,255}),Line(points = {{50,30},{50,10}}, color = {0,0,255}),Line(points = {{50,60},{42,44},{58,40},{50,30}}, color = {255,0,0})}));
  end ThreePhaseSwitch;
  model FiveLeggedCoreTransformer
    parameter Modelica.SIunits.ApparentPower tran_VA = 75000.0 "Transformer size";
    parameter Modelica.SIunits.Voltage tran_prim_V = 12500.0 "Voltage rating on the primary side (L-L)";
    parameter Real tran_core_loss = 0.1 "Core losses, percent";
    parameter Real tran_exciting = 0.2 "Reactive exciting current, percent";
    parameter Real resistive_load = 0.1 "Resistive load, percent";
    parameter Modelica.SIunits.Frequency f = 60.0 "Frequency";
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug H annotation(Placement(transformation(extent = {{-10,79},{10,99}}), iconTransformation(extent = {{-10,79},{10,99}})));
  protected
    parameter Modelica.SIunits.Resistance base_Z = tran_prim_V ^ 2 / tran_VA "Base impedance on the primary side of the transformer, ohms";
    parameter Modelica.SIunits.Resistance core_R = base_Z / tran_core_loss * 100.0 * 4 / 3 "Core losses";
    parameter Modelica.SIunits.Inductance L_nom = base_Z / tran_exciting * 100 / 2 / 2 / Modelica.Constants.pi / f "Nominal-voltage core inductance";
    parameter Modelica.SIunits.Inductance L_air = L_nom / 100.0 "Air-core inductance";
    parameter Modelica.SIunits.Inductance L_low = L_nom * 1.5 "Low-voltage core inductance";
    parameter Modelica.SIunits.Current Inom = tran_prim_V / sqrt(3) * 2 / 3 / L_nom / 2 / Modelica.Constants.pi / f "Current at nominal voltage";
    parameter Modelica.SIunits.Resistance Rload = base_Z / resistive_load * 100.0 "Load losses";
    parameter Modelica.SIunits.Capacitance Ctran = 0.0000000001664075 * tran_VA ^ 0.4 / tran_prim_V ^ 0.25 "Transformer winding capacitance to ground";
    Modelica.Electrical.Analog.Ideal.IdealTransformer T_H1(n = -1) annotation(Placement(visible = true, transformation(origin = {57.8149,19.8028}, extent = {{-12,-12},{12,12}}, rotation = 90)));
    Modelica.Electrical.Analog.Ideal.IdealTransformer T_H2(n = -1) annotation(Placement(visible = true, transformation(origin = {36.3938,42.8072}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    Modelica.Electrical.Analog.Basic.Ground groundH annotation(Placement(visible = true, transformation(origin = {-19.7857,-77.6069}, extent = {{-10,-10},{10,10}}, rotation = 0)));
    Modelica.Electrical.Analog.Basic.Resistor Rload1(R = Rload) "Resistive load " annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-83,42})));
    Modelica.Electrical.Analog.Basic.Capacitor Ctran1(C = Ctran) "Transformer winding capacitance" annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-65,42})));
    Modelica.Electrical.Analog.Basic.Resistor Rload2(R = Rload) "Resistive load " annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {71,42})));
    Modelica.Electrical.Analog.Basic.Capacitor Ctran2(C = Ctran) "Transformer winding capacitance" annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {89,42})));
    Modelica.Electrical.Analog.Basic.Resistor Rload3(R = Rload) "Resistive load " annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-38,-32})));
    Modelica.Electrical.Analog.Basic.Capacitor Ctran3(C = Ctran) "Transformer winding capacitance" annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-20,-32})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p1
    // annotation (Placement(transformation(extent={{-87,59},{-79,67}})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p2
    // annotation (Placement(transformation(extent={{85,59},{93,67}})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p3
    // annotation (Placement(transformation(extent={{-42,-16},{-34,-8}})));
    TransformerCore transformerCore1(Inom = Inom, Lnom = L_nom, Lzer = L_low, Linf = L_air, R = core_R) annotation(Placement(transformation(extent = {{-40,42},{-20,62}})));
    TransformerCore transformerCore2(Inom = Inom, Lnom = L_nom, Lzer = L_low, Linf = L_air, R = core_R) annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-7,42})));
    TransformerCore transformerCore3(Inom = Inom, Lnom = L_nom, Lzer = L_low, Linf = L_air, R = core_R) annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 0, origin = {57,-22})));
    TransformerCore transformerCore4(Inom = Inom, Lnom = L_nom, Lzer = L_low, Linf = L_air, R = core_R) annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 0, origin = {14,-22})));
  equation
    connect(H.pin[1],Rload1.p);
    connect(H.pin[2],Rload2.p);
    connect(H.pin[3],Rload3.p);
    // connect(H.pin[1], p1);
    // connect(H.pin[2], p2);
    // connect(H.pin[3], p3);
    connect(Ctran2.p,Rload2.p) annotation(Line(points = {{89,52},{71,52}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Rload2.p,T_H2.p2) annotation(Line(points = {{71,52},{60,52},{60,48.8072},{48.3938,48.8072}}, color = {0,0,255}, smooth = Smooth.None));
    connect(T_H2.n2,T_H1.p2) annotation(Line(points = {{48.3938,36.8072},{48.3938,32},{52,32},{52,31.8028},{51.8149,31.8028}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran2.n,Rload2.n) annotation(Line(points = {{89,32},{71,32}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Rload2.n,T_H1.n2) annotation(Line(points = {{71,32},{67.4074,32},{67.4074,31.8028},{63.8149,31.8028}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran1.n,Rload1.n) annotation(Line(points = {{-65,32},{-83,32}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran1.p,Rload1.p) annotation(Line(points = {{-65,52},{-83,52}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran3.p,Rload3.p) annotation(Line(points = {{-20,-22},{-38,-22}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran3.n,Rload3.n) annotation(Line(points = {{-20,-42},{-20,-55},{-38,-55},{-38,-42}}, color = {0,0,255}, smooth = Smooth.None));
    connect(groundH.p,Ctran3.n) annotation(Line(points = {{-19.7857,-67.6069},{-19.7857,-54.8034},{-20,-54.8034},{-20,-42}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Rload1.n,groundH.p) annotation(Line(points = {{-83,32},{-83,-67.6069},{-19.7857,-67.6069}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran2.n,groundH.p) annotation(Line(points = {{89,32},{89,-67.6069},{-19.7857,-67.6069}}, color = {0,0,255}, smooth = Smooth.None));
    // connect(p1, Rload1.p) annotation (Line(points={{-83,63},{-83,52}}, color={0,0,255}, smooth=Smooth.None));
    // connect(p2, Ctran2.p) annotation (Line(points={{89,63},{89,52}}, color={0,0,255}, smooth=Smooth.None));
    // connect(p3, Rload3.p) annotation (Line(points={{-38,-12},{-38,-22}}, color={0,0,255}, smooth=Smooth.None));
    connect(Ctran3.p,transformerCore4.p) annotation(Line(points = {{-20,-22},{4,-22}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore4.n,transformerCore3.p) annotation(Line(points = {{24,-22},{47,-22}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore3.p,T_H1.p1) annotation(Line(points = {{47,-22},{47,7.8028},{51.8149,7.8028}}, color = {0,0,255}, smooth = Smooth.None));
    connect(T_H1.n1,transformerCore3.n) annotation(Line(points = {{63.8149,7.8028},{63.8149,7.4014},{67,7.4014},{67,-22}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore3.n,groundH.p) annotation(Line(points = {{67,-22},{67,-67.6069},{-19.7857,-67.6069}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran1.n,transformerCore2.n) annotation(Line(points = {{-65,32},{-7,32}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore2.n,T_H2.n1) annotation(Line(points = {{-7,32},{24,32},{24,36.8072},{24.3938,36.8072}}, color = {0,0,255}, smooth = Smooth.None));
    connect(Ctran1.p,transformerCore1.p) annotation(Line(points = {{-65,52},{-40,52}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore1.n,transformerCore2.p) annotation(Line(points = {{-20,52},{-7,52}}, color = {0,0,255}, smooth = Smooth.None));
    connect(transformerCore2.p,T_H2.p1) annotation(Line(points = {{-7,52},{24,52},{24,48.8072},{24.3938,48.8072}}, color = {0,0,255}, smooth = Smooth.None));
    annotation(Icon(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, grid = {1,1}, initialScale = 0.2), graphics = {Rectangle(extent = {{58,50},{98,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{3,50},{54,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{14,40},{44,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{69,40},{88,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-98,50},{-58,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{-54,50},{-3,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{-43,40},{-13,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-87,40},{-68,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-100,60},{100,-43}}, lineColor = {95,95,95}, lineThickness = 0.5),Line(points = {{-30,-60},{31,-60}}, color = {0,0,255}),Line(points = {{-20,-70},{20,-70}}, color = {0,0,255}),Line(points = {{-10,-80},{10,-80}}, color = {0,0,255}),Line(points = {{0,-45},{0,-60}}, color = {0,0,255}),Line(points = {{0,89},{0,63}}, color = {0,0,255}),Rectangle(extent = {{-81,38},{-31,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder),Rectangle(extent = {{-24,38},{26,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder),Rectangle(extent = {{32,38},{82,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder)}), Diagram(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, initialScale = 0.2, grid = {1,1}), graphics), Coordsys(extent = [-500,-500;500,500], grid = [1,1], scale = 0.05), Documentation(info = "<html>
<p>This models the primary side interconnections to a five-legged wound-core transformer and includes the magnetic coupling between phases due to the common core. It also includes line-to-neutral capacitance, core losses, and customer load.</p>
<p>The model of the core coupling is most similar to that sketched out in the following:</p>
<p><ul>
<li>Walling, R. A., Hartana, R. K., Reckard, R. M., Sampat, M. P., and Balgie, T. R., &QUOT;Performance of Metal-Oxide Arresters Exposed to Ferroresonance in Padmount Transformers,&QUOT; <i>IEEE Transactions on Power Delivery</i>, vol. 9, no. 2, pp. 788-95, April 1994.</li>
</ul></p>
<p>See here for an additional transformer model that is equivalent:</p>
<p><ul>
<li>Stuehm, D. L., Mork, B. A., and Mairs, D. D., &QUOT;Five-Legged Core Transformer Equivalent Circuit,&QUOT; <i>Power Engineering Review</i>, IEEE, vol. 9, no. 7, pp. 64-65, July 1989.</li>
</ul></p>
<p>A model that includes the primary and secondary is given here:</p>
<p><ul>
<li><a name=\"line1\">M</a>ork, B. A., &QUOT;Five-legged wound-core transformer model: derivation, parameters, implementation and evaluation,&QUOT; <i>IEEE Transactions on Power Delivery</i>, vol.14, no.4, pp.1519-1526, Oct 1999. <a href=\"http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=796249&isnumber=17286\">IEEE Xplore link</a></li>
</ul></p>
<p>The capacitance from line to ground in the transformer is an important consideration for ferroresonance. Walling [1992] derived an empirical equation to estimate the line-to-ground transformer capacitance per phase in microfarads:</p>
<p><img src=\"modelica://FerroModule/Images/equations/equation-yyoSKXOS.png\" alt=\"C_uF = 0.000469 * S_kVA ^ 0.4 / V_kV^ 0.25 
\"/> </p>
<p>where, </p>
<p><i>SkVA</i> = transformer three-phase kVA rating </p>
<p><i>VkV</i> = rated line-to-line voltage in kV </p>
<p>With base SI units, this is: </p>
<p><img src=\"modelica://FerroModule/Images/equations/equation-kxhKLKwZ.png\" alt=\"C_F =  0.1664075E-9 * S_VA ^ 0.4 / V_V^ 0.25 
\"/></p>
<p><ul>
<li>Walling, R. A., &QUOT;Ferroresonance Guidelines for Modern Transformer Applications,&QUOT; in Final Report to the Distribution Systems Testing, Application, and Research (DSTAR) Consortium: General Electric, Industrial and Power Systems, Power Systems Engineering Department, 1992. As cited by NRECA RER Project 90-8, NRECA RER Project 90-8, <i>Underground Distribution System Design and Installation Guide</i>, National Rural Electric Cooperative Association, 1993. </li>
</ul></p>
<p>Another important parameter is the core losses. Lower loss transformers are more susceptable to ferroresonance.</p>
<p>The core losses are modeled as linear resistors. Customer load is lumped on each phase. </p>
</html>"), experiment(StartTime = 0, StopTime = 0.2, Tolerance = 0.000001));
  end FiveLeggedCoreTransformer;
  model Ferro
    parameter Integer m = 3 "Number of phases";
    parameter Modelica.SIunits.Frequency f = 60.0 "Frequency, Hz";
    Modelica.SIunits.Voltage v[3] = cableCapacitance.positivePlug.pin.v "Transformer terminal L-G voltages";
    ThreePhaseSwitch switch(isClosedA = true, isClosedB = false, isClosedC = false) annotation(Placement(visible = true, transformation(origin = {-18.6024,38.8612}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    FerroModule.FiveLeggedCoreTransformer fiveleggedcoretransformer1(resistive_load = 0.00001, tran_VA = 75000.0, tran_core_loss = 0.24) annotation(Placement(visible = true, transformation(origin = {49.9861,29.3167}, extent = {{-12,-12},{12,12}}, rotation = 0)));
    ThreePhaseSource threePhaseSource(V = 12470.0) annotation(Placement(visible = true, transformation(origin = {-55.6377,31.9558}, extent = {{-10,-10},{10,10}}, rotation = 0)));
    Modelica.Electrical.Analog.Basic.Ground ground annotation(Placement(visible = true, transformation(origin = {-55.779,11.9558}, extent = {{-10,-10},{10,10}}, rotation = 0)));
    CableCapacitance cableCapacitance(length = 60, d = 0.0134, l = 0.0066) annotation(Placement(visible = true, transformation(origin = {14.0099,20}, extent = {{-10,-10},{10,10}}, rotation = 0)));
  protected
    Modelica.Electrical.MultiPhase.Interfaces.PositivePlug positivePlug1 annotation(Placement(transformation(extent = {{9,39},{11,41}})));
  equation
    connect(cableCapacitance.positivePlug,positivePlug1) annotation(Line(points = {{10.0099,28},{10,40}}, color = {0,0,255}));
    connect(threePhaseSource.pin_n,ground.p) annotation(Line(points = {{-55.6377,27.9558},{-55.779,21.9558}}, color = {0,0,255}));
    connect(threePhaseSource.positivePlug,switch.plug_p) annotation(Line(points = {{-55.6377,39.9558},{-56.442,39.9558},{-29.4024,40.0612}}, color = {0,0,255}));
    connect(positivePlug1,fiveleggedcoretransformer1.H) annotation(Line(points = {{10,40},{25.724,40},{49.9861,39.9967},{49.9861,39.9967}}, color = {0,0,255}));
    connect(switch.plug_n,fiveleggedcoretransformer1.H) annotation(Line(points = {{-5.40239,40.0612},{28.7607,40.0612},{49.9861,39.9967},{49.9861,39.9967}}, color = {0,0,255}, smooth = Smooth.Bezier));
    annotation(Diagram(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, grid = {1,1}), graphics = {Text(extent = {{-92,74},{100,66}}, lineColor = {127,0,0}, fillColor = {127,0,0}, fillPattern = FillPattern.Solid, textString = "Ferroresonance on a Five-Legged Core Transformer")}), Icon(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, grid = {1,1}), graphics), experiment(StartTime = 0, StopTime = 0.3, Tolerance = 0.001));
  end Ferro;
  model SimpleSaturatingInductor "Simple model of an inductor with saturation"
    extends Modelica.Electrical.Analog.Interfaces.OnePort;
    parameter Modelica.SIunits.Current Inom(start = 1) "Nominal current";
    parameter Modelica.SIunits.Inductance Lnom(start = 1) "Nominal inductance at Nominal current";
    parameter Modelica.SIunits.Inductance Lzer(start = 2 * Lnom) "Inductance near current=0";
    parameter Modelica.SIunits.Inductance Linf(start = Lnom / 2) "Inductance at large currents";
    //  Modelica.SIunits.Inductance Lact(start = Lzer);
    Modelica.SIunits.MagneticFlux Psi(start = 0, fixed = true);
    parameter Real knee = 1.13;
  equation
    assert(Lzer > Lnom + Modelica.Constants.eps, "Lzer (= " + String(Lzer) + ") has to be > Lnom (= " + String(Lnom) + ")");
    assert(Linf < Lnom - Modelica.Constants.eps, "Linf (= " + String(Linf) + ") has to be < Lnom (= " + String(Lnom) + ")");
    if Psi > knee * Lnom * Inom then
      Psi = knee * Lnom * Inom + Linf * (i - knee * Inom);
    elseif Psi < (-knee * Lnom * Inom) then
      Psi = -knee * Lnom * Inom + Linf * (i + knee * Inom);
    else
      Psi = Lnom * i;
    end if;
    v = der(Psi);
    annotation(Icon(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}), graphics = {Ellipse(extent = {{-60,-15},{-30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{-30,-15},{0,15}}, lineColor = {0,0,255}),Ellipse(extent = {{0,-15},{30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{30,-15},{60,15}}, lineColor = {0,0,255}),Rectangle(extent = {{-60,-20},{62,0}}, lineColor = {255,255,255}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid),Line(points = {{60,0},{90,0}}, color = {0,0,255}),Line(points = {{-90,0},{-60,0}}, color = {0,0,255}),Rectangle(extent = {{-60,-10},{60,-20}}, lineColor = {0,0,0}, fillPattern = FillPattern.Sphere, fillColor = {0,0,255}),Text(extent = {{-148,-50},{152,-80}}, lineColor = {0,0,0}, textString = "Lnom=%Lnom"),Text(extent = {{-148,91},{152,51}}, textString = "%name", lineColor = {0,0,255})}), Documentation(info = "<html>
<p>This model approximates the behaviour of an inductor with the influence of saturation, i.e., the value of the inductance depends on the current flowing through the inductor. The inductance decreases as current increases.</p><p>The parameters are:</p>
<ul>
<li>Inom...nominal current</li>
<li>Lnom...nominal inductance at nominal current</li>
<li>Lzer...inductance near current = 0; Lzer has to be greater than Lnom</li>
<li>Linf...inductance at large currents; Linf has to be less than Lnom </li>
</ul>
</html>", Diagram(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}), graphics = {Ellipse(extent = {{-60,-15},{-30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{-30,-15},{0,15}}, lineColor = {0,0,255}),Ellipse(extent = {{0,-15},{30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{30,-15},{60,15}}, lineColor = {0,0,255}),Rectangle(extent = {{-60,-20},{62,0}}, lineColor = {255,255,255}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid),Line(points = {{60,0},{96,0}}, color = {0,0,255}),Line(points = {{-96,0},{-60,0}}, color = {0,0,255}),Rectangle(extent = {{-60,-10},{60,-20}}, lineColor = {0,0,0}, fillPattern = FillPattern.Sphere, fillColor = {0,0,255})})));
  end SimpleSaturatingInductor;
  model SimpleFerro
    parameter Modelica.SIunits.ApparentPower tran_VA = 75000.0 "Transformer size";
    parameter Modelica.SIunits.Voltage tran_prim_V = 12500.0 "Voltage rating on the primary side (L-L)";
    parameter Real tran_core_loss = 0.1 "Core losses, percent";
    parameter Real tran_exciting = 0.2 "Reactive exciting current, percent";
    parameter Real resistive_load = 0.1 "Resistive load, percent";
    parameter Modelica.SIunits.Frequency f = 60.0 "Frequency";
    Modelica.Electrical.Analog.Sources.SineVoltage sinevoltage1(V = 7200, freqHz = 60) annotation(Placement(visible = true, transformation(origin = {35.4424,-36.2466}, extent = {{-9.59785,-9.59785},{9.59785,9.59785}}, rotation = -90)));
  protected
    parameter Modelica.SIunits.Resistance base_Z = tran_prim_V ^ 2 / tran_VA "Base impedance on the primary side of the transformer, ohms";
    parameter Modelica.SIunits.Resistance core_R = base_Z / tran_core_loss * 100.0 * 4 / 3 "Core losses";
    parameter Modelica.SIunits.Inductance L_nom = base_Z / tran_exciting * 100 / 2 / 2 / Modelica.Constants.pi / f "Nominal-voltage core inductance";
    parameter Modelica.SIunits.Inductance L_air = L_nom / 100.0 "Air-core inductance";
    parameter Modelica.SIunits.Inductance L_low = L_nom * 1.5 "Low-voltage core inductance";
    parameter Modelica.SIunits.Current Inom = tran_prim_V / sqrt(3) * 2 / 3 / L_nom / 2 / Modelica.Constants.pi / f "Current at nominal voltage";
    parameter Modelica.SIunits.Resistance Rload = base_Z / resistive_load * 100.0 "Load losses";
    parameter Modelica.SIunits.Capacitance Ctran = 0.0000000001664075 * tran_VA ^ 0.4 / tran_prim_V ^ 0.25 "Transformer winding capacitance to ground";
    Modelica.Electrical.Analog.Basic.Ground groundH annotation(Placement(visible = true, transformation(origin = {-19.7857,-77.6069}, extent = {{-10,-10},{10,10}}, rotation = 0)));
    Modelica.Electrical.Analog.Basic.Resistor Rload3(R = Rload) "Resistive load " annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 270, origin = {-38,-32})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p1
    // annotation (Placement(transformation(extent={{-87,59},{-79,67}})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p2
    // annotation (Placement(transformation(extent={{85,59},{93,67}})));
    // Modelica.Electrical.Analog.Interfaces.PositivePin p3
    // annotation (Placement(transformation(extent={{-42,-16},{-34,-8}})));
    TransformerCore transformerCore4(Inom = Inom, Lnom = L_nom, Lzer = L_low, Linf = L_air, R = core_R) annotation(Placement(transformation(extent = {{-10,-10},{10,10}}, rotation = 0, origin = {14,-22})));
    Modelica.Electrical.Analog.Basic.Capacitor Ctran3(C = 0.0000001) "Transformer winding capacitance" annotation(Placement(visible = true, transformation(origin = {-20,-42.7239}, extent = {{-10,-10},{10,10}}, rotation = 270)));
  equation
    connect(Rload3.p,Ctran3.p) annotation(Line(points = {{-38,-22},{-38,-21.7158},{-19.3029,-21.7158},{-19.3029,-32.9759},{-19.3029,-32.9759}}));
    connect(transformerCore4.p,Ctran3.p) annotation(Line(points = {{4,-22},{-19.3029,-22},{-19.3029,-32.7078},{-19.3029,-32.7078}}));
    connect(groundH.p,Ctran3.n) annotation(Line(points = {{-19.7857,-67.6069},{-19.7857,-54.8034},{-20,-54.8034},{-20,-52.7239}}, color = {0,0,255}));
    connect(Ctran3.n,Rload3.n) annotation(Line(points = {{-20,-52.7239},{-20,-55},{-38,-55},{-38,-42}}, color = {0,0,255}));
    connect(sinevoltage1.n,groundH.p) annotation(Line(points = {{35.4424,-45.8445},{35.4424,-54.9598},{-19.8391,-54.9598},{-19.8391,-68.0965},{-19.8391,-68.0965}}));
    connect(transformerCore4.n,sinevoltage1.p) annotation(Line(points = {{24,-22},{35.6568,-22},{35.6568,-27.0777},{35.6568,-27.0777}}));
    // connect(p1, Rload1.p) annotation (Line(points={{-83,63},{-83,52}}, color={0,0,255}, smooth=Smooth.None));
    // connect(p2, Ctran2.p) annotation (Line(points={{89,63},{89,52}}, color={0,0,255}, smooth=Smooth.None));
    // connect(p3, Rload3.p) annotation (Line(points={{-38,-12},{-38,-22}}, color={0,0,255}, smooth=Smooth.None));
    annotation(Icon(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, grid = {1,1}, initialScale = 0.2), graphics = {Rectangle(extent = {{58,50},{98,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{3,50},{54,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{14,40},{44,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{69,40},{88,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-98,50},{-58,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{-54,50},{-3,-30}}, pattern = LinePattern.None, fillColor = {135,135,135}, fillPattern = FillPattern.Solid, lineColor = {0,0,0}, radius = 4),Rectangle(extent = {{-43,40},{-13,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-87,40},{-68,-20}}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid, pattern = LinePattern.None, radius = 4),Rectangle(extent = {{-100,60},{100,-43}}, lineColor = {95,95,95}, lineThickness = 0.5),Line(points = {{-30,-60},{31,-60}}, color = {0,0,255}),Line(points = {{-20,-70},{20,-70}}, color = {0,0,255}),Line(points = {{-10,-80},{10,-80}}, color = {0,0,255}),Line(points = {{0,-45},{0,-60}}, color = {0,0,255}),Line(points = {{0,89},{0,63}}, color = {0,0,255}),Rectangle(extent = {{-81,38},{-31,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder),Rectangle(extent = {{-24,38},{26,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder),Rectangle(extent = {{32,38},{82,-18}}, lineColor = {0,0,255}, fillColor = {215,215,215}, fillPattern = FillPattern.VerticalCylinder)}), Diagram(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}, initialScale = 0.2, grid = {1,1}), graphics), Coordsys(extent = [-500,-500;500,500], grid = [1,1], scale = 0.05), experiment(StartTime = 0, StopTime = 0.3, Tolerance = 0.000001));
  end SimpleFerro;
  model PiecewiseSaturatingInductor
    extends Modelica.Electrical.Analog.Interfaces.OnePort;
    parameter Modelica.SIunits.Current Inom(start = 1) "Nominal current";
    parameter Modelica.SIunits.Inductance Lnom(start = 1) "Nominal inductance at Nominal current";
    parameter Modelica.SIunits.Inductance Lzer(start = 2 * Lnom) "Inductance near current=0";
    parameter Modelica.SIunits.Inductance Linf(start = Lnom / 2) "Inductance at large currents";
    //  Modelica.SIunits.Inductance Lact(start = Lzer);
    Modelica.SIunits.MagneticFlux Psi(start = 0, fixed = true);
    parameter Real y[:] = {-1.1,-1,0,1,1.1} * Inom * Lnom;
    parameter Real x[:] = {-1000,-1,0,1,1000.0} * Inom * Lnom;
  equation
    assert(Lzer > Lnom + Modelica.Constants.eps, "Lzer (= " + String(Lzer) + ") has to be > Lnom (= " + String(Lnom) + ")");
    assert(Linf < Lnom - Modelica.Constants.eps, "Linf (= " + String(Linf) + ") has to be < Lnom (= " + String(Lnom) + ")");
    Psi = Modelica.Math.Vectors.interpolate(x, y, i * Lnom);
    v = der(Psi);
    annotation(Icon(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}), graphics = {Ellipse(extent = {{-60,-15},{-30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{-30,-15},{0,15}}, lineColor = {0,0,255}),Ellipse(extent = {{0,-15},{30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{30,-15},{60,15}}, lineColor = {0,0,255}),Rectangle(extent = {{-60,-20},{62,0}}, lineColor = {255,255,255}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid),Line(points = {{60,0},{90,0}}, color = {0,0,255}),Line(points = {{-90,0},{-60,0}}, color = {0,0,255}),Rectangle(extent = {{-60,-10},{60,-20}}, lineColor = {0,0,0}, fillPattern = FillPattern.Sphere, fillColor = {0,0,255}),Text(extent = {{-148,-50},{152,-80}}, lineColor = {0,0,0}, textString = "Lnom=%Lnom"),Text(extent = {{-148,91},{152,51}}, textString = "%name", lineColor = {0,0,255})}), Documentation(info = "<html>
<p>This model approximates the behaviour of an inductor with the influence of saturation, i.e., the value of the inductance depends on the current flowing through the inductor. The inductance decreases as current increases.</p><p>The parameters are:</p>
<ul>
<li>Inom...nominal current</li>
<li>Lnom...nominal inductance at nominal current</li>
<li>Lzer...inductance near current = 0; Lzer has to be greater than Lnom</li>
<li>Linf...inductance at large currents; Linf has to be less than Lnom </li>
</ul>
</html>", Diagram(coordinateSystem(preserveAspectRatio = true, extent = {{-100,-100},{100,100}}), graphics = {Ellipse(extent = {{-60,-15},{-30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{-30,-15},{0,15}}, lineColor = {0,0,255}),Ellipse(extent = {{0,-15},{30,15}}, lineColor = {0,0,255}),Ellipse(extent = {{30,-15},{60,15}}, lineColor = {0,0,255}),Rectangle(extent = {{-60,-20},{62,0}}, lineColor = {255,255,255}, fillColor = {255,255,255}, fillPattern = FillPattern.Solid),Line(points = {{60,0},{96,0}}, color = {0,0,255}),Line(points = {{-96,0},{-60,0}}, color = {0,0,255}),Rectangle(extent = {{-60,-10},{60,-20}}, lineColor = {0,0,0}, fillPattern = FillPattern.Sphere, fillColor = {0,0,255})})));
  end PiecewiseSaturatingInductor;
  annotation(uses(Modelica(version = "3.1")));
end FerroModule;

