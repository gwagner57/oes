/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Service-Desk-with-Activity";
sim.model.time = "continuous";
sim.model.timeUnit = "min";  // minutes
sim.model.objectTypes = ["ServiceDesk"];
sim.model.eventTypes = ["CustomerArrival"];
sim.model.activityTypes = ["PerformService"];
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.title = "Basic scenario with one service desk";
sim.scenario.durationInSimTime = 1000;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Create initial objects
  var sD = new ServiceDesk({id: 1, name:"sD1", queueLength: 0});
  // Schedule initial events
  sim.FEL.add( new CustomerArrival({occTime: 1, serviceDesk: sD}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with two service desks",
  setupInitialState: function () {
    // Create initial objects
    var sD1 = new ServiceDesk({id: 1, queueLength: 0}),
        sD2 = new ServiceDesk({id: 2, queueLength: 0});
    // Schedule initial events
    sim.FEL.add( new CustomerArrival({occTime: 1, serviceDesk: sD1}));
    sim.FEL.add( new CustomerArrival({occTime: 2, serviceDesk: sD2}));
  }
};
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
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
