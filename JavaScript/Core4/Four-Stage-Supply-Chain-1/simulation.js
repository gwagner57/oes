/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Four-Stage-Supply-Chain-1";
sim.model.time = "discrete";  // implies using only discrete random variables
sim.model.timeUnit = "D"  // days

sim.model.agentTypes = ["AbstractSupplyChainNode","BottomSupplyChainNode",
    "IntermediateSupplyChainNode","TopSupplyChainNode"];
sim.model.eventTypes = ["EndOfWeek","EndCustomerDemand","PurchaseOrder",
    "ShipItems","PerceiveInDelivery"];

// the costs for holding one unit in stock per week
sim.model.p.holdingCostsPerUnitPerWeek = 0.5;  // in USD or EUR
// the stockout costs per unit
sim.model.p.stockoutCostsPerUnit = 1;  // in USD or EUR
// extra inventory beyond the expected lead time demand
sim.model.p.safetyStock = 2;

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 100 * 7;
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
sim.model.setupStatistics = function () {
  sim.model.showTimeSeries = {
    "retailer inventory": {objectId:1, attribute:"stockQuantity"},
    "distributor inventory": {objectId:2, attribute:"stockQuantity"},
    "wholesaler inventory": {objectId:3, attribute:"stockQuantity"},
  }
};

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
