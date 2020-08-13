/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.durationInSimTime = 1000;
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "min";  // minutes
sim.model.objectTypes = ["ServiceDesk"];
sim.model.eventTypes = ["CustomerArrival", "CustomerDeparture"];
/*******************************************************
 Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var sD = new ServiceDesk({id: 1, queueLength: 0});
  // Schedule initial events
  sim.FEL.add( new CustomerArrival({occTime:1, serviceDesk: sD}));
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
/*
sim.experimentType = {
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10
};
*/
