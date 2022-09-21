/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Workstation";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["ServiceDesk"];
sim.model.eventTypes = ["Arrival", "ServiceEnd", "ServiceStart"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 168*60;  // 168 hours
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var s = new ServiceDesk({id: 1, queueLength: 0, status:"AVAILABLE"});
  // Schedule initial events
  sim.FEL.add( new Arrival({occTime: Arrival.recurrence(), serviceDesk: s}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with two service stations",
  description: "This scenario consists of two service stations operating in parallel.",
  idCounter: 11,
  durationInSimTime: 168*60,  // 168 hours
  setupInitialState: function () {
    // Create initial objects
    var s1 = new ServiceDesk({id: 1, queueLength: 0, status:"AVAILABLE"}),
        s2 = new ServiceDesk({id: 2, queueLength: 0, status:"AVAILABLE"});
    // Schedule initial events
    sim.FEL.add( new Arrival({occTime: 1, serviceDesk: s1}));
    sim.FEL.add( new Arrival({occTime: 2, serviceDesk: s2}));
  }
};
sim.scenarios[2] = {
  scenarioNo: 2,
  title: "Scenario with only 3 Arrival events",
  description: "This simulation scenario ends after 3 Arrival events have been processed.",
  idCounter: 11,
  setupInitialState: function () {
    // Create initial objects
    var ws = new ServiceDesk({id: 1, queueLength: 0, status:"AVAILABLE"});
    // Schedule initial events
    sim.FEL.add( new Arrival({occTime: 1, serviceDesk: ws}));
    Arrival.maxNmrOfEvents = 3;
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.arrived = 0;
  sim.stat.departed = 0;
  sim.stat.maxQueueLength = 0;
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
