/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Service-Desk-with-Activity";
sim.model.time = "continuous";
sim.model.timeUnit = "min";  // minutes
sim.model.objectTypes = ["ServiceDesk"];
sim.model.eventTypes = ["CustomerArrival"];
sim.model.activityTypes = ["Service"];
/*** implicitly created AN
 sim.model.networkNodes = {
  "customerArrivalEvtNode": {name:"customerArrivalEvtNode", typeName:"eVENTnODE",
        eventTypeName:"CustomerArrival", successorNodeName:"serviceActNode",
        arrivalRecurrence: () => rand.exponential( sim.v.orderEventRate)},
  "serviceActNode": {name:"serviceActNode", typeName:"aCTIVITYnODE", activityTypeName:"Service",
        duration: () => rand.triangular(0.5, 1.5, 1)}
};
*/
/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.title = "Basic scenario with one service desk";
sim.scenario.durationInSimTime = 360;
sim.scenario.idCounter = 11;  // start value of auto IDs
// Initial State
sim.scenario.setupInitialState = function () {
  // Create initial objects
  const sd1 = new ServiceDesk({id: 1, name:"sd1", status: rESOURCEsTATUS.AVAILABLE});
  sim.resourcePools["serviceDesks"].availResources.push( sd1);
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with two service desks",
  setupInitialState: function () {
    // Create initial objects
    const sd1 = new ServiceDesk({id: 1, name:"sd1", status: rESOURCEsTATUS.AVAILABLE}),
          sd2 = new ServiceDesk({id: 2, name:"sd2", status: rESOURCEsTATUS.AVAILABLE});
    // Schedule initial events
    sim.FEL.add( new CustomerArrival({occTime: 1, serviceDesk: sd1}));
    sim.FEL.add( new CustomerArrival({occTime: 2, serviceDesk: sd2}));
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
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
