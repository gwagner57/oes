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
        "ecgSpot": {card:1, deferredRelease:true}, "ecgMachine": {card:1}},
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
sim.scenario.idCounter = 101;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  const d1 = new Doctor({id: 1, name:"d1", status: rESOURCEsTATUS.AVAILABLE}),
      d2 = new Doctor({id: 2, name:"d2", status: rESOURCEsTATUS.AVAILABLE}),
      d3 = new Doctor({id: 3, name:"d3", status: rESOURCEsTATUS.AVAILABLE}),
      et1 = new EcgTechnician({id: 11, name:"et1", status: rESOURCEsTATUS.AVAILABLE}),
      et2 = new EcgTechnician({id: 12, name:"et2", status: rESOURCEsTATUS.AVAILABLE}),
      et3 = new EcgTechnician({id: 13, name:"et3", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the individual resource pools
  sim.scenario.resourcePools["doctors"].availResources.push( d1, d2, d3);
  sim.scenario.resourcePools["ecgTechnicians"].availResources.push( et1, et2, et3);
  // Initialize the count pools
  sim.scenario.resourcePools["ecgSpots"].available = 3;
  sim.scenario.resourcePools["ecgMachines"].available = 3;
  sim.scenario.resourcePools["usBeds"].available = 3;
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Deterministic scenario",
  setupInitialState: function () {
    const d1 = new Doctor({id: 1, name:"d1", status: rESOURCEsTATUS.AVAILABLE}),
        d2 = new Doctor({id: 2, name:"d2", status: rESOURCEsTATUS.AVAILABLE}),
        d3 = new Doctor({id: 3, name:"d3", status: rESOURCEsTATUS.AVAILABLE}),
        et1 = new EcgTechnician({id: 11, name:"et1", status: rESOURCEsTATUS.AVAILABLE}),
        et2 = new EcgTechnician({id: 12, name:"et2", status: rESOURCEsTATUS.AVAILABLE}),
        et3 = new EcgTechnician({id: 13, name:"et3", status: rESOURCEsTATUS.AVAILABLE});
    // Initialize the individual resource pools
    sim.scenario.resourcePools["doctors"].availResources.push( d1, d2, d3);
    sim.scenario.resourcePools["ecgTechnicians"].availResources.push( et1, et2, et3);
    // Initialize the count pools
    sim.scenario.resourcePools["ecgSpots"].available = 3;
    sim.scenario.resourcePools["ecgMachines"].available = 3;
    sim.scenario.resourcePools["usBeds"].available = 3;
    // make the model deterministic
    delete sim.scenario.networkNodes["patientArrival"].eventRate;
    // notice that recurrence and duration are defined for nodes as event/activity nodes
    sim.scenario.networkNodes["patientArrival"].eventRecurrence = () => 3;
    sim.scenario.networkNodes["performECG"].duration = () => 7;
    sim.scenario.networkNodes["performUsScan"].duration = () => 10;
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
