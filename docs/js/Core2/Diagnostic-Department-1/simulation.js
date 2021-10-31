/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Diagnostic-Department-1";
sim.model.time = "continuous";
sim.model.timeUnit = "min";

sim.model.objectTypes = ["EcgTechnician","Doctor"];

sim.model.networkNodes = {
  "patientEntry": {typeName:"EntryNode", name:"patientEntry",
      arrivalRate: 1/6,  // 1/6 per min = 10 per hour
      maxNmrOfArrivals: 50,
      successorNodeName:"ecgSpot-PerformECG"},
  "ecgSpot-PerformECG": {typeName:"ProcessingNode", name:"ecgSpot-PerformECG",
      processingCapacity: 3,  // ECG spots
      resourceRoles: {"ecgTechnician":{range:"EcgTechnician"}, "ecg":{card:1}},
      processingDuration: () => rand.triangular(5,10, 7),
      successorNodeName:"usBed-PerformUsScan"},
  "usBed-PerformUsScan": {typeName:"ProcessingNode", name:"usBed-PerformUsScan",
      processingCapacity: 3,  // US beds
      resourceRoles: {"doctor":{range:"Doctor"}},
      processingDuration: () => rand.triangular(7,20,10),
      successorNodeName:"patientExit"},
  "patientExit": {typeName:"ExitNode", name:"patientExit"}
};

/*******************************************************
 Default Simulation Scenario
 ********************************************************/
//sim.scenario.durationInSimTime = 5*60;
sim.scenario.title = "Default scenario.";
sim.scenario.description = "The default scenario has 3 ECG technicians, 3 ECGs, and 3 doctors.";
sim.scenario.setupInitialState = function () {
  const t1 = new EcgTechnician({id: 1, name:"t1", status: rESOURCEsTATUS.AVAILABLE}),
      t2 = new EcgTechnician({id: 2, name:"t2", status: rESOURCEsTATUS.AVAILABLE}),
      t3 = new EcgTechnician({id: 3, name:"t3", status: rESOURCEsTATUS.AVAILABLE}),
      d1 = new Doctor({id: 11, name:"d1", status: rESOURCEsTATUS.AVAILABLE}),
      d2 = new Doctor({id: 12, name:"d2", status: rESOURCEsTATUS.AVAILABLE}),
      d3 = new Doctor({id: 13, name:"d3", status: rESOURCEsTATUS.AVAILABLE});
  // Initialize the individual resource pools
  sim.resourcePools["ecgTechnicians"].availResources.push( t1, t2, t3);
  sim.resourcePools["doctors"].availResources.push( d1, d2, d3);
  // Initialize the count pools
  sim.resourcePools["ecgs"].available = 3;
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
    // Schedule initial events
    sim.FEL.add( new OrderCall({occTime: 1}));
    //***** Model Variant ********************************************
    OrderTaker.alternativeResourceTypes = ["PizzaMaker"];
  }
};
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  //sim.stat.deliveredPizzas = 0;
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
