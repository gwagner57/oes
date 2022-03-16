/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Lemonade-Stand-1";
sim.model.time = "discrete"; // implies using only discrete random variables
sim.model.timeUnit = "h";

sim.model.otherCodeFiles = ["../lib/RingBuffer"];
sim.model.objectTypes = ["SingleProductCompany", "ItemType", "InputItemType", "OutputItemType"];
sim.model.eventTypes = ["StartOfDay", "DailyDelivery", "DailyDemand", "EndOfDay"];

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 40*24;  // 40 days
sim.scenario.description = "The default scenario runs for 40 days.";
sim.scenario.setupInitialState = function () {
  const oit = new OutputItemType({id:2, name: "Lemonade",
    quantityUnit: "ltr",
    supplyUnit: "cup",
    quantityPerSupplyUnit: 0.25,  /// ltr
    salesPrice: 2,  // e.g., USD
    batchSize: 3.5,  // 1 pitcher = 3.5 liters
    stockQuantity: 0,  // in quantityUnit
    bomItemsPerBatch: {"Lemon": 3, "Water": 2.5, "IceCubes": 50, "Sugar": 0.3, "PaperCup": 1}
  });
  const ls = new SingleProductCompany({id:1, name: "LemonadeStand",
    productType: oit,  // Lemonade
    inputInventoryItemTypes: {
      "Lemon": 0,  // pieces
      "Water": 0,  // liters
      "IceCubes": 0,  // pieces
      "Sugar": 0,  // kilograms
      "PaperCup": 0
    },
    liquidity: 100,
    fixedCostPerDay: 50
  });
  const iit1 = new InputItemType({id:3, name: "Lemon",
    quantityUnit: "pc",  // piece(s)
    supplyUnit: "bag",
    quantityPerSupplyUnit: 5,  // pieces
    purchasePrice: 2  // per box
  });
  const iit2 = new InputItemType({id:4, name: "Water",
    quantityUnit: "ltr",
    supplyUnit: "bottle",
    quantityPerSupplyUnit: 1.5,  // litre
    purchasePrice: 0.5  // per bottle
  });
  const iit3 = new InputItemType({id:5, name: "IceCubes",
    quantityUnit: "pc",
    supplyUnit: "bag",
    quantityPerSupplyUnit: 100,// pieces
    purchasePrice: 2
  });
  const iit4 = new InputItemType({id:6, name: "Sugar",
    quantityUnit: "kg",
    supplyUnit: "bag",
    quantityPerSupplyUnit: 1,
    purchasePrice: 1
  });
  const iit5 = new InputItemType({id:7, name: "PaperCup",
    quantityUnit: "pc",
    supplyUnit: "box",
    quantityPerSupplyUnit: 100,
    purchasePrice: 2.5
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
