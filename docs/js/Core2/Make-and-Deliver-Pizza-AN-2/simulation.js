/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Make-and-Deliver-Pizza-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["OrderTaker","PizzaMaker"];
sim.model.eventTypes = ["OrderCall"];
sim.model.activityTypes = ["TakeOrder","MakePizza","DeliverPizza"];

/*** implicitly created AN
sim.model.networkNodes = {
  "orderCallEvtNode": {name:"orderCallEvtNode", evtTypeName:"OrderCall", successorNodeName:"takeOrderActNode",
        arrivalRecurrence: () => rand.exponential( sim.v.orderEventRate)},
  "takeOrderActNode": {name:"takeOrderActNode", activityTypeName:"TakeOrder", successorNodeName:"makePizzaActNode",
        duration: () => rand.triangular(0.5, 1.5, 1)},
  "makePizzaActNode": {name:"makePizzaActNode", activityTypeName:"MakePizza", successorNodeName:"deliverPizzaActNode"},
  "deliverPizzaActNode": {name:"deliverPizzaActNode", activityTypeName:"DeliverPizza",
        onActivityEnd: function () {
          var backlogQuantity = sim.stat.arrivedOrders - sim.stat.departedOrders;
          sim.stat.revenue += sim.v.revenuePerOrder;
          sim.stat.manuCosts += sim.v.manuCostsPerOrder;
          sim.stat.backlogCosts += sim.v.backlogCostsPerOrderPerTimeUnit * backlogQuantity;
          return [];
        }}
};
*/

/*******************************************************
 Default Simulation Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 5*60;
sim.scenario.title = "Default scenario.";
sim.scenario.description = "The default scenario has 2 order takers, 10 pizza makers, 5 ovens, and 20 delivery scooters.";
sim.scenario.setupInitialState = function () {
  const ot1 = new OrderTaker({id: 1, name:"ot1", status: rESOURCEsTATUS.AVAILABLE}),
      ot2 = new OrderTaker({id: 2, name:"ot2", status: rESOURCEsTATUS.AVAILABLE}),
      pm1 = new PizzaMaker({id: 11, name:"pm1", status: rESOURCEsTATUS.AVAILABLE}),
      pm2 = new PizzaMaker({id: 12, name:"pm2", status: rESOURCEsTATUS.AVAILABLE}),
      pm3 = new PizzaMaker({id: 13, name:"pm3", status: rESOURCEsTATUS.AVAILABLE}),
      pm4 = new PizzaMaker({id: 14, name:"pm4", status: rESOURCEsTATUS.AVAILABLE}),
      pm5 = new PizzaMaker({id: 15, name:"pm5", status: rESOURCEsTATUS.AVAILABLE}),
      pm6 = new PizzaMaker({id: 16, name:"pm6", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["orderTakers"].availResources.push( ot1, ot2);
  sim.resourcePools["pizzaMakers"].availResources.push( pm1,pm2,pm3,pm4,pm5,pm6);
  // Initialize the count pools
  sim.resourcePools["ovens"].size = 3;
  sim.resourcePools["scooters"].available = 10;
}
/*******************************************************
 Alternative Scenarios
 ********************************************************/
sim.scenarios[1] = {
  scenarioNo: 1,
  title: "Model variant: pizza makers can also take orders",
  description: `<p>Based on the default scenario (with 2 order takers, 6 pizza makers, 
                 3 ovens, and 10 delivery scooters), in this model variant the 
                 pizza makers are used as an <em>alternative resource pool</em> for order taking.
                 This means that when all order takers are busy and a new order call comes in,
                 an available pizza maker can take the call.</p>`,
  setupInitialState: function () {
    const ot1 = new OrderTaker({id: 1, name:"ot1", status: rESOURCEsTATUS.AVAILABLE}),
        ot2 = new OrderTaker({id: 2, name:"ot2", status: rESOURCEsTATUS.AVAILABLE}),
        pm1 = new PizzaMaker({id: 11, name:"pm1", status: rESOURCEsTATUS.AVAILABLE}),
        pm2 = new PizzaMaker({id: 12, name:"pm2", status: rESOURCEsTATUS.AVAILABLE}),
        pm3 = new PizzaMaker({id: 13, name:"pm3", status: rESOURCEsTATUS.AVAILABLE}),
        pm4 = new PizzaMaker({id: 14, name:"pm4", status: rESOURCEsTATUS.AVAILABLE}),
        pm5 = new PizzaMaker({id: 15, name:"pm5", status: rESOURCEsTATUS.AVAILABLE}),
        pm6 = new PizzaMaker({id: 16, name:"pm6", status: rESOURCEsTATUS.AVAILABLE});
    // Initialize the individual resource pools
    sim.resourcePools["orderTakers"].availResources.push( ot1, ot2);
    sim.resourcePools["pizzaMakers"].availResources.push( pm1,pm2,pm3,pm4,pm5,pm6);
    // Initialize the count pools
    sim.resourcePools["ovens"].available = 3;
    sim.resourcePools["scooters"].available = 10;
    //***** Model Variant ********************************************
    OrderTaker.alternativeResourceTypes = ["PizzaMaker"];
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.deliveredPizzas = 0;
};
/*******************************************************
 Define an experiment (type)
********************************************************/
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 100,
  //seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};
