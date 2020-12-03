/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Make-and-Deliver-Pizza-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["OrderTaker","PizzaMaker"];
sim.model.eventTypes = ["OrderCall"];
sim.model.activityTypes = ["TakeOrder","MakePizza","DeliverPizza"];

/*******************************************************
 Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 300;
//sim.scenario.durationInSimSteps = 1000;
//sim.scenario.durationInCpuTime = 1000;  // seconds

// Initial State
sim.scenario.setupInitialState = function () {
  const ot1 = new OrderTaker({id: 1, name:"ot1", status: oes.ResourceStatusEL.AVAILABLE}),
      ot2 = new OrderTaker({id: 2, name:"ot2", status: oes.ResourceStatusEL.AVAILABLE}),
      pm1 = new PizzaMaker({id: 11, name:"pm1", status: oes.ResourceStatusEL.AVAILABLE}),
      pm2 = new PizzaMaker({id: 12, name:"pm2", status: oes.ResourceStatusEL.AVAILABLE}),
      pm3 = new PizzaMaker({id: 13, name:"pm3", status: oes.ResourceStatusEL.AVAILABLE}),
      pm4 = new PizzaMaker({id: 14, name:"pm4", status: oes.ResourceStatusEL.AVAILABLE}),
      pm5 = new PizzaMaker({id: 15, name:"pm5", status: oes.ResourceStatusEL.AVAILABLE}),
      pm6 = new PizzaMaker({id: 16, name:"pm6", status: oes.ResourceStatusEL.AVAILABLE}),
      pm7 = new PizzaMaker({id: 17, name:"pm7", status: oes.ResourceStatusEL.AVAILABLE}),
      pm8 = new PizzaMaker({id: 18, name:"pm8", status: oes.ResourceStatusEL.AVAILABLE}),
      pm9 = new PizzaMaker({id: 19, name:"pm9", status: oes.ResourceStatusEL.AVAILABLE}),
      pm10 = new PizzaMaker({id: 20, name:"pm10", status: oes.ResourceStatusEL.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["orderTakers"].availResources.push( ot1, ot2);
  sim.resourcePools["pizzaMakers"].availResources.push( pm1,pm2,pm3,pm4,pm5,pm6,pm7,pm8,pm9,pm10);
  // Initialize the count pools
  sim.resourcePools["ovens"].available = 5;
  sim.resourcePools["scooters"].available = 20;
  // Schedule initial events
  sim.FEL.add( new OrderCall({occTime: 1}));
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Scenario with 2 wheel loaders",
  setupInitialState: function () {
    const t1 = new PizzaMaker({id: 1, name:"t1", status: oes.ResourceStatusEL.AVAILABLE}),
        t2 = new PizzaMaker({id: 2, name:"t2", status: oes.ResourceStatusEL.AVAILABLE}),
        t3 = new PizzaMaker({id: 3, name:"t3", status: oes.ResourceStatusEL.AVAILABLE}),
        t4 = new PizzaMaker({id: 4, name:"t4", status: oes.ResourceStatusEL.AVAILABLE}),
        t5 = new PizzaMaker({id: 5, name:"t5", status: oes.ResourceStatusEL.AVAILABLE}),
        wl1 = new WheelLoader({id: 11, name:"wl1", status: oes.ResourceStatusEL.AVAILABLE});
        wl2 = new WheelLoader({id: 12, name:"wl2", status: oes.ResourceStatusEL.AVAILABLE});
    // Initialize the individual resource pools
    sim.resourcePools["trucks"].availResources.push( t1, t2, t3, t4, t5);
    sim.resourcePools["wheelLoaders"].availResources.push( wl1, wl2);
    // Schedule initial events
    sim.FEL.add( new Request({occTime: 1, quantity: 990}));
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
