/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Medical-Department-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["Doctor"];
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
  const d1 = new Doctor({id: 1, name:"d1", status: oes.ResourceStatusEL.AVAILABLE}),
      d2 = new Doctor({id: 2, name:"d2", status: oes.ResourceStatusEL.AVAILABLE}),
      d3 = new Doctor({id: 3, name:"d3", status: oes.ResourceStatusEL.AVAILABLE}),
      d4 = new Doctor({id: 4, name:"d4", status: oes.ResourceStatusEL.AVAILABLE}),
      d5 = new Doctor({id: 5, name:"d5", status: oes.ResourceStatusEL.AVAILABLE});
  // Initialize the individual resource pool "doctors"
  sim.resourcePools["doctors"].clear();
  sim.resourcePools["doctors"].availResources.push( d1, d2, d3, d4, d5);
  // Schedule initial events
  sim.FEL.add( new NewCase({occTime: 1}));
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
