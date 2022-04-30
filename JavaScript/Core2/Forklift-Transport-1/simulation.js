/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Forklift-Transport-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.otherCodeFiles = ["ProductBuffer"];
sim.model.objectTypes = ["Operator", "Forklift", "Product", "Area"];
sim.model.eventTypes = ["ProductArrival"];
sim.model.activityTypes = ["WalkToForklift", "DriveForkliftFromHomeToArrivalArea", "LoadProduct",
"TransportProduct", "UnloadProduct", "DriveForkliftBackToArrivalArea", "DriveForkliftHome", "WalkBackHome" ];

// will be computed on the basis of the HaulRequest quantity
sim.model.v.nmrOfLoads = 66;
/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 10*60; // 10 hours
sim.scenario.description = "The default scenario has ...";
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
  title: "Scenario with 2 wheel loaders",
  description: `<p>Based on the default scenario (with 5 trucks and 1 wheel loader), this scenario  
                 has a second wheel loader. As a consequence, <i>Load</i> activities are performed twice as fast.</p>`,
  setupInitialState: function () {
    const t1 = new Truck({id: 1, name:"t1", status: rESOURCEsTATUS.AVAILABLE}),
        t2 = new Truck({id: 2, name:"t2", status: rESOURCEsTATUS.AVAILABLE}),
        t3 = new Truck({id: 3, name:"t3", status: rESOURCEsTATUS.AVAILABLE}),
        t4 = new Truck({id: 4, name:"t4", status: rESOURCEsTATUS.AVAILABLE}),
        t5 = new Truck({id: 5, name:"t5", status: rESOURCEsTATUS.AVAILABLE}),
        wl1 = new WheelLoader({id: 11, name:"wl1", status: rESOURCEsTATUS.AVAILABLE});
        wl2 = new WheelLoader({id: 12, name:"wl2", status: rESOURCEsTATUS.AVAILABLE});
    // Initialize the individual resource pools
    sim.scenario.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
    sim.scenario.resourcePools["wheelLoaders"].availResources.push( wl1, wl2);
    // Schedule initial events
    sim.FEL.add( new HaulRequest({occTime: 1, quantity: 990}));
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
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
