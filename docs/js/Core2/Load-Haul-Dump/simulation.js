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
sim.scenario.durationInSimTime = 2000;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
sim.scenario.idCounter = 11;  // start value of auto IDs
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
  title: "Scenario with 4 rooms",
  setupInitialState: function () {
    const d1 = new Doctor({id: 1, name:"d1", status: oes.ResourceStatusEL.AVAILABLE}),
        d2 = new Doctor({id: 2, name:"d2", status: oes.ResourceStatusEL.AVAILABLE}),
        d3 = new Doctor({id: 3, name:"d3", status: oes.ResourceStatusEL.AVAILABLE}),
        n1 = new WheelLoader({id: 11, name:"n1", status: oes.ResourceStatusEL.AVAILABLE}),
        n2 = new WheelLoader({id: 12, name:"n2", status: oes.ResourceStatusEL.AVAILABLE});
    // Initialize the individual resource pools
    sim.resourcePools["doctors"].availResources.push( d1, d2, d3);
    sim.resourcePools["nurses"].availResources.push( n1, n2);
    // Initialize the count pools
    sim.resourcePools["rooms"].available = 4;
    // Schedule initial events
    sim.FEL.add( new Request({occTime: 1}));
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
