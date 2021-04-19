/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Pizza-Server-2";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["PizzaService"];
sim.model.eventTypes = ["Order"];
sim.model.activityTypes = ["MakePizza"];

/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 300;
sim.scenario.setupInitialState = function () {
  let ps = new PizzaService({id: 1, name:"ps", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the resource pool
  sim.resourcePools["pizzaServices"].availResources.push( ps);
  // Schedule initial events
  sim.FEL.add( new Order({occTime: 1, pizzaService: ps}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.nmrOfOrders = 0;
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
