/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Load-Haul-Dump-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["Truck", "WheelLoader"];
sim.model.eventTypes = ["Request"];
sim.model.activityTypes = ["GoToLoadingSite","Load","Haul","Dump","GoBackToLoadingSite","GoHome"];

sim.model.v.nmrOfLoads = 66;
/*******************************************************
 Simulation Scenario
 ********************************************************/
//sim.scenario.durationInSimTime = 2000;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
// Initial State
sim.scenario.setupInitialState = function () {
  const t1 = new Truck({id: 1, name:"t1", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
      t2 = new Truck({id: 2, name:"t2", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
      t3 = new Truck({id: 3, name:"t3", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
      t4 = new Truck({id: 4, name:"t4", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
      t5 = new Truck({id: 5, name:"t5", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
      wl1 = new WheelLoader({id: 11, name:"wl1", status: oes.ResourceStatusEL.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
  sim.resourcePools["wheelLoaders"].availResources.push( wl1);
  // Schedule initial events
  sim.FEL.add( new Request({occTime: 1, quantity: 990}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with 2 wheel loaders",
  setupInitialState: function () {
    const t1 = new Truck({id: 1, name:"t1", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
        t2 = new Truck({id: 2, name:"t2", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
        t3 = new Truck({id: 3, name:"t3", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
        t4 = new Truck({id: 4, name:"t4", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
        t5 = new Truck({id: 5, name:"t5", status: oes.ResourceStatusEL.AVAILABLE, capacity: 15}),
        wl1 = new WheelLoader({id: 11, name:"wl1", status: oes.ResourceStatusEL.AVAILABLE});
        wl2 = new WheelLoader({id: 12, name:"wl2", status: oes.ResourceStatusEL.AVAILABLE});
    // Initialize the individual resource pools
    sim.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
    sim.resourcePools["wheelLoaders"].availResources.push( wl1, wl2);
    // Schedule initial events
    sim.FEL.add( new Request({occTime: 1, quantity: 990}));
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
