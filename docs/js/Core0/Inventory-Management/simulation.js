/*******************************************************
 Simulation Model
 ********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "days";
sim.model.objectTypes = ["SingleProductShop"];
sim.model.eventTypes = ["DailyDemand", "Delivery"];
/*******************************************************
 Simulation Scenario Settings
********************************************************/
sim.scenario.durationInSimTime = 1000;
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
    targetInventory: 100
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
 Define an experiment (type)
********************************************************/
sim.experimentType = new eXPERIMENTtYPE({
  experimentNo: 1,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10
});
/*
experiment2 = new eXPERIMENTtYPE({
  id: 2,
  scenarioNo: 1,
  experimentNo: 1,
  experimentTitle: "Simple Experiment with 50 replications.",
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
  parameterDefs: [
    new oes.ExperimentParamDef({name:"arrivalEventRate", values:[0.4, 0.5, 0.6]})
  ]
});
*/