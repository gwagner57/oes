/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.durationInSimTime = 1000;  // days
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "D";  // days
sim.model.objectTypes = ["SingleProductShop"];
sim.model.eventTypes = ["DailyDemand", "Delivery"];
// Define model parameters
sim.model.p.reviewPolicy = "periodic";  // "continuous" or "periodic"
sim.model.p.targetInventory = 100;
/*******************************************************
 Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // Create initial objects
  const tvShop = new SingleProductShop({
    id: 1,
    name:"TV Shop",
    quantityInStock: 80,
    reorderLevel: 50,
    targetInventory: sim.model.p.targetInventory,
    reorderInterval: 3  // every 3 days
  });
  // Create initial events
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
  title: `Simple experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
sim.experimentTypes[1] = {
  title: "Parameter variation experiment for exploring the targetInventory value",
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
  parameterDefs: [
    {name:"reviewPolicy", values:["continuous"]},
    {name:"targetInventory", startValue:80, endValue:100, stepSize:5},
  ]
};
sim.experimentTypes[2] = {
  title: "Parameter variation experiment for comparing policies",
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
  parameterDefs: [
    {name:"reviewPolicy", values:["continuous","periodic"]}
  ]
};
sim.experimentType = sim.experimentTypes[0];
