/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Pizza-Server-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["PizzaService"];
sim.model.eventTypes = ["Order"];
sim.model.activityTypes = ["MakePizza"];

/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 300;
//sim.scenario.title = "Default scenario.";
//sim.scenario.description = "";
sim.scenario.setupInitialState = function () {
  //const ps = new PizzaService({id: 1, name:"ps", status: rESOURCEsTATUS.AVAILABLE});
  const ps = new PizzaService({id: 1, name: "ps", queueLength: 0, busy: false});
  // Schedule initial events
  sim.FEL.add( new Order({occTime: 1, pizzaService: ps}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.nmrOfOrders = 0;
  sim.stat.nmrOfDeliveredPizzas = 0;
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
