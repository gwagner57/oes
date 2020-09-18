/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Medical-Department-0";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.eventTypes = ["NewCase"];
sim.model.activityTypes = ["Examination"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 100;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Initialize the count pool "doctors"
  sim.resourcePools["doctors"].available = 5;
  // Schedule initial events
  sim.FEL.add( new NewCase({occTime: 1}));
}
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
