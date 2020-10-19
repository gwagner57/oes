/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Medical-Department-2b";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["Nurse", "Doctor"];
sim.model.eventTypes = ["NewCase"];
sim.model.activityTypes = ["WalkToRoom", "Examination"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 1000;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  const d1 = new Doctor({id: 1, name:"d1", status: oes.ResourceStatusEL.AVAILABLE}),
      d2 = new Doctor({id: 2, name:"d2", status: oes.ResourceStatusEL.AVAILABLE}),
      d3 = new Doctor({id: 3, name:"d3", status: oes.ResourceStatusEL.AVAILABLE}),
      n1 = new Nurse({id: 11, name:"n1", status: oes.ResourceStatusEL.AVAILABLE}),
      n2 = new Nurse({id: 12, name:"n2", status: oes.ResourceStatusEL.AVAILABLE}),
      n3 = new Nurse({id: 13, name:"n3", status: oes.ResourceStatusEL.AVAILABLE}),
      n4 = new Nurse({id: 14, name:"n4", status: oes.ResourceStatusEL.AVAILABLE}),
      n5 = new Nurse({id: 15, name:"n5", status: oes.ResourceStatusEL.AVAILABLE}),
      n6 = new Nurse({id: 16, name:"n6", status: oes.ResourceStatusEL.AVAILABLE}),
      n7 = new Nurse({id: 17, name:"n7", status: oes.ResourceStatusEL.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["doctors"].availResources.push( d1, d2, d3);
  sim.resourcePools["nurses"].availResources.push( n1, n2, n3, n4, n5, n6, n7);
  // Initialize the count pools
  sim.resourcePools["rooms"].available = 4;
  // Schedule initial events
  sim.FEL.add( new NewCase({occTime: 1}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
/*
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with 5 rooms",
  setupInitialState: function () {
  }
};
*/
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
