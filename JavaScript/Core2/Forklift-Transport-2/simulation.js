/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Forklift-Transport-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.otherCodeFiles = ["ProductBuffer"];
sim.model.objectTypes = ["Operator", "Forklift", "Product", "Area"];
sim.model.eventTypes = ["ProductArrival"];
sim.model.activityTypes = ["WalkToForklift", "DriveForkliftToArrivalArea", "LoadProduct",
"TransportProduct", "UnloadProduct", "DriveForkliftBackToArrivalArea", "DriveForkliftHome", "WalkBackHome" ];

// model parameters
sim.model.p.arrivalRatePerHourType1 = 10;
sim.model.p.arrivalRatePerHourType2 = 20;
sim.model.p.arrivalRatePerHourType3 = 30;
sim.model.p.nmrOfForkliftsType1 = 1;
sim.model.p.nmrOfForkliftsType2 = 2;
sim.model.p.nmrOfForkliftsType3 = 1;
sim.model.p.nmrOfOperatorsType1 = 2;
sim.model.p.nmrOfOperatorsType2 = 2;
sim.model.p.nmrOfOperatorsType3 = 2;
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
sim.scenario.description = "The default scenario has an arrival rate of 60 products per hour, 4 forklifts and 6 operators";
sim.scenario.setupInitialState = function () {
  const a1 = new Area({id: 1, name:"arrivalArea"}),
      a2 = new Area({id: 2, name:"destinationArea"});
  // Forklifts
  for (let i=1; i <= sim.model.p.nmrOfForkliftsType1; i++) {
    sim.scenario.resourcePools["forklifts"].availResources.push(
        new Forklift({id: 10+i, name:"fl"+i, status: rESOURCEsTATUS.AVAILABLE, type: 1})
    );
  }
  for (let i=1; i <= sim.model.p.nmrOfForkliftsType2; i++) {
    const j = sim.model.p.nmrOfForkliftsType1 + i;
    sim.scenario.resourcePools["forklifts"].availResources.push(
        new Forklift({id: 10+j, name:"fl"+j, status: rESOURCEsTATUS.AVAILABLE, type: 2})
    );
  }
  for (let i=1; i <= sim.model.p.nmrOfForkliftsType3; i++) {
    const j = sim.model.p.nmrOfForkliftsType1 + sim.model.p.nmrOfForkliftsType2 + i;
    sim.scenario.resourcePools["forklifts"].availResources.push(
        new Forklift({id: 10+j, name:"fl"+j, status: rESOURCEsTATUS.AVAILABLE, type: 3})
    );
  }
  // Operators
  for (let i=1; i <= sim.model.p.nmrOfOperatorsType1; i++) {
    sim.scenario.resourcePools["operators"].availResources.push(
        new Operator({id: 20+i, name:"op"+i, status: rESOURCEsTATUS.AVAILABLE, type: 1})
    );
  }
  for (let i=1; i <= sim.model.p.nmrOfOperatorsType2; i++) {
    const j = sim.model.p.nmrOfOperatorsType1 + i;
    sim.scenario.resourcePools["operators"].availResources.push(
        new Operator({id: 20+j, name:"op"+j, status: rESOURCEsTATUS.AVAILABLE, type: 2})
    );
  }
  for (let i=1; i <= sim.model.p.nmrOfOperatorsType3; i++) {
    const j = sim.model.p.nmrOfOperatorsType1 + sim.model.p.nmrOfOperatorsType2 + i;
    sim.scenario.resourcePools["operators"].availResources.push(
        new Operator({id: 20+j, name:"op"+j, status: rESOURCEsTATUS.AVAILABLE, type: 3})
    );
  }
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with a lower arrival rate and fewer operators",
  description: `<p>This scenario has an arrival rate of 48 products per hour, 4 forklifts and 4 operators.</p>`,
  parameters: {arrivalRatePerHourType1: 8, arrivalRatePerHourType2: 16, arrivalRatePerHourType3: 24,
      nmrOfOperatorsType2: 1, nmrOfOperatorsType3: 1}
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