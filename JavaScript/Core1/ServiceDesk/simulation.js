/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.simEndTime = 1000;
sim.scenario.idCounter = 11;  // start value of auto IDs
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "continuous";
sim.model.timeUnit = "m";  // minutes
sim.model.objectTypes = ["ServiceDesk", "Customer"];
sim.model.eventTypes = ["CustomerArrival", "CustomerDeparture"];
/*******************************************************
 Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var sD = new ServiceDesk({id: 1, queueLength: 0});
  // Create initial events
  sim.FEL.add( new CustomerArrival({occTime:1, serviceDesk: sD}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.arrivedCustomers = 0;
  sim.stat.departedCustomers = 0;
  sim.stat.cumulativeTimeInSystem = 0.0;
  sim.stat.meanTimeInSystem = 0.0;
  sim.stat.maxQueueLength = 0;
};
sim.model.computeFinalStatistics = function () {
  sim.stat.meanTimeInSystem =
      sim.stat.cumulativeTimeInSystem / sim.stat.departedCustomers;
};
/*******************************************************
 Define an experiment (type)
********************************************************/
sim.experiment = new eXPERIMENTtYPE({
  experimentNo: 1,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.simEndTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  //seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
});
