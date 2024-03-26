/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "phishing-1";
sim.model.time = "discrete";  // implies using only discrete temporal random variables
sim.model.timeUnit = "min"  // minutes

sim.model.objectTypes = ["Webpage"];
sim.model.agentTypes = ["Phisher","PhishingTarget"];
sim.model.eventTypes = ["StartOfWeek","GoToHookWebpage","LookAtHookWebpage",
    "ProvideExploitableData","PerceiveExploitableData"];

// interleaved or round-based agent execution?
//sim.config.roundBasedAgentExecution = true;

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 52 * 7 * 24 * 60;  // one year
sim.scenario.description = "Default scenario";
sim.scenario.setupInitialState = function(){
  const retailer = new BottomSupplyChainNode({id: 1, name:"retailer",
            stockQuantity: 8, safetyStock: 3}),
        distributor = new IntermediateSupplyChainNode({id: 2, name:"distributor",
            downStreamNode: retailer, stockQuantity: 8, safetyStock: 4}),
        wholesaler = new IntermediateSupplyChainNode({id: 3, name:"wholesaler",
            downStreamNode: distributor, stockQuantity: 8, safetyStock: 5}),
        factory = new TopSupplyChainNode({id: 4, name:"factory",
            downStreamNode: wholesaler});
  retailer.upStreamNode = distributor;
  distributor.upStreamNode = wholesaler;
  wholesaler.upStreamNode = factory;
  // Schedule initial events
  sim.schedule( new EndCustomerDemand({occTime: 1}));
  sim.schedule( new EndOfWeek({occTime: 5}));
};

/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.setupStatistics = function () {};
sim.model.timeSeries = {
  "retailer inventory": {objectId:1, attribute:"stockQuantity"},
  "distributor inventory": {objectId:2, attribute:"stockQuantity"},
  "wholesaler inventory": {objectId:3, attribute:"stockQuantity"},
}

sim.model.computeFinalStatistics = function () {
  // create a table showing supply chain node characteristics
  const tableDef = {name:"Supply chain nodes", objectTypeName:"NonTopSupplyChainNode",
        attributes:["stockQuantity","backorderQuantity","accumulatedInventoryCosts"]};
  const row0 = [];
  sim.stat.table = {name: tableDef.name, rows:[]};
  //const population = sim.Classes[tableDef.objectTypeName].instances;
  for (const obj of sim.objects.values()) {
    const row=[];
    if (obj instanceof BottomSupplyChainNode || obj instanceof IntermediateSupplyChainNode) {
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
