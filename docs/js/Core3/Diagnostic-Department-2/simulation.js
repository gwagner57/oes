/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Diagnostic-Department-1-AN";
sim.model.time = "continuous";
sim.model.timeUnit = "min";
sim.model.objectTypes = ["EcgTechnician", "Doctor"];
sim.model.networkNodes = {
  "patientArrival": {typeName:"ArrivalEventNode", name:"patientArrival",
    arrivalRate: 1/6,  // 1/6 per min = 10 per hour
    maxNmrOfArrivals: 50,
    successorNodeName:"walkToECG"},
  "walkToECG": {typeName:"ProcessingActivityNode", name:"walkToECG",
    resourceRoles: {"ecgSpot": {card:1}},
    processingDuration: () => 20/60,
    successorNodeName:"performECG"},
  "performECG": {typeName:"ProcessingActivityNode", name:"performECG",
    resourceRoles: {"ecgTechnician": {range:"EcgTechnician"},
        "ecgSpot": {card:1}, "ecgMachine": {card:1}},
    processingDuration: () => rand.triangular(5,10, 7),
    successorNodeName:"walkToUS"},
  "walkToUS": {typeName:"ProcessingActivityNode", name:"walkToUS",
    resourceRoles: {"usBed": {card:1}},
    processingDuration: () => 25/60,
    successorNodeName:"performUsScan"},
  "performUsScan": {typeName:"ProcessingActivityNode", name:"performUsScan",
    resourceRoles: {"doctor": {range:"Doctor"}, "usBed": {card:1}},
    processingDuration: () => rand.triangular(5,25,10),
    successorNodeName:"patientExit"},
  "patientExit": {typeName:"ExitNode", name:"patientExit"}
};
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 1000;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  const d1 = new Doctor({id: 1, name:"d1", status: rESOURCEsTATUS.AVAILABLE}),
      d2 = new Doctor({id: 2, name:"d2", status: rESOURCEsTATUS.AVAILABLE}),
      d3 = new Doctor({id: 3, name:"d3", status: rESOURCEsTATUS.AVAILABLE}),
      n1 = new EcgTechnician({id: 11, name:"n1", status: rESOURCEsTATUS.AVAILABLE}),
      n2 = new EcgTechnician({id: 12, name:"n2", status: rESOURCEsTATUS.AVAILABLE}),
      n3 = new EcgTechnician({id: 13, name:"n3", status: rESOURCEsTATUS.AVAILABLE}),
      n4 = new EcgTechnician({id: 14, name:"n4", status: rESOURCEsTATUS.AVAILABLE}),
      n5 = new EcgTechnician({id: 15, name:"n5", status: rESOURCEsTATUS.AVAILABLE}),
      n6 = new EcgTechnician({id: 16, name:"n6", status: rESOURCEsTATUS.AVAILABLE}),
      n7 = new EcgTechnician({id: 17, name:"n7", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["doctors"].availResources.push( d1, d2, d3);
  sim.resourcePools["nurses"].availResources.push( n1, n2, n3, n4, n5, n6, n7);
  // Initialize the count pools
  sim.resourcePools["rooms"].available = 4;
  // Schedule initial events
  sim.FEL.add( new PatientArrival({occTime: 1}));
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
