/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Lemonade-Stand-1";
sim.model.time = "discrete"; // implies using only discrete random variables
sim.model.timeUnit = "h";

sim.model.otherCodeFiles = ["../lib/RingBuffer"];
sim.model.objectTypes = ["SingleProductCompany", "ItemType", "InputItemType", "OutputItemType"];
sim.model.eventTypes = ["StartOfDay", "DailyDelivery", "DailyProduction", "DailyDemand", "EndOfDay"];

sim.ui.objectTypes = ["SingleProductCompany", "ItemType", "InputItemType", "OutputItemType"];

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 40*24;  // 40 days
sim.scenario.description = "The default scenario runs for 40 days.";
sim.scenario.setupInitialState = function () {
  const iit1 = new InputItemType({id:3, name: "Lemon",
    quantityUnit: "pc",  // piece(s)
    supplyUnit: "bag",
    quantityPerSupplyUnit: 5,  // pieces per bag
    purchasePrice: 2,  // per bag
    stockQuantity: 0
  });
  const iit2 = new InputItemType({id:4, name: "Water",
    quantityUnit: "ltr",
    supplyUnit: "bottle",
    quantityPerSupplyUnit: 1.5,  // litre
    purchasePrice: 0.5,  // per bottle
    stockQuantity: 0
  });
  const iit3 = new InputItemType({id:5, name: "IceCubes",
    quantityUnit: "pc",  // piece(s)
    supplyUnit: "bag",
    quantityPerSupplyUnit: 100,  // pieces per bag
    purchasePrice: 2,  // per bag
    stockQuantity: 0
  });
  const iit4 = new InputItemType({id:6, name: "Sugar",
    quantityUnit: "kg",
    supplyUnit: "bag",
    quantityPerSupplyUnit: 1,  // kg per bag
    purchasePrice: 1,  // for a bag
    stockQuantity: 0
  });
  const iit5 = new InputItemType({id:7, name: "PaperCup",
    quantityUnit: "pc",
    supplyUnit: "box",
    quantityPerSupplyUnit: 100,  // pieces per box
    purchasePrice: 2.5,  // for a box
    stockQuantity: 0
  });
  const oit = new OutputItemType({id:2, name: "Lemonade",
    quantityUnit: "ltr",
    supplyUnit: "cup",
    quantityPerSupplyUnit: 0.25,  /// in quantity units (ltr)
    salesPrice: 1.5,  // e.g., USD
    batchSize: 3.5,  // in quantity units (1 pitcher = 3.5 liters)
    bomItemsPerBatch: {"Lemon": 3, "Water": 2.5, "IceCubes": 20, "Sugar": 0.3},
    packItemsPerSupplyUnit: {"PaperCup": 1},
    stockQuantity: 0  // in quantity units
  });
  const ls = new SingleProductCompany({id:1, name: "LemonadeStand",
    productType: oit,  // Lemonade
    liquidity: 100,
    fixedCostPerDay: 50
  });
  // Schedule initial events
  sim.schedule( new StartOfDay({occTime: 8, company: ls}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.lostSales = 0;
  sim.stat.totalRevenue = 0;
  sim.stat.totalCosts = 0;
};
sim.model.computeFinalStatistics = function () {
  sim.stat.totalProfit = sim.stat.totalRevenue - sim.stat.totalCosts;
}

/*******************************************************
 Define an experiment (type)
********************************************************/
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
