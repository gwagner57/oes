/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Forklift-Transport-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.otherCodeFiles = ["ProductBuffer"];
sim.model.objectTypes = ["Operator", "Forklift", "Product", "Area", "ProductType", "ForkliftType", "OperatorType"];
sim.model.eventTypes = ["ProductArrival"];
sim.model.activityTypes = ["WalkToForklift", "DriveForkliftToArrivalArea", "LoadProduct",
"TransportProduct", "UnloadProduct", "DriveForkliftBackToArrivalArea", "DriveForkliftHome", "WalkBackHome" ];

// object types which are to be rendered as tables in the initial state UI
if (sim.ui) sim.ui.objectTypes = ["ProductType", "ForkliftType", "OperatorType"];

// model parameters
sim.model.p.distanceOperatorHomeToForkliftHome = 50;  // m
sim.model.p.distanceForkliftHomeToArrivalArea = 200;  // m
sim.model.p.distanceArrivalToDestinationArea = 500;  // m
sim.model.p.distanceDestinationAreaToForkliftHome = 500;  // m
sim.model.p.forkliftSpeed = 3;  // m/s
sim.model.p.operatorSpeed = 1.4;  // m/s
/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 10*60; // 10 hours
sim.scenario.description = "<p>The default scenario has an arrival rate of 60 products per hour, 4 forklifts and 6 operators.</p>";
sim.scenario.setupInitialStateForUi = function () {
  ProductType.instances["1"] = new ProductType({id:1, name:"small", arrivalRatePerHour:10});
  ProductType.instances["2"] = new ProductType({id:2, name:"medium", arrivalRatePerHour:20});
  ProductType.instances["3"] = new ProductType({id:3, name:"big", arrivalRatePerHour:30});
  ForkliftType.instances["1"] = new ForkliftType({id:1, name:"electric", available:1, canTakeProductTypes:[1,2]});
  ForkliftType.instances["2"] = new ForkliftType({id:2, name:"manual", available:2, canTakeProductTypes:[1]});
  ForkliftType.instances["3"] = new ForkliftType({id:3, name:"heavy", available:1, canTakeProductTypes:[2,3]});
  OperatorType.instances["1"] = new OperatorType({id:1, name:"senior", available:2, canDriveForkliftTypes:[1,3]});
  OperatorType.instances["2"] = new OperatorType({id:2, name:"junior", available:2, canDriveForkliftTypes:[2]});
  OperatorType.instances["3"] = new OperatorType({id:3, name:"external", available:2, canDriveForkliftTypes:[3]});
}
sim.scenario.setupInitialState = function () {
  const a1 = new Area({id: 1, name:"arrivalArea"}),
        a2 = new Area({id: 2, name:"destinationArea"});
  // Forklifts
  let j=1;
  for (const flTypeId of Object.keys( ForkliftType.instances)) {
    const flType = ForkliftType.instances[flTypeId];
    for (let i=1; i <= flType.available; i++) {
      sim.scenario.resourcePools["forklifts"].availResources.push(
          new Forklift({id: 10+j, name:"fl"+j, status: rESOURCEsTATUS.AVAILABLE, type: flType}));
      j += 1;
    }
  }
  // Operators
  j=1;
  for (const opTypeId of Object.keys( OperatorType.instances)) {
    const opType = OperatorType.instances[opTypeId];
    for (let i=1; i <= opType.available; i++) {
      sim.scenario.resourcePools["operators"].availResources.push(
          new Operator({id: 20+j, name:"op"+j, status: rESOURCEsTATUS.AVAILABLE, type: opType}));
      j += 1;
    }
  }
  // create list of hourly arrival rates
  const arrivalRates = Object.keys( ProductType.instances).map(
      prodTypeId => ProductType.instances[prodTypeId].arrivalRatePerHour);
  // add up all hourly arrival rates
  ProductArrival.eventRatePerHour = arrivalRates.reduce((accum, value) => accum + value);
  ProductArrival.eventRate = ProductArrival.eventRatePerHour / 60;  // rate per minute
  // create a product type frequency map like {"1":0.166,"2":0.333,"3":0.5} for ProductArrival constructor
  sim.model.p.prodTypeFrequencyMap = arrivalRates.reduce((accum, value, index) =>
      {accum[String(index+1)] = value / ProductArrival.eventRatePerHour; return accum;}, {});
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with a lower arrival rate and fewer operators",
  description: `<p>This scenario has an arrival rate of 48 products per hour, 4 forklifts and 4 operators.</p>`,
  parameters: {arrivalRatePerHour: 48},
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
};
sim.model.computeFinalStatistics = function () {
  sim.stat.nmrOfArrivals = sim.scenario.networkNodes["productArrivalEvtNode"].nmrOfEvents;
  sim.stat.serviceLevel = sim.stat.networkNodes["unloadProductNode"].completedActivities / sim.stat.nmrOfArrivals;
};
/*******************************************************
 Define an experiment (type)
********************************************************/
/*
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
*/