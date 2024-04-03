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
sim.model.timeSeries = {
  "phisher assets": {objectId:1, attribute:"assetsTUSD"},
  "assets of target 1": {objectId:1001, attribute:"assetsTUSD"},
  "assets of target 2": {objectId:1002, attribute:"assetsTUSD"},
  "assets of target 3": {objectId:1003, attribute:"assetsTUSD"},
  "assets of target 4": {objectId:1004, attribute:"assetsTUSD"},
  "assets of target 5": {objectId:1005, attribute:"assetsTUSD"},
}
sim.model.computeFinalStatistics = function () {
  // create a table showing agent assets
  const tableDef = {name:"Assets after phishing", attributes:["assetsTUSD"]};
  const row0 = [];
  sim.stat.table = {name: tableDef.name, rows:[]};
  //const population = sim.Classes[tableDef.objectTypeName].instances;
  for (const obj of sim.agents.values()) {
    const row=[];
    if (obj instanceof PhishingTarget || obj instanceof Phisher) {
      if (row0.length === 0) {  // create column headings
        row0.push("");  // leftmost column
        for (const attr of tableDef.attributes) {
          row0.push( attr);
        }
        sim.stat.table.rows.push( row0);
      }
      row.push( obj.name);  // leftmost column
      for (const attr of tableDef.attributes) {
        row.push( obj[attr]);
      }
      sim.stat.table.rows.push( row);
    }
  }
};
