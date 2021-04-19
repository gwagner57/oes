/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Load-Haul-Dump-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["Truck", "WheelLoader"];
sim.model.eventTypes = ["HaulRequest"];
sim.model.activityTypes = ["GoToLoadingSite","Load","Haul","Dump","GoBackToLoadingSite","GoHome"];

sim.model.v.nmrOfLoads = 66;
/*******************************************************
 Default Scenario
 ********************************************************/
/* Do not define a fixed simulation duration since a simulation run ends,
   when the job is done (i.e., when the simulator runs out of future events).
 */
sim.scenario.description = "The default scenario has 5 trucks (with IDs 1-5) and one wheel loader (with ID 11).";
sim.scenario.setupInitialState = function () {
  const t1 = new Truck({id: 1, name:"t1", status: rESOURCEsTATUS.AVAILABLE}),
      t2 = new Truck({id: 2, name:"t2", status: rESOURCEsTATUS.AVAILABLE}),
      t3 = new Truck({id: 3, name:"t3", status: rESOURCEsTATUS.AVAILABLE}),
      t4 = new Truck({id: 4, name:"t4", status: rESOURCEsTATUS.AVAILABLE}),
      t5 = new Truck({id: 5, name:"t5", status: rESOURCEsTATUS.AVAILABLE}),
      wl1 = new WheelLoader({id: 11, name:"wl1", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
  sim.resourcePools["wheelLoaders"].availResources.push( wl1);
  // Schedule initial events
  sim.FEL.add( new HaulRequest({occTime: 1, quantity: 990}));
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
    sim.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
    sim.resourcePools["wheelLoaders"].availResources.push( wl1, wl2);
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
