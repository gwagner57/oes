/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "phishing-1";
sim.model.time = "discrete";  // implies using only discrete temporal random variables
sim.model.timeUnit = "min"  // minutes

sim.model.objectTypes = ["Webpage"];
sim.model.agentTypes = ["Phisher","PhishingTarget"];
sim.model.eventTypes = ["StartOfDay","VisitHookPage","LookAtHookPage",
    "ProvideExploitableData","PerceiveExploitableData","ExploitScammedData"];
// the number of phishing targets
sim.model.p.numberOfPhishingTargets = 10;

// interleaved or round-based agent execution?
//sim.config.roundBasedAgentExecution = true;

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 7 * 24 * 60;  // one week
sim.scenario.description = "Default scenario";
sim.scenario.setupInitialState = function(){
  const targetStartId=1001, phishTargs=[];
  for (let j=0; j < sim.model.p.numberOfPhishingTargets; j++) {
    const i = targetStartId + j;
    const susceptibility = rand.uniformInt(1,9) * 0.1;
    phishTargs.push( new PhishingTarget({id: i, name:"phishTarg"+ (j+1), susceptibility}));
  }
  const phisher = new Phisher({id: 1, name:"phisher", phishingTargets: phishTargs});
  // Schedule initial events
  sim.schedule( new StartOfDay({occTime: 1}));
};

/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.setupStatistics = function () {};
/*
sim.model.timeSeries = {
  "retailer inventory": {objectId:1, attribute:"stockQuantity"},
  "distributor inventory": {objectId:2, attribute:"stockQuantity"},
  "wholesaler inventory": {objectId:3, attribute:"stockQuantity"},
}
*/
sim.model.computeFinalStatistics = function () {};
