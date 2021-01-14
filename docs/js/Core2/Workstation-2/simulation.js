/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Workstation-2";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["WorkStation"];
sim.model.eventTypes = ["PartArrival"];
sim.model.activityTypes = ["Processing"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 168*60;  // 168 hours
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var ws = new WorkStation({id: 1, name:"ws", status: oes.ResourceStatusEL.AVAILABLE});
  // Initialize the resource pool
  sim.resourcePools["workStations"].availResources.push( ws);
  // Schedule initial events
  sim.FEL.add( new PartArrival({occTime: 1, workStation: ws}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with only 3 PartArrival events",
  description: "This simulation scenario ends after 3 PartArrival events have been processed.",
  idCounter: 11,
  setupInitialState: function () {
    // Create initial objects
    var ws = new WorkStation({id: 1, name:"ws", status: oes.ResourceStatusEL.AVAILABLE});
    // Initialize the resource pool
    sim.resourcePools["workStations"].availResources.push( ws);
    // Schedule initial events
    sim.FEL.add( new PartArrival({occTime: 1, workStation: ws}));
    // defining the end of simulation
    PartArrival.maxNmrOfEvents = 3;
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.arrivedParts = 0;
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
