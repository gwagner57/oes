/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.durationInSimTime = 200;
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "min";  // minutes
sim.model.objectTypes = [];
sim.model.eventTypes = ["CustomerArrival", "CustomerDeparture"];
// (global) model variable
sim.model.v.queueLength = 0;
// (global) model function
sim.model.f.serviceTime = function () {
  var r = math.getUniformRandomInteger( 0, 99);
  if ( r < 30) return 2;         // probability 0.30
  else if ( r < 80) return 3;    // probability 0.50
  else return 4;                 // probability 0.20
};
/*******************************************************
 Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // Assign initial values to model variables
  sim.model.v.queueLength = 0;
  // Schedule initial events
  sim.FEL.add( new CustomerArrival({occTime:1}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.arrivedCustomers = 0;
  sim.stat.departedCustomers = 0;
  sim.stat.maxQueueLength = 0;
};
/*******************************************************
 Define an experiment (type)
********************************************************/
sim.experimentType = {
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10
};
