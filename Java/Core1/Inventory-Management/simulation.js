/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.title = "Basic scenario with a continuous review policy";
sim.scenario.durationInSimTime = 1000;  // days
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds
/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Inventory-Management-1";
sim.model.time = "discrete";
sim.model.timeUnit = "days";
sim.model.objectTypes = ["SingleProductShop"];
sim.model.eventTypes = ["DailyDemand", "Delivery"];
// Model parameters
sim.model.p.reviewPolicy = "continuous";  // "continuous" or "periodic"
sim.model.p.targetInventory = 100;
sim.model.p.reorderInterval = 3;
/*******************************************************
 Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // Create initial objects
  const tvShop = new SingleProductShop({
    id: 1,
    name:"TV Shop",
    stockQuantity: 80,
    reorderPoint: 50,
    targetInventory: sim.model.p.targetInventory,
    reorderInterval: sim.model.p.reorderInterval
  });
  // Schedule initial events
  sim.FEL.add( new DailyDemand({occTime:1, quantity:25, shop: tvShop}));
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.nmrOfStockOuts = 0;
  sim.stat.lostSales = 0;
  sim.stat.serviceLevel = 0.0;
};
sim.model.computeFinalStatistics = function () {
  // percentage of business days without stock-outs
  sim.stat.serviceLevel = (sim.time - sim.stat.nmrOfStockOuts) / sim.time * 100;
};
/*******************************************************
 Define experiment types
********************************************************/
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
sim.experimentTypes[1] = {
  id: 1,
  title: "Parameter variation experiment for exploring reorderInterval and targetInventory",
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
  parameterDefs: [
    {name:"reviewPolicy", values:["periodic"]},
    {name:"reorderInterval", values:[2,3,4]},
    {name:"targetInventory", startValue:80, endValue:100, stepSize:10},
  ]
};
sim.experimentTypes[2] = {
  id: 2,
  title: "Parameter variation experiment for comparing policies",
  nmrOfReplications: 50,
  //seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
  parameterDefs: [
    {name:"reviewPolicy", values:["continuous","periodic"]}
  ]
};
// Define sim.experimentType for avoiding selection in user interface
//sim.experimentType = sim.experimentTypes[0];
