/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Forklift-Transport-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.otherCodeFiles = ["ProductBuffer"];
sim.model.objectTypes = ["Operator", "Forklift", "Product", "Area"];
sim.model.eventTypes = ["ProductArrival"];
sim.model.activityTypes = ["WalkToForklift", "DriveForkliftToArrivalArea", "LoadProduct",
"TransportProduct", "UnloadProduct", "DriveForkliftBackToArrivalArea", "DriveForkliftHome", "WalkBackHome" ];

// model parameters
sim.model.p.arrivalRatePerHour = 60;
sim.model.p.distanceOperatorHomeToForkliftHome = 50;  // m
sim.model.p.distanceForkliftHomeToArrivalArea = 200;  // m
sim.model.p.distanceArrivalToDestinationArea = 500;  // m
sim.model.p.distanceDestinationAreaToForkliftHome = 500;  // m
sim.model.p.forkliftSpeed = 3;  // m/s
sim.model.p.operatorSpeed = 1.4;  // m/s
/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 10*60; // 10 hours
sim.scenario.description = "The default scenario has an arrival rate of 60 products per hour, 4 forklifts and 6 operators";
sim.scenario.setupInitialState = function () {
  const a1 = new Area({id: 1, name:"arrivalArea"}),
      a2 = new Area({id: 2, name:"destinationArea"}),
      fl1 = new Forklift({id: 11, name:"fl1", status: rESOURCEsTATUS.AVAILABLE, type: 1}),
      fl2 = new Forklift({id: 12, name:"fl2", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
      fl3 = new Forklift({id: 13, name:"fl3", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
      fl4 = new Forklift({id: 14, name:"fl4", status: rESOURCEsTATUS.AVAILABLE, type: 3}),
      op1 = new Operator({id: 21, name:"op1", status: rESOURCEsTATUS.AVAILABLE, type: 1}),
      op2 = new Operator({id: 22, name:"op2", status: rESOURCEsTATUS.AVAILABLE, type: 1}),
      op3 = new Operator({id: 23, name:"op3", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
      op4 = new Operator({id: 24, name:"op4", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
      op5 = new Operator({id: 25, name:"op5", status: rESOURCEsTATUS.AVAILABLE, type: 3}),
      op6 = new Operator({id: 26, name:"op6", status: rESOURCEsTATUS.AVAILABLE, type: 3});
  // Initialize the individual resource pools
  sim.scenario.resourcePools["forklifts"].availResources.push( fl1, fl2, fl3, fl4);
  sim.scenario.resourcePools["operators"].availResources.push( op1,op2,op3,op4,op5,op6);
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with a lower arrival rate and fewer operators",
  description: `<p>This scenario has an arrival rate of 48 products per hour, 4 forklifts and 4 operators.</p>`,
  parameters: {arrivalRatePerHour: 48},
  setupInitialState: function () {
    const a1 = new Area({id: 1, name:"arrivalArea"}),
        a2 = new Area({id: 2, name:"destinationArea"}),
        fl1 = new Forklift({id: 11, name:"fl1", status: rESOURCEsTATUS.AVAILABLE, type: 1}),
        fl2 = new Forklift({id: 12, name:"fl2", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
        fl3 = new Forklift({id: 13, name:"fl3", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
        fl4 = new Forklift({id: 14, name:"fl4", status: rESOURCEsTATUS.AVAILABLE, type: 3}),
        op1 = new Operator({id: 21, name:"op1", status: rESOURCEsTATUS.AVAILABLE, type: 1}),
        op2 = new Operator({id: 22, name:"op2", status: rESOURCEsTATUS.AVAILABLE, type: 2}),
        op3 = new Operator({id: 23, name:"op3", status: rESOURCEsTATUS.AVAILABLE, type: 3}),
        op4 = new Operator({id: 24, name:"op4", status: rESOURCEsTATUS.AVAILABLE, type: 3});
    // Initialize the individual resource pools
    sim.scenario.resourcePools["forklifts"].availResources.push( fl1, fl2, fl3, fl4);
    sim.scenario.resourcePools["operators"].availResources.push( op1, op2, op3, op4);

  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
};
/*******************************************************
 Define an experiment (type)
********************************************************/
/*
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
*/