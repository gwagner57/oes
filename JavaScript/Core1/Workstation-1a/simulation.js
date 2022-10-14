/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Workstation";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["WorkStation"];
sim.model.eventTypes = ["PartArrival","ProcessingEnd","ProcessingStart",
    "Failure","RepairStart","RepairEnd","ProcessingAbort"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 168*60;  // 168 hours
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var ws = new WorkStation({id: 1, inputBufferLength: 0, status:"AVAILABLE"});
  // Schedule initial events
  sim.FEL.add( new PartArrival({occTime: PartArrival.recurrence(), workStation: ws}));
  sim.FEL.add( new Failure({occTime: Failure.recurrence(), workStation: ws}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with two workstations",
  description: "This scenario consists of two workstations operating in parallel.",
  idCounter: 11,
  durationInSimTime: 168*60,  // 168 hours
  setupInitialState: function () {
    // Create initial objects
    var ws1 = new WorkStation({id: 1, inputBufferLength: 0, status:"AVAILABLE"}),
        ws2 = new WorkStation({id: 2, inputBufferLength: 0, status:"AVAILABLE"});
    // Schedule initial events
    sim.FEL.add( new PartArrival({occTime: 1, workStation: ws1}));
    sim.FEL.add( new PartArrival({occTime: 2, workStation: ws2}));
  }
};
sim.scenarios[2] = {
  scenarioNo: 2,
  title: "Scenario with only 3 PartArrival events",
  description: "This simulation scenario ends after 3 PartArrival events have been processed.",
  idCounter: 11,
  setupInitialState: function () {
    // Create initial objects
    var ws = new WorkStation({id: 1, inputBufferLength: 0, status:"AVAILABLE"});
    // Schedule initial events
    sim.FEL.add( new PartArrival({occTime: 1, workStation: ws}));
    PartArrival.maxNmrOfEvents = 3;
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.arrivedParts = 0;
  sim.stat.departedParts = 0;
  sim.stat.maxQueueLength = 0;
  sim.stat.failures = 0;
  sim.stat.abortions = 0;
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
